/* 초대장 표지 그림 스무 장을 Gemini 이미지 생성 API 로 만듭니다.

     export GEMINI_API_KEY=…          # PowerShell: $env:GEMINI_API_KEY = '…'
     node generate.mjs
     ONLY=02,07 node generate.mjs     # 몇 장만 다시

   결과: cardly-artworks/01-wedding-floral-arch.png … 20장 + preview.html
   들이기: npm run art:import

   모델을 고르고, 막힌 모델을 피해 가고, 실패를 다시 시도하는 일은 전부
   scripts/gemini-image.mjs 가 합니다. 이 파일은 «무엇을 그릴지» 만 적습니다.
   명함 배경(generate-cards.mjs)도 같은 엔진을 씁니다.                */

import path from "node:path";
import { runBatch } from "./scripts/gemini-image.mjs";

/* 카드는 세로 5:7 입니다. 생성 API 가 받는 비율 가운데 가장 가까운 것이
   3:4 라 3:4 로 받고, 제품에 넣을 때 5:7 로 잘라 씁니다. 처음부터 좁게
   받으면 잘라 낼 여유가 없어 구도가 상합니다. */
const ASPECT = "3:4";

/* 받을 수 있는 가장 큰 판으로 받습니다. 표지는 카드 화면을 가득 채우는
   그림이라, 화면 배율이 2배·3배인 기기에서 흐려지면 그것으로 끝입니다.
   줄이는 것은 언제든 할 수 있지만 없는 화소를 만들어 낼 수는 없습니다. */
const SIZE = process.env.GEMINI_IMAGE_SIZE ?? "4K";

const PREFIX =
  "Vertical 5:7 portrait greeting card artwork, full-bleed illustration, high resolution, textured paper feel. ";

/* 뒤에 붙는 «액자를 그리지 마라» 가 길어 보이지만 전부 실제로 나온 사고를
   막는 문장입니다. 첫 판에서 스무 장 가운데 여덟 장이 그림이 아니라
   «인쇄된 카드를 찍은 사진» 으로 왔습니다 — 손에 들린 카드, 봉투 위에
   놓인 카드, 흰 여백과 그림자가 있는 카드. 그대로 표지에 깔면 카드 안에
   카드가 한 장 더 들어앉습니다. */
const SUFFIX =
  " The illustration must fill the entire frame edge to edge, like a full-bleed printed cover." +
  " Do not depict a greeting card, a sheet of paper, an envelope, a hand, a desk or any mockup" +
  " — this image IS the artwork itself, not a photograph of a printed card." +
  " No borders, no white margins, no drop shadows, no framing." +
  " Absolutely no text, no letters, no typography, no watermark, no signature.";

const CARDS = [
  {
    id: "01",
    slug: "wedding-floral-arch",
    prompt:
      "Hand-painted gouache illustration of a lush floral arch with peonies, ranunculus and eucalyptus in soft blush pink, ivory and sage green, two small white doves at the top, cream background with subtle paper texture, soft empty space in the center for text overlay",
  },
  {
    id: "02",
    slug: "wedding-line-couple",
    prompt:
      "Minimal continuous line drawing of a bride and groom embracing, single black ink line on warm ivory background, one small gold foil heart accent, generous negative space, sophisticated and quiet",
  },
  {
    id: "03",
    slug: "engagement-rings",
    prompt:
      "Watercolor illustration of two intertwined gold rings surrounded by delicate wildflowers and baby's breath, soft blush and champagne palette, loose painterly style with visible brush strokes, light cream background",
  },
  {
    id: "04",
    slug: "bridal-shower",
    prompt:
      "Playful flat illustration of a champagne tower with pink bubbles floating up turning into small hearts and flowers, pastel pink and gold palette, cute feminine mood, soft texture",
  },
  {
    id: "05",
    slug: "dol-baby-tiger",
    prompt:
      "Adorable children's book illustration of a baby tiger cub wearing a tiny traditional Korean hanbok, sitting among soft clouds and stars, warm pastel palette of peach, cream and mint, soft colored pencil texture",
  },
  {
    id: "06",
    slug: "dol-table",
    prompt:
      "Warm gouache illustration of a Korean doljanchi table with stacked rainbow rice cakes, fruit and thread spool, viewed from front, soft hanji paper texture background in warm ivory, folk-art style with muted traditional Korean colors",
  },
  {
    id: "07",
    slug: "baby-shower-moon",
    prompt:
      "Dreamy illustration of a sleeping baby bunny curled up on a crescent moon among twinkling stars and drifting clouds, soft night palette of dusty blue, lavender and warm gold, gentle airbrush texture",
  },
  {
    id: "08",
    slug: "birthday-animals",
    prompt:
      "Charming hand-drawn illustration of party animals, a cat, a dog and a hamster wearing paper party hats blowing tiny trumpets with confetti falling, quirky humorous style, bright but warm palette on cream background, visible pencil and gouache texture",
  },
  {
    id: "09",
    slug: "birthday-cake",
    prompt:
      "Retro-style illustration of a tall whimsical layered birthday cake with lit candles and cherries, slightly wobbly hand-painted charm, warm 1970s palette of mustard, coral, cream and brown, grainy print texture",
  },
  {
    id: "10",
    slug: "kids-dino",
    prompt:
      "Cute children's illustration of a green dinosaur wearing a party hat holding balloons, surrounded by confetti and wrapped gifts, bold flat colors with crayon texture, cheerful primary palette softened to pastel",
  },
  {
    id: "11",
    slug: "hwangap-peony",
    prompt:
      "Elegant Korean traditional minhwa style painting of blooming red and pink peonies with butterflies, deep burgundy and gold accents on aged hanji paper background, refined folk-art brushwork, celebratory and dignified mood",
  },
  {
    id: "12",
    slug: "anniversary-carnation",
    prompt:
      "Soft watercolor bouquet of carnations and garden roses in warm coral, deep pink and cream, loose romantic brushwork with water blooms, gentle ivory background, heartfelt and warm",
  },
  {
    id: "13",
    slug: "housewarming",
    prompt:
      "Cozy illustration of a charming small house at dusk with warm glowing windows, potted plants by the door and a cat on the doorstep, soft gouache texture, warm terracotta, sage and cream palette",
  },
  {
    id: "14",
    slug: "homeparty-wine",
    prompt:
      "Stylish mid-century illustration of two wine glasses clinking with grapes, cheese and olives on a table, flat cut-out shapes, burgundy, cream and olive green palette, sophisticated dinner party mood",
  },
  {
    id: "15",
    slug: "garden-party",
    prompt:
      "Lush botanical illustration of a garden table setting under hanging string lights and greenery, dappled sunlight, watercolor and ink style, fresh palette of greens, lemon yellow and white, airy summer mood",
  },
  {
    id: "16",
    slug: "picnic",
    prompt:
      "Warm illustration of a picnic scene from above, red gingham blanket, wicker basket, sandwiches, lemonade and a small dachshund sniffing the basket, flat lay composition, cheerful hand-painted style with soft grain",
  },
  {
    id: "17",
    slug: "christmas-party",
    prompt:
      "Festive illustration of a decorated Christmas tree with warm glowing lights, presents below and a cat batting at an ornament, cozy Scandinavian style, deep green, cranberry red, cream and gold palette, soft grainy texture",
  },
  {
    id: "18",
    slug: "yearend-party",
    prompt:
      "Glamorous art-deco illustration of champagne coupe glasses, fireworks and gold geometric rays on deep midnight navy, gold foil texture accents, elegant celebratory mood",
  },
  {
    id: "19",
    slug: "newyear-sunrise",
    prompt:
      "Serene minimal illustration of a red sun rising over calm ocean waves and a crane flying across, modern flat style with subtle risograph grain, palette of vermilion red, navy, cream and gold, hopeful and clean",
  },
  /* 20번은 붙여 주신 목록에서 잘려 오지 않아, 빠져 있던 «개업·오픈»
     갈래로 채웠습니다. 다른 그림을 원하시면 이 항목만 바꾸면 됩니다. */
  {
    id: "20",
    slug: "opening-shop",
    prompt:
      "Charming illustration of a small shop front on opening day, striped awning, a bay tree in a pot either side of the open door, a hand-lettered blank sign board and a paper garland, warm sunlight, gouache and ink style, palette of ochre, deep green, brick red and cream",
  },
];

await runBatch(CARDS, {
  out: path.resolve("cardly-artworks"),
  aspect: ASPECT,
  size: SIZE,
  prefix: PREFIX,
  suffix: SUFFIX,
  title: "초대장 아트웍",
});
