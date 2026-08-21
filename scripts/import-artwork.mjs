/* 생성한 표지 그림을 제품에 들입니다.

   generate.mjs 가 만든 cardly-artworks/*.png 는 3:4 · 2K · 3MB 짜리
   원본입니다. 그대로 배포하면 목록 한 장에 60MB 가 실립니다. 여기서
   카드 비율(5:7)로 자르고 webp 로 줄여 public/art/ 에 넣습니다.

     node scripts/import-artwork.mjs

   함께 하는 일이 하나 더 있습니다 — 그림마다 색 세 개(bg·ink·point)를
   뽑아 lib/occasion/palette.json 에 적어 둡니다. 카드 종이색과 강조색을 손으로
   고르면 그림과 따로 노는 색이 반드시 하나는 나옵니다. 그림에서 뽑으면
   그럴 일이 없습니다. 뽑은 뒤에는 대비를 재서, 본문 4.5:1 · 강조 3:1 을
   넘길 때까지 명도만 조금씩 옮깁니다.                                */

import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = path.resolve("cardly-artworks");
const OUT = path.resolve("public/art");
const THUMB = path.join(OUT, "thumb");

/** 카드 비율 — 5:7 세로 */
const RATIO = 5 / 7;
/** 화면 가득 뜰 때 쓰는 폭 */
const FULL_W = 1080;
/** 목록·고르는 칸에서 쓰는 폭 */
const THUMB_W = 480;

/* ── 색 뽑기 ─────────────────────────────────────────────── */

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

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function saturation([r, g, b]) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

/** 색을 흰쪽·검은쪽으로 조금씩 밀어 목표 대비를 넘깁니다 */
function push(color, against, target, toward) {
  let c = [...color];
  for (let i = 0; i < 60 && contrast(c, against) < target; i++) {
    c = c.map((v, k) => v + (toward[k] - v) * 0.06);
  }
  return c;
}

/**
 * 그림에서 색 무리를 찾습니다.
 *
 * 24×32 로 줄인 뒤 6단계 격자로 뭉칩니다. 픽셀을 전부 보면 사진의
 * 잡티까지 무리가 되고, 너무 거칠게 뭉치면 서로 다른 그림이 모두 같은
 * 색을 내놓습니다.
 */
async function clusters(file) {
  const { data, info } = await sharp(file)
    .resize(24, 32, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const bins = new Map();
  for (let i = 0; i < data.length; i += info.channels) {
    const px = [data[i], data[i + 1], data[i + 2]];
    const key = px.map((v) => Math.round(v / 42)).join(",");
    const bin = bins.get(key) ?? { n: 0, sum: [0, 0, 0] };
    bin.n += 1;
    for (let k = 0; k < 3; k++) bin.sum[k] += px[k];
    bins.set(key, bin);
  }

  return [...bins.values()]
    .map((b) => ({ n: b.n, rgb: b.sum.map((s) => s / b.n) }))
    .sort((a, b) => b.n - a.n);
}

async function palette(file) {
  const found = await clusters(file);

  /* 종이색 — 가장 밝은 축에 있는 큰 무리를 잡아 종이 쪽으로 당깁니다.
     그림에서 그대로 뽑은 색을 종이로 쓰면 채도가 남아 카드가 탁합니다. */
  const light = found
    .filter((c) => luminance(c.rgb) > 0.5)
    .sort((a, b) => b.n - a.n)[0] ?? found[0];
  const bg = light.rgb.map((v, k) => v + ([255, 253, 250][k] - v) * 0.55);

  /* 글자색 — 가장 어두운 큰 무리. 순수한 검정은 쓰지 않습니다. */
  const dark = found
    .filter((c) => luminance(c.rgb) < 0.22)
    .sort((a, b) => b.n - a.n)[0] ??
    found.slice().sort((a, b) => luminance(a.rgb) - luminance(b.rgb))[0];
  const ink = push(dark.rgb, bg, 8, [22, 18, 14]);

  /* 강조색 — 가장 진한 색. 큰 무리 열 개 안에서만 찾습니다. */
  const vivid = found
    .slice(0, 12)
    .filter((c) => saturation(c.rgb) > 0.18)
    .sort((a, b) => saturation(b.rgb) - saturation(a.rgb))[0] ?? dark;
  const point = push(vivid.rgb, bg, 3.2, [40, 30, 24]);

  return { bg: toHex(bg), ink: toHex(ink), point: toHex(point) };
}

/* ── 액자 벗기기 ───────────────────────────────────────────────

   그림을 만들어 달라고 하면 이따금 «인쇄된 카드를 찍은 사진» 이 옵니다.
   그림 둘레에 고른 종이색 테두리가 둘리는 것이 그 흔적입니다. 그대로
   표지에 깔면 카드 안에 카드가 한 장 더 들어앉습니다.

   프롬프트로 대부분 막았지만 스무 장 가운데 두 장이 여전히 그렇게
   왔습니다. 다시 뽑으면 구도까지 바뀌므로, 테두리만 잘라 냅니다.

   테두리인지 아닌지는 바깥 한 줄과 안쪽 한 줄을 견줘 판단합니다.
   바깥 한 줄이 «고르고»(색이 거의 안 변하고) 안쪽 한 줄과 «많이 다르면»
   그건 그림이 아니라 여백입니다. 종이색 바탕에 그린 그림(케이크, 공룡)은
   바깥과 안쪽이 둘 다 종이색이라 걸리지 않습니다.                    */

/** 바깥에서 inset 만큼 들어간 한 줄의 평균색과 편차 */
function ring(px, w, h, inset) {
  const pts = [];
  for (let x = inset; x < w - inset; x++) {
    pts.push(px(x, inset), px(x, h - 1 - inset));
  }
  for (let y = inset; y < h - inset; y++) {
    pts.push(px(inset, y), px(w - 1 - inset, y));
  }
  const avg = [0, 1, 2].map((k) => pts.reduce((s, p) => s + p[k], 0) / pts.length);
  const variance =
    pts.reduce(
      (s, p) => s + [0, 1, 2].reduce((t, k) => t + (p[k] - avg[k]) ** 2, 0),
      0,
    ) / pts.length;
  return { avg, sd: Math.sqrt(variance) };
}

async function isFramed(file) {
  const W = 100;
  const H = 140;
  const { data } = await sharp(file)
    .resize(W, H, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const px = (x, y) => {
    const i = (y * W + x) * 3;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const outer = ring(px, W, H, 1);
  const inner = ring(px, W, H, 12);
  const dist = Math.hypot(...[0, 1, 2].map((k) => outer.avg[k] - inner.avg[k]));
  return outer.sd < 14 && dist > 55;
}

/* ── 실행 ────────────────────────────────────────────────── */

await mkdir(THUMB, { recursive: true });

const files = (await readdir(SRC))
  .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
  .sort();

if (files.length === 0) {
  console.error(`${SRC} 에 그림이 없습니다 — 먼저 node generate.mjs 를 돌리세요`);
  process.exit(1);
}

const out = {};

for (const file of files) {
  const src = path.join(SRC, file);
  /* 01-wedding-floral-arch.png → wedding-floral-arch.webp */
  const name = file.replace(/^\d+-/, "").replace(/\.[^.]+$/, "");
  const webp = `${name}.webp`;

  /* 액자가 둘려 있으면 벗겨 낸 것을 원본 대신 씁니다. 임계값 20 은
     종이결의 자잘한 얼룩은 여백으로 보고, 그림은 건드리지 않는 선입니다. */
  const framed = await isFramed(src);
  const source = framed
    ? await sharp(src).trim({ threshold: 20 }).png().toBuffer()
    : src;

  const height = Math.round(FULL_W / RATIO);
  await sharp(source)
    .resize(FULL_W, height, { fit: "cover", position: sharp.strategy.attention })
    .webp({ quality: 82 })
    .toFile(path.join(OUT, webp));

  await sharp(source)
    .resize(THUMB_W, Math.round(THUMB_W / RATIO), {
      fit: "cover",
      position: sharp.strategy.attention,
    })
    .webp({ quality: 78 })
    .toFile(path.join(THUMB, webp));

  out[name] = await palette(source);
  console.log(
    `${file}  →  ${webp}${framed ? "  (액자 벗김)" : ""}   ${JSON.stringify(out[name])}`,
  );
}

await writeFile(
  path.resolve("lib/occasion/palette.json"),
  `${JSON.stringify(out, null, 2)}\n`,
  "utf8",
);
console.log(`\n${files.length}장 들였습니다 → public/art/ · public/art/thumb/`);
console.log("색: lib/occasion/palette.json");
