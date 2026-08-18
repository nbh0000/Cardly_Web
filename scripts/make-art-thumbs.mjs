/* 표지 그림의 작은 판을 만듭니다.

   목록 페이지에는 접힌 카드가 스물넉 장 깔립니다. 거기에 1080×1440
   원본을 그대로 물리면 브라우저가 큰 그림 여덟 장을 한꺼번에 풀어야
   하고, 그 그림들이 3D 면 위에 올라가 있어 합성까지 겹칩니다. 실제로
   목록을 내리다 화면이 멎었습니다.

   그래서 폭 480px 짜리 판을 따로 만들어 목록과 고르는 칸에서만
   씁니다. 화면 가득 뜨는 카드는 원본을 그대로 씁니다.

     node scripts/make-art-thumbs.mjs
*/

import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = path.join(process.cwd(), "public", "art");
const OUT = path.join(SRC, "thumb");
const WIDTH = 480;

await mkdir(OUT, { recursive: true });

const files = (await readdir(SRC)).filter((f) => f.endsWith(".webp"));

for (const file of files) {
  const to = path.join(OUT, file);
  await sharp(path.join(SRC, file))
    .resize({ width: WIDTH, withoutEnlargement: true })
    .webp({ quality: 72 })
    .toFile(to);
  console.log(`${file} → thumb/${file}`);
}
