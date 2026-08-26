/**
 * 쿠폰 여덟 장.
 *
 * 쿠폰은 «지갑에 들어가는 광고» 입니다. 그래서 다른 인쇄물과 규칙이
 * 다릅니다 — 여백을 아끼고, 혜택을 가장 크게 놓고, 조건은 반드시
 * 작게라도 적습니다. 조건이 없는 쿠폰은 가게에서 싸움이 납니다.
 *
 * 세 갈래를 모두 담았습니다.
 *   절취형  뜯어서 내는 것 (세로 절취선으로 왼쪽 혜택 / 오른쪽 보관)
 *   스탬프  도장을 찍어 모으는 것
 *   할인율  숫자 하나를 크게 세우는 것
 *
 * 작은 글자가 7pt 아래로 내려가지 않게 했습니다. 명함과 같은 기준입니다 —
 * 그 아래는 인쇄하면 뭉개져서 읽히지 않습니다.
 */

import {
  INK,
  artBackground,
  composeAll,
  ellipse,
  rect,
  rule,
  text,
  type Draft,
} from "@/lib/print/templates/kit";

/** 도장 자리 — 동그라미를 줄 맞춰 늘어놓습니다 */
function stamps(opts: {
  x: number;
  y: number;
  count: number;
  perRow: number;
  size: number;
  gap: number;
  color: string;
  lastFill?: string;
}) {
  const { x, y, count, perRow, size, gap, color, lastFill } = opts;
  return Array.from({ length: count }, (_, i) => {
    const cx = x + (i % perRow) * (size + gap);
    const cy = y + Math.floor(i / perRow) * (size + gap);
    const last = i === count - 1 && lastFill;
    return ellipse({
      x: cx,
      y: cy,
      w: size,
      h: size,
      fill: last ? lastFill : "transparent",
      stroke: color,
      strokeWidth: 0.35,
    });
  });
}

const DRAFTS: Draft[] = [
  /* ---------------------------------------------------------
     1. 카페 스탬프 — 열 잔 모으면 한 잔
     --------------------------------------------------------- */
  {
    id: "coupon-cafe-stamp",
    name: "커피 스탬프",
    note: "열 칸을 채우면 한 잔. 크라프트 질감 위에 도장 자리.",
    industry: "cafe",
    style: "minimal",
    palette: ["warm", "ink"],
    art: ["coupon-kraft-texture"],
    tags: ["스탬프", "적립", "카페"],
    background: artBackground("coupon-kraft-texture", "#e9dcc6", 0.9),
    build: ({ h }) => [
      text({
        x: 10,
        y: 9,
        w: 90,
        h: 5,
        text: "카들리 로스터스",
        size: 10,
        weight: 700,
        color: "#4a3520",
        font: "gothic-a1",
      }),
      text({
        x: 10,
        y: 17,
        w: 100,
        h: 5,
        text: "열 잔 드시면 한 잔은 저희가",
        size: 8,
        color: "#7a6248",
      }),

      ...stamps({
        x: 10,
        y: 28,
        count: 10,
        perRow: 5,
        size: 13,
        gap: 3.5,
        color: "#a58a63",
        lastFill: "#4a3520",
      }),
      text({
        x: 74.5,
        y: 48,
        w: 13,
        h: 6,
        text: "FREE",
        size: 7,
        weight: 700,
        color: "#f7ecd9",
        align: "center",
      }),

      rule({ x: 96, y: 10, w: 0.4, h: h - 20, fill: "#c9b291" }),

      text({
        x: 104,
        y: 14,
        w: 68,
        h: 6,
        text: "적립 안내",
        size: 9,
        weight: 700,
        color: "#4a3520",
      }),
      text({
        x: 104,
        y: 24,
        w: 68,
        h: 24,
        text: "· 음료 한 잔에 도장 하나\n· 다른 할인과 함께 쓰실 수 있습니다\n· 분실 시 재발급은 어렵습니다\n· 유효기간 발급일부터 1년",
        size: 7.5,
        color: "#7a6248",
        lineHeight: 1.85,
      }),
      text({
        x: 104,
        y: 54,
        w: 68,
        h: 5,
        text: "마포구 성미산로 12 · 02-336-0000",
        size: 7,
        color: "#a58a63",
      }),
    ],
  },

  /* ---------------------------------------------------------
     2. 음식점 절취 쿠폰 — 세로로 뜯습니다
     --------------------------------------------------------- */
  {
    id: "coupon-food-tear",
    name: "절취 식사권",
    note: "세로 절취선. 왼쪽은 손님이 내고 오른쪽은 가게가 보관합니다.",
    industry: "food",
    style: "bold",
    palette: ["red", "ink"],
    tags: ["절취선", "음식점", "할인"],
    perforation: true,
    perforationAxis: "x",
    perforationAt: 0.62,
    background: { color: "#ffffff" },
    build: ({ h, bleed }) => [
      rect({ x: -bleed, y: -bleed, w: 111.6 + bleed, h: h + bleed * 2, fill: INK.red }),

      text({
        x: 10,
        y: 10,
        w: 92,
        h: 5,
        text: "성산국밥 · 식사권",
        size: 8.5,
        weight: 700,
        color: "#ffd4d4",
        letterSpacing: 0.14,
      }),
      text({
        x: 10,
        y: 21,
        w: 92,
        h: 20,
        text: "2,000원 할인",
        size: 22,
        weight: 400,
        color: "#ffffff",
        font: "black-han-sans",
      }),
      text({
        x: 10,
        y: 44,
        w: 92,
        h: 10,
        text: "국밥·수육·전골 전 메뉴에서\n한 그릇당 2,000원을 빼 드립니다.",
        size: 8,
        color: "#ffe0e0",
        lineHeight: 1.7,
      }),
      text({
        x: 10,
        y: 58,
        w: 92,
        h: 5,
        text: "2026. 3. 1 – 5. 31",
        size: 8,
        weight: 700,
        color: "#ffffff",
      }),

      text({
        x: 118,
        y: 12,
        w: 52,
        h: 5,
        text: "보관용",
        size: 8,
        weight: 700,
        color: INK.grey,
        letterSpacing: 0.16,
      }),
      text({
        x: 118,
        y: 22,
        w: 52,
        h: 26,
        text: "· 1인 1매, 1회 1매\n· 다른 행사와 중복 불가\n· 포장·배달 제외\n· 현금으로 바꿔 드리지 않습니다",
        size: 7.2,
        color: INK.soft,
        lineHeight: 1.85,
      }),
      rule({ x: 118, y: 52, w: 52, fill: INK.line }),
      text({
        x: 118,
        y: 56,
        w: 52,
        h: 5,
        text: "성산국밥 02-331-0000",
        size: 7.5,
        weight: 700,
        color: INK.black,
      }),
    ],
  },

  /* ---------------------------------------------------------
     3. 미용실 할인율 — 숫자 하나를 크게
     --------------------------------------------------------- */
  {
    id: "coupon-beauty-percent",
    name: "첫 방문 할인",
    note: "할인율 하나만 크게. 파스텔 도형이 왼쪽을 받칩니다.",
    industry: "beauty",
    style: "minimal",
    palette: ["pastel", "ink"],
    tags: ["할인율", "미용실", "첫방문"],
    background: { color: "#faf6f4" },
    build: ({ h }) => [
      ellipse({ x: -16, y: -16, w: 102, h: 102, fill: "#e7d3dc" }),
      ellipse({ x: -26, y: -8, w: 86, h: 86, fill: "#d3adbf" }),

      text({
        x: 12,
        y: 12,
        w: 70,
        h: 5,
        text: "FIRST VISIT",
        size: 8,
        weight: 700,
        color: "#a8748a",
        letterSpacing: 0.3,
        font: "gothic-a1",
      }),
      text({
        x: 10,
        y: 22,
        w: 76,
        h: 26,
        text: "30%",
        size: 40,
        weight: 700,
        color: "#8a4f68",
        font: "gothic-a1",
        letterSpacing: -0.04,
      }),
      text({
        x: 12,
        y: 54,
        w: 76,
        h: 5,
        text: "처음 오신 분, 모든 시술",
        size: 8.5,
        color: "#7a5c68",
      }),

      rule({ x: 96, y: 12, w: 0.4, h: h - 24, fill: "#e3d3d8" }),

      text({
        x: 106,
        y: 13,
        w: 66,
        h: 6,
        text: "살롱 여백",
        size: 11,
        weight: 700,
        color: INK.black,
        font: "gothic-a1",
      }),
      text({
        x: 106,
        y: 24,
        w: 66,
        h: 22,
        text: "· 커트 · 펌 · 염색 · 클리닉\n· 첫 방문 1회에 한합니다\n· 예약 후 방문해 주세요\n· 유효기간 2026. 12. 31",
        size: 7.4,
        color: INK.soft,
        lineHeight: 1.85,
      }),
      text({
        x: 106,
        y: 54,
        w: 66,
        h: 5,
        text: "강남구 선릉로 21 · 02-546-0000",
        size: 7.2,
        color: INK.grey,
      }),
    ],
  },

  /* ---------------------------------------------------------
     4. 헬스장 1개월 — 검정 바탕에 흰 글자
     --------------------------------------------------------- */
  {
    id: "coupon-fitness-month",
    name: "1개월 무료",
    note: "검정 바탕에 흰 글자. 조건을 아래에 또렷하게.",
    industry: "fitness",
    style: "bold",
    palette: ["ink", "mono"],
    tags: ["헬스", "등록", "무료"],
    background: { color: "#141414" },
    build: ({ w, h }) => [
      rect({ x: 10, y: 10, w: w - 20, h: h - 20, fill: "transparent", stroke: "#4b4b4b", strokeWidth: 0.4 }),

      text({
        x: 18,
        y: 17,
        w: 80,
        h: 5,
        text: "성산 피트니스",
        size: 8.5,
        weight: 700,
        color: "#8a8a8a",
        letterSpacing: 0.2,
      }),
      text({
        x: 18,
        y: 27,
        w: 110,
        h: 16,
        text: "6개월 등록하면\n1개월 더",
        size: 17,
        weight: 700,
        color: "#ffffff",
        lineHeight: 1.35,
        font: "gothic-a1",
      }),
      text({
        x: 18,
        y: 54,
        w: 110,
        h: 5,
        text: "· 3월 등록분에 한합니다 · 양도 불가 · 1인 1매",
        size: 7.2,
        color: "#8a8a8a",
      }),

      rect({ x: 132, y: 22, w: 38, h: 26, fill: "#ffffff", radius: 2 }),
      text({
        x: 132,
        y: 28,
        w: 38,
        h: 6,
        text: "+1",
        size: 17,
        weight: 700,
        color: "#141414",
        align: "center",
        font: "gothic-a1",
      }),
      text({
        x: 132,
        y: 40,
        w: 38,
        h: 5,
        text: "MONTH",
        size: 6.8,
        weight: 700,
        color: "#141414",
        align: "center",
        letterSpacing: 0.16,
      }),
      text({
        x: 118,
        y: 54,
        w: 52,
        h: 5,
        text: "02-541-0000",
        size: 7.6,
        weight: 700,
        color: "#8a8a8a",
        align: "right",
      }),
    ],
  },

  /* ---------------------------------------------------------
     5. 학원 상담권 — 작은 규격, 조용한 색
     --------------------------------------------------------- */
  {
    id: "coupon-academy-consult",
    name: "무료 상담권",
    note: "100 × 50. 학부모가 지갑에 넣어 두는 크기입니다.",
    industry: "academy",
    style: "minimal",
    palette: ["navy", "mono"],
    tags: ["학원", "상담", "소형"],
    size: "100x50",
    background: { color: "#ffffff" },
    build: ({ w, bleed }) => [
      rect({ x: -bleed, y: -bleed, w: w + bleed * 2, h: 5 + bleed, fill: INK.navy }),

      text({
        x: 8,
        y: 12,
        w: 84,
        h: 5,
        text: "성산에듀 학습관",
        size: 8,
        weight: 700,
        color: INK.grey,
        letterSpacing: 0.1,
      }),
      text({
        x: 8,
        y: 20,
        w: 84,
        h: 8,
        text: "학습 진단 · 상담 무료",
        size: 12,
        weight: 700,
        color: INK.navy,
        font: "gothic-a1",
      }),
      rule({ x: 8, y: 32, w: w - 16, fill: INK.line }),
      text({
        x: 8,
        y: 35,
        w: 84,
        h: 8,
        text: "40분 진단 후 결과지를 드립니다.\n등록하지 않으셔도 됩니다.",
        size: 7.2,
        color: INK.soft,
        lineHeight: 1.7,
      }),
      text({
        x: 8,
        y: 41,
        w: w - 16,
        h: 4,
        text: "02-338-0000 · 마포구 성미산로 22, 3층",
        size: 6.8,
        color: INK.grey,
      }),
    ],
  },

  /* ---------------------------------------------------------
     6. 병원 검진 할인 — 옅은 색과 표
     --------------------------------------------------------- */
  {
    id: "coupon-clinic-checkup",
    name: "건강검진 할인",
    note: "옅은 색면과 표. 병원 인쇄물의 온도에 맞췄습니다.",
    industry: "clinic",
    style: "minimal",
    palette: ["pastel", "green"],
    tags: ["병원", "검진", "할인"],
    background: { color: "#f4f9f8" },
    build: ({ h }) => [
      rect({ x: 0, y: 0, w: 6, h, fill: INK.teal }),

      text({
        x: 14,
        y: 11,
        w: 90,
        h: 5,
        text: "성산내과의원",
        size: 8.5,
        weight: 700,
        color: INK.teal,
        letterSpacing: 0.08,
      }),
      text({
        x: 14,
        y: 20,
        w: 100,
        h: 10,
        text: "종합 건강검진 15% 할인",
        size: 13,
        weight: 700,
        color: INK.black,
        font: "gothic-a1",
      }),
      text({
        x: 14,
        y: 34,
        w: 92,
        h: 14,
        text: "기본 검진에 위·대장 내시경을 더한 과정입니다.\n예약제로 운영하니 미리 연락 주세요.",
        size: 7.6,
        color: INK.soft,
        lineHeight: 1.8,
      }),
      text({
        x: 14,
        y: 55,
        w: 92,
        h: 5,
        text: "· 2026. 6. 30 까지 · 1인 1매 · 타 할인 중복 불가",
        size: 6.9,
        color: INK.grey,
      }),

      rect({ x: 118, y: 14, w: 52, h: 42, fill: "#ffffff", radius: 3 }),
      text({
        x: 118,
        y: 22,
        w: 52,
        h: 6,
        text: "예약 전화",
        size: 7.5,
        color: INK.grey,
        align: "center",
      }),
      text({
        x: 118,
        y: 30,
        w: 52,
        h: 8,
        text: "02-337\n-0000",
        size: 11,
        weight: 700,
        color: INK.teal,
        align: "center",
        lineHeight: 1.35,
        font: "gothic-a1",
      }),
      text({
        x: 118,
        y: 48,
        w: 52,
        h: 5,
        text: "평일 09 – 18시",
        size: 6.8,
        color: INK.grey,
        align: "center",
      }),
    ],
  },

  /* ---------------------------------------------------------
     7. 오픈 1+1 — 가로 절취선
     --------------------------------------------------------- */
  {
    id: "coupon-open-2for1",
    name: "오픈 1+1",
    note: "가로 절취선. 위쪽만 뜯어 내면 되도록 짰습니다.",
    industry: "sale",
    style: "bold",
    palette: ["red", "warm"],
    tags: ["오픈", "절취선", "1+1"],
    perforation: true,
    perforationAxis: "y",
    perforationAt: 0.66,
    background: { color: "#fffaf2" },
    build: ({ w, bleed }) => [
      rect({ x: -bleed, y: -bleed, w: w + bleed * 2, h: 46 + bleed, fill: "#c2410c" }),

      text({
        x: 12,
        y: 8,
        w: 110,
        h: 5,
        text: "GRAND OPEN · 3월 2일",
        size: 8,
        weight: 700,
        color: "#ffd8b8",
        letterSpacing: 0.2,
      }),
      text({
        x: 12,
        y: 17,
        w: 120,
        h: 18,
        text: "무엇을 사시든 1 + 1",
        size: 19,
        weight: 400,
        color: "#ffffff",
        font: "black-han-sans",
      }),
      text({
        x: 12,
        y: 37,
        w: 120,
        h: 5,
        text: "오픈 첫 사흘, 전 품목",
        size: 8,
        color: "#ffe4cf",
      }),
      ellipse({ x: 142, y: 8, w: 30, h: 30, fill: "#ffffff" }),
      text({
        x: 142,
        y: 17,
        w: 30,
        h: 8,
        text: "1+1",
        size: 13,
        weight: 400,
        color: "#c2410c",
        align: "center",
        font: "black-han-sans",
      }),

      text({
        x: 12,
        y: 51,
        w: 106,
        h: 12,
        text: "· 1인 1매 · 낮은 가격의 상품이 증정됩니다\n· 주류·담배 제외 · 3월 4일까지",
        size: 7,
        color: INK.soft,
        lineHeight: 1.75,
      }),
      text({
        x: 124,
        y: 52,
        w: 48,
        h: 10,
        text: "동네마트 성산점\n02-330-0000",
        size: 7.6,
        weight: 700,
        color: INK.black,
        align: "right",
        lineHeight: 1.6,
      }),
    ],
  },

  /* ---------------------------------------------------------
     8. 분식집 도장 카드 — 명함 크기
     --------------------------------------------------------- */
  {
    id: "coupon-snack-stamp",
    name: "도장 카드",
    note: "명함 크기 도장 카드. 다섯 칸이면 지갑에서 잃어버리기 전에 찹니다.",
    industry: "food",
    style: "flat",
    palette: ["warm", "ink"],
    tags: ["스탬프", "분식", "명함크기"],
    size: "90x50",
    background: { color: "#fff8ec" },
    build: ({ w }) => [
      text({
        x: 8,
        y: 8,
        w: 74,
        h: 6,
        text: "김밥천국 성산점",
        size: 10.5,
        weight: 400,
        color: "#a15c00",
        font: "jua",
      }),
      text({
        x: 8,
        y: 16,
        w: 74,
        h: 4,
        text: "다섯 번 오시면 김밥 한 줄",
        size: 7.4,
        color: "#8a6a45",
      }),

      ...stamps({
        x: 8,
        y: 24,
        count: 5,
        perRow: 5,
        size: 12,
        gap: 3.5,
        color: "#d9b98c",
        lastFill: "#e8a33d",
      }),
      text({
        x: 70,
        y: 28,
        w: 12,
        h: 5,
        text: "무료",
        size: 7,
        weight: 700,
        color: "#ffffff",
        align: "center",
      }),

      rule({ x: 8, y: 39, w: w - 16, fill: "#e8dcc6" }),
      text({
        x: 8,
        y: 41.5,
        w: w - 16,
        h: 4.5,
        text: "마포구 성미산로 6 · 02-332-0000 · 매일 07:00 – 21:00",
        size: 6.8,
        color: "#a98d64",
      }),
    ],
  },
];

export const COUPON_TEMPLATES = composeAll("coupon", DRAFTS);
