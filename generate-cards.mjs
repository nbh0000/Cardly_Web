/* 명함 배경 스무 장을 Gemini 이미지 생성 API 로 만듭니다.

     export GEMINI_API_KEY=…          # PowerShell: $env:GEMINI_API_KEY = '…'
     node generate-cards.mjs
     ONLY=03,11 node generate-cards.mjs   # 몇 장만 다시

   결과: cardly-cards/01-navy-gold-deco.png … 20장 + preview.html
   들이기: npm run card:import

   ── 명함 배경은 초대장 표지와 다릅니다 ─────────────────────────
   초대장은 그림이 주인공이고 글자는 안에 있습니다. 명함은 반대로 «글자가
   주인공» 이고 배경은 그 뒤에 깔립니다. 이름·직함·연락처가 앉을 자리가
   비어 있지 않으면 아무리 예쁜 그림도 쓸 수 없습니다.

   그래서 프롬프트마다 «어느 쪽을 비워 둘 것인가» 를 적습니다. 그리고
   비워 둔 쪽에 글자가 앉도록 템플릿마다 배치 원형을 골라 짝지어 줍니다
   (lib/studio/card-templates.ts).

   ── 2K 와 4K 를 섞습니다 ──────────────────────────────────────
   명함은 인쇄물입니다. 저장하는 PNG 가 90 × 50 mm 에 약 800dpi 라, 배경이
   2700px 보다 좁으면 인쇄에서 흐려집니다. 그래서 «결이 있는» 배경 —
   대리석, 가죽, 리넨, 금박, 콘크리트 — 은 4K 로 받습니다.

   반대로 «결이 없는» 배경 — 단색 위의 가는 선, 넓은 그러데이션, 큰 색면 —
   은 2K 로 충분합니다. 확대해도 새로 나올 세부가 없어서, 4K 로 받아 봐야
   같은 그림을 네 배 무겁게 들고 있을 뿐입니다. 화질이 아니라 «담긴 정보»
   에 맞춰 고릅니다.                                                */

import path from "node:path";
import { runBatch } from "./scripts/gemini-image.mjs";

/* 명함은 90 × 50 mm — 가로 1.8 : 1 입니다. 생성 API 가 받는 비율 가운데
   가장 가까운 것이 16:9(1.78) 라 그것으로 받고, 들일 때 9:5 로 자릅니다. */
const ASPECT = "16:9";

const PREFIX =
  "Horizontal business card background artwork, 16:9, full bleed, premium print quality. ";

/* 글자는 명함 편집기가 얹습니다. 배경에 글자가 그려져 오면 그 위에 이름을
   또 얹게 되어 못 씁니다. 사람·로고·상표도 마찬가지입니다. */
const SUFFIX =
  " This is a background surface only — the artwork must fill the entire frame edge to edge." +
  " Absolutely no text, no letters, no numbers, no typography, no logos, no brand marks," +
  " no watermark, no signature, no people, no mockup, no card shape, no borders, no drop shadows.";

const CARDS = [
  /* ── 결이 있는 배경 — 4K ────────────────────────────────── */
  {
    id: "01",
    slug: "marble-noir",
    size: "4K",
    prompt:
      "Polished black marble slab with fine gold veining running diagonally through the lower left, deep charcoal base, subtle stone grain, soft directional sheen, the upper right two thirds left calm and almost plain",
  },
  {
    id: "02",
    slug: "linen-sand",
    size: "4K",
    prompt:
      "Natural sand-coloured linen weave, woven fibre texture in warm oatmeal and pale beige, even lighting, very shallow relief, no pattern or motif — a plain premium paper stock surface",
  },
  {
    id: "03",
    slug: "leather-burgundy",
    size: "4K",
    prompt:
      "Deep burgundy full-grain leather, fine natural pebble grain, warm oxblood tone deepening towards the edges, soft studio light, luxurious and restrained",
  },
  {
    id: "04",
    slug: "concrete-cool",
    size: "4K",
    prompt:
      "Smooth polished concrete in cool pale grey, faint mineral mottling and hairline variation, architectural and calm, even flat lighting, no cracks",
  },
  {
    id: "05",
    slug: "foil-navy",
    size: "4K",
    prompt:
      "Deep midnight navy with fine brushed gold foil lines forming a restrained geometric pattern along the left third only, metallic sheen catching the light, the right two thirds a clean unbroken navy field",
  },
  {
    id: "06",
    slug: "kraft-olive",
    size: "4K",
    prompt:
      "Recycled kraft paper in warm tan with visible fibre flecks, a single hand-painted deep olive band running down the left edge, matte and tactile, rest of the surface plain kraft",
  },
  {
    id: "07",
    slug: "terrazzo-cream",
    size: "4K",
    prompt:
      "Fine terrazzo surface, warm cream base with small scattered chips in terracotta, sage and charcoal, chips concentrated towards the bottom edge and thinning out upward leaving the top half nearly plain",
  },
  {
    id: "08",
    slug: "metal-graphite",
    size: "4K",
    prompt:
      "Brushed graphite metal, fine horizontal brush lines, dark gunmetal grey with a cool highlight sweeping across the middle, industrial and precise",
  },
  {
    id: "09",
    slug: "botanical-forest",
    size: "4K",
    prompt:
      "Very dark forest green ground with deep tonal botanical leaves — monstera and fern — massed along the right third in near-black silhouette, the left two thirds an unbroken dark green field",
  },
  {
    id: "10",
    slug: "watercolour-slate",
    size: "4K",
    prompt:
      "Loose watercolour wash in muted slate blue and pale grey bleeding across the top left corner, granulating pigment and water blooms on cold-press paper, fading to bare warm white paper across the rest",
  },

  /* ── 결이 없는 배경 — 2K ────────────────────────────────── */
  {
    id: "11",
    slug: "ivory-plain",
    size: "2K",
    prompt:
      "Plain warm ivory surface with an extremely subtle vertical tonal gradient, one thin muted gold hairline rule running down the left edge, otherwise completely empty and calm",
  },
  {
    id: "12",
    slug: "gradient-dusk",
    size: "2K",
    prompt:
      "Smooth wide gradient mesh blending dusty coral into soft lavender and pale peach, no hard edges, no shapes, soft dreamy dusk light",
  },
  {
    id: "13",
    slug: "deco-emerald",
    size: "2K",
    prompt:
      "Rich emerald green field with a single large art-deco fan of thin gold rays radiating from the bottom right corner, flat vector style, the upper left kept completely clear",
  },
  {
    id: "14",
    slug: "arc-blush",
    size: "2K",
    prompt:
      "Soft blush pink field with one thin muted gold arc sweeping through the right side, flat and minimal, generous empty space, nothing else",
  },
  {
    id: "15",
    slug: "riso-duo",
    size: "2K",
    prompt:
      "Risograph print look, warm cream paper with two large overlapping circles in brick red and cornflower blue at the right edge, visible ink grain and slight misregistration, left side clean paper",
  },
  {
    id: "16",
    slug: "midcentury-blocks",
    size: "2K",
    prompt:
      "Mid-century modern abstract composition, flat cut-paper shapes in mustard, teal and off-white stacked along the left third, warm cream ground filling the rest",
  },
  {
    id: "17",
    slug: "grid-white",
    size: "2K",
    prompt:
      "Bright warm white surface with a very faint embossed square grid, tone-on-tone, almost invisible, minimal Swiss design feeling, no colour",
  },
  {
    id: "18",
    slug: "night-constellation",
    size: "2K",
    prompt:
      "Deep indigo night field with a sparse scattering of tiny pale gold dots and two or three fine connecting lines in the upper right, vast empty indigo elsewhere",
  },
  {
    id: "19",
    slug: "iridescent-pastel",
    size: "2K",
    prompt:
      "Soft iridescent holographic sheen, pale mint, lilac and peach blending in wide smooth bands, pearlescent and light, no hard edges",
  },
  {
    id: "20",
    slug: "clay-terracotta",
    size: "2K",
    prompt:
      "Flat warm terracotta clay field with one large soft off-white semicircle rising from the bottom edge, minimal and calm, earthy palette",
  },
];

await runBatch(CARDS, {
  out: path.resolve("cardly-cards"),
  aspect: ASPECT,
  /* 장마다 size 를 적어 두었으므로 이 값은 쓰이지 않지만, 새 항목을
     추가하면서 size 를 빠뜨렸을 때의 기본값입니다. */
  size: "4K",
  prefix: PREFIX,
  suffix: SUFFIX,
  title: "명함 배경",
});
