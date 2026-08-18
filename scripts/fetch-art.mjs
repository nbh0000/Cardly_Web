/* 초대장 표지 그림을 미술관 오픈액세스에서 받아옵니다.

   시카고 미술관(api.artic.edu)의 퍼블릭 도메인(CC0) 소장품만 씁니다.
   상업적 이용에 제약이 없어야 하므로 is_public_domain 이 참인 것만
   골라 «작품 번호를 직접 적어» 가져옵니다. 검색어로 고르게 두면
   같은 그림이 두 번 뽑히거나 초대장에 맞지 않는 그림(죽은 사냥감
   정물 같은)이 섞여 들어옵니다.

   시카고 미술관 이미지 서버는 AIC-User-Agent 헤더를 요구합니다.
   없으면 403 과 함께 HTML 을 돌려주고, 그 HTML 이 sharp 로 넘어가
   «unsupported image format» 이 됩니다.

   실행:  node scripts/fetch-art.mjs
   결과:  public/art/*.webp  +  public/art/credits.json          */

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT = path.resolve("public/art");
const API = "https://api.artic.edu/api/v1/artworks";
const UA = {
  "User-Agent": "cardly.kr art fetch (nbh3459@gmail.com)",
  "AIC-User-Agent": "cardly.kr (nbh3459@gmail.com)",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* [파일이름, 시카고 미술관 작품번호] — 하나씩 눈으로 보고 골랐습니다. */
const WANT = [
  ["iris", 4887], // 모네 «붓꽃»
  ["bouquet", 64029], // 브뤼헐 «질그릇의 꽃다발»
  ["magnolia", 100829], // 히드 «하늘빛 벨벳 위의 목련»
  ["poppy", 4783], // 모네 «양귀비밭»
  ["lily", 87088], // 모네 «수련 연못»
  ["blossom", 110739], // 우타마로 «벚꽃 연회»
  ["wave", 24645], // 호쿠사이 «가나가와 앞바다의 큰 파도»
  ["bird", 25088], // 호쿠사이 «목련과 문조»
  ["chrysanth", 16617], // 르누아르 «국화»
  ["fruit", 64957], // 반 고흐 «포도, 레몬, 배, 사과»
  ["rose", 150828], // 쇠라 «화병의 장미»
  ["cloud", 76395], // 르동 «꽃구름»
  ["harbor", 152747], // 히드 «요크 항구»
  ["maple", 127643], // 도사 미쓰오키 «벚꽃과 단풍, 그리고 시전»
  ["sunflower", 35720], // 레멘 «해바라기»
  ["table", 75507], // 팡탱라투르 «식탁 한 귀퉁이»
  ["apple", 111436], // 세잔 «사과 바구니»
  ["beach", 14598], // 모네 «생타드레스의 해변»
];

async function j(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    const r = await fetch(url, { headers: UA });
    if (r.ok) return r.json();
    await sleep(600 * (i + 1) * (i + 1));
  }
  throw new Error(`요청 실패 ${url}`);
}

const hex = (c) =>
  "#" + [c.r, c.g, c.b].map((v) => v.toString(16).padStart(2, "0")).join("");

await fs.mkdir(OUT, { recursive: true });
const credits = [];

for (const [name, id] of WANT) {
  try {
    const { data: a } = await j(
      `${API}/${id}?fields=id,title,artist_title,date_display,image_id,is_public_domain`,
    );
    if (!a.is_public_domain) throw new Error("퍼블릭 도메인이 아닙니다");
    if (!a.image_id) throw new Error("이미지가 없습니다");

    const r = await fetch(
      `https://www.artic.edu/iiif/2/${a.image_id}/full/1686,/0/default.jpg`,
      { headers: UA },
    );
    if (!r.ok) throw new Error(`이미지 ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer());

    /* 표지는 세로 3:4. attention 은 그림에서 눈길이 가는 쪽을 남깁니다. */
    const cover = sharp(buf).resize(1080, 1440, {
      fit: "cover",
      position: sharp.strategy.attention,
    });
    await cover.clone().webp({ quality: 82 }).toFile(path.join(OUT, `${name}.webp`));

    /* 그림에서 색을 뽑아 둡니다. 표지 배경과 글자색을 그림에 맞춰
       고르는 데 씁니다 — 색을 따로 지어내면 그림과 따로 놉니다. */
    const st = await sharp(buf).stats();
    const avg = hex({
      r: Math.round(st.channels[0].mean),
      g: Math.round(st.channels[1].mean),
      b: Math.round(st.channels[2].mean),
    });

    credits.push({
      file: `${name}.webp`,
      title: a.title,
      artist: a.artist_title || "작가 미상",
      date: a.date_display || "",
      source: "시카고 미술관 (CC0 퍼블릭 도메인)",
      url: `https://www.artic.edu/artworks/${a.id}`,
      dominant: hex(st.dominant),
      average: avg,
    });
    console.log(
      `✓ ${name.padEnd(10)} ${hex(st.dominant)} ${a.artist_title || "미상"} — ${a.title.slice(0, 48)}`,
    );
  } catch (e) {
    console.log(`✗ ${name} — ${e.message}`);
  }
  await sleep(250);
}

await fs.writeFile(
  path.join(OUT, "credits.json"),
  JSON.stringify(credits, null, 2) + "\n",
);
console.log(`\n${credits.length}점 저장`);
