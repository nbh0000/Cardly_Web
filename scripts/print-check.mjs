/* 템플릿 마흔여덟 장 점검.

   빌드가 떨궈 놓은 out/print-templates.json 을 읽어, 사람이 눈으로 세기
   어려운 것만 기계가 셉니다. 화면에서 예뻐 보여도 인쇄하면 문제가 되는
   종류입니다 — 안전선을 넘은 글자, 해상도가 모자란 사진, 7pt 아래로
   내려간 작은 글씨, 한 장에 뒤섞인 글꼴.

   실행:
     GITHUB_PAGES=true npx next build   (out/print-templates.json 을 만듭니다)
     npm run print:check

   나가는 값이 0 이 아니면 «고쳐야 하는 것» 이 있다는 뜻입니다.
   경고(WARN)는 막지 않습니다 — 일부러 그렇게 짠 판이 있기 때문입니다.   */

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "out", "print-templates.json");

/* ── 기준 ───────────────────────────────────────────────── */

/** 인쇄물마다 «이보다 작으면 못 읽는다» 는 크기가 다릅니다 */
const MIN_PT = { coupon: 6.8, menu: 7.5, flyer: 8, poster: 9, banner: 100, "standing-banner": 24 };
/** 사진의 해상도 바닥 — lib/print/specs.ts 의 minImageDpi 와 같은 규칙 */
const minDpi = (docDpi) => Math.max(72, Math.round(docDpi / 2));
/** 한 장에 쓰는 글꼴 */
const MAX_FONTS = 2;
/**
 * 한 장에 쓰는 «색 갈래».
 *
 * 색상값을 그대로 세면 같은 남색의 밝기 차이 넷이 «색 네 가지» 로 잡힙니다.
 * 그건 절제된 팔레트를 벌주는 셈입니다. 그래서 색상환에서 30도 단위로 묶고,
 * 채도가 낮은 것은 전부 «무채색» 한 갈래로 셉니다.
 */
const MAX_HUES = 3;

/** 갈래마다 «이보다 요소가 적으면 허전하다» 는 기준이 다릅니다 */
const MIN_ELEMENTS = { banner: 3, "standing-banner": 6, coupon: 5 };
/** 갈래마다 몇 장이어야 하는가 */
const PER_CATEGORY = 8;

if (!existsSync(DATA)) {
  console.error(
    `${DATA} 가 없습니다.\n  먼저 빌드하세요:  GITHUB_PAGES=true npx next build`,
  );
  process.exit(2);
}

const data = JSON.parse(await readFile(DATA, "utf8"));
const templates = data.templates ?? [];

let errors = 0;
let warns = 0;
const rows = [];

const norm = (c) => String(c ?? "").trim().toLowerCase();
const isPlain = (c) => ["", "transparent", "#fff", "#ffffff", "#000", "#000000"].includes(norm(c));

/** #rrggbb → 색상환 30도 묶음. 채도가 낮으면 «무채색» */
function hueFamily(css) {
  const hex = norm(css).replace("#", "");
  const full = hex.length === 3 ? hex.split("").map((x) => x + x).join("") : hex;
  const n = parseInt(full.slice(0, 6), 16);
  if (Number.isNaN(n)) return null;
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (s < 0.16) return "무채색";
  let h = 0;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return `${Math.round(h / 30) * 30}°`;
}

for (const t of templates) {
  const doc = t.doc;
  const bad = [];
  const soft = [];

  /* ── 딱지 ── */
  if (!t.industry || !t.style || !t.palette?.length) bad.push("업종·스타일·색 딱지가 빠졌습니다");

  /* ── 요소가 독립인가 ──
     한 장을 통째로 그림으로 구워 놓으면 «편집기» 가 아니라 «액자» 가
     됩니다. 글자가 셋 이상 따로 있어야 그 판을 고칠 수 있습니다. */
  const texts = doc.elements.filter((e) => e.kind === "text");
  const images = doc.elements.filter((e) => e.kind === "image");
  const shapes = doc.elements.filter((e) => e.kind === "shape");
  if (texts.length < 3) bad.push(`글자 요소가 ${texts.length}개뿐입니다 (3개 이상)`);
  const minEls = MIN_ELEMENTS[t.category] ?? 5;
  if (doc.elements.length < minEls) soft.push(`요소가 ${doc.elements.length}개로 적습니다`);

  /* ── 안전선 ──
     글자는 재단선 안쪽 safe 만큼 들어와 있어야 합니다. 도형과 사진은
     일부러 재단선 밖까지 뻗기도 하므로(재단 여백) 여기서 보지 않습니다. */
  const s = doc.safe;
  for (const e of texts) {
    if (e.x < s - 0.5 || e.y < s - 0.5 || e.x + e.w > doc.width - s + 0.5 || e.y + e.h > doc.height - s + 0.5) {
      bad.push(`«${String(e.text).split("\n")[0].slice(0, 14)}» 가 안전선 밖입니다`);
    }
  }

  /* ── 종이 밖으로 나간 것 ── */
  for (const e of doc.elements) {
    if (e.x > doc.width || e.y > doc.height || e.x + e.w < -doc.bleed || e.y + e.h < -doc.bleed) {
      bad.push(`요소 ${e.id} 가 종이 밖에 있습니다`);
    }
  }

  /* ── 작은 글씨 ── */
  const floor = MIN_PT[t.category] ?? 8;
  for (const e of texts) {
    if (e.size < floor) {
      bad.push(`${e.size}pt 글자 — ${t.category} 는 ${floor}pt 아래로 내려가면 안 됩니다`);
    }
  }

  /* ── 글꼴 ── */
  const fonts = [...new Set(texts.map((e) => e.font))];
  if (fonts.length > MAX_FONTS) bad.push(`글꼴 ${fonts.length}종 (${fonts.join(", ")})`);

  /* ── 색 ── */
  const colors = new Set();
  for (const e of texts) if (!isPlain(e.color)) colors.add(hueFamily(e.color));
  for (const e of shapes) if (!isPlain(e.fill)) colors.add(hueFamily(e.fill));
  colors.delete(null);
  if (colors.size > MAX_HUES) soft.push(`색 갈래 ${colors.size}가지 (${[...colors].join(", ")})`);

  /* ── 사진 해상도 ── */
  for (const e of images) {
    if (!e.naturalWidth || !e.w) continue;
    const dpi = Math.round(e.naturalWidth / (e.w / 25.4));
    const floorDpi = minDpi(doc.dpi);
    if (dpi < floorDpi) bad.push(`사진 ${dpi}dpi (${floorDpi} 이상)`);
  }

  /* ── 그림이 실제로 붙었는가 ── */
  for (const id of t.art ?? []) {
    const art = (data.art ?? []).find((a) => a.id === id);
    if (!art?.file) soft.push(`그림 ${id} 이 아직 없습니다`);
  }

  /* ── 양면 ── */
  if (doc.duplex) {
    const back = doc.elements.filter((e) => e.side === "back");
    if (back.length > 0 && back.length < 3) soft.push(`뒷면 요소가 ${back.length}개뿐입니다`);
  }

  errors += bad.length;
  warns += soft.length;
  rows.push({ id: t.id, category: t.category, bad, soft, fonts: fonts.length, colors: colors.size, els: doc.elements.length });
}

/* ── 갈래마다 여덟 장인가 ── */
const perCat = {};
for (const t of templates) perCat[t.category] = (perCat[t.category] ?? 0) + 1;
const missing = Object.entries(perCat).filter(([, n]) => n !== PER_CATEGORY);

/* ── 보고 ── */

const pad = (s, n) => String(s).padEnd(n);
console.log(`\n템플릿 ${templates.length}장 · 그림 ${data.counts?.art ?? 0}장\n`);
console.log(pad("아이디", 26) + pad("갈래", 17) + pad("요소", 6) + pad("글꼴", 6) + pad("색", 5) + "상태");
console.log("-".repeat(78));
for (const r of rows) {
  const state = r.bad.length ? `✗ ${r.bad.length}` : r.soft.length ? `△ ${r.soft.length}` : "○";
  console.log(pad(r.id, 26) + pad(r.category, 17) + pad(r.els, 6) + pad(r.fonts, 6) + pad(r.colors, 5) + state);
}

const shout = rows.filter((r) => r.bad.length || r.soft.length);
if (shout.length) {
  console.log("\n자세히");
  for (const r of shout) {
    console.log(`  ${r.id}`);
    for (const m of r.bad) console.log(`    ✗ ${m}`);
    for (const m of r.soft) console.log(`    △ ${m}`);
  }
}

if (missing.length) {
  console.log("\n갈래별 장수");
  for (const [c, n] of Object.entries(perCat)) console.log(`  ${pad(c, 18)}${n}장`);
}

console.log(`\n오류 ${errors} · 경고 ${warns}`);
process.exit(errors > 0 ? 1 : 0);
