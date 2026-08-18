/* 행사 갈래와, 갈래마다의 예시 내용.

   목록 페이지의 분류이면서, 템플릿을 열었을 때 미리 채워져 있는 글이기도
   합니다. 예시 글은 «채워 넣으세요» 같은 안내문이 아니라 실제로 보낼 만한
   문장으로 씁니다. 안내문을 넣어 두면 그대로 보내는 사람이 반드시 나오고,
   무엇보다 미리보기가 초대장처럼 보이지 않습니다.                     */

import type { InviteData, Occasion, OccasionId } from "@/lib/occasion/types";

export const OCCASIONS: Occasion[] = [
  {
    id: "birthday",
    label: "생일",
    en: "Birthday",
    blurb:
      "생일은 부르는 사람이 주인공이 아니라 오는 사람이 주인공입니다. 언제 어디로 가면 되는지가 한눈에 보이는 카드를 골랐습니다.",
  },
  {
    id: "firstbirthday",
    label: "돌잔치",
    en: "First Birthday",
    blurb:
      "아이 사진을 올리기 전에도 카드로 성립하도록, 여백이 넓고 이름이 크게 앉는 그림을 모았습니다.",
  },
  {
    id: "housewarming",
    label: "집들이",
    en: "Housewarming",
    blurb:
      "집으로 사람을 부르는 일이라 주소와 오는 길이 제일 중요합니다. 지도로 바로 넘어가는 버튼이 붙어 있습니다.",
  },
  {
    id: "opening",
    label: "개업 · 오픈",
    en: "Opening",
    blurb:
      "가게와 사무실을 여는 날. 기세 있는 그림으로 고르고, 상호와 날짜가 표지에서 바로 읽히게 짰습니다.",
  },
  {
    id: "party",
    label: "파티 · 모임",
    en: "Party",
    blurb:
      "송년회, 집들이 겸 파티, 동아리 모임. 격식보다 분위기가 먼저 오는 그림들입니다.",
  },
  {
    id: "anniversary",
    label: "기념일 · 감사",
    en: "Anniversary",
    blurb:
      "결혼기념일, 회갑, 은퇴, 감사의 자리. 오래 두고 볼 카드라 고전 회화 쪽으로 골랐습니다.",
  },
];

const BY_ID = new Map(OCCASIONS.map((o) => [o.id, o]));

export function getOccasion(id: string | undefined): Occasion {
  return (id && BY_ID.get(id as OccasionId)) || OCCASIONS[0]!;
}

/* 예시로 쓰는 날짜. 지나간 날짜가 미리보기에 뜨면 «남은 날짜»가
   음수가 되므로 넉넉히 앞을 봅니다. */
const D = "2026-11-14";

type Sample = Omit<InviteData, "d">;

const SAMPLES: Record<OccasionId, Sample> = {
  birthday: {
    eyebrow: "Birthday",
    title: "서른,\n같이 먹어요",
    host: "박지우",
    message:
      "한 해 동안 얼굴 한 번 못 본 사람이 너무 많습니다.\n생일을 핑계 삼아 저녁 한 끼 하려고 합니다.\n\n선물은 정말 됐고, 몸만 오세요.",
    date: D,
    time: "18:30",
    place: "연남동 술집 목요일",
    address: "서울 마포구 성미산로 161-4",
    note: "가게가 크지 않아 인원 파악이 꼭 필요합니다.",
    phone: "010-1234-5678",
    rsvp: true,
  },
  firstbirthday: {
    eyebrow: "First Birthday",
    title: "이하윤\n첫 생일",
    host: "이준호 · 김서영",
    message:
      "작년 이맘때 태어난 아이가\n벌써 걷고 웃습니다.\n\n귀한 걸음 해 주시어\n하윤이의 첫 생일을 함께 축하해 주세요.",
    date: D,
    time: "12:00",
    place: "더채플앳청담",
    address: "서울 강남구 선릉로 727",
    note: "건물 주차장 2시간 무료입니다.",
    phone: "010-2345-6789",
    rsvp: true,
  },
  housewarming: {
    eyebrow: "Housewarming",
    title: "이사했습니다\n놀러 오세요",
    host: "정민석 · 한소윤",
    message:
      "삼 년 만에 짐을 옮겼습니다.\n아직 상자가 반쯤 남았지만\n밥은 차릴 수 있게 되었습니다.\n\n편한 시간에 들르세요.",
    date: D,
    time: "17:00",
    place: "망원동 집",
    address: "서울 마포구 월드컵로19길 12, 301호",
    note: "주차 자리가 없어 대중교통을 권합니다.",
    phone: "010-3456-7890",
    rsvp: false,
  },
  opening: {
    eyebrow: "Grand Opening",
    title: "제철상회\n문을 엽니다",
    host: "제철상회",
    message:
      "이 년을 준비한 가게가 드디어 문을 엽니다.\n\n첫날은 오시는 분께 커피를 냅니다.\n가까이 계시면 잠깐이라도 들러 주세요.",
    date: D,
    time: "11:00",
    place: "제철상회",
    address: "서울 종로구 자하문로 41",
    note: "화환은 정중히 사양합니다.",
    phone: "02-333-4455",
    rsvp: false,
  },
  party: {
    eyebrow: "You are invited",
    title: "올해의\n마지막 밤",
    host: "목요모임",
    message:
      "한 해를 같이 보낸 사람들과\n마지막 밤을 보내려 합니다.\n\n음식은 준비되어 있고,\n마실 것만 한 병씩 들고 오세요.",
    date: D,
    time: "19:00",
    place: "성수동 스튜디오 로우",
    address: "서울 성동구 연무장길 45, 2층",
    note: "드레스코드는 검정입니다.",
    phone: "010-4567-8901",
    rsvp: true,
  },
  anniversary: {
    eyebrow: "Anniversary",
    title: "결혼 삼십 년\n감사의 자리",
    host: "최영수 · 윤미경",
    message:
      "함께 산 지 삼십 년이 되었습니다.\n\n그동안 곁을 지켜 주신 분들께\n밥 한 끼 대접하고 싶습니다.\n부담 없이 오셔서 앉았다 가세요.",
    date: D,
    time: "12:30",
    place: "한식당 소반",
    address: "서울 중구 퇴계로 100, 5층",
    note: "선물은 사양합니다. 오시는 것으로 충분합니다.",
    phone: "010-5678-9012",
    rsvp: true,
  },
};

/** 디자인을 열었을 때 미리 채워져 있는 내용 */
export function sampleFor(designId: string, occasion: OccasionId): InviteData {
  return { d: designId, ...SAMPLES[occasion] };
}
