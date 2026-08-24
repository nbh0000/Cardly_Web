/* 인쇄물 배경 그림 만들기 — 2차(템플릿 대량 제작)에서 쓰는 도구.

   편집기 안의 «배경 그림» 단추는 사용자가 한 장씩 부르는 것이고, 이
   스크립트는 우리가 템플릿에 실을 그림을 한꺼번에 뽑는 것입니다. 부르는
   모델과 실패 처리는 초대장·명함과 같은 것을 씁니다(gemini-image.mjs).

   실행:
     $env:GEMINI_API_KEY = '발급받은키'      (PowerShell)
     export GEMINI_API_KEY=발급받은키        (bash)
     npm run print:art                       전부
     npm run print:art -- poster             한 갈래만
     ONLY=01,03 npm run print:art -- poster  그 번호만 다시

   키는 환경변수로만 받습니다. 파일에 적거나 커밋하지 마세요.

   결과는 public/print-art/<갈래>/ 에 떨어집니다. 2차에서 템플릿의
   background.image 가 이 주소를 가리키게 됩니다.                        */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { runBatch } from "./gemini-image.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "print-art");

/* 글자를 그려 넣지 말라고 매번 붙입니다. 모델은 «포스터» 라는 말만 들으면
   가짜 글자를 그려 넣는데, 그 위에 진짜 글자를 얹으면 둘이 겹칩니다. */
const SUFFIX =
  " No text, no letters, no numbers, no logos, no watermark. " +
  "Leave generous empty space for typography. Print quality, clean edges, " +
  "no borders, no frame, full bleed composition.";

const SETS = {
  flyer: {
    aspect: "3:4",
    size: "2K",
    cards: [
      { id: "01", slug: "paper-texture", prompt: "Warm off-white paper texture with a soft diagonal light gradient, subtle fiber grain, minimal, editorial." },
      { id: "02", slug: "spring-branch", prompt: "A single bare branch with a few pale blossoms entering from the top-left corner against a cream background, soft daylight, photographic, shallow depth of field." },
      { id: "03", slug: "ink-wash", prompt: "Loose indigo ink wash sweeping across the lower third of a white field, dry brush edges, plenty of empty space above." },
    ],
  },
  coupon: {
    aspect: "16:9",
    size: "2K",
    cards: [
      { id: "01", slug: "kraft", prompt: "Flat kraft paper surface, warm tan, fine speckles, even lighting, no shadows." },
      { id: "02", slug: "coffee-ring", prompt: "Cream paper with one faint coffee cup ring in the far corner, rest of the field empty, soft natural light." },
    ],
  },
  poster: {
    aspect: "3:4",
    size: "4K",
    cards: [
      { id: "01", slug: "night-hall", prompt: "Dark teal concert hall interior dissolving into deep shadow, a single warm stage light pooling at the bottom, cinematic, grainy film photograph." },
      { id: "02", slug: "risograph-shapes", prompt: "Two overlapping flat shapes in coral and deep blue on off-white, risograph print texture with visible misregistration, mid-century poster feel." },
      { id: "03", slug: "summer-sea", prompt: "Overexposed film photograph of a calm sea horizon at noon, pale sky filling the upper two thirds, heavy grain." },
    ],
  },
  banner: {
    aspect: "21:9",
    size: "4K",
    cards: [
      { id: "01", slug: "deep-navy", prompt: "Deep navy field with a slow diagonal light gradient from the left, very subtle canvas weave texture, no objects." },
      { id: "02", slug: "harvest", prompt: "Wide photograph of ripe rice stalks lit from behind at golden hour, blurred into soft bands, warm and clean." },
    ],
  },
  "standing-banner": {
    aspect: "9:16",
    size: "4K",
    cards: [
      { id: "01", slug: "soft-arc", prompt: "Vertical composition, pale grey background with one enormous soft arc of light blue rising from the bottom, minimal, matte." },
      { id: "02", slug: "office-light", prompt: "Vertical photograph of a bright empty office corner, white wall, one plant leaf at the lower edge, soft morning light, plenty of blank wall." },
    ],
  },
  menu: {
    aspect: "3:4",
    size: "2K",
    cards: [
      { id: "01", slug: "linen", prompt: "Close photograph of natural linen cloth, warm ivory, even soft light, fine weave, no folds crossing the centre." },
      { id: "02", slug: "walnut", prompt: "Dark walnut wood surface photographed straight on, fine grain, warm low light falling from the top-left." },
    ],
  },
};

const wanted = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const groups = wanted.length ? wanted : Object.keys(SETS);

for (const group of groups) {
  const set = SETS[group];
  if (!set) {
    console.error(`모르는 갈래입니다: ${group}\n고를 수 있는 것: ${Object.keys(SETS).join(", ")}`);
    process.exitCode = 1;
    continue;
  }
  console.log(`\n── ${group} ──`);
  await runBatch(set.cards, {
    out: path.join(OUT, group),
    aspect: set.aspect,
    size: set.size,
    suffix: SUFFIX,
    title: `인쇄물 배경 · ${group}`,
  });
}
