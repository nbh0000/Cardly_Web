/**
 * 현수막 여덟 장.
 *
 * 현수막은 «달리는 차에서 읽는 인쇄물» 입니다. 그래서 규칙이 셋뿐입니다.
 *   ① 정보는 세 줄 안에. 넷째 줄은 아무도 읽지 않습니다
 *   ② 글자와 바탕의 밝기 차이를 최대로. 중간 톤끼리 겹치면 멀리서 뭉갭니다
 *   ③ 전화번호는 제목 다음으로 큽니다. 현수막을 보고 하는 행동은 전화뿐입니다
 *
 * 기본 규격은 5000 × 900mm 입니다. 안전선이 60mm 로 넓은 것은 재단이 아니라
 * 봉제와 고리 때문입니다 — 양 끝 60mm 는 접히거나 구멍이 뚫립니다.
 *
 * 글자 크기가 수백 pt 로 보이는 것은 규격이 미터 단위라서 그렇습니다.
 * 560pt 는 종이에서는 터무니없지만 5m 짜리 천에서는 높이 20cm 입니다.
 */

import {
  INK,
  composeAll,
  image,
  rect,
  rule,
  text,
  type Draft,
} from "@/lib/print/templates/kit";

const DRAFTS: Draft[] = [
  /* ---------------------------------------------------------
     1. 개업 — 붉은 사진을 왼쪽에 세우고 오른쪽을 비웁니다
     --------------------------------------------------------- */
  {
    id: "banner-open-red",
    name: "개업 인사",
    note: "왼쪽에 사진, 오른쪽은 글자만. 붉은색이 멀리서 먼저 보입니다.",
    industry: "sale",
    style: "photo",
    palette: ["red", "warm"],
    art: ["banner-open-photo"],
    tags: ["개업", "오픈", "인사"],
    background: { color: "#7f1220" },
    build: ({ h, bleed }) => [
      image("banner-open-photo", {
        x: -bleed,
        y: -bleed,
        w: 1500 + bleed,
        h: h + bleed * 2,
      }),

      text({
        x: 1620,
        y: 170,
        w: 3300,
        h: 120,
        text: "성산김밥 오늘 문 엽니다",
        size: 520,
        weight: 400,
        color: "#ffffff",
        font: "black-han-sans",
      }),
      text({
        x: 1620,
        y: 470,
        w: 2400,
        h: 120,
        text: "첫 사흘 김밥 한 줄 2,000원",
        size: 260,
        weight: 700,
        color: "#ffd6a8",
        font: "gothic-a1",
      }),
      text({
        x: 1620,
        y: 640,
        w: 2400,
        h: 110,
        text: "성미산로 6 · 02-332-0000",
        size: 220,
        weight: 400,
        color: "#ffffff",
        font: "gothic-a1",
      }),
    ],
  },

  /* ---------------------------------------------------------
     2. 식당 — 음식 사진을 오른쪽 끝에
     --------------------------------------------------------- */
  {
    id: "banner-food-open",
    name: "식당 개업",
    note: "글자는 왼쪽, 음식은 오른쪽 끝. 어두운 바탕이 김을 살립니다.",
    industry: "food",
    style: "photo",
    palette: ["warm", "ink"],
    art: ["banner-food-photo"],
    tags: ["음식점", "개업", "국밥"],
    background: { color: "#191410" },
    build: ({ h, bleed }) => [
      image("banner-food-photo", {
        x: 2900,
        y: -bleed,
        w: 2100 + bleed,
        h: h + bleed * 2,
      }),
      rect({ x: 2900, y: -bleed, w: 700, h: h + bleed * 2, fill: "#191410", opacity: 0.55 }),

      text({
        x: 200,
        y: 190,
        w: 2900,
        h: 120,
        text: "24시간 성산국밥",
        size: 500,
        weight: 400,
        color: "#ffffff",
        font: "black-han-sans",
      }),
      text({
        x: 200,
        y: 470,
        w: 2700,
        h: 110,
        text: "가마솥에 열두 시간 끓인 국물",
        size: 230,
        weight: 700,
        color: "#f0b429",
        font: "gothic-a1",
      }),
      text({
        x: 200,
        y: 640,
        w: 2700,
        h: 110,
        text: "성미산로 16 · 02-331-0000",
        size: 210,
        weight: 400,
        color: "#d6cec3",
        font: "gothic-a1",
      }),
    ],
  },

  /* ---------------------------------------------------------
     3. 세일 — 노랑과 검정, 가장 센 대비
     --------------------------------------------------------- */
  {
    id: "banner-sale-yellow",
    name: "세일 안내",
    note: "노랑과 검정. 멀리서 읽히는 대비로는 이보다 센 조합이 없습니다.",
    industry: "sale",
    style: "bold",
    palette: ["warm", "ink"],
    tags: ["세일", "할인", "행사"],
    background: { color: "#1a1a1a" },
    build: () => [
      /* 사선 띠 셋. 회전한 사각형이라 아무리 키워도 가장자리가 깨지지 않고,
         사용자가 색을 바꾸면 그대로 따라옵니다. 이걸 그림으로 받아 두면
         파일만 무겁고 «만들다 만 것» 처럼 보입니다. */
      rect({ x: 150, y: -420, w: 170, h: 1740, rotation: 24, fill: "#f5c518" }),
      rect({ x: 400, y: -420, w: 90, h: 1740, rotation: 24, fill: "#ffffff" }),
      rect({ x: 570, y: -420, w: 170, h: 1740, rotation: 24, fill: "#f5c518" }),

      text({
        x: 1520,
        y: 150,
        w: 3300,
        h: 160,
        text: "전 품목 최대 70%",
        size: 560,
        weight: 400,
        color: "#f5c518",
        font: "black-han-sans",
      }),
      text({
        x: 1520,
        y: 480,
        w: 3300,
        h: 110,
        text: "3월 6일 – 8일 사흘간",
        size: 250,
        weight: 400,
        color: "#ffffff",
        font: "gothic-a1",
      }),
      text({
        x: 1520,
        y: 650,
        w: 3300,
        h: 100,
        text: "성산아울렛 · 02-333-0000",
        size: 190,
        weight: 700,
        color: "#9a9a9a",
        font: "gothic-a1",
      }),
    ],
  },

  /* ---------------------------------------------------------
     4. 축하 — 글자만. 학교·기관 앞에 거는 것
     --------------------------------------------------------- */
  {
    id: "banner-congrats",
    name: "축하 현수막",
    note: "사진 없이 글자만. 남색 바탕에 흰 글자, 가운데 정렬.",
    industry: "community",
    style: "type",
    palette: ["navy", "mono"],
    tags: ["축하", "합격", "수상"],
    background: { color: "#0f2547" },
    build: ({ w, h, bleed }) => [
      rect({ x: -bleed, y: -bleed, w: w + bleed * 2, h: 26 + bleed, fill: "#c9a227" }),
      rect({ x: -bleed, y: h - 26, w: w + bleed * 2, h: 26 + bleed, fill: "#c9a227" }),

      text({
        x: 300,
        y: 150,
        w: w - 600,
        h: 150,
        text: "축 전국대회 금상 수상",
        size: 520,
        weight: 400,
        color: "#ffffff",
        align: "center",
        font: "black-han-sans",
      }),
      rule({ x: 1900, y: 470, w: 1200, h: 6, fill: "#c9a227" }),
      text({
        x: 300,
        y: 520,
        w: w - 600,
        h: 130,
        text: "성산중학교 3학년 4반 김서연",
        size: 260,
        weight: 700,
        color: "#cfe0ff",
        align: "center",
        font: "gothic-a1",
      }),
      text({
        x: 300,
        y: 690,
        w: w - 600,
        h: 90,
        text: "성산중학교 총동문회",
        size: 150,
        weight: 400,
        color: "#8ba4c9",
        align: "center",
        font: "gothic-a1",
      }),
    ],
  },

  /* ---------------------------------------------------------
     5. 안내 — 공사·휴무처럼 사실만 전하는 것
     --------------------------------------------------------- */
  {
    id: "banner-notice",
    name: "안내 현수막",
    note: "흰 바탕에 검은 글자. 공사·휴무처럼 사실만 전할 때.",
    industry: "community",
    style: "type",
    palette: ["mono", "ink"],
    tags: ["안내", "공지", "휴무"],
    background: { color: "#f5f5f4" },
    build: ({ h, bleed }) => [
      rect({ x: -bleed, y: -bleed, w: 120 + bleed, h: h + bleed * 2, fill: INK.black }),

      text({
        x: 260,
        y: 130,
        w: 4400,
        h: 90,
        text: "안내",
        size: 180,
        weight: 700,
        color: "#8a8a8a",
        letterSpacing: 0.3,
        font: "gothic-a1",
      }),
      text({
        x: 260,
        y: 250,
        w: 4400,
        h: 150,
        text: "3월 2일 – 3월 9일 내부 공사",
        size: 460,
        weight: 400,
        color: INK.black,
        font: "black-han-sans",
      }),
      text({
        x: 260,
        y: 560,
        w: 4400,
        h: 120,
        text: "공사 기간에는 뒤쪽 임시 매장에서 영업합니다 · 02-330-0000",
        size: 200,
        weight: 400,
        color: "#3f3f46",
        font: "gothic-a1",
      }),
    ],
  },

  /* ---------------------------------------------------------
     6. 학원 모집 — 색면 두 덩이
     --------------------------------------------------------- */
  {
    id: "banner-academy-recruit",
    name: "학원 모집",
    note: "왼쪽 색면에 과목, 오른쪽에 문구. 학원가에서 흔한 짜임입니다.",
    industry: "academy",
    style: "bold",
    palette: ["navy", "warm"],
    tags: ["학원", "모집", "개강"],
    background: { color: "#ffffff" },
    build: ({ h, bleed }) => [
      rect({ x: -bleed, y: -bleed, w: 1250 + bleed, h: h + bleed * 2, fill: INK.navy }),
      text({
        x: 140,
        y: 210,
        w: 1000,
        h: 300,
        text: "국·영·수",
        size: 330,
        weight: 400,
        color: "#ffffff",
        align: "center",
        lineHeight: 1.25,
        font: "black-han-sans",
      }),
      text({
        x: 140,
        y: 560,
        w: 1000,
        h: 100,
        text: "초등 3 – 중등 3",
        size: 150,
        weight: 700,
        color: "#a9c0e8",
        align: "center",
        font: "gothic-a1",
      }),

      text({
        x: 1420,
        y: 170,
        w: 3400,
        h: 150,
        text: "3월 2일 개강 · 한 반 8명",
        size: 430,
        weight: 400,
        color: INK.navy,
        font: "black-han-sans",
      }),
      text({
        x: 1420,
        y: 460,
        w: 3400,
        h: 110,
        text: "숙제는 학원에서 끝내고 갑니다",
        size: 230,
        weight: 700,
        color: "#c2410c",
        font: "gothic-a1",
      }),
      text({
        x: 1420,
        y: 640,
        w: 3400,
        h: 110,
        text: "성산에듀 학습관 · 02-338-0000",
        size: 210,
        weight: 400,
        color: "#52525b",
        font: "gothic-a1",
      }),
    ],
  },

  /* ---------------------------------------------------------
     7. 분양·임대 — 숫자가 주인공
     --------------------------------------------------------- */
  {
    id: "banner-realestate",
    name: "분양 안내",
    note: "평형과 값을 가장 크게. 부동산 현수막은 숫자를 보고 전화합니다.",
    industry: "realestate",
    style: "bold",
    palette: ["ink", "green"],
    tags: ["부동산", "분양", "임대"],
    background: { color: "#12211c" },
    build: ({ w, bleed }) => [
      rect({ x: -bleed, y: -bleed, w: w + bleed * 2, h: 20 + bleed, fill: "#2f6f5e" }),

      text({
        x: 200,
        y: 140,
        w: 2600,
        h: 90,
        text: "성산 리버뷰 오피스텔",
        size: 190,
        weight: 700,
        color: "#7fc3ac",
        letterSpacing: 0.06,
        font: "gothic-a1",
      }),
      text({
        x: 200,
        y: 250,
        w: 3200,
        h: 170,
        text: "전세 3억 2,000",
        size: 500,
        weight: 400,
        color: "#ffffff",
        font: "black-han-sans",
      }),
      text({
        x: 200,
        y: 600,
        w: 3200,
        h: 110,
        text: "전용 59㎡ · 방 3 · 즉시 입주",
        size: 220,
        weight: 400,
        color: "#b9cfc7",
        font: "gothic-a1",
      }),

      rect({ x: 3500, y: 210, w: 1300, h: 480, fill: "#2f6f5e", radius: 24 }),
      text({
        x: 3540,
        y: 280,
        w: 1220,
        h: 90,
        text: "문의",
        size: 150,
        weight: 700,
        color: "#c9e6db",
        align: "center",
        font: "gothic-a1",
      }),
      text({
        x: 3540,
        y: 390,
        w: 1220,
        h: 150,
        text: "02-334\n-0000",
        size: 240,
        weight: 400,
        color: "#ffffff",
        align: "center",
        lineHeight: 1.35,
        font: "black-han-sans",
      }),
    ],
  },

  /* ---------------------------------------------------------
     8. 축제 안내 — 붉은 바탕에 날짜를 크게
     --------------------------------------------------------- */
  {
    id: "banner-festival",
    name: "축제 안내",
    note: "행사 이름과 날짜 둘뿐. 걸어 놓고 두 주를 버티는 현수막.",
    industry: "event",
    style: "bold",
    palette: ["red", "warm"],
    tags: ["축제", "행사", "안내"],
    background: { color: "#9f1239" },
    build: ({ w, h, bleed }) => [
      rect({ x: -bleed, y: h - 120, w: w + bleed * 2, h: 120 + bleed, fill: "#f2c14e" }),

      text({
        x: 260,
        y: 130,
        w: 4400,
        h: 90,
        text: "제7회 성산동 밤마실",
        size: 200,
        weight: 700,
        color: "#f7c8d2",
        letterSpacing: 0.08,
        font: "gothic-a1",
      }),
      text({
        x: 260,
        y: 250,
        w: 4400,
        h: 170,
        text: "10월 4일 토요일 오후 5시",
        size: 470,
        weight: 400,
        color: "#ffffff",
        font: "black-han-sans",
      }),
      text({
        x: 260,
        y: 600,
        w: 4400,
        h: 90,
        text: "문화의거리 일대 · 먹거리 28집 · 마당 무대",
        size: 190,
        weight: 400,
        color: "#ffdde4",
        font: "gothic-a1",
      }),
      text({
        x: 260,
        y: 745,
        w: 4400,
        h: 60,
        text: "주최 성산동 상인회 · 02-330-0000",
        size: 140,
        weight: 700,
        color: "#7a1030",
        font: "gothic-a1",
      }),
    ],
  },
];

export const BANNER_TEMPLATES = composeAll("banner", DRAFTS);
