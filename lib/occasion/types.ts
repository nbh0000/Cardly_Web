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
  /** 영문 라벨 — 목록 눈썹글에 씁니다 */
  en: string;
  /** 목록 머리글 아래 한 문단 */
  blurb: string;
}

/* ── 표지 ─────────────────────────────────────────────────────

   표지가 정하는 것은 «어떤 그림을 쓰는가» 뿐입니다. 판짜기가 없습니다 —
   글자를 얹지 않기 때문입니다.

   예전에는 판이 다섯이었고(가운데·아래·위·띠·창) 글자가 놓이는 자리의
   밝기까지 벌마다 적어 두었습니다. 그 전부가 «그림 위에 글자를 올린다»
   는 결정 하나에서 나온 것이었고, 그 결정을 물리자 함께 사라졌습니다.
   실물 인사장이 그렇듯 앞은 그림이고 말은 안에 있습니다.            */

export interface Design {
  id: string;
  /** 목록에 보이는 이름 */
  name: string;
  occasion: OccasionId;
  /** 목록 카드 아래 한 줄 — 어떤 그림인지 */
  note: string;

  /** public/art/ 안의 파일 이름 */
  art: string;

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
  /** 속면 윗줄 (영문 소문자 라벨) */
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
