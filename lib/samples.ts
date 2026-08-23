/**
 * 샘플 — 실제로 발행된 것과 똑같이 열리는 링크 셋.
 *
 * "샘플 보기" 를 편집기 미리보기로 보내면, 보는 사람은 «내가 만들 때의
 * 화면» 을 볼 뿐 «하객이 받는 것» 은 끝내 못 봅니다. 파는 물건이 링크인데
 * 링크를 안 보여 주는 셈입니다. 그래서 샘플도 발행된 문서와 같은 주소
 * 체계(/w/…, /i/…)로 열리게 두고, 같은 화면 컴포넌트가 그립니다.
 *
 * 데이터베이스에 넣지 않고 코드에 두는 이유는 셋입니다.
 *   · 서버 없이도(=키가 없는 환경에서도) 샘플은 언제나 열려야 합니다.
 *   · 빌드에 포함되므로 카카오톡 미리보기가 처음부터 붙습니다.
 *   · 남의 계정에 딸린 문서가 아니라 우리가 관리하는 견본이어야 합니다.
 *
 * 내용은 가상의 인물입니다. 실제 예식장 이름과 주소를 쓰면 그 업체가
 * 우리와 관계 있는 것처럼 읽히므로 지명만 남기고 상호는 지어냈습니다.
 */

import { createDefaultData, type InvitationData } from "@/lib/invitation";
import type { InviteData } from "@/lib/occasion/types";

export interface WeddingSample {
  slug: string;
  kind: "wedding";
  /** 목록에 보여 줄 한 줄 */
  label: string;
  note: string;
  templateId: string;
  eventDate: string;
  data: InvitationData;
}

export interface OccasionSample {
  slug: string;
  kind: "occasion";
  label: string;
  note: string;
  designId: string;
  eventDate: string;
  data: InviteData;
}

export type Sample = WeddingSample | OccasionSample;

/* ------------------------------------------------------------
   모바일 청첩장
   ------------------------------------------------------------ */

function wedding(
  slug: string,
  label: string,
  note: string,
  templateId: string,
  overrides: Partial<InvitationData>,
): WeddingSample {
  const base = createDefaultData(templateId);
  const data: InvitationData = { ...base, ...overrides };
  return {
    slug,
    kind: "wedding",
    label,
    note,
    templateId,
    eventDate: data.date,
    data,
  };
}

const WEDDING_SAMPLES: WeddingSample[] = [
  wedding(
    "sample-jiho-suin",
    "정지호 · 문수인",
    "사진을 크게 쓰는 포토 계열. 갤러리와 참석 여부까지 켜 둔 판입니다.",
    "linen",
    {
      groom: {
        lastName: "정",
        firstName: "지호",
        phone: "010-0000-0000",
        relation: "장남",
        fatherLastName: "정",
        fatherFirstName: "한수",
        fatherPhone: "",
        fatherLate: false,
        motherLastName: "오",
        motherFirstName: "미경",
        motherPhone: "",
        motherLate: false,
      },
      bride: {
        lastName: "문",
        firstName: "수인",
        phone: "010-0000-0000",
        relation: "차녀",
        fatherLastName: "문",
        fatherFirstName: "재우",
        fatherPhone: "",
        fatherLate: false,
        motherLastName: "배",
        motherFirstName: "선영",
        motherPhone: "",
        motherLate: false,
      },
      date: "2026-10-17",
      time: "13:00",
      venueName: "서린가든",
      venueHall: "3층 그랜드홀",
      venueAddress: "서울 종로구 새문안로 5길 19",
      greetingTitle: "저희 두 사람\n결혼합니다",
      greeting:
        "여름의 끝에서 처음 만나\n네 번의 계절을 함께 지났습니다.\n\n이제 같은 방향을 보며 걷기로 했습니다.\n오셔서 축복해 주시면 큰 기쁨이겠습니다.",
      coverPhoto: "/samples/couple-03.jpg",
      shareImage: "/samples/couple-03.jpg",
      gallery: [
        "/samples/couple-04.jpg",
        "/samples/couple-05.jpg",
        "/samples/couple-06.jpg",
        "/samples/couple-07.jpg",
      ],
      showGallery: true,
      showRsvp: true,
      showGuestbook: true,
      showAccounts: true,
      shareTitle: "정지호 ♥ 문수인 결혼합니다",
      shareDescription: "2026년 10월 17일 토요일 오후 1시 · 서린가든 그랜드홀",
    },
  ),
  wedding(
    "sample-doyun-haeun",
    "강도윤 · 임하은",
    "글자만으로 세운 미니멀. 사진 없이도 청첩장이 됩니다.",
    "noir",
    {
      groom: {
        lastName: "강",
        firstName: "도윤",
        phone: "010-0000-0000",
        relation: "장남",
        fatherLastName: "강",
        fatherFirstName: "인석",
        fatherPhone: "",
        fatherLate: false,
        motherLastName: "황",
        motherFirstName: "정아",
        motherPhone: "",
        motherLate: false,
      },
      bride: {
        lastName: "임",
        firstName: "하은",
        phone: "010-0000-0000",
        relation: "장녀",
        fatherLastName: "임",
        fatherFirstName: "성호",
        fatherPhone: "",
        fatherLate: false,
        motherLastName: "신",
        motherFirstName: "유리",
        motherPhone: "",
        motherLate: false,
      },
      date: "2026-11-28",
      time: "17:30",
      venueName: "청담 아뜰리에",
      venueHall: "지하 1층 홀",
      venueAddress: "서울 강남구 도산대로 45길 12",
      greetingTitle: "겨울의 초입에\n식을 올립니다",
      greeting:
        "서로의 이름을 오래 불러 온 두 사람이\n같은 성을 쓰기로 했습니다.\n\n귀한 걸음으로 축복해 주세요.",
      showGallery: false,
      showRsvp: true,
      showAccounts: true,
      shareTitle: "강도윤 ♥ 임하은 결혼합니다",
      shareDescription: "2026년 11월 28일 토요일 오후 5시 30분 · 청담 아뜰리에",
    },
  ),
  wedding(
    "sample-minjae-areum",
    "서민재 · 백아름",
    "꽃과 손글씨가 있는 클래식. 안내사항과 오시는 길까지 채운 판입니다.",
    "camellia",
    {
      groom: {
        lastName: "서",
        firstName: "민재",
        phone: "010-0000-0000",
        relation: "차남",
        fatherLastName: "서",
        fatherFirstName: "동혁",
        fatherPhone: "",
        fatherLate: false,
        motherLastName: "권",
        motherFirstName: "은주",
        motherPhone: "",
        motherLate: false,
      },
      bride: {
        lastName: "백",
        firstName: "아름",
        phone: "010-0000-0000",
        relation: "장녀",
        fatherLastName: "백",
        fatherFirstName: "종민",
        fatherPhone: "",
        fatherLate: false,
        motherLastName: "차",
        motherFirstName: "혜정",
        motherPhone: "",
        motherLate: false,
      },
      date: "2027-04-10",
      time: "12:00",
      venueName: "온수리 가든하우스",
      venueHall: "야외 예식장",
      venueAddress: "경기 남양주시 화도읍 재재기로 78",
      greetingTitle: "봄에 두 사람이\n하나가 됩니다",
      greeting:
        "꽃이 한창일 때 식을 올립니다.\n\n오시는 길이 조금 멀지만,\n그날 하루가 오래 기억되도록\n정성껏 준비하겠습니다.",
      coverPhoto: "/samples/couple-11.jpg",
      shareImage: "/samples/couple-11.jpg",
      gallery: ["/samples/couple-12.jpg", "/samples/couple-13.jpg", "/samples/couple-14.jpg"],
      showGallery: true,
      showNotice: true,
      notices: [
        {
          id: "n1",
          title: "주차 안내",
          body: "예식장 앞 주차장을 두 시간 무료로 쓰실 수 있습니다. 자리가 넉넉하지 않아 대중교통을 권해 드립니다.",
        },
        {
          id: "n2",
          title: "화환은 정중히 사양합니다",
          body: "마음만 감사히 받겠습니다.",
        },
      ],
      showRsvp: true,
      showGuestbook: true,
      shareTitle: "서민재 ♥ 백아름 결혼합니다",
      shareDescription: "2027년 4월 10일 토요일 낮 12시 · 온수리 가든하우스",
    },
  ),
];

/* ------------------------------------------------------------
   접히는 초대장
   ------------------------------------------------------------ */

function occasion(
  slug: string,
  label: string,
  note: string,
  data: InviteData,
): OccasionSample {
  return { slug, kind: "occasion", label, note, designId: data.d, eventDate: data.date, data };
}

const OCCASION_SAMPLES: OccasionSample[] = [
  occasion("sample-dol-jiwoo", "지우 첫 생일", "돌잔치 — 표지를 넘기면 인사말과 일정이 나옵니다.", {
    d: "dol-baby-tiger",
    eyebrow: "FIRST BIRTHDAY",
    title: "지우의\n첫 생일",
    host: "아빠 한도현 · 엄마 유서진",
    message:
      "작년 이맘때 태어난 아이가\n벌써 걸음마를 뗐습니다.\n\n가까운 분들만 모시고\n조용히 한 상 차리려 합니다.\n오셔서 축하해 주세요.",
    date: "2026-09-19",
    time: "12:00",
    place: "라온 연회장 2층",
    address: "서울 송파구 올림픽로 300",
    note: "주차 2시간 무료 · 아이 동반 환영",
    phone: "010-0000-0000",
    rsvp: true,
  }),
  occasion("sample-open-mokgong", "목공방 문 엽니다", "개업 — 짧은 카드 한 장으로 끝나는 초대.", {
    d: "opening-shop",
    eyebrow: "OPEN",
    title: "작은 목공방을\n엽니다",
    host: "나무결 공방 · 정한결",
    message:
      "삼 년을 준비한 자리입니다.\n\n오시는 분께 커피와\n손수 만든 도마 하나를 드립니다.\n편한 시간에 들러 주세요.",
    date: "2026-09-05",
    time: "11:00",
    place: "나무결 공방",
    address: "서울 성동구 성수이로 88",
    note: "오후 8시까지 열려 있습니다",
    phone: "010-0000-0000",
    rsvp: false,
  }),
  occasion("sample-newyear-party", "송년 모임", "연말 모임 — 참석 회신 단추를 켠 판입니다.", {
    d: "yearend-party",
    eyebrow: "YEAR END PARTY",
    title: "한 해를\n마무리하는 밤",
    host: "여섯시 모임",
    message:
      "올해도 무사히 지나갔습니다.\n\n한 해 동안 있었던 일을\n안주 삼아 나누는 자리입니다.\n오실 수 있으면 알려 주세요.",
    date: "2026-12-19",
    time: "19:00",
    place: "연남동 소소식당",
    address: "서울 마포구 동교로 41길 22",
    note: "회비 3만원 · 드레스코드 없음",
    phone: "010-0000-0000",
    rsvp: true,
  }),
];

/* ------------------------------------------------------------
   조회
   ------------------------------------------------------------ */

export const SAMPLES: Sample[] = [...WEDDING_SAMPLES, ...OCCASION_SAMPLES];

export function weddingSamples(): WeddingSample[] {
  return WEDDING_SAMPLES;
}

export function occasionSamples(): OccasionSample[] {
  return OCCASION_SAMPLES;
}

export function findWeddingSample(slug: string): WeddingSample | undefined {
  return WEDDING_SAMPLES.find((s) => s.slug === slug);
}

export function findOccasionSample(slug: string): OccasionSample | undefined {
  return OCCASION_SAMPLES.find((s) => s.slug === slug);
}
