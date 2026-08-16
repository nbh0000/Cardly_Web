/* 표지 그림의 출처.

   모두 시카고 미술관 오픈액세스의 퍼블릭 도메인(CC0) 소장품이라
   상업적 이용에 제약이 없습니다. 파일은 scripts/fetch-art.mjs 가
   내려받아 public/art/ 에 넣습니다. 새 그림을 들일 때도 반드시
   is_public_domain 이 참인 것만 쓰세요.

   법으로 요구되지는 않지만 작가와 소장처는 밝힙니다. 남의 그림을
   가져다 쓰면서 이름을 지우는 건 만드는 사람의 태도 문제입니다. */

import type { ArtCredit } from "@/lib/occasion/types";

export const ART: Record<string, ArtCredit> = {
  "iris.webp": {
    file: "iris.webp",
    title: "Irises",
    artist: "Claude Monet",
    date: "1914–17",
    url: "https://www.artic.edu/artworks/4887",
  },
  "bouquet.webp": {
    file: "bouquet.webp",
    title: "Bouquet of Flowers in an Earthenware Vase",
    artist: "Jan Brueghel the Elder",
    date: "c. 1610",
    url: "https://www.artic.edu/artworks/64029",
  },
  "magnolia.webp": {
    file: "magnolia.webp",
    title: "Magnolias on Light Blue Velvet Cloth",
    artist: "Martin Johnson Heade",
    date: "1885–95",
    url: "https://www.artic.edu/artworks/100829",
  },
  "poppy.webp": {
    file: "poppy.webp",
    title: "Poppy Field (Giverny)",
    artist: "Claude Monet",
    date: "1890–91",
    url: "https://www.artic.edu/artworks/4783",
  },
  "lily.webp": {
    file: "lily.webp",
    title: "Water Lily Pond",
    artist: "Claude Monet",
    date: "1900",
    url: "https://www.artic.edu/artworks/87088",
  },
  "blossom.webp": {
    file: "blossom.webp",
    title: "Cherry Blossom Banquet",
    artist: "Kitagawa Utamaro",
    date: "에도",
    url: "https://www.artic.edu/artworks/110739",
  },
  "wave.webp": {
    file: "wave.webp",
    title: "Under the Wave off Kanagawa",
    artist: "Katsushika Hokusai",
    date: "1830/33",
    url: "https://www.artic.edu/artworks/24645",
  },
  "bird.webp": {
    file: "bird.webp",
    title: "Paddy Bird and Magnolia Flowers",
    artist: "Katsushika Hokusai",
    date: "c. 1834",
    url: "https://www.artic.edu/artworks/25088",
  },
  "chrysanth.webp": {
    file: "chrysanth.webp",
    title: "Chrysanthemums",
    artist: "Pierre-Auguste Renoir",
    date: "1881–82",
    url: "https://www.artic.edu/artworks/16617",
  },
  "fruit.webp": {
    file: "fruit.webp",
    title: "Grapes, Lemons, Pears, and Apples",
    artist: "Vincent van Gogh",
    date: "1887",
    url: "https://www.artic.edu/artworks/64957",
  },
  "rose.webp": {
    file: "rose.webp",
    title: "Roses in a Vase",
    artist: "Georges Seurat",
    date: "1881/83",
    url: "https://www.artic.edu/artworks/150828",
  },
  "cloud.webp": {
    file: "cloud.webp",
    title: "Flower Clouds",
    artist: "Odilon Redon",
    date: "c. 1903",
    url: "https://www.artic.edu/artworks/76395",
  },
  "harbor.webp": {
    file: "harbor.webp",
    title: "York Harbor, Coast of Maine",
    artist: "Martin Johnson Heade",
    date: "1877",
    url: "https://www.artic.edu/artworks/152747",
  },
  "maple.webp": {
    file: "maple.webp",
    title: "Flowering Cherry and Autumn Maples with Poem Slips",
    artist: "Tosa Mitsuoki",
    date: "1654/81",
    url: "https://www.artic.edu/artworks/127643",
  },
  "sunflower.webp": {
    file: "sunflower.webp",
    title: "Sunflowers",
    artist: "Georges Lemmen",
    date: "1895",
    url: "https://www.artic.edu/artworks/35720",
  },
  "table.webp": {
    file: "table.webp",
    title: "Still Life: Corner of a Table",
    artist: "Henri Fantin-Latour",
    date: "1873",
    url: "https://www.artic.edu/artworks/75507",
  },
  "apple.webp": {
    file: "apple.webp",
    title: "The Basket of Apples",
    artist: "Paul Cézanne",
    date: "c. 1893",
    url: "https://www.artic.edu/artworks/111436",
  },
  "beach.webp": {
    file: "beach.webp",
    title: "The Beach at Sainte-Adresse",
    artist: "Claude Monet",
    date: "1867",
    url: "https://www.artic.edu/artworks/14598",
  },
};

export const ART_SOURCE = "시카고 미술관 오픈액세스 · 퍼블릭 도메인(CC0)";
