/* 갈래마다 카카오톡·검색에 뜨는 미리보기 그림(OG) 만들기.

   1200 × 630 은 페이스북이 정하고 나머지가 따라간 크기입니다. 우리가 만든
   배경 그림을 그 비율로 잘라 씁니다 — 글자를 얹지 않는 이유는, 얹으려면
   서버에서 한글 글꼴을 렌더해야 하고 그 준비물이 운영체제마다 달라서
   «내 컴퓨터에서만 되는» 스크립트가 되기 때문입니다. 제목과 설명은 어차피
   <meta> 로 따로 갑니다.

   실행:
     npm run print:og

   결과는 public/og/print-<갈래>.jpg 입니다.                              */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ART = path.join(ROOT, "public", "print-art");
const OUT = path.join(ROOT, "public", "og");

const W = 1200;
const H = 630;

/** 갈래마다 얼굴이 될 그림. 사람이 고른 것이라 여기 적습니다 */
const FACE = {
  flyer: "flyer-cafe-photo",
  coupon: "coupon-kraft-texture",
  poster: "poster-concert-photo",
  banner: "banner-open-photo",
  "standing-banner": "sb-realestate-photo",
  menu: "menu-marble-photo",
};

/** 그림에서 어디를 남길지 — 대부분 위쪽이 비어 있어 가운데를 잡습니다 */
const FOCUS = {
  flyer: "attention",
  coupon: "centre",
  poster: "attention",
  banner: "centre",
  "standing-banner": "attention",
  menu: "centre",
};

const registry = JSON.parse(await readFile(path.join(ROOT, "lib", "print", "art.json"), "utf8"));
await mkdir(OUT, { recursive: true });

let made = 0;
for (const [category, artId] of Object.entries(FACE)) {
  const art = registry.art.find((a) => a.id === artId);
  if (!art?.file) {
    console.log(`건너뜀 ${category} — 그림 ${artId} 이 아직 없습니다`);
    continue;
  }
  const src = path.join(ART, art.file);
  if (!existsSync(src)) {
    console.log(`건너뜀 ${category} — ${art.file} 파일이 없습니다`);
    continue;
  }

  const out = path.join(OUT, `print-${category}.jpg`);
  const bytes = await sharp(src, { limitInputPixels: false })
    .resize(W, H, {
      fit: "cover",
      position: FOCUS[category] === "attention" ? sharp.strategy.attention : "centre",
    })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  await writeFile(out, bytes);
  console.log(`${category.padEnd(18)}${art.file} → ${path.basename(out)} (${Math.round(bytes.length / 1024)}KB)`);
  made++;
}

console.log(`\n${made}장 만들었습니다.`);
