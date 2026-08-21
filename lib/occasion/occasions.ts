/* 행사 갈래와, 갈래마다의 예시 내용.

   목록 페이지의 분류이면서, 템플릿을 열었을 때 미리 채워져 있는 글이기도
   합니다. 예시 글은 «채워 넣으세요» 같은 안내문이 아니라 실제로 보낼 만한
   문장으로 씁니다. 안내문을 넣어 두면 그대로 보내는 사람이 반드시 나오고,
   무엇보다 미리보기가 초대장처럼 보이지 않습니다.                     */

import type { InviteData, Occasion, OccasionId } from "@/lib/occasion/types";

export const OCCASIONS: Occasion[] = [
  {
    id: "wedding",
    label: "결혼 · 약혼",
    en: "Wedding",
    blurb:
      "예식 자체를 알리는 모바일 청첩장과 달리, 상견례·약혼·브라이덜 샤워처럼 가까운 사람만 부르는 자리에 맞춘 카드입니다.",
  },
  {
    id: "baby",
    label: "돌 · 백일",
    en: "Baby",
    blurb:
      "아이 사진을 올리기 전에도 카드로 성립하도록, 그림이 자리를 채우고 이름이 크게 앉는 판으로 골랐습니다.",
  },
  {
    id: "birthday",
    label: "생일",
    en: "Birthday",
    blurb:
      "부르는 사람이 아니라 오는 사람이 주인공입니다. 언제 어디로 가면 되는지가 한눈에 보이는 카드를 모았습니다.",
  },
  {
    id: "anniversary",
    label: "기념일 · 감사",
    en: "Anniversary",
    blurb:
      "결혼기념일, 회갑, 은퇴, 감사의 자리. 오래 두고 볼 카드라 그림도 오래 가는 쪽으로 골랐습니다.",
  },
  {
    id: "housewarming",
    label: "집들이 · 개업",
    en: "Housewarming",
    blurb:
      "집과 가게로 사람을 부르는 일이라 주소와 오는 길이 제일 중요합니다. 지도로 바로 넘어가는 버튼이 붙어 있습니다.",
  },
  {
    id: "party",
    label: "파티 · 모임",
    en: "Party",
    blurb:
      "정원 파티, 피크닉, 동아리 모임. 격식보다 분위기가 먼저 오는 그림들입니다.",
  },
  {
    id: "season",
    label: "연말 · 새해",
    en: "Season",
    blurb:
      "송년회와 새해 인사. 한 해에 한 번 쓰는 카드라 그해에만 어울리는 그림으로 짰습니다.",
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
  wedding: {
    eyebrow: "Save the date",
    title: "저희 두 사람\n결혼합니다",
    host: "김도윤 · 이서연",
    message:
      "오래 만난 사람과 이제 한집에 살기로 했습니다.\n\n먼 걸음이지만 오셔서\n저희 시작을 보아 주시면\n그보다 큰 축하가 없겠습니다.",
    date: D,
    time: "13:00",
    place: "그랜드하얏트 서울 그랜드볼룸",
    address: "서울 용산구 소월로 322",
    note: "예식 30분 전부터 입장하실 수 있습니다.",
    phone: "010-1234-5678",
    rsvp: true,
  },
  baby: {
    eyebrow: "First Birthday",
    title: "이하윤\n첫 생일",
    host: "이준호 · 김서영",
    message:
      "작년 이맘때 태어난 아이가\n벌써 걷고 웃습니다.\n\n귀한 걸음 해 주시어\n하윤이의 첫 생일을 함께\n축하해 주세요.",
    date: D,
    time: "12:00",
    place: "더채플앳청담",
    address: "서울 강남구 선릉로 727",
    note: "건물 주차장 2시간 무료입니다.",
    phone: "010-2345-6789",
    rsvp: true,
  },
  birthday: {
    eyebrow: "Birthday",
    title: "서른,\n같이 먹어요",
    host: "박지우",
    message:
      "한 해 동안 얼굴 한 번 못 본 사람이\n너무 많습니다.\n\n생일을 핑계 삼아\n저녁 한 끼 하려고 합니다.\n선물은 정말 됐고, 몸만 오세요.",
    date: D,
    time: "18:30",
    place: "연남동 술집 목요일",
    address: "서울 마포구 성미산로 161-4",
    note: "가게가 크지 않아 인원 파악이 꼭 필요합니다.",
    phone: "010-1234-5678",
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
  party: {
    eyebrow: "You are invited",
    title: "마당에서\n한 끼 합니다",
    host: "목요모임",
    message:
      "날이 좋아 자리를 밖에 폈습니다.\n\n음식은 준비되어 있으니\n마실 것만 한 병씩 들고 오세요.\n비가 오면 안으로 들어갑니다.",
    date: D,
    time: "17:30",
    place: "성수동 스튜디오 로우",
    address: "서울 성동구 연무장길 45, 2층",
    note: "신발은 편한 것으로 신고 오세요.",
    phone: "010-4567-8901",
    rsvp: true,
  },
  season: {
    eyebrow: "Year End",
    title: "올해의\n마지막 밤",
    host: "목요모임",
    message:
      "한 해를 같이 보낸 사람들과\n마지막 밤을 보내려 합니다.\n\n자리는 넉넉하니\n늦더라도 얼굴만 비춰 주세요.",
    date: "2026-12-19",
    time: "19:00",
    place: "을지로 살롱 드 원",
    address: "서울 중구 을지로 105, 4층",
    note: "드레스코드는 검정입니다.",
    phone: "010-6789-0123",
    rsvp: true,
  },
};

/** 디자인을 열었을 때 미리 채워져 있는 내용 */
export function sampleFor(designId: string, occasion: OccasionId): InviteData {
  return { d: designId, ...SAMPLES[occasion] };
}
