/* 초대장 공유 썸네일(OG 이미지)을 디자인마다 한 장씩 만듭니다.

   카카오톡·문자에 링크를 붙였을 때 뜨는 그림입니다. 정적 배포라 초대장마다
   다른 그림을 만들 수는 없지만, 디자인마다 한 장씩 미리 만들어 두면 «어떤
   카드가 오는지» 는 보입니다. 아무것도 안 뜨는 것보다 훨씬 낫습니다.

   그림에 글자는 넣지 않습니다. 서버에서 한글을 그리려면 어떤 글꼴이 깔려
   있는지에 기대야 하는데, 빌드 환경마다 달라서 어느 날 조용히 네모로
   바뀝니다. 대신 «바닥에 놓인 카드 한 장» 을 그립니다 — 표지 그림이
   그대로 보이므로 카드를 알아볼 수 있습니다.

   디자인 id 와 표지 그림 파일 이름이 같습니다. 그래서 이 스크립트는
   designs.ts 를 읽지 않고 public/art/ 를 그대로 훑습니다 — TS 를 정규식으로
   파싱하던 예전 방식은 designs.ts 의 모양이 바뀔 때마다 조용히 깨졌습니다.

     node scripts/make-og.mjs
*/

import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const ART = path.join(ROOT, "public", "art");
const OUT = path.join(ROOT, "public", "og", "invitation-card");

/** 카카오톡·오픈그래프가 기대하는 가로세로 */
const W = 1200;
const H = 630;
/** 그 안에 놓이는 카드 (5 : 7) */
const CARD_W = 340;
const CARD_H = Math.round(CARD_W * 1.4);
const CARD_X = Math.round((W - CARD_W) / 2);
const CARD_Y = Math.round((H - CARD_H) / 2);

/** 카드가 놓인 바닥 — 아주 옅은 따뜻한 회색 */
const SURFACE = "#F1ECE3";

/** 카드 아래 그림자 한 겹 */
async function shadow() {
  const pad = 40;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W + pad * 2}" height="${CARD_H + pad * 2}">
    <rect x="${pad}" y="${pad + 10}" width="${CARD_W}" height="${CARD_H}" rx="3" fill="rgb(40,28,18)" opacity="0.34"/>
  </svg>`;
  return sharp(Buffer.from(svg)).blur(18).png().toBuffer();
}

await mkdir(OUT, { recursive: true });

const files = (await readdir(ART)).filter((f) => f.endsWith(".webp"));
if (files.length === 0) {
  throw new Error("public/art/ 에 표지 그림이 없습니다 — scripts/import-artwork.mjs 를 먼저 돌리세요");
}

const blur = await shadow();

for (const file of files) {
  const card = await sharp(path.join(ART, file))
    .resize(CARD_W, CARD_H, { fit: "cover" })
    .png()
    .toBuffer();

  await sharp({
    create: { width: W, height: H, channels: 3, background: SURFACE },
  })
    .composite([
      { input: blur, left: CARD_X - 40, top: CARD_Y - 40 },
      { input: card, left: CARD_X, top: CARD_Y },
    ])
    .jpeg({ quality: 86 })
    .toFile(path.join(OUT, `${file.replace(/\.webp$/, "")}.jpg`));
}

console.log(`\n${files.length}장 만들었습니다 → public/og/invitation-card/`);
