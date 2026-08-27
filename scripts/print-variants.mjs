/* 그림의 작은 판을 만듭니다.

   왜 필요한가. 목록 화면의 썸네일은 130px 남짓인데, 그리는 데 쓰던 것은
   3584 × 4800 짜리 원본이었습니다. 갈래 목록 한 장이 9.5MB, 허브가 18.7MB
   를 내려받았고 그래서 «인쇄물 쪽에 들어가면 너무 오래 걸린다» 가 됐습니다.

   원본을 지울 수는 없습니다. PDF 로 내보낼 때 그 해상도가 필요합니다.
   그래서 같은 그림을 세 벌로 둡니다.

     원본            print-art/<id>.jpg        내보내기 전용
     md  1400px      print-art/md/<id>.webp    미리보기 화면의 큰 그림
     sm   520px      print-art/sm/<id>.webp    목록의 썸네일

   webp 를 쓰는 이유는 같은 화질에서 jpeg 보다 30~40% 가볍기 때문입니다.
   실패해도 화면은 원본으로 되돌아가므로(art.ts 의 variantUrl) 이 스크립트를
   돌리지 않아도 사이트는 그대로 섭니다 — 느릴 뿐입니다.

   실행:
     npm run print:variants          없는 것만
     npm run print:variants -- --all 전부 다시
*/

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ART = path.join(ROOT, "public", "print-art");

/** 긴 변 기준. 화면에서 그려지는 최대 크기의 두 배쯤이면 충분합니다 */
const SIZES = [
  { dir: "sm", edge: 520, quality: 72 },
  { dir: "md", edge: 1400, quality: 78 },
];

const all = process.argv.includes("--all");

const registry = JSON.parse(await readFile(path.join(ROOT, "lib", "print", "art.json"), "utf8"));
for (const { dir } of SIZES) await mkdir(path.join(ART, dir), { recursive: true });

let made = 0;

for (const art of registry.art) {
  if (!art.file) continue;
  const src = path.join(ART, art.file);
  if (!existsSync(src)) continue;

  const base = art.file.replace(/\.[^.]+$/, "");
  for (const { dir, edge, quality } of SIZES) {
    const out = path.join(ART, dir, `${base}.webp`);
    if (!all && existsSync(out)) continue;

    const bytes = await sharp(src, { limitInputPixels: false })
      .resize({ width: edge, height: edge, fit: "inside", withoutEnlargement: true })
      .webp({ quality, effort: 5 })
      .toBuffer();
    await writeFile(out, bytes);

    made++;
    console.log(
      `${dir}/${base}.webp`.padEnd(46) + `${(bytes.length / 1024).toFixed(0)}KB`,
    );
  }
}

console.log(`\n${made}장 만들었습니다.`);
