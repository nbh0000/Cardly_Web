/* Gemini 이미지 생성 — 초대장과 명함이 함께 쓰는 부분.

   부르는 쪽(generate.mjs, generate-cards.mjs)은 «무엇을 그릴지» 만 적고,
   모델을 고르고 막힌 것을 피해 가는 일은 전부 여기서 합니다.

   외부 패키지를 쓰지 않습니다 — fetch 와 node:fs 만 씁니다.           */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const API = "https://generativelanguage.googleapis.com/v1beta";

/** 화질 순. 앞의 것이 막히면 뒤로 내려갑니다. */
const PREFERRED = [
  "gemini-3-pro-image",
  "gemini-3.1-flash-image",
  "gemini-2.5-flash-image",
];

/** 호출 사이 쉬는 시간 — 레이트리밋을 피합니다 */
const GAP_MS = 2000;
const TRIES = 3;
/** 한 번의 호출을 기다려 주는 시간. 4K 는 30초쯤 걸립니다 */
const REQ_MS = 100_000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function requireKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error(
      "GEMINI_API_KEY 가 없습니다.\n" +
        "  export GEMINI_API_KEY=발급받은키   (PowerShell: $env:GEMINI_API_KEY = '발급받은키')",
    );
    process.exit(1);
  }
  return key;
}

/**
 * 쓸 수 있는 모델을 화질 순으로 늘어놓습니다.
 *
 * 이름을 코드에 박아 두면 그 모델이 없어진 날 조용히 죽습니다. 실행할 때
 * 물어보고, 선호 목록이 전부 사라졌으면 이름에 image 가 들어간 것을 씁니다.
 */
export async function pickModels(key) {
  if (process.env.GEMINI_IMAGE_MODEL) return [process.env.GEMINI_IMAGE_MODEL];

  const res = await fetch(`${API}/models?key=${key}&pageSize=200`, {
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`모델 목록을 못 받았습니다 (${res.status})`);
  const { models = [] } = await res.json();
  const names = models.map((m) => m.name.replace(/^models\//, ""));

  const picked = PREFERRED.filter((want) => names.includes(want));
  if (picked.length) return picked;

  const any = names.filter((n) => /image/.test(n) && !/preview/.test(n));
  if (any.length) return any;
  const preview = names.filter((n) => /image/.test(n));
  if (preview.length) return preview;
  throw new Error("이미지 생성 모델이 하나도 없습니다");
}

async function request(key, model, prompt, aspect, size) {
  const res = await fetch(`${API}/models/${model}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    /* 시간 제한이 없으면 영영 기다립니다. 화질 좋은 모델은 하루 몫을
       다 쓰면 429 를 주는 대신 «응답을 시작하지 않는» 식으로 막히는데,
       그때 이 스크립트가 첫 장에서 멈춰 선 채로 밤을 새웁니다. */
    signal: AbortSignal.timeout(REQ_MS),
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: { aspectRatio: aspect, imageSize: size },
      },
    }),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(body?.error?.message ?? `HTTP ${res.status}`);
    /* 400·404 는 다시 불러도 같은 답이 옵니다 */
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

async function generate(key, model, prompt, aspect, size) {
  try {
    return await request(key, model, prompt, aspect, size);
  } catch (e) {
    if (
      e.name === "TimeoutError" ||
      e.name === "AbortError" ||
      e.message === "fetch failed"
    ) {
      /* TimeoutError 의 message 는 읽기 전용이라 고쳐 쓸 수 없습니다.
         새 오류로 갈아 끼웁니다. */
      const blocked = new Error("응답이 없습니다");
      blocked.blocked = true;
      throw blocked;
    }
    throw e;
  }
}

/** 지수 백오프로 최대 세 번 */
async function withRetry(label, fn) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (e.fatal || e.blocked || attempt >= TRIES) throw e;
      const wait = 2000 * 2 ** (attempt - 1);
      console.log(
        `   ↻ ${label} 실패(${e.message}) — ${wait / 1000}초 뒤 ${attempt + 1}번째 시도`,
      );
      await sleep(wait);
    }
  }
}

/**
 * 여러 장을 만들어 파일로 떨굽니다.
 *
 * @param cards  { id, slug, prompt, size? } 목록. size 를 적으면 그 장만
 *               다른 크기로 받습니다 (명함은 2K 와 4K 를 섞어 씁니다).
 * @param opts   { out, aspect, size, prefix, suffix, title }
 */
export async function runBatch(cards, opts) {
  const key = requireKey();
  const { out, aspect, size, prefix = "", suffix = "", title } = opts;

  await mkdir(out, { recursive: true });

  /* 막힌 모델은 목록에서 빼 버리므로 이 배열은 실행 중에 줄어듭니다. */
  const models = await pickModels(key);
  console.log(
    `모델: ${models.join(" → ")}   비율: ${aspect}   크기: ${size}   저장: ${out}\n`,
  );

  /* ONLY=02,07 처럼 주면 그 번호만 다시 만듭니다. 스무 장 가운데 몇 장만
     마음에 안 들 때 나머지를 새로 뽑지 않기 위한 것입니다 — 다시 뽑으면
     이미 좋은 그림도 다른 그림이 되어 버립니다. */
  const only = process.env.ONLY?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const queue = only ? cards.filter((c) => only.includes(c.id)) : cards;
  if (only) console.log(`다시 만들 것: ${queue.map((c) => c.id).join(", ")}\n`);

  const done = [];
  const failed = [];

  for (const [i, card] of queue.entries()) {
    const file = `${card.id}-${card.slug}.png`;
    const want = card.size ?? size;
    process.stdout.write(`[${i + 1}/${queue.length}] ${file} (${want}) … `);

    let bytes;
    let used;
    let last;
    /* 앞에서부터 시도하고, 연결 자체가 막히는 모델은 그 자리에서 목록에서
       빼 버립니다. 스무 번 다시 물어보면 스무 번 다 기다리게 됩니다. */
    for (const model of [...models]) {
      try {
        bytes = await withRetry(model, () =>
          generate(key, model, prefix + card.prompt + suffix, aspect, want),
        );
        used = model;
        break;
      } catch (e) {
        last = e;
        if (e.fatal) break;
        if (e.blocked && models.length > 1) {
          models.splice(models.indexOf(model), 1);
          console.log(
            `\n   ↧ ${model} 이 막혔습니다(${e.message}) — 남은 장은 다음 모델로`,
          );
        } else {
          console.log(`\n   ↧ ${model} 실패(${e.message}) — 다음 모델로`);
        }
      }
    }

    if (bytes) {
      await writeFile(path.join(out, file), bytes);
      done.push({ ...card, file, model: used, size: want });
      console.log(
        `${(bytes.length / 1024 / 1024).toFixed(1)}MB` +
          (used === models[0] ? "" : `  (${used})`),
      );
    } else {
      failed.push({ ...card, file, why: last?.message ?? "알 수 없음" });
      console.log(`실패 — ${last?.message ?? "알 수 없음"}`);
    }

    if (i < queue.length - 1) await sleep(GAP_MS);
  }

  await writeFile(
    path.join(out, "preview.html"),
    previewHtml(done, title, aspect),
    "utf8",
  );

  console.log(`\n성공 ${done.length}장 · 실패 ${failed.length}장`);
  for (const c of done) console.log(`  ${path.join(out, c.file)}`);
  if (failed.length) {
    console.log("\n실패 목록");
    for (const c of failed) console.log(`  ${c.file} — ${c.why}`);
  }
  console.log(`\n미리보기: ${path.join(out, "preview.html")}`);

  return { done, failed };
}

function previewHtml(done, title, aspect) {
  const ratio = aspect.replace(":", " / ");
  const cells = done
    .map(
      (c) => `    <figure>
      <img src="./${c.file}" alt="${c.slug}" loading="lazy" />
      <figcaption>${c.id} · ${c.slug} <span>${c.size}</span></figcaption>
    </figure>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title} ${done.length}장</title>
<style>
  :root { color-scheme: light; }
  body { margin: 0; padding: 40px; background: #f4f1ec;
         font: 14px/1.5 -apple-system, "Segoe UI", "Malgun Gothic", sans-serif; color: #2b2621; }
  h1 { margin: 0 0 28px; font-size: 20px; font-weight: 600; letter-spacing: -0.01em; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 28px 24px; }
  @media (max-width: 1100px) { .grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 640px)  { .grid { grid-template-columns: 1fr; } }
  figure { margin: 0; }
  img { display: block; width: 100%; aspect-ratio: ${ratio}; object-fit: cover;
        border-radius: 3px; background: #fff;
        box-shadow: 0 1px 2px rgb(40 30 20 / .12), 0 12px 24px -12px rgb(40 30 20 / .28); }
  figcaption { margin-top: 10px; font-size: 12px; color: #6d655c; letter-spacing: .01em; }
  figcaption span { color: #a49a8e; }
</style>
</head>
<body>
  <h1>${title} — ${done.length}장</h1>
  <div class="grid">
${cells}
  </div>
</body>
</html>
`;
}
