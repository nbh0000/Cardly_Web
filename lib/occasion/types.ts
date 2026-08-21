/* 초대장 — 자료형

   청첩장(lib/invitation)과는 다른 물건입니다. 청첩장은 길게 내려 읽는
   웹페이지이고, 초대장은 «받아서 여는 접힌 카드» 입니다. 그래서 칸이
   아홉 개씩 있지 않고, 넉 장 안에 들어갈 만큼만 담습니다.

   넉 장이라는 수는 임의로 정한 것이 아닙니다. 종이 한 장을 한 번 접으면
   면이 넷 생깁니다 — 앞표지, 속 왼쪽, 속 오른쪽, 뒤표지. 실물 카드가
   그렇게 생겼기 때문에 자료형도 그렇게 생겼습니다.                */

/** 행사 갈래 — 목록 페이지의 분류이자 기본값의 기준 */
export type OccasionId =
  | "wedding"
  | "baby"
  | "birthday"
  | "anniversary"
  | "housewarming"
  | "party"
  | "season";

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

   스무 벌 모두 표지 전면이 그림입니다. 그림은 그리는 것이 아니라
   생성해서 들여옵니다(generate.mjs) — 손으로 짠 벡터 도형은 아무리
   다듬어도 클립아트로 읽히고, 색면과 괘선만으로는 실물 카드가 주는
   화사함이 나오지 않습니다.

   그래서 판짜기가 정하는 것은 «그림을 어디까지 쓰고, 글자를 어디에
   앉히느냐» 입니다. 다섯 판뿐인 것은 적어서가 아니라, 그림이 스무 장
   서로 다르기 때문입니다. 판까지 스무 가지면 한 벌의 물건으로 보이지
   않습니다.                                                        */

export type CoverLayout =
  /** 그림이 표지 전면. 글자는 그림이 비워 둔 한가운데로 */
  | "open"
  /** 그림이 표지 전면. 글자는 아래에 모아 앉힘 */
  | "foot"
  /** 그림이 표지 전면. 글자는 위에 걸어 둠 */
  | "head"
  /** 그림이 위쪽 3분의 2, 아래는 종이 띠. 글자가 언제나 읽힙니다 */
  | "panel"
  /** 그림을 창처럼 오려 넣고 글자는 종이 위에 */
  | "window";

/** 글자가 그림 위에 직접 놓이는 판 */
export const ON_ART_LAYOUTS: readonly CoverLayout[] = ["open", "foot", "head"];

export interface Design {
  id: string;
  /** 목록에 보이는 이름 */
  name: string;
  occasion: OccasionId;
  /** 목록 카드 아래 한 줄 — 어떤 그림인지 */
  note: string;

  cover: CoverLayout;
  /** public/art/ 안의 파일 이름 */
  art: string;

  /**
   * 글자가 놓이는 자리의 그림이 밝은지 어두운지.
   *
   * 밝으면 글자는 잉크색이고 그림 위에 흰 베일을 옅게 깝니다.
   * 어두우면 글자는 종이색이고 검은 그늘을 옅게 깝니다. 그림마다
   * 눈으로 보고 정합니다 — 평균 밝기로 자동 판정하면 꽃 한 송이가
   * 밝다는 이유로 전체가 뒤집힙니다.
   */
  tone: "light" | "dark";

  /* ── 색 세 개 ──────────────────────────────────────────────
     전부 그림에서 뽑습니다. 지어낸 색을 그림 옆에 놓으면 아무리 예쁜
     색이어도 카드가 조잡해집니다.                                   */

  /** 카드 종이색 — 속면과 뒤표지의 바탕 */
  bg: string;
  /** 그 종이 위의 글자색 — bg 와 4.5:1 이상이어야 합니다 */
  ink: string;
  /** 강조색 — 선, 날짜, 단추. bg 와 3:1 이상이어야 합니다 */
  point: string;
}

/* ── 사용자가 채우는 내용 ──────────────────────────────────────
   공유 링크에 통째로 실립니다. 칸마다 최대 길이를 정해 둔 것은 화면을
   지키기 위해서이기도 하고, 주소 길이를 지키기 위해서이기도 합니다 —
   내용이 길어지면 링크가 길어지고, 어떤 메신저는 긴 링크를 자릅니다. */

export const LIMITS = {
  eyebrow: 24,
  title: 30,
  host: 30,
  message: 400,
  place: 40,
  address: 60,
  note: 60,
  phone: 20,
} as const;

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
  /** 연락처. 비우면 «전화» 가 사라집니다 */
  phone: string;
  /** 참석 회신 단추를 켤지 */
  rsvp: boolean;
}
