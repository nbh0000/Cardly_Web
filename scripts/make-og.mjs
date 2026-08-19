/* 초대장 공유 썸네일(OG 이미지)을 디자인마다 한 장씩 만듭니다.

   카카오톡·문자에 링크를 붙였을 때 뜨는 그림입니다. 정적 배포라 초대장마다
   다른 그림을 만들 수는 없지만, 디자인마다 한 장씩 미리 만들어 두면 «어떤
   카드가 오는지» 는 보입니다. 아무것도 안 뜨는 것보다 훨씬 낫습니다.

   그림에 글자는 넣지 않습니다. 서버에서 한글을 그리려면 어떤 글꼴이 깔려
   있는지에 기대야 하는데, 빌드 환경마다 달라서 어느 날 조용히 네모로
   바뀝니다. 대신 «바닥에 놓인 카드 한 장» 을 그립니다 — 표지 그림이나
   종이색이 그대로 보이므로 카드를 알아볼 수 있습니다.

     node scripts/make-og.mjs
*/

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const ART = path.join(ROOT, "public", "art");
const OUT = path.join(ROOT, "public", "og", "invitation-card");

/** 카카오톡·오픈그래프가 기대하는 가로세로 */
const W = 1200;
const H = 630;
/** 그 안에 놓이는 카드 (1 : 1.414) */
const CARD_W = 336;
const CARD_H = Math.round(CARD_W * 1.414);
const CARD_X = Math.round((W - CARD_W) / 2);
const CARD_Y = Math.round((H - CARD_H) / 2);

/** designs.ts 에서 id·색·그림만 뽑아 옵니다 (TS 를 실행하지 않으려고 정규식으로) */
async function readDesigns() {
  const src = await readFile(path.join(ROOT, "lib", "occasion", "designs.ts"), "utf8");
  const out = [];
  const re =
    /id:\s*"([a-z0-9-]+)",[\s\S]*?kind:\s*"(photo|graphic)",[\s\S]*?(?:art:\s*"([^"]+)",[\s\S]*?)?bg:\s*"(#[0-9A-Fa-f]{6})",\s*\n\s*ink:\s*"(#[0-9A-Fa-f]{6})",\s*\n\s*point:\s*"(#[0-9A-Fa-f]{6})"/g;
  let m;
  while ((m = re.exec(src))) {
    out.push({ id: m[1], kind: m[2], art: m[3], bg: m[4], ink: m[5], point: m[6] });
  }
  return out;
}

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

/** 일러스트형 카드 한 장 — 종이색 + 강조색 액자선 */
async function graphicCard(design) {
  const inset = 22;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${CARD_H}">
    <rect width="${CARD_W}" height="${CARD_H}" rx="3" fill="${design.bg}"/>
    <rect x="${inset}" y="${inset}" width="${CARD_W - inset * 2}" height="${CARD_H - inset * 2}"
          fill="none" stroke="${design.point}" stroke-width="1.5" opacity="0.9"/>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** 사진형 카드 한 장 — 표지 그림을 카드 크기로 채웁니다 */
async function photoCard(design) {
  return sharp(path.join(ART, design.art))
    .resize(CARD_W, CARD_H, { fit: "cover", position: "attention" })
    .png()
    .toBuffer();
}

await mkdir(OUT, { recursive: true });

const designs = await readDesigns();
if (designs.length === 0) {
  throw new Error("designs.ts 에서 디자인을 읽지 못했습니다 — 정규식을 확인하세요");
}

const shade = await shadow();

for (const design of designs) {
  const card =
    design.kind === "photo" && design.art
      ? await photoCard(design)
      : await graphicCard(design);

  const png = await sharp({
    create: { width: W, height: H, channels: 3, background: SURFACE },
  })
    .composite([
      { input: shade, left: CARD_X - 40, top: CARD_Y - 40 },
      { input: card, left: CARD_X, top: CARD_Y },
    ])
    /* OG 는 투명도가 필요 없고 사진이 절반입니다. PNG 로 두면 24장이
       3.4MB 인데 JPEG 로는 그 5분의 1입니다. */
    .jpeg({ quality: 84, chromaSubsampling: "4:4:4" })
    .toBuffer();

  await writeFile(path.join(OUT, `${design.id}.jpg`), png);
  console.log(`${design.id}.jpg  (${design.kind})`);
}

console.log(`\n${designs.length}장 만들었습니다 → public/og/invitation-card/`);
