/**
 * 메뉴판 여덟 장.
 *
 * 메뉴판에서 가장 중요한 것은 «값이 한 줄에 서는가» 입니다. 값이 들쭉날쭉
 * 하면 손님은 비교를 못 하고, 비교를 못 하면 제일 싼 것을 시킵니다.
 * 그래서 여덟 장 모두 값을 **오른쪽 정렬한 별도 텍스트 요소** 로 두었습니다
 * (kit.ts 의 priceRow). 이름과 값을 한 글자열에 넣고 공백으로 메우는 방식은
 * 글꼴만 바뀌어도 무너지는데, 사용자는 그걸 고칠 방법이 없습니다.
 *
 * 세 규격을 모두 담았습니다.
 *   1단  A4 세로 한 장          — 테이블에 두는 것
 *   2단  A3 가로를 반으로       — 펼쳐 보는 것
 *   3단  A4 가로를 셋으로 접는 것 — 포장·배달용
 *
 * 접는 판은 접히는 자리를 피해 글자를 놓아야 합니다. 3단은 99mm 마다,
 * 2단은 210mm 자리에서 접히므로 그 선 좌우 6mm 를 비워 두었습니다.
 */

import {
  INK,
  artBackground,
  bullets,
  composeAll,
  image,
  priceRow,
  rect,
  rule,
  text,
  type Draft,
} from "@/lib/print/templates/kit";

const DRAFTS: Draft[] = [
  /* ---------------------------------------------------------
     1. 카페 1단 — 일러스트를 아래에
     --------------------------------------------------------- */
  {
    id: "menu-cafe-1col",
    name: "카페 차림표",
    note: "A4 한 장. 아래에 일러스트를 깔아 여백을 마무리했습니다.",
    industry: "cafe",
    style: "flat",
    palette: ["warm", "ink"],
    art: ["menu-cafe-flat"],
    tags: ["카페", "1단", "음료"],
    size: "a4-1col",
    background: { color: "#fdfaf4" },
    build: ({ w, bleed }) => [
      text({
        x: 20,
        y: 26,
        w: w - 40,
        h: 12,
        text: "카들리 로스터스",
        size: 22,
        weight: 700,
        color: "#3b2a18",
        align: "center",
        font: "gothic-a1",
      }),
      text({
        x: 20,
        y: 46,
        w: w - 40,
        h: 6,
        text: "COFFEE · TEA · BAKERY",
        size: 8.5,
        weight: 700,
        color: "#a98d64",
        align: "center",
        letterSpacing: 0.36,
      }),
      rule({ x: 62, y: 62, w: w - 124, fill: "#e0d3bd", h: 0.6 }),

      text({
        x: 20,
        y: 76,
        w: w - 40,
        h: 6,
        text: "COFFEE",
        size: 9,
        weight: 700,
        color: "#a15c00",
        letterSpacing: 0.24,
      }),
      ...[
        ["아메리카노", "그날의 원두", "4,500"],
        ["카페 라테", "국산 우유", "5,000"],
        ["콜드브루", "열여덟 시간 내린 것", "5,500"],
        ["핸드드립", "산지 한 가지를 골라", "6,500"],
      ].flatMap(([n, d, p], i) =>
        priceRow({ x: 20, y: 88 + i * 22, w: w - 40, name: n, desc: d, price: p, nameSize: 12.5, descSize: 8.5 }),
      ),

      text({
        x: 20,
        y: 184,
        w: w - 40,
        h: 6,
        text: "TEA & MORE",
        size: 9,
        weight: 700,
        color: "#a15c00",
        letterSpacing: 0.24,
      }),
      ...[
        ["레몬 티", "설탕에 절인 국산 레몬", "5,500"],
        ["말차 라테", "우지 말차", "6,000"],
        ["플레인 스콘", "버터를 아끼지 않았습니다", "3,800"],
      ].flatMap(([n, d, p], i) =>
        priceRow({ x: 20, y: 196 + i * 22, w: w - 40, name: n, desc: d, price: p, nameSize: 12.5, descSize: 8.5 }),
      ),

      rule({ x: 62, y: 268, w: w - 124, fill: "#e0d3bd", h: 0.6 }),
      text({
        x: 20,
        y: 274,
        w: w - 40,
        h: 10,
        text: "모든 가격은 부가세가 포함된 금액입니다.\n원산지 — 커피 원두(에티오피아·콜롬비아), 우유(국내산)",
        size: 8,
        color: "#a98d64",
        align: "center",
        lineHeight: 1.7,
      }),

      image("menu-cafe-flat", {
        x: -bleed,
        y: 236,
        w: w + bleed * 2,
        h: 34,
        opacity: 0.32,
      }),
    ],
  },

  /* ---------------------------------------------------------
     2. 한식 1단 — 수채화 띠를 위에
     --------------------------------------------------------- */
  {
    id: "menu-korean-1col",
    name: "한식 차림표",
    note: "위쪽 수채화 띠와 명조. 국밥·백반집에 맞는 온도.",
    industry: "food",
    style: "watercolor",
    palette: ["red", "warm"],
    art: ["menu-korean-water"],
    tags: ["한식", "1단", "백반"],
    size: "a4-1col",
    background: { color: "#fffdf8" },
    build: ({ w, bleed }) => [
      image("menu-korean-water", { x: -bleed, y: -bleed, w: w + bleed * 2, h: 70 + bleed }),

      text({
        x: 20,
        y: 80,
        w: w - 40,
        h: 12,
        text: "성산국밥",
        size: 24,
        weight: 700,
        color: "#5b2318",
        align: "center",
        font: "nanum-myeongjo",
      }),
      text({
        x: 20,
        y: 100,
        w: w - 40,
        h: 6,
        text: "가마솥에 열두 시간",
        size: 9.5,
        color: "#96705e",
        align: "center",
        font: "nanum-myeongjo",
      }),
      rule({ x: 70, y: 112, w: w - 140, fill: "#dcc4b4", h: 0.6 }),

      ...[
        ["돼지국밥", "9,000"],
        ["순대국밥", "9,000"],
        ["내장국밥", "9,500"],
        ["섞어국밥", "10,000"],
        ["수육 (소)", "22,000"],
        ["수육 (대)", "32,000"],
        ["모둠전골 2인", "26,000"],
        ["공기밥", "1,000"],
      ].flatMap(([n, p], i) =>
        priceRow({
          x: 30,
          y: 126 + i * 16,
          w: w - 60,
          name: n,
          price: p,
          nameSize: 13,
          font: "nanum-myeongjo",
          color: "#3b2a24",
        }),
      ),

      rule({ x: 70, y: 252, w: w - 140, fill: "#dcc4b4", h: 0.6 }),
      ...bullets({
        x: 30,
        y: 258,
        w: w - 60,
        size: 8.5,
        gap: 7.5,
        color: "#96705e",
        font: "nanum-myeongjo",
        lines: [
          "돼지고기 국내산 · 김치 국내산 · 쌀 국내산",
          "포장은 용기값 500원이 더해집니다",
          "매일 07:00 – 22:00, 첫째·셋째 일요일 휴무",
        ],
      }),
      text({
        x: 20,
        y: 284,
        w: w - 40,
        h: 6,
        text: "마포구 성미산로 16 · 02-331-0000",
        size: 9,
        weight: 700,
        color: "#5b2318",
        align: "center",
        font: "nanum-myeongjo",
      }),
    ],
  },

  /* ---------------------------------------------------------
     3. 다이닝 2단 — 어두운 대리석, 펼치는 판
     --------------------------------------------------------- */
  {
    id: "menu-dining-2col",
    name: "다이닝 2단",
    note: "A3 가로를 반으로. 왼쪽은 코스, 오른쪽은 단품.",
    industry: "food",
    style: "photo",
    palette: ["ink", "mono"],
    art: ["menu-marble-photo"],
    tags: ["다이닝", "2단", "코스"],
    size: "a3-2col",
    background: artBackground("menu-marble-photo", "#1c1c1c", 0.85),
    build: ({ w, h }) => [
      /* 접히는 자리 — 210mm. 좌우 6mm 를 비웁니다 */
      rule({ x: w / 2, y: 16, w: 0.3, h: h - 32, fill: "#4a4a4a" }),

      text({
        x: 24,
        y: 26,
        w: w / 2 - 54,
        h: 12,
        text: "성산 다이닝",
        size: 20,
        weight: 700,
        color: "#f5f0e6",
        font: "gothic-a1",
      }),
      text({
        x: 24,
        y: 46,
        w: w / 2 - 54,
        h: 6,
        text: "DINNER COURSE",
        size: 8.5,
        weight: 700,
        color: "#a89b83",
        letterSpacing: 0.3,
      }),
      rule({ x: 24, y: 62, w: w / 2 - 54, fill: "#4a4a4a" }),

      ...[
        ["아뮤즈", "제철 채소와 훈제 연어", ""],
        ["전채", "관자와 콜리플라워", ""],
        ["수프", "밤과 트러플", ""],
        ["생선", "그날의 흰살 생선", ""],
        ["육류", "한우 채끝 또는 오리", ""],
        ["디저트", "계절 과일 타르트", ""],
      ].flatMap(([n, d], i) =>
        priceRow({
          x: 24,
          y: 78 + i * 24,
          w: w / 2 - 54,
          name: n,
          desc: d,
          price: "",
          nameSize: 13,
          descSize: 9,
          color: "#f5f0e6",
          descColor: "#a89b83",
        }),
      ),

      rule({ x: 24, y: 232, w: w / 2 - 54, fill: "#4a4a4a" }),
      priceRow({
        x: 24,
        y: 244,
        w: w / 2 - 54,
        name: "6코스",
        price: "78,000",
        nameSize: 16,
        color: "#f5f0e6",
        priceWidth: 40,
      })[0],
      priceRow({
        x: 24,
        y: 244,
        w: w / 2 - 54,
        name: "6코스",
        price: "78,000",
        nameSize: 16,
        color: "#f5f0e6",
        priceWidth: 40,
      })[1],
      text({
        x: 24,
        y: 264,
        w: w / 2 - 54,
        h: 6,
        text: "와인 페어링 4잔 48,000원",
        size: 9,
        color: "#a89b83",
      }),

      text({
        x: w / 2 + 30,
        y: 26,
        w: w / 2 - 54,
        h: 8,
        text: "A LA CARTE",
        size: 8.5,
        weight: 700,
        color: "#a89b83",
        letterSpacing: 0.3,
      }),
      rule({ x: w / 2 + 30, y: 44, w: w / 2 - 54, fill: "#4a4a4a" }),

      ...[
        ["관자 카르파초", "레몬과 올리브", "26,000"],
        ["부라타와 토마토", "성주 토마토", "24,000"],
        ["감자 뇨키", "고르곤졸라", "23,000"],
        ["문어 콩피", "파프리카 소스", "32,000"],
        ["한우 채끝 180g", "감자 그라탕", "58,000"],
        ["트러플 파스타", "계란 노른자", "29,000"],
        ["계절 타르트", "바닐라 아이스크림", "13,000"],
      ].flatMap(([n, d, p], i) =>
        priceRow({
          x: w / 2 + 30,
          y: 58 + i * 26,
          w: w / 2 - 54,
          name: n,
          desc: d,
          price: p,
          nameSize: 12.5,
          descSize: 9,
          color: "#f5f0e6",
          descColor: "#a89b83",
          priceWidth: 32,
        }),
      ),

      rule({ x: w / 2 + 30, y: 250, w: w / 2 - 54, fill: "#4a4a4a" }),
      text({
        x: w / 2 + 30,
        y: 260,
        w: w / 2 - 54,
        h: 12,
        text: "예약 02-543-0000 · 강남구 도산대로 40\n화 – 일 18:00 – 23:00 (월요일 휴무)",
        size: 9,
        color: "#a89b83",
        lineHeight: 1.8,
      }),
    ],
  },

  /* ---------------------------------------------------------
     4. 베이커리 2단 — 리넨 위 옅은 판
     --------------------------------------------------------- */
  {
    id: "menu-bakery-2col",
    name: "베이커리 2단",
    note: "리넨 질감 위에 두 단. 빵 이름이 길어도 값이 흐트러지지 않습니다.",
    industry: "cafe",
    style: "minimal",
    palette: ["warm", "mono"],
    art: ["menu-linen-texture"],
    tags: ["베이커리", "2단", "빵"],
    size: "a3-2col",
    background: artBackground("menu-linen-texture", "#f6f1e7", 0.75),
    build: ({ w, h }) => [
      rule({ x: w / 2, y: 16, w: 0.3, h: h - 32, fill: "#ded3c0" }),

      text({
        x: 24,
        y: 26,
        w: w / 2 - 54,
        h: 12,
        text: "성산 베이커리",
        size: 20,
        weight: 700,
        color: "#4a3b2a",
        font: "gothic-a1",
      }),
      text({
        x: 24,
        y: 46,
        w: w / 2 - 54,
        h: 6,
        text: "매일 새벽 네 시에 반죽합니다",
        size: 9,
        color: "#8a7454",
      }),
      rule({ x: 24, y: 62, w: w / 2 - 54, fill: "#ded3c0" }),

      text({
        x: 24,
        y: 74,
        w: 60,
        h: 6,
        text: "식사빵",
        size: 9,
        weight: 700,
        color: "#a1762f",
        letterSpacing: 0.16,
      }),
      ...[
        ["통밀 캄파뉴", "1/2 · 통밀 70%", "6,500"],
        ["바게트", "당일 소진", "4,000"],
        ["치아바타", "올리브유", "3,800"],
        ["호밀 식빵", "1근", "7,000"],
      ].flatMap(([n, d, p], i) =>
        priceRow({
          x: 24,
          y: 88 + i * 24,
          w: w / 2 - 54,
          name: n,
          desc: d,
          price: p,
          nameSize: 12.5,
          descSize: 9,
          color: "#3b3025",
          descColor: "#8a7454",
        }),
      ),

      text({
        x: 24,
        y: 194,
        w: 60,
        h: 6,
        text: "간식빵",
        size: 9,
        weight: 700,
        color: "#a1762f",
        letterSpacing: 0.16,
      }),
      ...[
        ["소금빵", "발효버터", "3,200"],
        ["앙버터", "팥은 직접 쑵니다", "4,500"],
        ["크루아상", "3일 접기", "4,200"],
      ].flatMap(([n, d, p], i) =>
        priceRow({
          x: 24,
          y: 208 + i * 24,
          w: w / 2 - 54,
          name: n,
          desc: d,
          price: p,
          nameSize: 12.5,
          descSize: 9,
          color: "#3b3025",
          descColor: "#8a7454",
        }),
      ),

      text({
        x: w / 2 + 30,
        y: 26,
        w: 80,
        h: 6,
        text: "케이크 · 예약",
        size: 9,
        weight: 700,
        color: "#a1762f",
        letterSpacing: 0.16,
      }),
      rule({ x: w / 2 + 30, y: 44, w: w / 2 - 54, fill: "#ded3c0" }),
      ...[
        ["딸기 생크림", "1호 · 이틀 전 예약", "42,000"],
        ["초코 가나슈", "1호 · 이틀 전 예약", "44,000"],
        ["당근 케이크", "홀 · 하루 전 예약", "38,000"],
        ["파운드 세트", "다섯 조각", "18,000"],
      ].flatMap(([n, d, p], i) =>
        priceRow({
          x: w / 2 + 30,
          y: 58 + i * 26,
          w: w / 2 - 54,
          name: n,
          desc: d,
          price: p,
          nameSize: 12.5,
          descSize: 9,
          color: "#3b3025",
          descColor: "#8a7454",
          priceWidth: 30,
        }),
      ),

      text({
        x: w / 2 + 30,
        y: 176,
        w: 80,
        h: 6,
        text: "음료",
        size: 9,
        weight: 700,
        color: "#a1762f",
        letterSpacing: 0.16,
      }),
      ...[
        ["드립 커피", "4,000"],
        ["카페 라테", "4,800"],
        ["우유", "2,500"],
      ].flatMap(([n, p], i) =>
        priceRow({
          x: w / 2 + 30,
          y: 190 + i * 20,
          w: w / 2 - 54,
          name: n,
          price: p,
          nameSize: 12.5,
          color: "#3b3025",
          priceWidth: 30,
        }),
      ),

      rule({ x: w / 2 + 30, y: 254, w: w / 2 - 54, fill: "#ded3c0" }),
      text({
        x: w / 2 + 30,
        y: 264,
        w: w / 2 - 54,
        h: 12,
        text: "마포구 성미산로 14 · 02-336-1000\n매일 08:00 – 20:00 · 월요일 휴무",
        size: 9,
        color: "#8a7454",
        lineHeight: 1.8,
      }),
    ],
  },

  /* ---------------------------------------------------------
     5. 술집 3단 — 접이식, 어두운 나무
     --------------------------------------------------------- */
  {
    id: "menu-pub-trifold",
    name: "포차 3단 접이",
    note: "A4 가로를 셋으로. 접히는 자리를 피해 칸을 나눴습니다.",
    industry: "food",
    style: "photo",
    palette: ["ink", "warm"],
    art: ["menu-wood-texture"],
    tags: ["술집", "3단", "접이식"],
    size: "a4-trifold",
    background: artBackground("menu-wood-texture", "#2a1d13", 0.9),
    build: ({ w, h }) => {
      const panel = w / 3; // 99mm
      const pad = 10;
      return [
        rule({ x: panel, y: 10, w: 0.3, h: h - 20, fill: "#5c4632" }),
        rule({ x: panel * 2, y: 10, w: 0.3, h: h - 20, fill: "#5c4632" }),

        /* 1면 — 표지 */
        text({
          x: pad,
          y: 60,
          w: panel - pad * 2,
          h: 20,
          text: "성산포차",
          size: 26,
          weight: 400,
          color: "#f3e2c7",
          align: "center",
          font: "do-hyeon",
        }),
        text({
          x: pad,
          y: 88,
          w: panel - pad * 2,
          h: 6,
          text: "저녁 다섯 시부터 새벽 두 시까지",
          size: 8.5,
          color: "#b39970",
          align: "center",
        }),
        rule({ x: pad + 20, y: 104, w: panel - pad * 2 - 40, fill: "#5c4632" }),
        text({
          x: pad,
          y: 116,
          w: panel - pad * 2,
          h: 20,
          text: "안주는 그날 들어온 것으로\n만듭니다. 없는 날도 있습니다.",
          size: 9,
          color: "#d6c4a5",
          align: "center",
          lineHeight: 1.9,
        }),
        text({
          x: pad,
          y: 176,
          w: panel - pad * 2,
          h: 12,
          text: "마포구 성미산로 10\n02-332-1000",
          size: 9,
          color: "#b39970",
          align: "center",
          lineHeight: 1.8,
        }),

        /* 2면 — 안주 */
        text({
          x: panel + pad,
          y: 22,
          w: panel - pad * 2,
          h: 6,
          text: "안주",
          size: 9.5,
          weight: 700,
          color: "#e0a458",
          letterSpacing: 0.2,
        }),
        rule({ x: panel + pad, y: 36, w: panel - pad * 2, fill: "#5c4632" }),
        ...[
          ["모둠 전", "18,000"],
          ["골뱅이 무침", "22,000"],
          ["계란말이", "12,000"],
          ["닭똥집 볶음", "16,000"],
          ["오뎅탕", "14,000"],
          ["감자전", "13,000"],
          ["회 한 접시", "시가"],
        ].flatMap(([n, p], i) =>
          priceRow({
            x: panel + pad,
            y: 48 + i * 18,
            w: panel - pad * 2,
            name: n,
            price: p,
            nameSize: 11,
            color: "#f3e2c7",
            priceWidth: 24,
          }),
        ),

        /* 3면 — 술 */
        text({
          x: panel * 2 + pad,
          y: 22,
          w: panel - pad * 2,
          h: 6,
          text: "술",
          size: 9.5,
          weight: 700,
          color: "#e0a458",
          letterSpacing: 0.2,
        }),
        rule({ x: panel * 2 + pad, y: 36, w: panel - pad * 2, fill: "#5c4632" }),
        ...[
          ["소주", "5,000"],
          ["맥주", "5,000"],
          ["막걸리", "6,000"],
          ["소맥 세트", "9,000"],
          ["하이볼", "8,000"],
          ["무알콜 맥주", "5,000"],
        ].flatMap(([n, p], i) =>
          priceRow({
            x: panel * 2 + pad,
            y: 48 + i * 18,
            w: panel - pad * 2,
            name: n,
            price: p,
            nameSize: 11,
            color: "#f3e2c7",
            priceWidth: 24,
          }),
        ),
        rule({ x: panel * 2 + pad, y: 166, w: panel - pad * 2, fill: "#5c4632" }),
        text({
          x: panel * 2 + pad,
          y: 174,
          w: panel - pad * 2,
          h: 12,
          text: "청소년에게는 팔지 않습니다.\n신분증을 보여 주세요.",
          size: 8,
          color: "#b39970",
          lineHeight: 1.8,
        }),
      ];
    },
  },

  /* ---------------------------------------------------------
     6. 브런치 3단 — 밝은 판
     --------------------------------------------------------- */
  {
    id: "menu-brunch-trifold",
    name: "브런치 3단 접이",
    note: "밝고 성긴 판. 셋째 면을 안내로 비워 두었습니다.",
    industry: "cafe",
    style: "minimal",
    palette: ["pastel", "mono"],
    tags: ["브런치", "3단", "접이식"],
    size: "a4-trifold",
    background: { color: "#fbfaf7" },
    build: ({ w, h }) => {
      const panel = w / 3;
      const pad = 10;
      return [
        rule({ x: panel, y: 10, w: 0.3, h: h - 20, fill: "#e5e2da" }),
        rule({ x: panel * 2, y: 10, w: 0.3, h: h - 20, fill: "#e5e2da" }),

        text({
          x: pad,
          y: 22,
          w: panel - pad * 2,
          h: 6,
          text: "ALL DAY BRUNCH",
          size: 8,
          weight: 700,
          color: "#8a8f7a",
          letterSpacing: 0.28,
        }),
        rule({ x: pad, y: 36, w: panel - pad * 2, fill: "#dcd9cf" }),
        ...[
          ["에그 베네딕트", "수란 둘 · 홀랜다이즈", "15,000"],
          ["아보카도 토스트", "통밀빵 · 수란", "13,000"],
          ["팬케이크", "메이플 · 버터", "12,000"],
          ["그래놀라 볼", "요거트 · 제철 과일", "11,000"],
        ].flatMap(([n, d, p], i) =>
          priceRow({
            x: pad,
            y: 48 + i * 26,
            w: panel - pad * 2,
            name: n,
            desc: d,
            price: p,
            nameSize: 11,
            descSize: 8,
            priceWidth: 24,
          }),
        ),

        text({
          x: panel + pad,
          y: 22,
          w: panel - pad * 2,
          h: 6,
          text: "PLATES",
          size: 8,
          weight: 700,
          color: "#8a8f7a",
          letterSpacing: 0.28,
        }),
        rule({ x: panel + pad, y: 36, w: panel - pad * 2, fill: "#dcd9cf" }),
        ...[
          ["샐러드 파스타", "레몬 · 루콜라", "16,000"],
          ["트러플 감자", "파르메산", "9,000"],
          ["수프와 빵", "그날의 수프", "10,000"],
          ["치킨 샌드위치", "감자튀김 포함", "15,000"],
        ].flatMap(([n, d, p], i) =>
          priceRow({
            x: panel + pad,
            y: 48 + i * 26,
            w: panel - pad * 2,
            name: n,
            desc: d,
            price: p,
            nameSize: 11,
            descSize: 8,
            priceWidth: 24,
          }),
        ),

        text({
          x: panel * 2 + pad,
          y: 22,
          w: panel - pad * 2,
          h: 6,
          text: "DRINKS",
          size: 8,
          weight: 700,
          color: "#8a8f7a",
          letterSpacing: 0.28,
        }),
        rule({ x: panel * 2 + pad, y: 36, w: panel - pad * 2, fill: "#dcd9cf" }),
        ...[
          ["드립 커피", "4,500"],
          ["카페 라테", "5,000"],
          ["생과일 주스", "6,500"],
          ["허브 티", "5,000"],
        ].flatMap(([n, p], i) =>
          priceRow({
            x: panel * 2 + pad,
            y: 48 + i * 18,
            w: panel - pad * 2,
            name: n,
            price: p,
            nameSize: 11,
            priceWidth: 24,
          }),
        ),

        rule({ x: panel * 2 + pad, y: 130, w: panel - pad * 2, fill: "#dcd9cf" }),
        ...bullets({
          x: panel * 2 + pad,
          y: 140,
          w: panel - pad * 2,
          size: 8,
          gap: 7,
          lines: ["브런치는 오후 4시까지", "2인 이상 주문 부탁드립니다", "반려동물 동반 가능"],
        }),
        text({
          x: panel * 2 + pad,
          y: 176,
          w: panel - pad * 2,
          h: 12,
          text: "마포구 성미산로 26\n02-336-2000",
          size: 8.5,
          weight: 700,
          color: INK.black,
          lineHeight: 1.8,
        }),
      ];
    },
  },

  /* ---------------------------------------------------------
     7. 치킨집 1단 — 붉은 판, 배달 안내까지
     --------------------------------------------------------- */
  {
    id: "menu-chicken-1col",
    name: "치킨 차림표",
    note: "굵은 글씨와 붉은 판. 벽에 붙여도 멀리서 읽힙니다.",
    industry: "food",
    style: "bold",
    palette: ["red", "ink"],
    tags: ["치킨", "1단", "배달"],
    size: "a4-1col",
    background: { color: "#141414" },
    build: ({ w, bleed }) => [
      rect({ x: -bleed, y: -bleed, w: w + bleed * 2, h: 54 + bleed, fill: "#b91c1c" }),
      text({
        x: 20,
        y: 16,
        w: w - 40,
        h: 16,
        text: "성산치킨",
        size: 26,
        weight: 400,
        color: "#ffffff",
        font: "black-han-sans",
      }),
      text({
        x: 20,
        y: 40,
        w: w - 40,
        h: 6,
        text: "매일 16:00 – 02:00 · 연중무휴 · 02-339-0000",
        size: 9,
        color: "#ffd6d6",
      }),

      text({
        x: 20,
        y: 70,
        w: w - 40,
        h: 6,
        text: "치킨",
        size: 10,
        weight: 700,
        color: "#f0b429",
        letterSpacing: 0.2,
      }),
      ...[
        ["후라이드", "19,000"],
        ["양념", "20,000"],
        ["간장", "20,000"],
        ["반반", "20,000"],
        ["마늘 간장", "21,000"],
        ["매운 양념", "21,000"],
      ].flatMap(([n, p], i) =>
        priceRow({
          x: 20,
          y: 80 + i * 18,
          w: w - 40,
          name: n,
          price: p,
          nameSize: 14,
          color: "#ffffff",
          priceWidth: 30,
        }),
      ),

      text({
        x: 20,
        y: 192,
        w: w - 40,
        h: 6,
        text: "사이드 · 음료",
        size: 10,
        weight: 700,
        color: "#f0b429",
        letterSpacing: 0.2,
      }),
      ...[
        ["감자튀김", "5,000"],
        ["치즈볼 5개", "6,000"],
        ["콜라 1.25L", "3,000"],
        ["생맥주 500", "4,500"],
      ].flatMap(([n, p], i) =>
        priceRow({
          x: 20,
          y: 204 + i * 17,
          w: w - 40,
          name: n,
          price: p,
          nameSize: 12.5,
          color: "#ffffff",
          priceWidth: 30,
        }),
      ),

      rect({ x: 20, y: 268, w: w - 40, h: 24, fill: "#252525", radius: 3 }),
      ...bullets({
        x: 28,
        y: 274,
        w: w - 56,
        size: 8.5,
        gap: 7,
        color: "#a1a1aa",
        lines: [
          "두 마리 주문 시 3,000원 할인",
          "배달은 반경 3km · 최소 주문 15,000원",
          "닭 국내산 · 원산지는 매장에 게시되어 있습니다",
        ],
      }),
    ],
  },

  /* ---------------------------------------------------------
     8. 찻집 2단 — 옅은 초록과 넉넉한 행간
     --------------------------------------------------------- */
  {
    id: "menu-tea-2col",
    name: "찻집 2단",
    note: "행간을 넓게 벌린 조용한 판. 값이 작아도 흐트러지지 않습니다.",
    industry: "cafe",
    style: "minimal",
    palette: ["green", "warm"],
    art: ["mark-leaf-minimal"],
    tags: ["찻집", "2단", "차"],
    size: "a3-2col",
    background: { color: "#f7f9f4" },
    build: ({ w, h }) => [
      rule({ x: w / 2, y: 16, w: 0.3, h: h - 32, fill: "#d8e0d0" }),
      image("mark-leaf-minimal", {
        x: w / 2 - 22,
        y: 118,
        w: 44,
        h: 44,
        fit: "contain",
        opacity: 0.5,
      }),

      text({
        x: 24,
        y: 28,
        w: w / 2 - 54,
        h: 12,
        text: "다향 茶香",
        size: 20,
        weight: 700,
        color: "#1f3d24",
        font: "nanum-myeongjo",
      }),
      text({
        x: 24,
        y: 48,
        w: w / 2 - 54,
        h: 6,
        text: "하동에서 받은 잎으로 우립니다",
        size: 9,
        color: "#6b7d63",
        font: "nanum-myeongjo",
      }),
      rule({ x: 24, y: 64, w: w / 2 - 54, fill: "#d8e0d0" }),

      text({
        x: 24,
        y: 76,
        w: 60,
        h: 6,
        text: "녹차",
        size: 9,
        weight: 700,
        color: "#4d7c0f",
        letterSpacing: 0.16,
      }),
      ...[
        ["세작", "곡우 전에 딴 잎", "9,000"],
        ["중작", "하동 야생차", "7,500"],
        ["말차", "격불하여 냅니다", "9,500"],
      ].flatMap(([n, d, p], i) =>
        priceRow({
          x: 24,
          y: 92 + i * 28,
          w: w / 2 - 54,
          name: n,
          desc: d,
          price: p,
          nameSize: 12.5,
          descSize: 9,
          font: "nanum-myeongjo",
          color: "#25311f",
          descColor: "#6b7d63",
        }),
      ),

      text({
        x: 24,
        y: 190,
        w: 60,
        h: 6,
        text: "발효차",
        size: 9,
        weight: 700,
        color: "#4d7c0f",
        letterSpacing: 0.16,
      }),
      ...[
        ["보이차", "십 년 묵힌 것", "12,000"],
        ["홍차", "정산소종", "8,500"],
        ["황차", "하동 반발효", "9,000"],
      ].flatMap(([n, d, p], i) =>
        priceRow({
          x: 24,
          y: 206 + i * 28,
          w: w / 2 - 54,
          name: n,
          desc: d,
          price: p,
          nameSize: 12.5,
          descSize: 9,
          font: "nanum-myeongjo",
          color: "#25311f",
          descColor: "#6b7d63",
        }),
      ),

      text({
        x: w / 2 + 30,
        y: 28,
        w: 80,
        h: 6,
        text: "차와 함께",
        size: 9,
        weight: 700,
        color: "#4d7c0f",
        letterSpacing: 0.16,
      }),
      rule({ x: w / 2 + 30, y: 46, w: w / 2 - 54, fill: "#d8e0d0" }),
      ...[
        ["약과 두 개", "직접 만든 것", "5,000"],
        ["백설기", "하루 열 개만", "4,500"],
        ["대추차", "생대추를 고아", "8,000"],
        ["오미자차", "차게 또는 뜨겁게", "8,000"],
        ["수정과", "직접 담근 것", "7,500"],
      ].flatMap(([n, d, p], i) =>
        priceRow({
          x: w / 2 + 30,
          y: 62 + i * 28,
          w: w / 2 - 54,
          name: n,
          desc: d,
          price: p,
          nameSize: 12.5,
          descSize: 9,
          font: "nanum-myeongjo",
          color: "#25311f",
          descColor: "#6b7d63",
          priceWidth: 28,
        }),
      ),

      rule({ x: w / 2 + 30, y: 216, w: w / 2 - 54, fill: "#d8e0d0" }),
      text({
        x: w / 2 + 30,
        y: 228,
        w: w / 2 - 54,
        h: 20,
        text: "차는 두 번까지 우려 드립니다.\n다기는 매번 끓는 물로 헹굽니다.\n\n종로구 인사동길 30 · 02-720-0000",
        size: 9,
        color: "#6b7d63",
        lineHeight: 1.9,
        font: "nanum-myeongjo",
      }),
    ],
  },
];

export const MENU_TEMPLATES = composeAll("menu", DRAFTS);
