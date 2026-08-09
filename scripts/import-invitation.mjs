/**
 * 편집기에서 내보낸 발행용 파일을 저장소에 넣습니다.
 *
 *   npm run invite:add -- ~/Downloads/dohyun-seoyeon.json
 *
 * 하는 일
 *   1. 파일 안의 사진(data URL)을 public/invitations/<slug>/ 아래 파일로 꺼냅니다.
 *      JSON 에 사진을 그대로 두면 파일이 수 MB 가 되고 그대로 HTML 에 실려
 *      첫 화면이 느려집니다.
 *   2. 사진 자리는 /invitations/<slug>/xx.jpg 경로로 바꿉니다.
 *   3. content/invitations.json 에 같은 slug 가 있으면 교체, 없으면 추가합니다.
 *
 * 이 뒤에 커밋·푸시하면 배포되어 /i/<slug> 로 열립니다.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const STORE = join(root, "content", "invitations.json");

const input = process.argv[2];
if (!input) {
  console.error("사용법: npm run invite:add -- <내보낸 파일.json>");
  process.exit(1);
}

const payload = JSON.parse(readFileSync(resolve(input), "utf8"));
const slug = String(payload.slug || "").trim();
if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.error(`slug 가 올바르지 않습니다: ${JSON.stringify(payload.slug)}`);
  console.error("영문 소문자·숫자·하이픈만 쓸 수 있습니다.");
  process.exit(1);
}

const photoDir = join(root, "public", "invitations", slug);
mkdirSync(photoDir, { recursive: true });

let n = 0;
const written = [];

/** data URL 하나를 파일로 꺼내고 웹 경로를 돌려줍니다. */
function extract(value) {
  if (typeof value !== "string" || !value.startsWith("data:image/")) return value;
  const [meta, b64] = value.split(",");
  const ext = meta.includes("png") ? "png" : meta.includes("webp") ? "webp" : "jpg";
  const name = `${String(++n).padStart(2, "0")}.${ext}`;
  writeFileSync(join(photoDir, name), Buffer.from(b64, "base64"));
  written.push(name);
  return `/invitations/${slug}/${name}`;
}

/** 객체 전체를 훑으며 data URL 을 파일로 바꿉니다. */
function walk(node) {
  if (Array.isArray(node)) return node.map(walk);
  if (node && typeof node === "object") {
    return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, walk(v)]));
  }
  return extract(node);
}

const record = {
  slug,
  templateId: payload.templateId,
  updatedAt: payload.updatedAt ?? new Date().toISOString(),
  data: walk(payload.data),
};

const store = JSON.parse(readFileSync(STORE, "utf8"));
const at = store.findIndex((r) => r.slug === slug);
if (at >= 0) store[at] = record;
else store.push(record);

writeFileSync(STORE, `${JSON.stringify(store, null, 2)}\n`);

console.log(`${at >= 0 ? "교체" : "추가"}: ${slug}`);
console.log(`사진 ${written.length}장 → public/invitations/${slug}/`);
console.log(`주소: /i/${slug}`);
console.log("\n커밋하고 푸시하면 배포됩니다.");
