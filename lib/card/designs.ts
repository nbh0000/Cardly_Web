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

   그림 카드에서는 그림 둘레의 종이와 글자 색으로만 쓰이므로 조용해야
   하고, 활자 카드에서는 조판 전체의 색이 되므로 힘이 있어야 합니다.
   그래서 앞의 여섯은 종이에 가깝고 뒤의 여섯은 잉크에 가깝습니다.
   ------------------------------------------------------------ */

const P = {
  /* ── 그림을 받치는 조용한 종이 ── */
  rag: { paper: "#FAF6EE", ink: "#2A2520", accent: "#8C7A5E", soft: "#EAE1D2", deep: "#4E4335", tint: "#F2EADC" },
  bone: { paper: "#F6F4EF", ink: "#26282A", accent: "#6E7378", soft: "#E3E2DB", deep: "#3A3E42", tint: "#EDEBE4" },
  linen: { paper: "#F7F2E9", ink: "#2C2A22", accent: "#9A7B45", soft: "#E9E0CC", deep: "#5A4522", tint: "#F0E8D8" },
  ash: { paper: "#F2F2F0", ink: "#232527", accent: "#5F6A72", soft: "#DFE0DE", deep: "#333A40", tint: "#EAEAE7" },
  shell: { paper: "#FAF3F1", ink: "#2E2622", accent: "#A5766A", soft: "#EEDFD9", deep: "#63403A", tint: "#F4E9E4" },
  moss: { paper: "#F3F4EE", ink: "#242A22", accent: "#6C7A56", soft: "#E1E5D6", deep: "#3D4832", tint: "#EBEDE2" },

  /* ── 활자를 세우는 진한 색 ── */
  ink: { paper: "#1C1E24", ink: "#F2F0EA", accent: "#C9A961", soft: "#2A2D35", deep: "#111318", tint: "#23262D" },
  wine: { paper: "#3A1B22", ink: "#F6EAE6", accent: "#E0A88C", soft: "#4A252D", deep: "#251015", tint: "#421F27" },
  pine: { paper: "#17302A", ink: "#EFF2EC", accent: "#C2CE9E", soft: "#204039", deep: "#0E211C", tint: "#1B3630" },
  clay: { paper: "#B5563A", ink: "#FCF2E9", accent: "#F5D9B8", soft: "#A24A31", deep: "#7C3320", tint: "#AC5036" },
  sky: { paper: "#20486B", ink: "#EEF4F9", accent: "#9FC6E0", soft: "#2A587F", deep: "#12314A", tint: "#25506F" },
  cream: { paper: "#F7ECD2", ink: "#2A2115", accent: "#B4562C", soft: "#EBDBB6", deep: "#6E3312", tint: "#F1E4C6" },
} as const;

/* ------------------------------------------------------------
   카드 마흔 장

   격식 있는 자리(기념일·졸업·퇴임·개업·집들이·모임)에는 그림을
   앉히고, 밝은 자리(생일·파티·돌잔치·페스티벌)에는 활자를 세웁니다.
   그림은 전부 메트로폴리탄 미술관 오픈액세스(CC0)입니다.
   ------------------------------------------------------------ */

const plate = (
  file: string,
  title: string,
  artist: string,
  date: string,
): { file: string; title: string; artist: string; date: string } => ({
  file,
  title,
  artist,
  date,
});

export const DESIGNS: CardDesign[] = [
  /* ══════ 기념일 — 꽃 정물 ══════ */
  { id: "an-iris", name: "붓꽃", occasion: "anniversary", front: "plate", plateFit: "bleed", palette: P.rag, titleFont: "nanum-myeongjo", badge: "BEST",
    plate: plate("an-iris", "Irises", "빈센트 반 고흐", "1890") },
  { id: "an-roses", name: "장미", occasion: "anniversary", front: "plate", plateFit: "inset", palette: P.shell, titleFont: "gowun-batang",
    plate: plate("an-roses", "Roses in a Bowl", "앙리 팡탱라투르", "1883") },
  { id: "an-basket", name: "꽃바구니", occasion: "anniversary", front: "plate", plateFit: "bleed", palette: P.linen, titleFont: "nanum-myeongjo",
    plate: plate("an-basket", "Basket of Flowers", "외젠 들라크루아", "1848–49") },
  { id: "an-vase", name: "화병", occasion: "anniversary", front: "plate", plateFit: "inset", palette: P.rag, titleFont: "gowun-batang", badge: "NEW",
    plate: plate("an-vase", "A Vase of Flowers", "마르하레타 하버만", "1716") },

  /* ══════ 졸업 · 수료 ══════ */
  { id: "gd-finches", name: "대나무와 새", occasion: "graduation", front: "plate", plateFit: "bleed", palette: P.bone, titleFont: "nanum-myeongjo", badge: "BEST",
    plate: plate("gd-finches", "Finches and Bamboo", "휘종 황제", "12세기 초") },
  { id: "gd-vosmaer", name: "고요한 화병", occasion: "graduation", front: "plate", plateFit: "inset", palette: P.ash, titleFont: "gowun-batang",
    plate: plate("gd-vosmaer", "A Vase with Flowers", "야코프 포스마어", "1613년경") },
  { id: "gd-fantin", name: "꽃과 과일", occasion: "graduation", front: "plate", plateFit: "bleed", palette: P.linen, titleFont: "nanum-myeongjo",
    plate: plate("gd-fantin", "Still Life with Flowers and Fruit", "앙리 팡탱라투르", "1866") },
  { id: "gd-caccia", name: "그로테스크 화병", occasion: "graduation", front: "plate", plateFit: "inset", palette: P.rag, titleFont: "gowun-batang", badge: "NEW",
    plate: plate("gd-caccia", "Flowers in a Grotesque Vase", "오르솔라 마달레나 카차", "1635년경") },

  /* ══════ 퇴임 · 송별 ══════ */
  { id: "fw-zeshin", name: "새", occasion: "farewell", front: "plate", plateFit: "inset", palette: P.bone, titleFont: "nanum-myeongjo", badge: "BEST",
    plate: plate("fw-zeshin", "Birds", "시바타 젠신", "19세기 후반") },
  { id: "fw-oleander", name: "협죽도", occasion: "farewell", front: "plate", plateFit: "bleed", palette: P.moss, titleFont: "gowun-batang",
    plate: plate("fw-oleander", "Oleanders", "빈센트 반 고흐", "1888") },
  { id: "fw-terutada", name: "여름과 가을", occasion: "farewell", front: "plate", plateFit: "bleed", palette: P.ash, titleFont: "nanum-myeongjo",
    plate: plate("fw-terutada", "Birds and Flowers of Summer and Autumn", "시키부 데루타다", "16세기 중반") },
  { id: "fw-pansy", name: "팬지", occasion: "farewell", front: "plate", plateFit: "inset", palette: P.shell, titleFont: "gowun-batang", badge: "NEW",
    plate: plate("fw-pansy", "Still Life with Pansies", "앙리 팡탱라투르", "1874") },

  /* ══════ 개업 · 오픈 ══════ */
  { id: "op-fruit", name: "과일과 꽃", occasion: "opening", front: "plate", plateFit: "bleed", palette: P.linen, titleFont: "nanum-myeongjo", badge: "BEST",
    plate: plate("op-fruit", "Fruit and Flowers", "오르솔라 마달레나 카차", "1630년경") },
  { id: "op-seasons", name: "사계의 꽃과 새", occasion: "opening", front: "plate", plateFit: "bleed", palette: P.rag, titleFont: "gowun-batang",
    plate: plate("op-seasons", "Birds and Flowers of the Four Seasons", "일본", "16세기 후반") },
  { id: "op-melon", name: "성찬", occasion: "opening", front: "plate", plateFit: "inset", palette: P.linen, titleFont: "nanum-myeongjo",
    plate: plate("op-melon", "Still Life with a Vase of Flowers", "샤를로트 드 그롤리에", "1780") },
  { id: "op-renoir", name: "선인장꽃", occasion: "opening", front: "plate", plateFit: "inset", palette: P.shell, titleFont: "gowun-batang", badge: "NEW",
    plate: plate("op-renoir", "Still Life with Flowers and Prickly Pears", "오귀스트 르누아르", "1885년경") },

  /* ══════ 집들이 ══════ */
  { id: "hw-primrose", name: "앵초 화분", occasion: "housewarming", front: "plate", plateFit: "bleed", palette: P.rag, titleFont: "gowun-batang", badge: "BEST",
    plate: plate("hw-primrose", "Still Life with Apples and a Pot of Primroses", "폴 세잔", "1890년경") },
  { id: "hw-pissarro", name: "사과와 물병", occasion: "housewarming", front: "plate", plateFit: "inset", palette: P.linen, titleFont: "nanum-myeongjo",
    plate: plate("hw-pissarro", "Still Life with Apples and Pitcher", "카미유 피사로", "1872") },
  { id: "hw-zeshin2", name: "새 두 마리", occasion: "housewarming", front: "plate", plateFit: "inset", palette: P.moss, titleFont: "gowun-batang",
    plate: plate("hw-zeshin2", "Birds", "시바타 젠신", "19세기 후반") },
  { id: "hw-cezanne", name: "사과와 배", occasion: "housewarming", front: "plate", plateFit: "bleed", palette: P.bone, titleFont: "nanum-myeongjo", badge: "NEW",
    plate: plate("hw-cezanne", "Still Life with Apples and Pears", "폴 세잔", "1891–92년경") },

  /* ══════ 모임 · 동창회 ══════ */
  { id: "gt-brioche", name: "브리오슈", occasion: "gathering", front: "plate", plateFit: "bleed", palette: P.linen, titleFont: "nanum-myeongjo", badge: "BEST",
    plate: plate("gt-brioche", "The Brioche", "에두아르 마네", "1870") },
  { id: "gt-teapot", name: "찻주전자", occasion: "gathering", front: "plate", plateFit: "bleed", palette: P.moss, titleFont: "gowun-batang",
    plate: plate("gt-teapot", "Still Life with Teapot and Fruit", "폴 고갱", "1896") },
  { id: "gt-silver", name: "은그릇", occasion: "gathering", front: "plate", plateFit: "inset", palette: P.ash, titleFont: "nanum-myeongjo",
    plate: plate("gt-silver", "Still Life with Silver", "알렉상드르 데포르트", "1720년대") },
  { id: "gt-degas", name: "꽃 곁에서", occasion: "gathering", front: "plate", plateFit: "bleed", palette: P.rag, titleFont: "gowun-batang", badge: "NEW",
    plate: plate("gt-degas", "A Woman Seated beside a Vase of Flowers", "에드가르 드가", "1865") },

  /* ══════ 생일 — 활자 ══════ */
  { id: "bd-bigdate", name: "빅데이트", occasion: "birthday", front: "type", layout: "bigdate", palette: P.cream, titleFont: "gowun-batang", badge: "BEST" },
  { id: "bd-stack", name: "스택", occasion: "birthday", front: "type", layout: "stack", palette: P.wine, titleFont: "black-han-sans" },
  { id: "bd-seal", name: "도장", occasion: "birthday", front: "type", layout: "seal", palette: P.ink, titleFont: "nanum-myeongjo" },
  { id: "bd-corner", name: "코너", occasion: "birthday", front: "type", layout: "corner", palette: P.clay, titleFont: "gowun-dodum", badge: "NEW" },

  /* ══════ 파티 — 활자 ══════ */
  { id: "pt-stack", name: "스택", occasion: "party", front: "type", layout: "stack", palette: P.ink, titleFont: "black-han-sans", badge: "BEST" },
  { id: "pt-rule", name: "괘선", occasion: "party", front: "type", layout: "rule", palette: P.wine, titleFont: "do-hyeon" },
  { id: "pt-bigdate", name: "빅데이트", occasion: "party", front: "type", layout: "bigdate", palette: P.pine, titleFont: "gowun-batang" },
  { id: "pt-corner", name: "코너", occasion: "party", front: "type", layout: "corner", palette: P.clay, titleFont: "do-hyeon", badge: "NEW" },

  /* ══════ 돌잔치 — 활자 ══════ */
  { id: "fb-seal", name: "도장", occasion: "firstbirthday", front: "type", layout: "seal", palette: P.cream, titleFont: "gowun-batang", badge: "BEST" },
  { id: "fb-bigdate", name: "빅데이트", occasion: "firstbirthday", front: "type", layout: "bigdate", palette: P.sky, titleFont: "gowun-dodum" },
  { id: "fb-corner", name: "코너", occasion: "firstbirthday", front: "type", layout: "corner", palette: P.shell, titleFont: "hi-melody" },
  { id: "fb-rule", name: "괘선", occasion: "firstbirthday", front: "type", layout: "rule", palette: P.moss, titleFont: "gowun-batang", badge: "NEW" },

  /* ══════ 페스티벌 — 활자 ══════ */
  { id: "fs-rule", name: "괘선", occasion: "festival", front: "type", layout: "rule", palette: P.ink, titleFont: "black-han-sans", badge: "BEST" },
  { id: "fs-stack", name: "라인업", occasion: "festival", front: "type", layout: "stack", palette: P.clay, titleFont: "black-han-sans" },
  { id: "fs-bigdate", name: "빅데이트", occasion: "festival", front: "type", layout: "bigdate", palette: P.pine, titleFont: "do-hyeon" },
  { id: "fs-seal", name: "도장", occasion: "festival", front: "type", layout: "seal", palette: P.wine, titleFont: "do-hyeon", badge: "NEW" },
];

export function getDesign(id: string): CardDesign | undefined {
  return DESIGNS.find((d) => d.id === id);
}

export function designsFor(occasion: OccasionId): CardDesign[] {
  return DESIGNS.filter((d) => d.occasion === occasion);
}
