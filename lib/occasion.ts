/**
 * 초대장 — 결혼식이 아닌 행사용.
 *
 * 청첩장 엔진을 그대로 씁니다. 템플릿(색·글꼴·커버 레이아웃)도, 섹션도,
 * 3D 오프닝도 웨딩 전용 로직이 없어서 재사용이 됩니다. 다른 것은
 * "커버에 무엇을 적는가"와 "어떤 섹션을 기본으로 켜는가" 뿐입니다.
 *
 *   청첩장 커버 : 신랑 이름 / 신부 이름
 *   초대장 커버 : 행사 이름 / 주최자
 *
 * 그래서 새 편집기를 만들지 않고 InvitationData 에 occasion 을 얹었습니다.
 * occasion 이 없으면 지금까지처럼 청첩장으로 동작합니다.
 */

import {
  createDefaultData,
  formatDateKo,
  formatTimeKo,
  type InvitationData,
} from "@/lib/invitation";
import { getOccasionTemplate } from "@/lib/occasion-templates";

export type OccasionKind =
  | "birthday"
  | "party"
  | "housewarming"
  | "firstbirthday"
  | "opening"
  | "festival"
  | "gathering"
  | "anniversary"
  | "graduation"
  | "retirement";

export interface OccasionSpec {
  id: OccasionKind;
  /** 목록·탭에 쓰는 이름 */
  label: string;
  /** 커버 상단 영문 라벨 */
  eyebrow: string;
  /** 커버에 얹는 영문 캘리그래피 */
  script: string;
  /** 행사 이름 기본값 */
  title: string;
  /** 주최자 표기 기본값 */
  host: string;
  /** 인사말 기본값 */
  greeting: string;
  /** 장소 이름 기본값 */
  venue: string;
  /** 이 행사에서 기본으로 켜 두면 좋은 섹션 */
  rsvp: boolean;
}

export const OCCASIONS: OccasionSpec[] = [
  {
    id: "birthday",
    label: "생일",
    eyebrow: "BIRTHDAY PARTY",
    script: "Happy Birthday",
    title: "서연이의 생일",
    host: "김서연",
    greeting:
      "한 살 더 먹었습니다.\n케이크 앞에서 같이 웃어 주실 분들을 모십니다.\n편한 차림으로 오세요.",
    venue: "연남동 라운지",
    rsvp: true,
  },
  {
    id: "party",
    label: "파티",
    eyebrow: "YOU ARE INVITED",
    script: "Let's Celebrate",
    title: "여름밤 홈파티",
    host: "김도윤 · 이서연",
    greeting:
      "긴 여름밤, 좋은 사람들과 한잔하려 합니다.\n음식과 음악은 준비해 두었으니\n몸만 오시면 됩니다.",
    venue: "성수동 옥상",
    rsvp: true,
  },
  {
    id: "housewarming",
    label: "집들이",
    eyebrow: "HOUSEWARMING",
    script: "Our New Home",
    title: "저희 집에 초대합니다",
    host: "김도윤 · 이서연",
    greeting:
      "드디어 짐 정리가 끝났습니다.\n밥 한 끼 같이 하면서 새 집 구경하러 오세요.\n빈손으로 오시면 됩니다.",
    venue: "마포구 연남동",
    rsvp: true,
  },
  {
    id: "firstbirthday",
    label: "돌잔치",
    eyebrow: "FIRST BIRTHDAY",
    script: "First Birthday",
    title: "하준이의 첫 생일",
    host: "김도윤 · 이서연",
    greeting:
      "아이가 태어난 지 일 년이 되었습니다.\n그동안 마음 써 주신 분들과\n첫 생일을 함께 나누고 싶습니다.",
    venue: "그랜드하얏트 서울",
    rsvp: true,
  },
  {
    id: "opening",
    label: "개업 · 오픈",
    eyebrow: "GRAND OPENING",
    script: "Grand Opening",
    title: "작은 가게를 엽니다",
    host: "김도윤",
    greeting:
      "오래 준비한 가게를 드디어 엽니다.\n오시는 길에 들러 커피 한잔 하고 가세요.\n오픈 주간에는 음료를 대접합니다.",
    venue: "연희동 1층",
    rsvp: false,
  },
  {
    id: "festival",
    label: "페스티벌",
    eyebrow: "FESTIVAL",
    script: "See You There",
    title: "한강 여름 페스티벌",
    host: "한강문화기획단",
    greeting:
      "여름 저녁, 강가에서 음악과 함께합니다.\n돗자리와 편한 신발을 챙겨 오세요.\n우천 시에는 실내로 옮겨 진행합니다.",
    venue: "여의도 한강공원",
    rsvp: true,
  },
  {
    id: "gathering",
    label: "모임 · 동창회",
    eyebrow: "GET TOGETHER",
    script: "Long Time No See",
    title: "열두 번째 정기 모임",
    host: "모임지기 김도윤",
    greeting:
      "오랜만에 얼굴 한번 보시죠.\n식사와 자리는 미리 잡아 두었습니다.\n오실 분은 참석 여부만 알려 주세요.",
    venue: "종로 한정식",
    rsvp: true,
  },
  {
    id: "anniversary",
    label: "기념일",
    eyebrow: "ANNIVERSARY",
    script: "Anniversary",
    title: "함께한 열 번째 해",
    host: "김도윤 · 이서연",
    greeting:
      "벌써 십 년이 되었습니다.\n곁에 있어 주신 분들과\n조용히 한 끼 나누고 싶습니다.",
    venue: "북촌 다이닝",
    rsvp: true,
  },
  {
    id: "graduation",
    label: "졸업 · 수료",
    eyebrow: "GRADUATION",
    script: "We Did It",
    title: "졸업을 축하해 주세요",
    host: "김서연",
    greeting:
      "긴 과정을 무사히 마쳤습니다.\n지켜봐 주신 분들과\n마지막 날을 함께하고 싶습니다.",
    venue: "한국대학교 대강당",
    rsvp: false,
  },
  {
    id: "retirement",
    label: "퇴임 · 송별",
    eyebrow: "FAREWELL",
    script: "Thank You",
    title: "그동안 감사했습니다",
    host: "김도윤",
    greeting:
      "오랜 시간 한자리를 지켰습니다.\n함께 일한 분들과 인사를 나누고 싶어\n자리를 마련했습니다.",
    venue: "회사 근처 식당",
    rsvp: true,
  },
];

export function getOccasion(id: string): OccasionSpec | undefined {
  return OCCASIONS.find((o) => o.id === id);
}

/**
 * 행사용 기본 데이터.
 *
 * 청첩장 기본값 위에 행사에 맞는 값만 덮어씁니다. 웨딩 전용 섹션
 * (혼주 소개·두 사람 이야기·마음 전하실 곳)은 꺼 두고, 대신 참석 응답과
 * 안내사항처럼 행사에 필요한 것을 켭니다.
 */
export function createOccasionData(
  templateId: string,
  kind: OccasionKind,
): InvitationData {
  const spec = getOccasion(kind) ?? OCCASIONS[0]!;
  const base = createDefaultData(templateId);
  /* 초대장 전용 템플릿은 자기 문구를 갖고 있습니다 — "네온사인"은
     Let's Celebrate 이고 "라운지"는 Come Over 입니다. 행사 기본값으로
     덮어쓰면 스무 종이 전부 같은 한 줄을 달게 됩니다. */
  const t = getOccasionTemplate(templateId);
  return {
    ...base,
    occasion: spec.id,
    eventTitle: spec.title,
    hostName: spec.host,

    coverEyebrow: t?.eyebrow ?? spec.eyebrow,
    coverScript: t?.script ?? spec.script,
    greeting: spec.greeting,
    venueName: spec.venue,

    /* 카카오톡에 붙였을 때 뜨는 제목·설명. 여기까지 갈아 두지 않으면
       생일 초대장을 보냈는데 "김도윤 ♥ 이서연 결혼합니다"가 뜹니다. */
    shareTitle: `${spec.title} · ${spec.host}`,
    shareDescription: `${formatDateKo(base.date)} ${formatTimeKo(base.time)}\n${spec.venue}`,

    /* 초대장은 링크를 열자마자 카드가 3D 로 펴지면서 시작합니다.
       청첩장은 오프닝을 고르는 것이지만, 초대장에서는 그것이
       물건의 정체 자체라 기본으로 켜 둡니다. */
    opening: "cardopen",

    // 결혼식에만 있는 것들은 꺼 둡니다
    showAccounts: false,
    showCouple: false,
    showTimeline: false,
    showAlbum: false,
    snapEnabled: false,

    // 행사에 필요한 것
    showRsvp: spec.rsvp,
    showNotice: true,
    showCalendar: true,
    showGallery: true,
    showVenueInfo: true,
  };
}

/**
 * 템플릿 하나만 보고 어떤 행사인지 알아냅니다.
 *
 * 갤러리에서는 주소에 ?occasion= 이 붙지만, /preview/<id> 처럼 곧바로
 * 템플릿을 여는 길도 있습니다. 초대장 템플릿은 자기가 어느 행사의
 * 것인지 알고 있으므로 물어보면 됩니다.
 */
export function occasionOf(templateId: string): OccasionKind | null {
  return getOccasionTemplate(templateId)?.occasion ?? null;
}

/** 초대장 템플릿이면 행사 기본값을, 아니면 청첩장 기본값을 만듭니다 */
export function createDataForTemplate(templateId: string): InvitationData {
  const kind = occasionOf(templateId);
  return kind ? createOccasionData(templateId, kind) : createDefaultData(templateId);
}

/** 목록 필터용 — "전체" 를 앞에 둡니다 */
export const OCCASION_FILTERS: { id: string; label: string }[] = [
  { id: "all", label: "전체" },
  ...OCCASIONS.map((o) => ({ id: o.id, label: o.label })),
];
