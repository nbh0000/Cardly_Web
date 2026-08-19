/* 초대장 디자인 스물넉 벌 — 행사 여섯 갈래 × 네 벌.

   한 벌이 정하는 것은 «표지 판짜기 + 색 세 개» 뿐입니다. 글꼴은 전체가
   두 벌로 통일되어 있고(본문 Pretendard, 디스플레이 나눔명조), 크기와
   여백은 토큰이 정합니다. 벌마다 자유롭게 정할 수 있는 것이 적을수록
   전체가 한 벌의 물건으로 보입니다.

   ── 색 세 개 ──────────────────────────────────────────────────
     bg     카드 종이색
     ink    그 종이 위의 글자색 — bg 와 4.5:1 이상
     point  강조색(선·날짜·단추) — bg 와 3:1 이상
   나머지 톤은 CSS 가 이 셋을 섞어 만듭니다(app/occasion-tokens.css).
   개편 전에는 한 벌이 색을 여덟 개 들고 있었는데, 여덟 개를 손으로 맞추면
   반드시 어딘가 어긋나고 어긋난 자리를 찾기도 어렵습니다.

   ── 사진형 여덟 벌 ────────────────────────────────────────────
   미술관 오픈액세스(CC0) 소장품을 씁니다. 색은 지어내지 않고 그림에서
   뽑았습니다. 그림과 따로 노는 색을 얹으면 아무리 예쁜 색이어도 카드가
   조잡해집니다.

   ── 일러스트형 열여섯 벌 ──────────────────────────────────────
   그림이 없습니다. 색면·괘선·활자만으로 짭니다. 스물넉 벌이 전부 명화면
   초대장이 아니라 미술관 굿즈로 보입니다.                             */

import type { Design, OccasionId } from "@/lib/occasion/types";

export const DESIGNS: Design[] = [
  /* ══════════════════ 생일 ══════════════════ */
  {
    id: "sunflower",
    name: "해바라기",
    occasion: "birthday",
    note: "레멘의 목판화. 검은 바탕에 노란 꽃 두 송이가 정면을 봅니다.",
    kind: "photo",
    cover: "foot",
    art: "sunflower.webp",
    bg: "#FFFCF3",
    ink: "#241F16",
    point: "#A6741A",
  },
  {
    id: "numeral-ink",
    name: "먹과 숫자",
    occasion: "birthday",
    note: "날짜를 표지에서 가장 큰 것으로 세우고 나머지는 왼쪽 아래로 몰았습니다.",
    kind: "graphic",
    cover: "numeral",
    bg: "#1B2430",
    ink: "#F0EDE4",
    point: "#D2A15C",
  },
  {
    id: "band-coral",
    name: "산호 띠",
    occasion: "birthday",
    note: "위아래 굵은 띠 사이에 종이를 남겨 두는, 오래된 초대장 판입니다.",
    kind: "graphic",
    cover: "band",
    bg: "#FDF7F1",
    ink: "#2E2320",
    point: "#B84A2F",
  },
  {
    id: "rule-cream",
    name: "괘선",
    occasion: "birthday",
    note: "가는 선 두 줄 사이에 영문을 눕히고, 그 아래 제목을 앉혔습니다.",
    kind: "graphic",
    cover: "rule",
    bg: "#F6F2E6",
    ink: "#26231A",
    point: "#7A6C33",
  },

  /* ══════════════════ 돌잔치 ══════════════════ */
  {
    id: "bird",
    name: "목련과 문조",
    occasion: "firstbirthday",
    note: "호쿠사이의 화조화를 창처럼 오려 넣고, 이름은 종이 위에 앉혔습니다.",
    kind: "photo",
    cover: "window",
    art: "bird.webp",
    bg: "#F7F2E4",
    ink: "#2A2719",
    point: "#6E6C36",
  },
  {
    id: "plate-sky",
    name: "하늘색 판",
    occasion: "firstbirthday",
    note: "옅은 하늘색 한 면에 가는 액자선 하나. 아기 이름이 제일 큽니다.",
    kind: "graphic",
    cover: "plate",
    bg: "#DCE7EC",
    ink: "#1F2E33",
    point: "#2F5E6B",
  },
  {
    id: "corner-oat",
    name: "오트밀 모서리",
    occasion: "firstbirthday",
    note: "네 모서리에만 ㄱ자 선을 둡니다. 날짜가 제목 위로 올라갑니다.",
    kind: "graphic",
    cover: "corner",
    bg: "#F3EDE1",
    ink: "#2C2620",
    point: "#93683B",
  },
  {
    id: "mono-clay",
    name: "이니셜",
    occasion: "firstbirthday",
    note: "이름 첫 글자를 원 안에. 스물넉 벌 가운데 가장 조용한 판입니다.",
    kind: "graphic",
    cover: "mono",
    bg: "#E9E1D9",
    ink: "#302823",
    point: "#7E5F4E",
  },

  /* ══════════════════ 집들이 ══════════════════ */
  {
    id: "table",
    name: "식탁 한 귀퉁이",
    occasion: "housewarming",
    note: "팡탱라투르. 흰 식탁보, 유리잔, 그리고 꽃 한 다발.",
    kind: "photo",
    cover: "foot",
    art: "table.webp",
    bg: "#FBFBF7",
    ink: "#22241F",
    point: "#5E5646",
  },
  {
    id: "lily",
    name: "수련 연못",
    occasion: "housewarming",
    note: "모네의 연못. 초록이 화면을 다 덮어 눈이 편안합니다.",
    kind: "photo",
    cover: "head",
    art: "lily.webp",
    bg: "#FAFCF6",
    ink: "#1F261E",
    point: "#43653F",
  },
  {
    id: "stripe-olive",
    name: "올리브 줄무늬",
    occasion: "housewarming",
    note: "아주 가는 세로줄 위에 라벨 하나. 라벨 안은 왼쪽으로 정렬했습니다.",
    kind: "graphic",
    cover: "stripe",
    bg: "#EDEDE2",
    ink: "#272A20",
    point: "#566234",
  },
  {
    id: "stack-sand",
    name: "모래빛 조판",
    occasion: "housewarming",
    note: "제목을 왼쪽에 크게 쌓고 아래에 굵은 선 하나, 날짜는 오른쪽 끝에.",
    kind: "graphic",
    cover: "stack",
    bg: "#E8E1D4",
    ink: "#2A2620",
    point: "#8A5C26",
  },

  /* ══════════════════ 개업 · 오픈 ══════════════════ */
  {
    id: "wave",
    name: "큰 파도",
    occasion: "opening",
    note: "호쿠사이. 이보다 기세 좋은 그림은 많지 않습니다.",
    kind: "photo",
    cover: "center",
    art: "wave.webp",
    bg: "#FAFBF7",
    ink: "#1B2430",
    point: "#1C4266",
  },
  {
    id: "band-ink",
    name: "먹 띠",
    occasion: "opening",
    note: "검정과 흰 종이만. 상호가 길어도 흔들리지 않는 판입니다.",
    kind: "graphic",
    cover: "band",
    bg: "#FAF8F3",
    ink: "#1F2124",
    point: "#1D1F22",
  },
  {
    id: "numeral-gold",
    name: "놋쇠 숫자",
    occasion: "opening",
    note: "어두운 종이에 문 여는 날짜만 크게. 놋쇠 한 색으로 눌렀습니다.",
    kind: "graphic",
    cover: "numeral",
    bg: "#1F1A12",
    ink: "#F2E7CE",
    point: "#C79A45",
  },
  {
    id: "plate-forest",
    name: "짙은 숲 판",
    occasion: "opening",
    note: "초록 한 면에 가는 액자선. 카페와 공방에 잘 맞습니다.",
    kind: "graphic",
    cover: "plate",
    bg: "#1E3229",
    ink: "#E8F0E7",
    point: "#8CBB93",
  },

  /* ══════════════════ 파티 · 모임 ══════════════════ */
  {
    id: "blossom",
    name: "벚꽃 연회",
    occasion: "party",
    note: "우타마로의 목판화. 벚꽃 아래 사람들이 모여 있습니다.",
    kind: "photo",
    cover: "center",
    art: "blossom.webp",
    bg: "#FFFAF5",
    ink: "#33231E",
    point: "#A85941",
  },
  {
    id: "stack-night",
    name: "밤",
    occasion: "party",
    note: "남색 한 면에 제목을 왼쪽으로 몰아 쌓았습니다. 저녁 모임의 색입니다.",
    kind: "graphic",
    cover: "stack",
    bg: "#191C2B",
    ink: "#E9E8F2",
    point: "#9B9AD4",
  },
  {
    id: "stripe-plum",
    name: "자두 줄무늬",
    occasion: "party",
    note: "가는 줄무늬에 라벨 하나. 격식은 덜고 분위기만 남겼습니다.",
    kind: "graphic",
    cover: "stripe",
    bg: "#F3E9EE",
    ink: "#33222B",
    point: "#7E3453",
  },
  {
    id: "mono-coral",
    name: "산호 이니셜",
    occasion: "party",
    note: "모임 이름의 첫 글자를 원 안에. 동아리와 송년회에 맞습니다.",
    kind: "graphic",
    cover: "mono",
    bg: "#F7EDE6",
    ink: "#33241E",
    point: "#B04F2C",
  },

  /* ══════════════════ 기념일 · 감사 ══════════════════ */
  {
    id: "rose",
    name: "화병의 장미",
    occasion: "anniversary",
    note: "쇠라의 목탄 소묘. 색이 없어 오히려 격이 있습니다.",
    kind: "photo",
    cover: "window",
    art: "rose.webp",
    bg: "#F5F2EB",
    ink: "#232120",
    point: "#57534E",
  },
  {
    id: "iris",
    name: "붓꽃",
    occasion: "anniversary",
    note: "모네 말년의 붓꽃. 초록과 보라가 뒤엉킨 큰 화면입니다.",
    kind: "photo",
    cover: "foot",
    art: "iris.webp",
    bg: "#FBFCF7",
    ink: "#232A22",
    point: "#4F4F7C",
  },
  {
    id: "rule-ash",
    name: "잿빛 괘선",
    occasion: "anniversary",
    note: "가장 조용한 판입니다. 회갑과 은퇴처럼 말을 아껴야 할 자리에.",
    kind: "graphic",
    cover: "rule",
    bg: "#F1F0EC",
    ink: "#232120",
    point: "#57534E",
  },
  {
    id: "corner-pearl",
    name: "진주빛 모서리",
    occasion: "anniversary",
    note: "따뜻한 흰 종이에 모서리 선만. 결혼기념일에 가장 많이 고르는 판입니다.",
    kind: "graphic",
    cover: "corner",
    bg: "#F6F1EA",
    ink: "#2C2620",
    point: "#8A6A52",
  },
];

const BY_ID = new Map(DESIGNS.map((d) => [d.id, d]));

/** 첫 디자인 — 목록의 견본과 만들기의 기본값으로만 씁니다 */
export const FALLBACK_DESIGN = DESIGNS[0]!;

/**
 * 아는 디자인이면 돌려주고, 모르면 undefined 입니다.
 *
 * 예전에는 모르는 id 를 조용히 첫 디자인으로 바꿔 돌려줬습니다. 그러면
 * 링크가 한 글자 깨졌을 때 «다른 카드» 가 멀쩡한 얼굴로 열립니다. 받는
 * 사람은 그게 자기에게 온 카드인 줄 알고, 만든 사람은 뭐가 잘못됐는지
 * 영영 모릅니다. 모르는 것은 모른다고 해야 합니다.
 */
export function findDesign(id: string | undefined): Design | undefined {
  return id ? BY_ID.get(id) : undefined;
}

export function designsOf(occasion: OccasionId): Design[] {
  return DESIGNS.filter((d) => d.occasion === occasion);
}

/** 디자인의 색 세 개를 CSS 변수로 — 카드 안팎이 모두 이 셋만 봅니다. */
export function designVars(d: Design): Record<string, string> {
  return {
    "--oc-bg": d.bg,
    "--oc-ink": d.ink,
    "--oc-point": d.point,
  };
}
