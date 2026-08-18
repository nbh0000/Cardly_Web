/* 초대장 — 자료형

   청첩장(lib/invitation)과는 다른 물건입니다. 청첩장은 길게 내려
   읽는 웹페이지이고, 초대장은 «받아서 여는 접힌 카드» 입니다.
   그래서 칸이 아홉 개씩 있지 않고, 넉 장 안에 들어갈 만큼만 담습니다.

   넉 장이라는 수는 임의로 정한 것이 아닙니다. 종이 한 장을 한 번
   접으면 면이 넷 생깁니다 — 앞표지, 속 왼쪽, 속 오른쪽, 뒤표지.
   실물 카드가 그렇게 생겼기 때문에 자료형도 그렇게 생겼습니다.   */

/** 행사 갈래 — 목록 페이지의 분류이자 기본값의 기준 */
export type OccasionId =
  | "birthday"
  | "firstbirthday"
  | "housewarming"
  | "opening"
  | "party"
  | "anniversary";

export interface Occasion {
  id: OccasionId;
  /** 목록에 보이는 이름 */
  label: string;
  /** 영문 라벨 — 표지 윗줄과 목록 눈썹글에 씁니다 */
  en: string;
  /** 목록 머리글 아래 한 문단 */
  blurb: string;
}

/* ── 표지 판짜기 ──────────────────────────────────────────────

   두 갈래입니다.

   ① 그림 표지 — 미술관 오픈액세스(CC0) 소장품을 깔고 그 위에 글자를
      얹습니다. 그림이 주인공이라 판짜기는 «글자를 어디로 비키느냐» 를
      정하는 일입니다.

   ② 활자 표지 — 그림이 없습니다. 색면·괘선·활자만으로 짭니다.
      실제 고급 문구(letterpress stationery)의 대부분이 이쪽이고,
      그림 없이도 — 오히려 그림이 없어서 — 격이 섭니다.
      직접 그린 도형을 얹는 길은 택하지 않았습니다. 손으로 그린
      벡터 도형은 아무리 다듬어도 클립아트로 읽힙니다.            */

export type CoverLayout =
  /* ── 그림 표지 ── */
  /** 아래쪽에 모아 앉힘 — 그림의 윗부분이 주인공일 때 */
  | "foot"
  /** 위쪽에 걸어 둠 — 그림의 아랫부분이 주인공일 때 */
  | "head"
  /** 한가운데 — 그림이 무늬처럼 고를 때 */
  | "center"
  /** 그림을 창처럼 오려 넣고 글자는 종이 위에 — 가장 카드다운 판 */
  | "window"
  /* ── 활자 표지 ── */
  /** 색면 전면에 가는 액자선 하나. 가장 기본이 되는 판 */
  | "plate"
  /** 위·아래 굵은 색띠, 가운데 종이 */
  | "band"
  /** 가는 괘선 두 줄 사이에 영문, 그 아래 큰 제목 */
  | "rule"
  /** 아주 가는 세로줄 바탕에 흰 라벨 */
  | "stripe"
  /** 네 모서리에 ㄱ자 선 — 청첩장의 오래된 관례 */
  | "corner"
  /** 날짜 숫자가 표지의 주인공 */
  | "numeral"
  /** 이니셜 한두 글자를 원 안에 */
  | "mono"
  /** 왼쪽 정렬 대형 제목 + 아래 굵은 선 */
  | "stack";

/** 그림을 쓰는 판짜기인지 */
export const ART_LAYOUTS: readonly CoverLayout[] = [
  "foot",
  "head",
  "center",
  "window",
];

export interface Design {
  id: string;
  /** 목록에 보이는 이름 */
  name: string;
  occasion: OccasionId;
  /** 목록 카드 아래 한 줄 — 왜 이 판인지 */
  note: string;

  cover: CoverLayout;
  /** public/art/ 안의 파일 이름. 활자 표지에는 없습니다 */
  art?: string;

  /** 표지 글자색 */
  coverInk: string;
  /** 표지 바탕 — 그림 표지에서는 그림을 두르는 종이색 */
  paper: string;
  /** 카드 안쪽 바탕 */
  inside: string;
  /** 안쪽 본문 글자색 */
  ink: string;
  /** 안쪽 보조 글자색 */
  inkSoft: string;
  /** 강조색 — 선, 날짜, 단추 */
  accent: string;
  /** 강조색 위에 얹는 글자색 */
  onAccent: string;
  /** 아주 옅은 강조 틴트 */
  veil: string;

  /** 제목 글꼴 (lib/fonts 의 FontId) */
  headFont: string;
  /** 본문 글꼴 */
  bodyFont: string;
}

/** 그림 한 점의 출처 — 저작권 표기에 씁니다 */
export interface ArtCredit {
  file: string;
  title: string;
  artist: string;
  date: string;
  url: string;
}

/** 사용자가 채우는 내용 — 공유 링크에 통째로 실립니다 */
export interface InviteData {
  /** 디자인 id */
  d: string;
  /** 표지 윗줄 (영문 소문자 라벨) */
  eyebrow: string;
  /** 표지 큰 글씨 — \n 으로 줄바꿈 */
  title: string;
  /** 초대하는 사람 */
  host: string;
  /** 초대 글 — 속 왼쪽 면 */
  message: string;
  /** 연-월-일 */
  date: string;
  /** 24시간 표기 HH:MM */
  time: string;
  /** 장소 이름 */
  place: string;
  /** 주소 */
  address: string;
  /** 안내 한 줄 (주차, 드레스코드 등). 비우면 칸이 사라집니다 */
  note: string;
  /** 연락처. 비우면 «전화하기» 가 사라집니다 */
  phone: string;
  /** 참석 회신 단추를 켤지 */
  rsvp: boolean;
}
