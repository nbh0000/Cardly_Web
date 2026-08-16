/* 모바일 초대장 — 자료형

   청첩장(lib/invitation)과는 다른 물건입니다. 청첩장은 길게 내려
   읽는 웹페이지이고, 초대장은 «받아서 여는 카드» 입니다. 그래서
   칸이 아홉 개씩 있지 않고, 한 장 안에 들어갈 만큼만 담습니다. */

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

/** 표지 글자를 그림 위 어디에 얹을지 */
export type CoverLayout =
  /** 아래쪽에 모아 앉힘 — 그림의 윗부분이 주인공일 때 */
  | "foot"
  /** 위쪽에 걸어 둠 — 그림의 아랫부분이 주인공일 때 */
  | "head"
  /** 한가운데 — 그림이 무늬처럼 고를 때 */
  | "center"
  /** 그림을 창처럼 오려 넣고 글자는 종이 위에 — 가장 카드다운 판 */
  | "window";

export interface Design {
  id: string;
  /** 목록에 보이는 이름 */
  name: string;
  occasion: OccasionId;
  /** public/art/ 안의 파일 이름 (확장자 포함) */
  art: string;
  /** 그림을 고른 이유 — 목록 카드 아래 한 줄 */
  note: string;

  cover: CoverLayout;
  /** 표지 글자색 (그림 위에 얹힐 때) */
  coverInk: string;
  /** window 판에서 그림을 둘러싸는 종이색 */
  paper: string;
  /** 카드 안쪽 바탕 */
  inside: string;
  /** 안쪽 본문 글자색 */
  ink: string;
  /** 안쪽 보조 글자색 */
  inkSoft: string;
  /** 강조색 — 선, 날짜, 버튼 */
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
  /** 초대 글 */
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
  /** 참석 회신 버튼을 켤지 */
  rsvp: boolean;
}
