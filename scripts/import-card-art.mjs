/* 생성한 명함 배경을 제품에 들입니다.

     node scripts/import-card-art.mjs      (npm run card:import)

   generate-cards.mjs 가 만든 cardly-cards/*.png 는 16:9 원본입니다. 여기서
   명함 비율(90 × 50 mm = 9:5)로 자르고 webp 로 줄여 public/card-art/ 에
   넣습니다.

   ── 왜 두 벌을 만드는가 ───────────────────────────────────────
   저장하는 PNG 는 90 × 50 mm 에 약 800dpi 입니다(html2canvas 배율 8).
   90 mm 를 CSS px 로 재면 340px 이고 여기에 8을 곱하면 2721px 이므로,
   실제로 인쇄에 나가는 배경은 그만큼은 되어야 합니다. 그래서 큰 판을
   2800px 로 둡니다.

   반면 편집기 왼쪽의 고르는 칸은 한 장이 70px 남짓입니다. 거기에 2800px
   짜리 스무 장을 물리면 목록을 여는 순간 수십 MB 를 받습니다. 그래서
   작은 판을 따로 만듭니다.

   ── 배치와 색도 여기서 정합니다 ──────────────────────────────
   배경마다 비어 있는 쪽이 다르므로, 배치 원형 스무 가지를 놓고 어느 것이
   이 배경 위에서 가장 조용한지 재서 고릅니다. 고른 자리가 어두우면 글자를
   밝게 씁니다. 결과는 lib/studio/card-art.json 에 적힙니다.        */

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = path.resolve("cardly-cards");
const OUT = path.resolve("public/card-art");
const THUMB = path.join(OUT, "thumb");

/** 명함 비율 — 90 : 50 */
const RATIO = 9 / 5;
/** 인쇄용 큰 판 */
const FULL_W = 2800;
/** 편집기에서 고르는 칸 */
const THUMB_W = 420;

/* ── 색 재기 ─────────────────────────────────────────────── */

function toHex([r, g, b]) {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

/** 0–1. 웹 접근성에서 쓰는 상대 휘도 */
function luminance([r, g, b]) {
  const f = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function saturation([r, g, b]) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * 강조색이 배경에 묻히지 않게 밀어냅니다.
 *
 * 단색에 가까운 배경(민무늬 아이보리, 흰 그리드, 감청 포일)에서는 가장
 * 진한 색을 찾아도 결국 배경색이 나옵니다. 그대로 두면 강조선이 배경과
 * 같은 색이 되어 아예 보이지 않습니다. 배경이 밝으면 어두운 쪽으로,
 * 어두우면 밝은 쪽으로 대비 3:1 을 넘을 때까지 명도만 옮깁니다 — 색상은
 * 그대로 두므로 그림에서 뽑은 색이라는 성질은 남습니다.
 */
function separate(color, bg) {
  const toward = luminance(bg) > 0.4 ? [26, 22, 18] : [250, 246, 238];
  let c = [...color];
  for (let i = 0; i < 60 && contrast(c, bg) < 3; i++) {
    c = c.map((v, k) => v + (toward[k] - v) * 0.06);
  }
  return c;
}

/* ── 배치 고르기 ───────────────────────────────────────────────

   배경마다 비어 있는 쪽이 다릅니다. 대리석은 왼쪽 아래가 요란하고,
   보태니컬은 오른쪽 삼분의 일이 잎으로 덮여 있습니다. 거기에 이름을
   얹으면 아무리 좋은 배경도 못 쓰는 명함이 됩니다.

   그래서 배치 원형 스무 가지를 놓고, 각 원형이 글자를 앉히려는 자리마다
   배경을 들여다봅니다. 좋은 자리는 두 가지를 만족합니다.

     ① 조용하다 — 그 자리의 밝기가 고르다(표준편차가 작다). 글자가
        얼룩 위에 놓이면 획이 끊겨 보입니다.
     ② 한 벌로 읽힌다 — 여섯 자리의 밝기가 서로 비슷하다. 이름은 밝은
        데 있고 연락처는 어두운 데 있으면 글자색을 하나로 정할 수가
        없습니다.

   둘을 더해 점수가 가장 낮은 원형을 고릅니다. 눈으로 스무 장 × 스무
   원형을 견주는 것보다 정확하고, 배경을 다시 만들면 배치도 따라옵니다. */

/** 글자가 앉는 자리 여섯 곳을 [x%, y%] 로 */
function slotsOf(archetype) {
  return [
    archetype.company,
    archetype.name,
    archetype.role,
    ...archetype.contacts,
  ].map(([x, y]) => [x, y]);
}

/**
 * 자리 한 곳의 밝기와 얼룩. 글자 한 줄이 차지하는 만큼만 봅니다 —
 * 가로로 넓고 세로로 얇은 창입니다.
 */
function windowStats(px, W, H, xPct, yPct) {
  const cx = (xPct / 100) * W;
  const cy = (yPct / 100) * H;
  const halfW = W * 0.13;
  const halfH = H * 0.06;
  const values = [];
  for (let y = Math.max(0, Math.round(cy - halfH)); y <= Math.min(H - 1, Math.round(cy + halfH)); y++) {
    for (let x = Math.max(0, Math.round(cx - halfW)); x <= Math.min(W - 1, Math.round(cx + halfW)); x++) {
      values.push(luminance(px(x, y)));
    }
  }
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sd = Math.sqrt(
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length,
  );
  return { mean, sd };
}

/**
 * 배경 한 장을 읽어 필요한 값을 뽑습니다.
 *
 *   bg         가장 넓은 면의 색 — 배경 사진을 못 불러왔을 때의 대체색
 *   accent     가장 진한 색 — 선과 강조에 씁니다
 *   archetype  이 배경에 맞는 배치 원형 번호 (0–19)
 *   dark       그 배치 자리가 어두워 글자를 밝게 써야 하는지
 */
async function measure(file, archetypes) {
  const W = 90;
  const H = 50;
  const { data } = await sharp(file)
    .resize(W, H, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const px = (x, y) => {
    const i = (y * W + x) * 3;
    return [data[i], data[i + 1], data[i + 2]];
  };

  /* 색 무리 — 6단계 격자로 뭉칩니다 */
  const bins = new Map();
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = px(x, y);
      const key = p.map((v) => Math.round(v / 42)).join(",");
      const bin = bins.get(key) ?? { n: 0, sum: [0, 0, 0] };
      bin.n += 1;
      for (let k = 0; k < 3; k++) bin.sum[k] += p[k];
      bins.set(key, bin);
    }
  }

  const groups = [...bins.values()]
    .map((b) => ({ n: b.n, rgb: b.sum.map((s) => s / b.n) }))
    .sort((a, b) => b.n - a.n);

  const bg = groups[0].rgb;
  /* 강조색 — 큰 무리 열둘 안에서 가장 진한 것. 없으면 가장 밝은 것을
     씁니다(검은 배경에서는 밝은 색이 강조색 노릇을 합니다). */
  const vivid =
    groups.slice(0, 12).filter((c) => saturation(c.rgb) > 0.22).sort(
      (a, b) => saturation(b.rgb) - saturation(a.rgb),
    )[0] ??
    groups.slice().sort((a, b) => luminance(b.rgb) - luminance(a.rgb))[0];

  let best = { score: Infinity, index: 0, mean: 0.5 };
  archetypes.forEach((archetype, index) => {
    const stats = slotsOf(archetype).map(([x, y]) => windowStats(px, W, H, x, y));
    const means = stats.map((s) => s.mean);
    const mean = means.reduce((a, b) => a + b, 0) / means.length;
    const noise = stats.reduce((a, s) => a + s.sd, 0) / stats.length;
    const spread = Math.max(...means) - Math.min(...means);
    const score = noise + spread;
    if (score < best.score) best = { score, index, mean };
  });

  return {
    bg: toHex(bg),
    accent: toHex(separate(vivid.rgb, bg)),
    archetype: best.index,
    dark: best.mean < 0.42,
  };
}

/* ── 실행 ────────────────────────────────────────────────── */

await mkdir(THUMB, { recursive: true });

const ARCHETYPES = JSON.parse(
  await readFile(path.resolve("lib/studio/archetypes.json"), "utf8"),
);

const files = (await readdir(SRC))
  .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
  .sort();

if (files.length === 0) {
  console.error(`${SRC} 에 배경이 없습니다 — 먼저 node generate-cards.mjs 를 돌리세요`);
  process.exit(1);
}

const out = {};

for (const file of files) {
  const src = path.join(SRC, file);
  /* 01-marble-noir.png → marble-noir.webp */
  const name = file.replace(/^\d+-/, "").replace(/\.[^.]+$/, "");
  const webp = `${name}.webp`;

  /* 자를 때 attention 을 쓰지 않습니다. 명함 배경은 «비워 둔 쪽» 이 있는
     그림이라, 눈에 띄는 쪽을 따라가면 그 여백이 잘려 나갑니다. 가운데를
     기준으로 위아래만 조금 덜어 냅니다. */
  await sharp(src)
    .resize(FULL_W, Math.round(FULL_W / RATIO), { fit: "cover", position: "center" })
    .webp({ quality: 90 })
    .toFile(path.join(OUT, webp));

  await sharp(src)
    .resize(THUMB_W, Math.round(THUMB_W / RATIO), { fit: "cover", position: "center" })
    .webp({ quality: 82 })
    .toFile(path.join(THUMB, webp));

  out[name] = await measure(src, ARCHETYPES);
  console.log(`${file}  →  ${webp}   ${JSON.stringify(out[name])}`);
}

await writeFile(
  path.resolve("lib/studio/card-art.json"),
  `${JSON.stringify(out, null, 2)}\n`,
  "utf8",
);
console.log(`\n${files.length}장 들였습니다 → public/card-art/ · public/card-art/thumb/`);
console.log("색·밝기: lib/studio/card-art.json");
