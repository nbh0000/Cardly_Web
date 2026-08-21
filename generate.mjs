/* 초대장 표지 아트웍 20장을 Gemini 이미지 생성 API 로 만듭니다.

   외부 패키지를 쓰지 않습니다 — fetch 와 node:fs 만 씁니다.

     export GEMINI_API_KEY=…
     node generate.mjs

   결과: cardly-artworks/01-wedding-floral-arch.png … 20장 + preview.html

   모델은 실행할 때 API 에 물어보고 화질 순으로 늘어놓습니다. 이름을 코드에
   박아 두면 그 모델이 없어진 날 조용히 죽습니다. 한 장마다 앞에서부터
   시도하고, 앞의 것이 막히면 다음 것으로 내려갑니다 — 화질 좋은 모델은
   하루 몫이 적어서 스무 장을 다 만들기 전에 막히는 일이 잦습니다.
   GEMINI_IMAGE_MODEL 을 주면 그 값 하나만 씁니다.                  */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) {
  console.error(
    "GEMINI_API_KEY 가 없습니다.\n" +
      "  export GEMINI_API_KEY=발급받은키   (PowerShell: $env:GEMINI_API_KEY = '발급받은키')",
  );
  process.exit(1);
}

const API = "https://generativelanguage.googleapis.com/v1beta";
const OUT = path.resolve("cardly-artworks");

/** 화질 순. 앞에 있는 것이 있으면 그것을 씁니다. */
const PREFERRED = [
  "gemini-3-pro-image",
  "gemini-3.1-flash-image",
  "gemini-2.5-flash-image",
];

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

/** 호출 사이 쉬는 시간 — 레이트리밋을 피합니다 */
const GAP_MS = 2000;
const TRIES = 3;
/** 한 번의 호출을 기다려 주는 시간. 4K 는 25초쯤 걸립니다 */
const REQ_MS = 100_000;

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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** API 에 물어보고 쓸 모델을 화질 순으로 늘어놓습니다 */
async function pickModels() {
  if (process.env.GEMINI_IMAGE_MODEL) return [process.env.GEMINI_IMAGE_MODEL];

  const res = await fetch(`${API}/models?key=${KEY}&pageSize=200`, {
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`모델 목록을 못 받았습니다 (${res.status})`);
  const { models = [] } = await res.json();
  const names = models.map((m) => m.name.replace(/^models\//, ""));

  const picked = PREFERRED.filter((want) => names.includes(want));
  if (picked.length) return picked;

  /* 선호 목록이 전부 없어졌을 때의 마지막 수단 — preview 가 아닌 것을
     먼저 봅니다. */
  const any = names.filter((n) => /image/.test(n) && !/preview/.test(n));
  if (any.length) return any;
  const preview = names.filter((n) => /image/.test(n));
  if (preview.length) return preview;
  throw new Error("이미지 생성 모델이 하나도 없습니다");
}

/** 한 장 만듭니다. 실패하면 예외를 던집니다 */
async function generate(model, prompt) {
  try {
    return await request(model, prompt);
  } catch (e) {
    /* 응답을 아예 시작하지 않거나 소켓이 끊긴 것 — 이 판에서는 막힌
       모델로 봅니다. 프롬프트를 고쳐도 달라지지 않습니다. */
    if (e.name === "TimeoutError" || e.name === "AbortError" || e.message === "fetch failed") {
      /* TimeoutError 의 message 는 읽기 전용이라 고쳐 쓸 수 없습니다.
         새 오류로 갈아 끼웁니다. */
      const blocked = new Error("응답이 없습니다");
      blocked.blocked = true;
      throw blocked;
    }
    throw e;
  }
}

async function request(model, prompt) {
  const res = await fetch(`${API}/models/${model}:generateContent?key=${KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    /* 시간 제한이 없으면 영영 기다립니다. 화질 좋은 모델은 하루 몫을
       다 쓰면 429 를 주는 대신 «응답을 시작하지 않는» 식으로 막히는데,
       그때 이 스크립트가 첫 장에서 멈춰 선 채로 밤을 새웁니다. */
    signal: AbortSignal.timeout(REQ_MS),
    body: JSON.stringify({
      contents: [{ parts: [{ text: PREFIX + prompt + SUFFIX }] }],
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: { aspectRatio: ASPECT, imageSize: SIZE },
      },
    }),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = body?.error?.message ?? `HTTP ${res.status}`;
    const err = new Error(msg);
    /* 400·404 는 다시 불러도 같은 답이 옵니다 — 재시도하지 않습니다. */
    err.fatal = res.status === 400 || res.status === 404;
    throw err;
  }

  const cand = body?.candidates?.[0];
  const part = cand?.content?.parts?.find((p) => p.inlineData);
  if (!part) {
    /* 안전 필터에 걸리면 그림 없이 이유만 옵니다. 프롬프트를 고쳐야
       하므로 이것도 재시도 대상이 아닙니다. */
    const why = cand?.finishReason ?? "이미지가 오지 않았습니다";
    const err = new Error(String(why));
    err.fatal = why !== "STOP";
    throw err;
  }
  return Buffer.from(part.inlineData.data, "base64");
}

/** 지수 백오프로 최대 세 번 */
async function withRetry(label, fn) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (e.fatal || e.blocked || attempt >= TRIES) throw e;
      const wait = 2000 * 2 ** (attempt - 1);
      console.log(`   ↻ ${label} 실패(${e.message}) — ${wait / 1000}초 뒤 ${attempt + 1}번째 시도`);
      await sleep(wait);
    }
  }
}

async function previewHtml(done) {
  const cells = done
    .map(
      (c) => `    <figure>
      <img src="./${c.file}" alt="${c.slug}" loading="lazy" />
      <figcaption>${c.id} · ${c.slug}</figcaption>
    </figure>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>초대장 아트웍 ${done.length}장</title>
<style>
  :root { color-scheme: light; }
  body { margin: 0; padding: 40px; background: #f4f1ec;
         font: 14px/1.5 -apple-system, "Segoe UI", "Malgun Gothic", sans-serif; color: #2b2621; }
  h1 { margin: 0 0 28px; font-size: 20px; font-weight: 600; letter-spacing: -0.01em; }
  .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 28px 24px; }
  @media (max-width: 1100px) { .grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 640px)  { .grid { grid-template-columns: repeat(2, 1fr); } }
  figure { margin: 0; }
  img { display: block; width: 100%; aspect-ratio: 5 / 7; object-fit: cover;
        border-radius: 3px; background: #fff;
        box-shadow: 0 1px 2px rgb(40 30 20 / .12), 0 12px 24px -12px rgb(40 30 20 / .28); }
  figcaption { margin-top: 10px; font-size: 12px; color: #6d655c; letter-spacing: .01em; }
</style>
</head>
<body>
  <h1>초대장 아트웍 — ${done.length}장</h1>
  <div class="grid">
${cells}
  </div>
</body>
</html>
`;
}

/* ── 실행 ────────────────────────────────────────────────── */

await mkdir(OUT, { recursive: true });

/* 쓸 수 있는 모델을 화질 순으로 늘어놓습니다. 한 장을 만들 때 앞에서부터
   시도하고, 앞의 것이 막히면 다음 것으로 내려갑니다.

   화질 좋은 모델은 하루 몫이 훨씬 적습니다. 다 쓰고 나면 429 를 주는 대신
   응답을 아예 시작하지 않는 식으로 막히는데, 그때 스무 장을 통째로
   포기하는 것보다 한 급 아래 모델로 마저 만드는 편이 낫습니다. 도중에
   앞의 모델이 풀리면 그다음 장부터 다시 그것으로 올라갑니다. */
const models = await pickModels();
console.log(
  `모델: ${models.join(" → ")}   비율: ${ASPECT}   크기: ${SIZE}   저장: ${OUT}\n`,
);
/**
 * 앞에서부터 시도해 처음 성공한 것을 돌려줍니다.
 *
 * 연결 자체가 막히는 모델은 그 자리에서 목록에서 빼 버립니다. 화질 좋은
 * 모델은 하루 몫을 다 쓰면 429 를 주는 대신 응답을 시작하지 않는 식으로
 * 막히는데, 그것을 스무 번 다시 물어보면 스무 번 다 기다리게 됩니다.
 * 한 번 막힌 것은 이번 판에서는 막힌 것으로 칩니다.
 */
async function generateWithFallback(prompt) {
  let last;
  for (const model of [...models]) {
    try {
      return { bytes: await withRetry(model, () => generate(model, prompt)), model };
    } catch (e) {
      last = e;
      /* 프롬프트가 문제면 모델을 바꿔도 같은 답이 옵니다 */
      if (e.fatal) throw e;
      if (e.blocked && models.length > 1) {
        models.splice(models.indexOf(model), 1);
        console.log(`   ↧ ${model} 이 막혔습니다(${e.message}) — 남은 장은 다음 모델로`);
      } else {
        console.log(`   ↧ ${model} 실패(${e.message}) — 다음 모델로`);
      }
    }
  }
  throw last ?? new Error("쓸 수 있는 모델이 없습니다");
}

const done = [];
const failed = [];

/* ONLY=02,07 처럼 주면 그 번호만 다시 만듭니다. 스무 장 가운데 몇 장만
   마음에 안 들 때 나머지를 새로 뽑지 않기 위한 것입니다 — 다시 뽑으면
   이미 좋은 그림도 다른 그림이 되어 버립니다. */
const only = process.env.ONLY?.split(",").map((s) => s.trim()).filter(Boolean);
const queue = only ? CARDS.filter((c) => only.includes(c.id)) : CARDS;
if (only) console.log(`다시 만들 것: ${queue.map((c) => c.id).join(", ")}\n`);

for (const [i, card] of queue.entries()) {
  const file = `${card.id}-${card.slug}.png`;
  process.stdout.write(`[${i + 1}/${queue.length}] ${file} … `);
  try {
    const { bytes, model } = await generateWithFallback(card.prompt);
    await writeFile(path.join(OUT, file), bytes);
    done.push({ ...card, file });
    console.log(
      `${(bytes.length / 1024 / 1024).toFixed(1)}MB` +
        (model === models[0] ? "" : `  (${model})`),
    );
  } catch (e) {
    failed.push({ ...card, file, why: e.message });
    console.log(`실패 — ${e.message}`);
  }
  if (i < queue.length - 1) await sleep(GAP_MS);
}

await writeFile(path.join(OUT, "preview.html"), await previewHtml(done), "utf8");

console.log(`\n성공 ${done.length}장 · 실패 ${failed.length}장`);
for (const c of done) console.log(`  ${path.join(OUT, c.file)}`);
if (failed.length) {
  console.log("\n실패 목록");
  for (const c of failed) console.log(`  ${c.file} — ${c.why}`);
}
console.log(`\n미리보기: ${path.join(OUT, "preview.html")}`);
