/* ============================================================
   행사별 기본 설정

   같은 템플릿이지만 결혼식과 기업 행사는 켜는 칸도, 부르는 말도
   다릅니다. 여기서 그 차이만 담아 둡니다 — 결혼식에는 «마음 전하실
   곳»이 있고 기업 행사에는 없으며, 돌잔치에는 «참석 회신»이 먼저
   필요합니다.

   새 행사를 더하려면 아래 배열에 한 덩어리를 붙이면 됩니다.
   ============================================================ */

import type { InviteConfig, Preset } from "@/lib/invite/types";

/* 견본에 쓰는 사진. public/samples 는 Pexels 라이선스(상업적 이용·
   수정 가능), public/invite 는 메트로폴리탄 미술관 오픈액세스(CC0)라
   둘 다 그대로 배포할 수 있습니다. */
const photo = (n: number) => `/samples/couple-${String(n).padStart(2, "0")}.jpg`;
const art = (name: string) => `/invite/${name}.webp`;

/** 모든 프리셋이 공유하는 뼈대 — 여기서 덮어쓸 것만 덮어씁니다 */
const base: InviteConfig = {
  theme: "ivory",
  shareTitle: "",
  shareDescription: "",
  cover: { eyebrow: "INVITATION", title: "", subtitle: "", dim: 28 },
  event: {
    date: "2026-10-17",
    time: "13:00",
    place: "",
    address: "",
    transports: [],
  },
  greeting: { title: "", body: "" },
  gallery: [],
  contacts: [],
  rsvp: { title: "참석 여부를 알려 주세요", body: "", to: "" },
  accounts: [],
  notices: [],
  sections: ["greeting", "detail", "countdown", "gallery", "location", "contact"],
};

export const PRESETS: Preset[] = [
  /* ── 결혼식 ── */
  {
    id: "wedding",
    label: "결혼식",
    note: "청첩장 — 혼주와 계좌, 참석 회신까지",
    config: {
      ...base,
      theme: "blush",
      shareTitle: "김도윤 · 이서연 결혼합니다",
      shareDescription: "2026년 10월 17일 토요일 오후 1시 · 그랜드하얏트 서울",
      cover: {
        eyebrow: "WE ARE GETTING MARRIED",
        title: "김도윤\n이서연",
        subtitle: "2026. 10. 17 SAT 1PM",
        image: photo(3),
        dim: 34,
      },
      event: {
        date: "2026-10-17",
        time: "13:00",
        place: "그랜드하얏트 서울",
        hall: "그랜드볼룸 3층",
        address: "서울 용산구 소월로 322",
        transports: [
          { kind: "지하철", body: "6호선 녹사평역 2번 출구에서 셔틀버스가 20분 간격으로 운행합니다." },
          { kind: "주차", body: "호텔 주차장 3시간 무료입니다. 안내데스크에서 확인받으세요." },
        ],
      },
      greeting: {
        lead: "서로를 향해 걸어온 길이\n이제 한 방향이 되었습니다",
        title: "초대합니다",
        body:
          "오래 곁을 지켜 준 두 사람이\n이제 한 가정을 이루려 합니다.\n\n귀한 걸음으로 오셔서\n저희의 첫날을 함께해 주시면\n큰 기쁨이 되겠습니다.",
        sign: "김도윤 · 이서연 올림",
      },
      gallery: [photo(1), photo(2), photo(4), photo(5), photo(6), photo(7)],
      contacts: [
        { role: "신랑", name: "김도윤", phone: "010-1234-5678" },
        { role: "신부", name: "이서연", phone: "010-2345-6789" },
        { role: "신랑 아버지", name: "김성호", phone: "010-3456-7890" },
        { role: "신부 어머니", name: "박정은", phone: "010-4567-8901" },
      ],
      rsvp: {
        title: "참석 여부를 알려 주세요",
        body: "식사 준비를 위해 참석 여부를 미리 알려 주시면 감사하겠습니다.",
        to: "010-1234-5678",
        deadline: "2026년 10월 5일까지",
      },
      accounts: [
        { group: "신랑측", bank: "국민은행", number: "123456-01-234567", holder: "김도윤" },
        { group: "신랑측", bank: "신한은행", number: "110-234-567890", holder: "김성호" },
        { group: "신부측", bank: "하나은행", number: "234-567890-12345", holder: "이서연" },
      ],
      notices: [
        { title: "화환", body: "마음만 감사히 받겠습니다. 화환은 정중히 사양합니다." },
        { title: "포토부스", body: "1층 로비에 포토부스가 있습니다. 오셔서 한 장 남겨 주세요." },
      ],
      sections: ["greeting", "detail", "countdown", "gallery", "location", "contact", "rsvp", "account", "notice"],
      closing: "저희의 시작을 함께해 주셔서 고맙습니다.",
    },
  },

  /* ── 돌잔치 ── */
  {
    id: "firstbirthday",
    label: "돌잔치",
    note: "아이의 첫 생일 — 참석 회신을 앞에 둡니다",
    config: {
      ...base,
      theme: "sage",
      shareTitle: "하준이의 첫 생일에 초대합니다",
      shareDescription: "2026년 10월 17일 토요일 낮 12시 · 연남동 소풍",
      cover: {
        eyebrow: "FIRST BIRTHDAY",
        title: "하준이의\n첫 생일",
        subtitle: "2026. 10. 17 SAT 12PM",
        image: art("fw-zeshin"),
        dim: 18,
      },
      event: {
        date: "2026-10-17",
        time: "12:00",
        place: "연남동 소풍",
        hall: "2층 연회장",
        address: "서울 마포구 성미산로 32길 8",
        transports: [
          { kind: "지하철", body: "2호선 홍대입구역 3번 출구에서 도보 8분입니다." },
          { kind: "주차", body: "건물 지하 주차장을 2시간 무료로 쓰실 수 있습니다." },
        ],
      },
      greeting: {
        lead: "작은 아이가\n첫 일 년을 지났습니다",
        title: "함께 나누고 싶습니다",
        body:
          "아이가 태어난 지 일 년이 되었습니다.\n그동안 마음 써 주신 분들과\n첫 생일을 나누고 싶습니다.\n\n편한 걸음으로 오셔서\n밥 한 끼 함께해 주세요.",
        sign: "김도윤 · 이서연 드림",
      },
      gallery: [art("hw-zeshin2"), art("gd-finches"), art("fw-terutada")],
      contacts: [
        { role: "아버지", name: "김도윤", phone: "010-1234-5678" },
        { role: "어머니", name: "이서연", phone: "010-2345-6789" },
      ],
      rsvp: {
        title: "참석 여부를 알려 주세요",
        body: "아이 자리와 식사를 준비해야 해서, 오실 분은 미리 알려 주시면 좋겠습니다.",
        to: "010-2345-6789",
        deadline: "10월 5일까지",
      },
      accounts: [
        { group: "돌 축하금", bank: "국민은행", number: "123456-01-234567", holder: "이서연" },
      ],
      notices: [
        { title: "돌잡이", body: "낮 12시 30분에 시작합니다. 조금 일찍 와 주시면 좋겠습니다." },
        { title: "아이 동반", body: "아이와 함께 오셔도 좋습니다. 놀이 공간이 마련되어 있습니다." },
      ],
      sections: ["greeting", "detail", "rsvp", "countdown", "gallery", "location", "contact", "account", "notice"],
      closing: "귀한 걸음 고맙습니다.",
    },
  },

  /* ── 생일 ── */
  {
    id: "birthday",
    label: "생일",
    note: "가볍게 부르는 자리 — 계좌 칸 없이",
    config: {
      ...base,
      theme: "sky",
      shareTitle: "서연이의 생일에 초대합니다",
      shareDescription: "2026년 10월 17일 토요일 저녁 7시 · 연남동 라운지",
      cover: {
        eyebrow: "BIRTHDAY PARTY",
        title: "서연이의\n생일",
        subtitle: "2026. 10. 17 SAT 7PM",
        image: art("an-iris"),
        dim: 22,
      },
      event: {
        date: "2026-10-17",
        time: "19:00",
        place: "연남동 라운지",
        hall: "2층",
        address: "서울 마포구 연남로 21",
        transports: [
          { kind: "지하철", body: "경의중앙선 가좌역 1번 출구에서 도보 6분입니다." },
          { kind: "주차", body: "주차 공간이 좁아 대중교통을 권합니다." },
        ],
      },
      greeting: {
        lead: "한 살 더 먹었습니다",
        title: "같이 웃어 주세요",
        body:
          "케이크 앞에서 같이 웃어 줄 사람이\n당신이면 좋겠습니다.\n\n음식과 음악은 준비해 두었으니\n편한 차림으로 몸만 오세요.",
        sign: "김서연",
      },
      gallery: [art("an-roses"), art("an-vase"), art("an-basket")],
      contacts: [{ role: "문의", name: "김서연", phone: "010-1234-5678" }],
      rsvp: {
        title: "올 수 있는지 알려 주세요",
        body: "자리를 잡아야 해서, 오실 수 있으면 한마디만 남겨 주세요.",
        to: "010-1234-5678",
      },
      accounts: [],
      notices: [{ title: "선물", body: "선물은 정중히 사양합니다. 얼굴만 보여 주세요." }],
      sections: ["greeting", "detail", "countdown", "gallery", "location", "contact", "rsvp", "notice"],
      closing: "그날 봬요.",
    },
  },

  /* ── 기업 행사 ── */
  {
    id: "corporate",
    label: "기업 행사",
    note: "세미나·창립기념·오픈식 — 격식 있는 조판",
    config: {
      ...base,
      theme: "ink",
      shareTitle: "2026 파트너 데이에 초대합니다",
      shareDescription: "2026년 10월 17일 토요일 오후 2시 · 코엑스 그랜드볼룸",
      cover: {
        eyebrow: "PARTNER DAY 2026",
        title: "2026\n파트너 데이",
        subtitle: "2026. 10. 17 SAT 2PM",
        image: art("gt-silver"),
        dim: 42,
      },
      event: {
        date: "2026-10-17",
        time: "14:00",
        place: "코엑스",
        hall: "그랜드볼룸 3층",
        address: "서울 강남구 영동대로 513",
        transports: [
          { kind: "지하철", body: "2호선 삼성역 5번 출구와 바로 연결됩니다." },
          { kind: "주차", body: "코엑스 주차장 4시간 무료입니다. 등록데스크에서 확인받으세요." },
        ],
      },
      greeting: {
        lead: "한 해를 함께 지나 주신 분들께",
        title: "모시고자 합니다",
        body:
          "지난 한 해 동안 함께 일해 주신 파트너 여러분을 모십니다.\n\n올해의 성과와 다음 해의 계획을 나누고,\n저녁 식사를 함께하는 자리로 준비했습니다.\n부디 자리를 빛내 주시기 바랍니다.",
        sign: "주식회사 카들리 드림",
      },
      gallery: [art("gt-brioche"), art("gt-teapot")],
      contacts: [
        { role: "행사 문의", name: "경영지원팀", phone: "02-1234-5678" },
        { role: "등록 문의", name: "김도윤 매니저", phone: "010-1234-5678" },
      ],
      rsvp: {
        title: "참석 등록",
        body: "좌석과 식사 준비를 위해 10월 5일까지 참석 여부를 알려 주시기 바랍니다.",
        to: "partner@cardly.kr",
        deadline: "10월 5일 마감",
      },
      accounts: [],
      notices: [
        { title: "복장", body: "비즈니스 캐주얼로 편하게 오시면 됩니다." },
        { title: "진행", body: "오후 2시 등록, 2시 30분 본행사, 6시 만찬 순으로 진행됩니다." },
      ],
      sections: ["greeting", "detail", "rsvp", "location", "contact", "notice"],
      closing: "함께해 주셔서 고맙습니다.",
    },
  },

  /* ── 개업 · 오픈 ── */
  {
    id: "opening",
    label: "개업 · 오픈",
    note: "가게 문을 여는 날",
    config: {
      ...base,
      theme: "mocha",
      shareTitle: "작은 가게를 엽니다",
      shareDescription: "2026년 10월 17일 토요일 오전 11시 · 연희동",
      cover: {
        eyebrow: "GRAND OPENING",
        title: "작은 가게를\n엽니다",
        subtitle: "2026. 10. 17 SAT 11AM",
        image: art("op-fruit"),
        dim: 26,
      },
      event: {
        date: "2026-10-17",
        time: "11:00",
        place: "연희동 1층",
        address: "서울 서대문구 연희로 11길 20",
        transports: [
          { kind: "버스", body: "연희동 삼거리 정류장에서 도보 3분입니다." },
          { kind: "주차", body: "건물 앞에 두 대까지 세우실 수 있습니다." },
        ],
      },
      greeting: {
        lead: "오래 준비했습니다",
        title: "들러 주세요",
        body:
          "오래 준비한 가게를 드디어 엽니다.\n\n지나는 길에 들러\n커피 한잔 하고 가세요.\n오픈 주간에는 음료를 대접합니다.",
        sign: "김도윤 드림",
      },
      gallery: [art("op-seasons"), art("op-renoir")],
      contacts: [{ role: "문의", name: "김도윤", phone: "010-1234-5678" }],
      rsvp: { title: "", body: "", to: "" },
      accounts: [],
      notices: [{ title: "오픈 주간", body: "10월 17일부터 23일까지 모든 음료를 대접합니다." }],
      sections: ["greeting", "detail", "gallery", "location", "contact", "notice"],
      closing: "오셔서 축하해 주세요.",
    },
  },

  /* ── 모임 · 동창회 ── */
  {
    id: "gathering",
    label: "모임 · 동창회",
    note: "오랜만에 얼굴 보는 자리",
    config: {
      ...base,
      theme: "ivory",
      shareTitle: "열두 번째 정기 모임",
      shareDescription: "2026년 10월 17일 토요일 저녁 6시 · 종로 한정식",
      cover: {
        eyebrow: "GET TOGETHER",
        title: "열두 번째\n정기 모임",
        subtitle: "2026. 10. 17 SAT 6PM",
        image: art("gt-degas"),
        dim: 30,
      },
      event: {
        date: "2026-10-17",
        time: "18:00",
        place: "종로 한정식",
        hall: "2층 별실",
        address: "서울 종로구 인사동길 30",
        transports: [
          { kind: "지하철", body: "3호선 안국역 6번 출구에서 도보 5분입니다." },
          { kind: "주차", body: "인사동 공영주차장을 이용해 주세요." },
        ],
      },
      greeting: {
        lead: "오랜만입니다",
        title: "얼굴 한번 보시죠",
        body:
          "한 해가 또 지났습니다.\n식사와 자리는 미리 잡아 두었으니\n몸만 오시면 됩니다.\n\n오실 분은 참석 여부만 알려 주세요.",
        sign: "모임지기 김도윤",
      },
      gallery: [art("gt-silver"), art("gt-brioche")],
      contacts: [{ role: "모임지기", name: "김도윤", phone: "010-1234-5678" }],
      rsvp: {
        title: "참석 여부를 알려 주세요",
        body: "인원을 확인해야 자리를 잡을 수 있습니다.",
        to: "010-1234-5678",
        deadline: "10월 8일까지",
      },
      accounts: [{ group: "회비", bank: "국민은행", number: "123456-01-234567", holder: "김도윤" }],
      notices: [{ title: "회비", body: "1인 5만 원입니다. 당일 현장 납부도 됩니다." }],
      sections: ["greeting", "detail", "rsvp", "location", "contact", "account", "notice"],
      closing: "그날 뵙겠습니다.",
    },
  },
];

export const DEFAULT_PRESET = PRESETS[0]!;

export function getPreset(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}
