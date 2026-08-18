/* 표지 그림의 출처.

   여덟 점 모두 시카고 미술관 오픈액세스의 퍼블릭 도메인(CC0) 소장품이라
   상업적 이용에 제약이 없습니다. 파일은 scripts/fetch-art.mjs 가 내려받아
   public/art/ 에 넣습니다. 새 그림을 들일 때도 반드시 is_public_domain 이
   참인 것만 쓰세요.

   그림은 스물넉 벌 가운데 여덟 벌에만 씁니다. 나머지 열여섯 벌은 색면과
   활자로만 짰습니다 — 명화를 전면에 두르면 처음 몇 벌은 근사하지만,
   스물넉 벌이 전부 그림이면 «미술관 굿즈» 처럼 보이지 초대장으로
   보이지 않습니다.

   법으로 요구되지는 않지만 작가와 소장처는 밝힙니다. 남의 그림을
   가져다 쓰면서 이름을 지우는 건 만드는 사람의 태도 문제입니다. */

import type { ArtCredit } from "@/lib/occasion/types";

export const ART: Record<string, ArtCredit> = {
  "sunflower.webp": {
    file: "sunflower.webp",
    title: "Sunflowers",
    artist: "Georges Lemmen",
    date: "1895",
    url: "https://www.artic.edu/artworks/35720",
  },
  "bird.webp": {
    file: "bird.webp",
    title: "Paddy Bird and Magnolia Flowers",
    artist: "Katsushika Hokusai",
    date: "c. 1834",
    url: "https://www.artic.edu/artworks/25088",
  },
  "table.webp": {
    file: "table.webp",
    title: "Still Life: Corner of a Table",
    artist: "Henri Fantin-Latour",
    date: "1873",
    url: "https://www.artic.edu/artworks/75507",
  },
  "lily.webp": {
    file: "lily.webp",
    title: "Water Lily Pond",
    artist: "Claude Monet",
    date: "1900",
    url: "https://www.artic.edu/artworks/87088",
  },
  "wave.webp": {
    file: "wave.webp",
    title: "Under the Wave off Kanagawa",
    artist: "Katsushika Hokusai",
    date: "1830/33",
    url: "https://www.artic.edu/artworks/24645",
  },
  "blossom.webp": {
    file: "blossom.webp",
    title: "Cherry Blossom Banquet",
    artist: "Kitagawa Utamaro",
    date: "에도",
    url: "https://www.artic.edu/artworks/110739",
  },
  "rose.webp": {
    file: "rose.webp",
    title: "Roses in a Vase",
    artist: "Georges Seurat",
    date: "1881/83",
    url: "https://www.artic.edu/artworks/150828",
  },
  "iris.webp": {
    file: "iris.webp",
    title: "Irises",
    artist: "Claude Monet",
    date: "1914–17",
    url: "https://www.artic.edu/artworks/4887",
  },
};

export const ART_SOURCE = "시카고 미술관 오픈액세스 · 퍼블릭 도메인(CC0)";
