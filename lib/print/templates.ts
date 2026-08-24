/**
 * 검증용 템플릿 — 갈래마다 한 장.
 *
 * 2차에서 대량으로 만들 템플릿의 «모양 견본» 이자, 1차에서 흐름을 확인하는
 * 데 쓰는 최소한입니다. 열기 → 글자 고치기 → 사진 바꾸기 → AI 문구 얹기 →
 * PDF 내보내기 가 이 여섯 장으로 전부 확인됩니다.
 *
 * 사진을 한 장도 쓰지 않았습니다. 인쇄물에서 «AI 가 만든 티» 는 대개 그림이
 * 아니라 짜임에서 납니다 — 글자 크기의 층이 두 단계뿐이거나, 여백이 사방
 * 균등하거나, 모든 것이 가운데 정렬이거나. 그래서 견본은 활자와 색면만으로
 * 세웠습니다. 사진은 사용자가 자기 것을 넣으면 됩니다.
 *
 * 새 템플릿을 더할 때는 크기를 직접 적지 말고 specs.ts 의 id 를 가리키세요.
 */

import { findCategory, type PrintCategoryId } from "@/lib/print/specs";
import { fromSpec } from "@/lib/print/doc";
import { newShape, newText } from "@/lib/print/model";
import type { PrintDoc, PrintElement, PrintTemplate } from "@/lib/print/types";

function build(
  categoryId: PrintCategoryId,
  sizeId: string,
  title: string,
  make: (page: { w: number; h: number; safe: number }) => PrintElement[],
  background: PrintDoc["background"] = { color: "#ffffff" },
): PrintDoc {
  const category = findCategory(categoryId)!;
  const size = category.sizes.find((s) => s.id === sizeId) ?? category.sizes[0]!;
  const doc = fromSpec(category, size, [], title);
  return {
    ...doc,
    background,
    elements: make({ w: size.width, h: size.height, safe: category.safe }),
  };
}

/* 견본이 공통으로 쓰는 색 — 인쇄에서 잘 나오는 진한 잉크 계열입니다.
   화면에서 예쁜 형광 계열은 CMYK 로 넘어가면 탁해집니다. */
const INK = "#141414";
const ACCENT = "#1d4ed8";
const PAPER_SOFT = "#f4f2ee";

export const PRINT_TEMPLATES: PrintTemplate[] = [
  /* ---------------------------------------------------------
     전단지 — 위쪽 색면에 제목, 아래는 안내
     --------------------------------------------------------- */
  {
    id: "flyer-band",
    name: "색면 전단",
    category: "flyer",
    note: "위쪽 색면에 제목 하나. 여백을 아래로 몰아 읽는 순서를 만듭니다.",
    doc: build("flyer", "a4", "색면 전단", (p) => [
      newShape("rect", { x: 0, y: 0, w: p.w, h: 118, fill: ACCENT }),
      newText({
        x: 18,
        y: 26,
        w: p.w - 36,
        h: 12,
        text: "2026 봄 강좌 모집",
        font: "sans",
        size: 12,
        weight: 600,
        color: "#c7d2fe",
        letterSpacing: 0.14,
      }),
      newText({
        x: 18,
        y: 44,
        w: p.w - 36,
        h: 46,
        text: "손으로 만드는\n일요일 오후",
        font: "sans",
        size: 40,
        weight: 700,
        color: "#ffffff",
        lineHeight: 1.18,
      }),
      newText({
        x: 18,
        y: 132,
        w: 120,
        h: 40,
        text: "도자기·목공·제본 세 반을 엽니다.\n재료비를 포함한 가격이고,\n한 반은 여덟 명까지만 받습니다.",
        size: 11,
        lineHeight: 1.7,
        color: INK,
      }),
      newShape("line", { x: 18, y: 186, w: p.w - 36, h: 0.4, fill: "#d4d4d8" }),
      newText({
        x: 18,
        y: 196,
        w: 90,
        h: 30,
        text: "일요일 14:00–17:00\n3월 8일 첫 수업\n여덟 명 정원",
        size: 10.5,
        lineHeight: 1.8,
        color: INK,
      }),
      newText({
        x: 112,
        y: 196,
        w: 80,
        h: 30,
        text: "서울 마포구 성미산로 12\n02-000-0000\ncardly.kr",
        size: 10.5,
        lineHeight: 1.8,
        color: "#52525b",
      }),
      newText({
        x: 18,
        y: 268,
        w: p.w - 36,
        h: 8,
        text: "신청은 전화 또는 누리집에서 받습니다",
        size: 9,
        color: "#71717a",
      }),
    ]),
  },

  /* ---------------------------------------------------------
     쿠폰 — 왼쪽 색면, 오른쪽 조건. 가운데 절취선
     --------------------------------------------------------- */
  {
    id: "coupon-stub",
    name: "절취 쿠폰",
    category: "coupon",
    note: "왼쪽에 혜택, 오른쪽에 조건. 잘라 보관하는 쪽을 나눴습니다.",
    doc: build(
      "coupon",
      "180x70",
      "절취 쿠폰",
      (p) => [
        newShape("rect", { x: 0, y: 0, w: 108, h: p.h, fill: INK }),
        newText({
          x: 10,
          y: 12,
          w: 88,
          h: 8,
          text: "OPENING COUPON",
          size: 7,
          weight: 600,
          color: "#a1a1aa",
          letterSpacing: 0.22,
        }),
        newText({
          x: 10,
          y: 24,
          w: 88,
          h: 22,
          text: "음료 한 잔\n무료",
          size: 20,
          weight: 700,
          color: "#ffffff",
          lineHeight: 1.15,
        }),
        newText({
          x: 10,
          y: 54,
          w: 88,
          h: 6,
          text: "2026. 3. 1 – 4. 30",
          size: 7.5,
          color: "#d4d4d8",
        }),
        newText({
          x: 118,
          y: 14,
          w: 54,
          h: 10,
          text: "카들리 커피",
          size: 10,
          weight: 700,
          color: INK,
        }),
        newText({
          x: 118,
          y: 28,
          w: 54,
          h: 30,
          text: "· 1인 1매\n· 다른 할인과 중복 불가\n· 매장 이용 시에만",
          size: 7,
          lineHeight: 1.7,
          color: "#52525b",
        }),
      ],
      { color: PAPER_SOFT },
    ),
  },

  /* ---------------------------------------------------------
     포스터 — 멀리서 읽히는 큰 글자 하나
     --------------------------------------------------------- */
  {
    id: "poster-type",
    name: "활자 포스터",
    category: "poster",
    note: "제목 하나를 크게. 열 걸음 밖에서 읽히는 것이 첫 조건입니다.",
    doc: build(
      "poster",
      "a3",
      "활자 포스터",
      (p) => [
        newText({
          x: 22,
          y: 30,
          w: p.w - 44,
          h: 10,
          text: "네 번째 여름 음악회",
          size: 13,
          weight: 600,
          color: ACCENT,
          letterSpacing: 0.1,
        }),
        newText({
          x: 22,
          y: 56,
          w: p.w - 44,
          h: 150,
          text: "밤에\n듣는\n실내악",
          size: 88,
          weight: 700,
          color: INK,
          lineHeight: 1.05,
          letterSpacing: -0.03,
        }),
        newShape("rect", { x: 22, y: 232, w: p.w - 44, h: 1.2, fill: INK }),
        newText({
          x: 22,
          y: 244,
          w: 120,
          h: 40,
          text: "8월 12일 금요일 저녁 7시 30분\n성산아트홀 소극장\n전석 20,000원",
          size: 12,
          lineHeight: 1.8,
          color: INK,
        }),
        newText({
          x: 22,
          y: 372,
          w: p.w - 44,
          h: 8,
          text: "예매 cardly.kr · 문의 02-000-0000",
          size: 10,
          color: "#52525b",
        }),
      ],
      { color: "#f7f6f3" },
    ),
  },

  /* ---------------------------------------------------------
     현수막 — 한 줄. 달리는 차에서 읽힙니다
     --------------------------------------------------------- */
  {
    id: "banner-one-line",
    name: "한 줄 현수막",
    category: "banner",
    note: "한 줄과 전화번호. 지나가면서 읽는 글자는 이보다 늘 수 없습니다.",
    doc: build(
      "banner",
      "5000x900",
      "한 줄 현수막",
      (p) => [
        newShape("rect", { x: 0, y: 0, w: 260, h: p.h, fill: ACCENT }),
        newText({
          x: 420,
          y: 220,
          w: 3200,
          h: 320,
          text: "정직하게 지은 밥, 오늘 문 엽니다",
          size: 560,
          weight: 700,
          color: "#ffffff",
          lineHeight: 1.1,
        }),
        newText({
          x: 420,
          y: 590,
          w: 2400,
          h: 140,
          text: "성산동 사거리 · 02-000-0000",
          size: 240,
          weight: 600,
          color: "#93c5fd",
        }),
      ],
      { color: "#0f172a" },
    ),
  },

  /* ---------------------------------------------------------
     배너 — 세로로 길고, 아래 200mm 는 비웁니다
     --------------------------------------------------------- */
  {
    id: "standing-clean",
    name: "행사 배너",
    category: "standing-banner",
    note: "위에서 아래로 읽는 순서. 아래쪽은 거치대에 가리므로 비웠습니다.",
    doc: build(
      "standing-banner",
      "x-600x1800",
      "행사 배너",
      (p) => [
        newShape("rect", { x: 0, y: 0, w: p.w, h: 26, fill: ACCENT }),
        newText({
          x: 60,
          y: 180,
          w: p.w - 120,
          h: 40,
          text: "2026 신입 상담",
          size: 58,
          weight: 600,
          color: ACCENT,
          letterSpacing: 0.06,
        }),
        newText({
          x: 60,
          y: 260,
          w: p.w - 120,
          h: 300,
          text: "무엇부터\n물어봐도\n괜찮습니다",
          size: 108,
          weight: 700,
          color: INK,
          lineHeight: 1.2,
        }),
        newShape("line", { x: 60, y: 620, w: p.w - 120, h: 2, fill: "#d4d4d8" }),
        newText({
          x: 60,
          y: 660,
          w: p.w - 120,
          h: 200,
          text: "· 평일 10:00 – 18:00\n· 예약 없이 오셔도 됩니다\n· 상담은 30분씩 진행합니다",
          size: 40,
          lineHeight: 1.9,
          color: "#3f3f46",
        }),
        newText({
          x: 60,
          y: 1480,
          w: p.w - 120,
          h: 60,
          text: "cardly.kr · 02-000-0000",
          size: 36,
          weight: 600,
          color: "#71717a",
        }),
      ],
      { color: "#ffffff" },
    ),
  },

  /* ---------------------------------------------------------
     메뉴판 — 값이 오른쪽 한 줄에 정렬됩니다
     --------------------------------------------------------- */
  {
    id: "menu-list",
    name: "차림표 한 장",
    category: "menu",
    note: "이름과 값을 좌우로 벌린 표. 값이 한 줄에 서야 비교가 됩니다.",
    doc: build(
      "menu",
      "a4-1col",
      "차림표 한 장",
      (p) => {
        const rows: [string, string, string][] = [
          ["아메리카노", "직접 볶은 원두, 하루 두 번", "4,500"],
          ["카페 라테", "국산 우유", "5,000"],
          ["핸드드립", "그날의 산지 한 가지", "6,500"],
          ["레몬 티", "설탕에 절인 국산 레몬", "5,500"],
          ["플레인 스콘", "버터를 아끼지 않았습니다", "3,800"],
        ];
        const els: PrintElement[] = [
          newText({
            x: 20,
            y: 26,
            w: p.w - 40,
            h: 14,
            text: "카들리 커피",
            size: 22,
            weight: 700,
            color: INK,
            align: "center",
          }),
          newText({
            x: 20,
            y: 44,
            w: p.w - 40,
            h: 8,
            text: "MENU",
            size: 9,
            weight: 600,
            color: "#a1a1aa",
            align: "center",
            letterSpacing: 0.4,
          }),
          newShape("line", { x: 20, y: 60, w: p.w - 40, h: 0.4, fill: "#d4d4d8" }),
        ];
        rows.forEach(([name, desc, price], i) => {
          const y = 76 + i * 30;
          els.push(
            newText({ x: 20, y, w: 110, h: 8, text: name, size: 13, weight: 600, color: INK }),
            newText({
              x: 20,
              y: y + 11,
              w: 110,
              h: 6,
              text: desc,
              size: 9,
              color: "#71717a",
            }),
            newText({
              x: p.w - 60,
              y,
              w: 40,
              h: 8,
              text: price,
              size: 13,
              weight: 600,
              color: INK,
              align: "right",
            }),
          );
        });
        els.push(
          newShape("line", { x: 20, y: 234, w: p.w - 40, h: 0.4, fill: "#d4d4d8" }),
          newText({
            x: 20,
            y: 246,
            w: p.w - 40,
            h: 12,
            text: "모든 가격은 부가세가 포함된 금액입니다.\n원산지: 커피 원두(에티오피아·콜롬비아), 우유(국내산)",
            size: 8.5,
            lineHeight: 1.7,
            color: "#71717a",
            align: "center",
          }),
        );
        return els;
      },
      { color: "#fbfaf8" },
    ),
  },
];

export function templatesFor(category: PrintCategoryId): PrintTemplate[] {
  return PRINT_TEMPLATES.filter((t) => t.category === category);
}

export function findTemplate(id: string): PrintTemplate | undefined {
  return PRINT_TEMPLATES.find((t) => t.id === id);
}
