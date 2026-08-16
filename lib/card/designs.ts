/* ============================================================
   카드 디자인 목록

   한 장의 카드는 "그림 하나 + 색 한 벌" 입니다. cardly.net 이 그런
   구조로 되어 있고, 그게 맞습니다 — 카드를 고르는 사람은 레이아웃을
   고르는 게 아니라 그림을 고릅니다.

   그림은 전부 이 저장소 안에서 SVG 로 그립니다. 남의 일러스트를
   가져다 쓰면 상업적 이용 조건을 지킬 수 없고, 스톡 사진을 깔면
   초대장이 아니라 배너가 됩니다.
   ============================================================ */

import type { CardDesign, Occasion, OccasionId } from "@/lib/card/types";

export const OCCASIONS: Occasion[] = [
  {
    id: "birthday",
    label: "생일",
    blurb: "케이크 앞에 모일 사람들에게",
    preset: {
      title: "서연이의 생일",
      subtitle: "함께 촛불을 꺼 주세요",
      host: "김서연",
      place: "연남동 라운지",
      address: "서울 마포구 연남로 21 2층",
      greeting:
        "한 살 더 먹었습니다.\n케이크 앞에서 같이 웃어 줄 사람이\n당신이면 좋겠어요.\n\n편한 차림으로 와 주세요.",
      note: "주차 공간이 좁아 대중교통을 권합니다.",
    },
  },
  {
    id: "party",
    label: "파티",
    blurb: "긴 밤을 같이 보낼 사람들에게",
    preset: {
      title: "여름밤 홈파티",
      subtitle: "몸만 오세요",
      host: "김도윤 · 이서연",
      place: "성수동 옥상",
      address: "서울 성동구 연무장길 45 옥상",
      greeting:
        "긴 여름밤, 좋은 사람들과 한잔하려 합니다.\n음식과 음악은 준비해 두었으니\n몸만 오시면 됩니다.\n\n늦게 오셔도 좋아요.",
      note: "옥상이라 저녁에는 조금 쌀쌀합니다. 겉옷을 챙겨 오세요.",
    },
  },
  {
    id: "housewarming",
    label: "집들이",
    blurb: "새 집을 처음 보여 주는 날",
    preset: {
      title: "저희 집에 초대합니다",
      subtitle: "밥 한 끼 같이 해요",
      host: "김도윤 · 이서연",
      place: "마포구 연남동",
      address: "서울 마포구 성미산로 32길 8, 301호",
      greeting:
        "드디어 짐 정리가 끝났습니다.\n밥 한 끼 같이 하면서\n새 집 구경하러 오세요.\n\n빈손으로 오시면 됩니다.",
      note: "엘리베이터가 없는 3층입니다. 천천히 올라오세요.",
    },
  },
  {
    id: "firstbirthday",
    label: "돌잔치",
    blurb: "아이의 첫 일 년을 나누는 자리",
    preset: {
      title: "하준이의 첫 생일",
      subtitle: "함께해 주세요",
      host: "김도윤 · 이서연",
      place: "그랜드하얏트 서울",
      address: "서울 용산구 소월로 322 3층 연회장",
      greeting:
        "아이가 태어난 지 일 년이 되었습니다.\n그동안 마음 써 주신 분들과\n첫 생일을 함께 나누고 싶습니다.\n\n오셔서 축복해 주세요.",
      note: "돌잡이는 오후 1시 30분에 시작합니다.",
    },
  },
  {
    id: "opening",
    label: "개업 · 오픈",
    blurb: "오래 준비한 문을 여는 날",
    preset: {
      title: "작은 가게를 엽니다",
      subtitle: "들러서 커피 한잔 하세요",
      host: "김도윤",
      place: "연희동 1층",
      address: "서울 서대문구 연희로 11길 20 1층",
      greeting:
        "오래 준비한 가게를 드디어 엽니다.\n오시는 길에 들러\n커피 한잔 하고 가세요.\n\n오픈 주간에는 음료를 대접합니다.",
      note: "오픈 주간(5/24–5/30)에는 음료를 대접합니다.",
    },
  },
  {
    id: "festival",
    label: "페스티벌",
    blurb: "강가에서 만나기로 한 밤",
    preset: {
      title: "한강 여름 페스티벌",
      subtitle: "돗자리를 챙겨 오세요",
      host: "한강문화기획단",
      place: "여의도 한강공원",
      address: "서울 영등포구 여의동로 330 물빛무대",
      greeting:
        "여름 저녁, 강가에서 음악과 함께합니다.\n돗자리와 편한 신발을 챙겨 오세요.\n\n우천 시에는 실내로 옮겨 진행합니다.",
      note: "우천 시 실내(여의도 아트홀)로 옮겨 진행합니다.",
    },
  },
  {
    id: "gathering",
    label: "모임 · 동창회",
    blurb: "오랜만에 얼굴 보자는 말",
    preset: {
      title: "열두 번째 정기 모임",
      subtitle: "오랜만에 얼굴 봅시다",
      host: "모임지기 김도윤",
      place: "종로 한정식",
      address: "서울 종로구 인사동길 30 2층",
      greeting:
        "오랜만에 얼굴 한번 보시죠.\n식사와 자리는 미리 잡아 두었습니다.\n\n오실 분은 참석 여부만 알려 주세요.",
      note: "주차는 인사동 공영주차장을 이용해 주세요.",
    },
  },
  {
    id: "anniversary",
    label: "기념일",
    blurb: "조용히 한 끼 나누는 날",
    preset: {
      title: "함께한 열 번째 해",
      subtitle: "곁에 있어 주셔서",
      host: "김도윤 · 이서연",
      place: "북촌 다이닝",
      address: "서울 종로구 북촌로 12길 5",
      greeting:
        "벌써 십 년이 되었습니다.\n곁에 있어 주신 분들과\n조용히 한 끼 나누고 싶습니다.\n\n귀한 걸음 부탁드립니다.",
      note: "코스 요리라 예약 인원 확인이 필요합니다.",
    },
  },
  {
    id: "graduation",
    label: "졸업 · 수료",
    blurb: "긴 과정을 마친 마지막 날",
    preset: {
      title: "졸업을 축하해 주세요",
      subtitle: "마지막 날을 함께",
      host: "김서연",
      place: "한국대학교 대강당",
      address: "서울 성북구 안암로 145 대강당",
      greeting:
        "긴 과정을 무사히 마쳤습니다.\n지켜봐 주신 분들과\n마지막 날을 함께하고 싶습니다.\n\n와 주시면 큰 기쁨이 되겠습니다.",
      note: "학위수여식은 오후 1시, 사진 촬영은 2시부터입니다.",
    },
  },
  {
    id: "farewell",
    label: "퇴임 · 송별",
    blurb: "오래 지킨 자리를 떠나며",
    preset: {
      title: "그동안 감사했습니다",
      subtitle: "인사를 나누고 싶습니다",
      host: "김도윤",
      place: "회사 근처 식당",
      address: "서울 중구 을지로 100 3층",
      greeting:
        "오랜 시간 한자리를 지켰습니다.\n함께 일한 분들과 인사를 나누고 싶어\n자리를 마련했습니다.\n\n부담 없이 들러 주세요.",
      note: "선물은 정중히 사양합니다. 몸만 와 주세요.",
    },
  },
];

export function getOccasion(id: string): Occasion | undefined {
  return OCCASIONS.find((o) => o.id === id);
}

/* ------------------------------------------------------------
   색 한 벌씩

   채도를 낮추고 종이색을 따뜻하게 잡았습니다. 원색을 그대로 쓰면
   화면에서는 선명해 보여도 인쇄물로는 보이지 않습니다. tint 는
   종이보다 한 겹 진한 면이라 그림에 빛과 그늘을 만듭니다.
   ------------------------------------------------------------ */

const P = {
  /* 따뜻한 아이보리 — 어디에나 어울리는 기본 */
  ivory: { paper: "#FBF7F0", ink: "#2B241C", accent: "#C1703F", soft: "#E7D8C0", deep: "#7B4220", tint: "#F3E9D9" },
  /* 물 빠진 장미 */
  blush: { paper: "#FCF2F0", ink: "#33242A", accent: "#C25E72", soft: "#F0D6D3", deep: "#7E3244", tint: "#F7E4E0" },
  /* 마른 세이지 */
  sage: { paper: "#F1F3EC", ink: "#242A22", accent: "#6E8B5E", soft: "#D8E1CF", deep: "#3B4E33", tint: "#E6EBDE" },
  /* 흐린 하늘 */
  sky: { paper: "#EEF3F7", ink: "#1F2A34", accent: "#4C82A8", soft: "#D5E3ED", deep: "#254F6D", tint: "#E3EDF4" },
  /* 마른 자두 */
  plum: { paper: "#F4EFF5", ink: "#2B2231", accent: "#8A6B9E", soft: "#E1D7E7", deep: "#4F3661", tint: "#EBE2EF" },
  /* 구운 흙 */
  clay: { paper: "#F8F0E8", ink: "#2E2219", accent: "#B4603C", soft: "#EBD9C7", deep: "#6D371D", tint: "#F1E3D4" },
  /* 겨자와 아마 */
  ochre: { paper: "#F8F3E4", ink: "#2C2718", accent: "#B58B2E", soft: "#E9DEBC", deep: "#6A4E14", tint: "#F1E8CE" },
  /* 바랜 잉크 */
  slate: { paper: "#F2F3F1", ink: "#1E2630", accent: "#456079", soft: "#DBE0E1", deep: "#22323F", tint: "#E5E8E7" },
  /* 이끼와 물 */
  teal: { paper: "#EDF4F2", ink: "#1D2C29", accent: "#3E8A7C", soft: "#CFE3DE", deep: "#1F544B", tint: "#E0EDE9" },
  /* 붉은 벽돌 */
  brick: { paper: "#F9EFEA", ink: "#2E1F19", accent: "#B0503C", soft: "#EDD5CA", deep: "#6C2A1D", tint: "#F2E0D7" },
  /* 밤 — 어두운 종이 */
  night: { paper: "#1B1F2E", ink: "#EFEDE6", accent: "#D9AE62", soft: "#2B3145", deep: "#10131E", tint: "#242A3C" },
  /* 숯 — 어두운 종이 */
  charcoal: { paper: "#22211E", ink: "#F0EDE5", accent: "#C98A54", soft: "#33312C", deep: "#141310", tint: "#2B2A26" },
} as const;

/* ------------------------------------------------------------
   카드 마흔 장

   같은 그림이라도 색이 바뀌면 다른 물건입니다. 행사마다 네 장씩,
   되도록 결이 다른 넷을 붙였습니다 — 그림 하나, 패턴 하나, 조판
   하나, 어두운 것 하나.
   ------------------------------------------------------------ */

export const DESIGNS: CardDesign[] = [
  /* ══════ 생일 ══════ */
  { id: "bd-candle", name: "촛불", occasion: "birthday", art: "candle", palette: P.ivory, titlePlace: "bottom", titleFont: "gowun-batang", badge: "BEST" },
  { id: "bd-confetti", name: "색종이", occasion: "birthday", art: "confetti", palette: P.blush, titlePlace: "bottom", titleFont: "jua" },
  { id: "bd-balloon", name: "풍선", occasion: "birthday", art: "balloon", palette: P.sky, titlePlace: "bottom", titleFont: "gowun-dodum" },
  { id: "bd-night", name: "생일밤", occasion: "birthday", art: "night", palette: P.night, titlePlace: "bottom", titleFont: "nanum-myeongjo", badge: "NEW" },

  /* ══════ 파티 ══════ */
  { id: "pt-terrazzo", name: "테라조", occasion: "party", art: "terrazzo", palette: P.plum, titlePlace: "bottom", titleFont: "do-hyeon", badge: "BEST" },
  { id: "pt-stripe", name: "스트라이프", occasion: "party", art: "stripe", palette: P.brick, titlePlace: "top", titleFont: "black-han-sans" },
  { id: "pt-night", name: "한밤", occasion: "party", art: "night", palette: P.charcoal, titlePlace: "bottom", titleFont: "gowun-batang" },
  { id: "pt-wave", name: "웨이브", occasion: "party", art: "wave", palette: P.teal, titlePlace: "bottom", titleFont: "jua", badge: "NEW" },

  /* ══════ 집들이 ══════ */
  { id: "hw-window", name: "창가", occasion: "housewarming", art: "window", palette: P.clay, titlePlace: "bottom", titleFont: "gowun-batang", badge: "BEST" },
  { id: "hw-sprig", name: "잎가지", occasion: "housewarming", art: "sprig", palette: P.sage, titlePlace: "bottom", titleFont: "nanum-myeongjo" },
  { id: "hw-arch", name: "아치", occasion: "housewarming", art: "arch", palette: P.ivory, titlePlace: "bottom", titleFont: "gowun-dodum" },
  { id: "hw-terrazzo", name: "테라코타", occasion: "housewarming", art: "terrazzo", palette: P.brick, titlePlace: "top", titleFont: "do-hyeon", badge: "NEW" },

  /* ══════ 돌잔치 ══════ */
  { id: "fb-balloon", name: "첫 풍선", occasion: "firstbirthday", art: "balloon", palette: P.sky, titlePlace: "bottom", titleFont: "gowun-dodum", badge: "BEST" },
  { id: "fb-arch", name: "무지개문", occasion: "firstbirthday", art: "arch", palette: P.blush, titlePlace: "bottom", titleFont: "hi-melody" },
  { id: "fb-garden", name: "들꽃", occasion: "firstbirthday", art: "garden", palette: P.sage, titlePlace: "bottom", titleFont: "nanum-myeongjo" },
  { id: "fb-dune", name: "언덕", occasion: "firstbirthday", art: "dune", palette: P.plum, titlePlace: "bottom", titleFont: "gowun-batang", badge: "NEW" },

  /* ══════ 개업 ══════ */
  { id: "op-ribbon", name: "테이프커팅", occasion: "opening", art: "ribbon", palette: P.ochre, titlePlace: "bottom", titleFont: "nanum-myeongjo", badge: "BEST" },
  { id: "op-arch", name: "새 문", occasion: "opening", art: "arch", palette: P.teal, titlePlace: "bottom", titleFont: "gowun-batang" },
  { id: "op-frame", name: "개업인사", occasion: "opening", art: "frame", palette: P.ivory, titlePlace: "bottom", titleFont: "nanum-myeongjo" },
  { id: "op-stripe", name: "차양", occasion: "opening", art: "stripe", palette: P.slate, titlePlace: "top", titleFont: "do-hyeon", badge: "NEW" },

  /* ══════ 페스티벌 ══════ */
  { id: "fs-dune", name: "노을", occasion: "festival", art: "dune", palette: P.brick, titlePlace: "bottom", titleFont: "black-han-sans", badge: "BEST" },
  { id: "fs-night", name: "강변의 밤", occasion: "festival", art: "night", palette: P.night, titlePlace: "bottom", titleFont: "do-hyeon" },
  { id: "fs-wave", name: "물결", occasion: "festival", art: "wave", palette: P.teal, titlePlace: "top", titleFont: "black-han-sans" },
  { id: "fs-terrazzo", name: "포스터", occasion: "festival", art: "terrazzo", palette: P.ochre, titlePlace: "top", titleFont: "do-hyeon", badge: "NEW" },

  /* ══════ 모임 ══════ */
  { id: "gt-frame", name: "알림글", occasion: "gathering", art: "frame", palette: P.slate, titlePlace: "bottom", titleFont: "nanum-myeongjo", badge: "BEST" },
  { id: "gt-sprig", name: "잎가지", occasion: "gathering", art: "sprig", palette: P.ochre, titlePlace: "bottom", titleFont: "gowun-batang" },
  { id: "gt-dune", name: "먼 길", occasion: "gathering", art: "dune", palette: P.sky, titlePlace: "bottom", titleFont: "gowun-batang" },
  { id: "gt-night", name: "그 시절", occasion: "gathering", art: "night", palette: P.charcoal, titlePlace: "bottom", titleFont: "nanum-myeongjo", badge: "NEW" },

  /* ══════ 기념일 ══════ */
  { id: "an-bloom", name: "한 송이", occasion: "anniversary", art: "bloom", palette: P.blush, titlePlace: "bottom", titleFont: "nanum-myeongjo", badge: "BEST" },
  { id: "an-ribbon", name: "금박 리본", occasion: "anniversary", art: "ribbon", palette: P.ochre, titlePlace: "bottom", titleFont: "gowun-batang" },
  { id: "an-frame", name: "액자", occasion: "anniversary", art: "frame", palette: P.clay, titlePlace: "bottom", titleFont: "nanum-myeongjo" },
  { id: "an-wreath", name: "올리브 화환", occasion: "anniversary", art: "wreath", palette: P.sage, titlePlace: "bottom", titleFont: "gowun-batang", badge: "NEW" },

  /* ══════ 졸업 ══════ */
  { id: "gd-wreath", name: "월계관", occasion: "graduation", art: "wreath", palette: P.slate, titlePlace: "bottom", titleFont: "nanum-myeongjo", badge: "BEST" },
  { id: "gd-arch", name: "다음 문", occasion: "graduation", art: "arch", palette: P.sky, titlePlace: "bottom", titleFont: "gowun-batang" },
  { id: "gd-night", name: "밤을 지나", occasion: "graduation", art: "night", palette: P.night, titlePlace: "bottom", titleFont: "nanum-myeongjo" },
  { id: "gd-frame", name: "학위기", occasion: "graduation", art: "frame", palette: P.ochre, titlePlace: "bottom", titleFont: "nanum-myeongjo", badge: "NEW" },

  /* ══════ 퇴임 · 송별 ══════ */
  { id: "fw-dune", name: "긴 길", occasion: "farewell", art: "dune", palette: P.ochre, titlePlace: "bottom", titleFont: "gowun-batang", badge: "BEST" },
  { id: "fw-bloom", name: "감사의 꽃", occasion: "farewell", art: "bloom", palette: P.sage, titlePlace: "bottom", titleFont: "nanum-myeongjo" },
  { id: "fw-sprig", name: "잎가지", occasion: "farewell", art: "sprig", palette: P.slate, titlePlace: "bottom", titleFont: "gowun-batang" },
  { id: "fw-window", name: "해질녘 창", occasion: "farewell", art: "window", palette: P.charcoal, titlePlace: "bottom", titleFont: "nanum-myeongjo", badge: "NEW" },
];

export function getDesign(id: string): CardDesign | undefined {
  return DESIGNS.find((d) => d.id === id);
}

export function designsFor(occasion: OccasionId): CardDesign[] {
  return DESIGNS.filter((d) => d.occasion === occasion);
}
