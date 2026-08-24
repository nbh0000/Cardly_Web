/* 인쇄물 템플릿에 쓰는 그림 만들기.

   무엇을 만들지는 이 파일이 아니라 lib/print/art.json 이 정합니다. 그래야
   «이 배경은 어떤 말로 만들었나» 를 템플릿 쪽에서 되짚을 수 있고, 같은 말로
   다시 뽑으면 같은 자리에 같은 그림이 들어갑니다.

   실행:
     $env:GEMINI_API_KEY = '발급받은키'      (PowerShell)
     export GEMINI_API_KEY=발급받은키        (bash)

     npm run print:art                  아직 없는 것만 만듭니다
     npm run print:art -- --all         있어도 다시 만듭니다
     npm run print:art -- flyer poster  그 갈래만
     npm run print:art -- --id menu-linen-texture
     npm run print:art -- --sheet       만든 것들을 한 장에 붙여 훑어봅니다

   만든 뒤에는 실제 픽셀 크기를 재서 art.json 에 적어 넣습니다. 템플릿이
   «이 그림을 이 크기로 놓으면 몇 dpi 인가» 를 계산할 수 있어야, 인쇄하고
   나서야 흐린 것을 발견하는 일이 없습니다.

   키는 환경변수로만 받습니다. 파일에 적거나 커밋하지 마세요.            */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REGISTRY = path.join(ROOT, "lib", "print", "art.json");
const OUT = path.join(ROOT, "public", "print-art");

const API = "https://generativelanguage.googleapis.com/v1beta";

/** 화질 순. 앞의 것이 막히면 뒤로 내려갑니다. */
const PREFERRED = ["gemini-3-pro-image", "gemini-3.1-flash-image", "gemini-2.5-flash-image"];

/** 한 장을 기다려 주는 시간. 4K 는 1분을 넘기도 합니다 */
const REQ_MS = 180_000;
/** 호출 사이 쉬는 시간 — 레이트리밋을 피합니다 */
const GAP_MS = 2500;
const TRIES = 3;

/**
 * 갈래마다 «긴 변이 몇 픽셀이어야 하는가».
 *
 * 인쇄 해상도에서 거꾸로 뽑은 값입니다. A4 297mm 를 300dpi 로 찍으려면
 * 3508px 이 필요합니다. 모델이 그보다 작게 주면 여기서 한 번 키웁니다.
 * 현수막·배너는 실물이 미터 단위라 어차피 원본을 못 채웁니다 — 그쪽은
 * 템플릿이 그림을 «전면» 이 아니라 «띠» 로 쓰도록 짜 두었습니다.
 */
const TARGET_LONG_EDGE = {
  flyer: 3508,
  poster: 3600,
  menu: 3508,
  coupon: 2126,
  banner: 0,
  "standing-banner": 0,
  shared: 0,
};

/** 키우기는 두 배까지만. 그 이상은 선명해지지 않고 뭉개지기만 합니다 */
const MAX_UPSCALE = 2;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function requireKey() {
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
 * 쓸 수 있는 모델을 화질 순으로.
 *
 * 이름을 코드에 박아 두면 그 모델이 없어진 날 조용히 죽습니다. 실제로
 * gemini-2.5-flash 는 «신규 사용자에게는 제공하지 않음» 으로 바뀌었습니다.
 */
async function pickModels(key) {
  if (process.env.GEMINI_IMAGE_MODEL) return [process.env.GEMINI_IMAGE_MODEL];
  const res = await fetch(`${API}/models?key=${key}&pageSize=200`, {
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`모델 목록을 못 받았습니다 (${res.status})`);
  const { models = [] } = await res.json();
  const names = models.map((m) => m.name.replace(/^models\//, ""));
  const picked = PREFERRED.filter((want) => names.includes(want));
  if (picked.length) return picked;
  const any = names.filter((n) => /image/.test(n));
  if (any.length) return any;
  throw new Error("이미지 생성 모델이 하나도 없습니다");
}

async function request(key, model, prompt, aspect, size) {
  const res = await fetch(`${API}/models/${model}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(REQ_MS),
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: { aspectRatio: aspect, imageSize: size },
      },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error?.message ?? `${res.status}`;
    const err = new Error(message);
    // 없는 모델·막힌 모델은 다음 모델로, 나머지는 다시 시도
    err.skipModel = [400, 404, 429, 503].includes(res.status);
    throw err;
  }
  if (data?.promptFeedback?.blockReason) {
    const err = new Error(`안전 정책에 걸렸습니다 (${data.promptFeedback.blockReason})`);
    err.fatal = true;
    throw err;
  }
  const part = (data?.candidates?.[0]?.content?.parts ?? []).find((p) => p.inlineData?.data);
  if (!part) throw new Error("그림이 오지 않았습니다");
  return Buffer.from(part.inlineData.data, "base64");
}

async function withRetry(label, fn) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (e.fatal || e.skipModel || attempt >= TRIES) throw e;
      const wait = 2000 * 2 ** (attempt - 1);
      console.log(`   ↻ ${label} 실패(${e.message}) — ${wait / 1000}초 뒤 ${attempt + 1}번째`);
      await sleep(wait);
    }
  }
}

/**
 * 저장 — 필요하면 키우고, 잰 값을 돌려줍니다.
 *
 * jpeg 로 굽습니다. 인쇄 배경은 투명할 일이 없고, 같은 화질에서 png 보다
 * 서너 배 가볍습니다. 웹에서 내려받는 무게가 그대로 편집기 첫 화면 비용이
 * 되기 때문에 이쪽이 중요합니다.
 */
async function store(buffer, entry) {
  const target = TARGET_LONG_EDGE[entry.category] ?? 0;
  let image = sharp(buffer, { limitInputPixels: false });
  let meta = await image.metadata();
  let upscaled = false;

  const long = Math.max(meta.width ?? 0, meta.height ?? 0);
  if (target && long > 0 && long < target) {
    const factor = Math.min(MAX_UPSCALE, target / long);
    const width = Math.round((meta.width ?? 0) * factor);
    image = sharp(await image.resize({ width, kernel: "lanczos3" }).toBuffer(), {
      limitInputPixels: false,
    });
    meta = await image.metadata();
    upscaled = true;
  }

  const file = `${entry.id}.jpg`;
  const bytes = await image.jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: "4:4:4" }).toBuffer();
  await writeFile(path.join(OUT, file), bytes);

  return { file, width: meta.width, height: meta.height, bytes: bytes.length, upscaled };
}

/* ------------------------------------------------------------
   훑어보기 — 한 장에 붙여 놓고 어색한 것을 고릅니다
   ------------------------------------------------------------ */

async function contactSheet(registry) {
  const made = registry.art.filter((a) => a.file && existsSync(path.join(OUT, a.file)));
  if (made.length === 0) {
    console.log("아직 만든 그림이 없습니다.");
    return;
  }
  const cell = 420;
  const cols = 4;
  const rows = Math.ceil(made.length / cols);
  const tiles = [];
  for (const [i, a] of made.entries()) {
    const buf = await sharp(path.join(OUT, a.file))
      .resize(cell, cell, { fit: "contain", background: "#ffffff" })
      .toBuffer();
    tiles.push({ input: buf, left: (i % cols) * cell, top: Math.floor(i / cols) * cell });
  }
  const out = path.join(OUT, "_contact-sheet.jpg");
  await sharp({
    create: { width: cols * cell, height: rows * cell, channels: 3, background: "#ffffff" },
  })
    .composite(tiles)
    .jpeg({ quality: 82 })
    .toFile(out);
  console.log(`훑어보기: ${out}`);
  made.forEach((a, i) => console.log(`  ${String(i + 1).padStart(2)}. ${a.id}`));
}

/* ------------------------------------------------------------
   본문
   ------------------------------------------------------------ */

const args = process.argv.slice(2);
const registry = JSON.parse(await readFile(REGISTRY, "utf8"));

if (args.includes("--sheet")) {
  await contactSheet(registry);
  process.exit(0);
}

const all = args.includes("--all");
const idAt = args.indexOf("--id");
const onlyIds = idAt >= 0 ? args.slice(idAt + 1).filter((a) => !a.startsWith("--")) : null;
const groups = args.filter((a) => !a.startsWith("--") && !onlyIds?.includes(a));

await mkdir(OUT, { recursive: true });

let queue = registry.art;
if (onlyIds?.length) queue = queue.filter((a) => onlyIds.includes(a.id));
else if (groups.length) queue = queue.filter((a) => groups.includes(a.category));
if (!all && !onlyIds?.length) {
  queue = queue.filter((a) => !(a.file && existsSync(path.join(OUT, a.file))));
}

if (queue.length === 0) {
  console.log("만들 것이 없습니다. 다시 만들려면 --all 또는 --id <아이디>.");
  process.exit(0);
}

const key = requireKey();
const models = await pickModels(key);
console.log(`모델: ${models.join(" → ")}\n만들 것: ${queue.length}장\n`);

const failed = [];

for (const [i, entry] of queue.entries()) {
  process.stdout.write(`[${i + 1}/${queue.length}] ${entry.id} (${entry.aspect} ${entry.size}) … `);

  let buffer;
  let used;
  let last;
  for (const model of [...models]) {
    try {
      buffer = await withRetry(model, () =>
        request(key, model, entry.prompt + registry.suffix, entry.aspect, entry.size),
      );
      used = model;
      break;
    } catch (e) {
      last = e;
      if (e.fatal) break;
      if (e.skipModel && models.length > 1) {
        models.splice(models.indexOf(model), 1);
        console.log(`\n   ↧ ${model} 이 막혔습니다(${e.message}) — 남은 장은 다음 모델로`);
      } else {
        console.log(`\n   ↧ ${model} 실패(${e.message}) — 다음 모델로`);
      }
    }
  }

  if (!buffer) {
    console.log(`실패 (${last?.message ?? "알 수 없음"})`);
    failed.push(entry.id);
    continue;
  }

  const info = await store(buffer, entry);
  Object.assign(entry, {
    file: info.file,
    width: info.width,
    height: info.height,
    bytes: info.bytes,
    upscaled: info.upscaled,
    model: used,
  });
  await writeFile(REGISTRY, `${JSON.stringify(registry, null, 2)}\n`, "utf8");

  console.log(
    `${info.width}×${info.height}${info.upscaled ? " (키움)" : ""} · ${Math.round(info.bytes / 1024)}KB · ${used}`,
  );
  await sleep(GAP_MS);
}

console.log(`\n끝났습니다. ${queue.length - failed.length}장 성공.`);
if (failed.length) console.log(`실패: ${failed.join(", ")} — 다시 하려면 --id 로 지정하세요.`);
