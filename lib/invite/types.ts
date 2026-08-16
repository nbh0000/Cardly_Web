/* ============================================================
   웹 초대장 — 자료 구조

   하나의 템플릿으로 결혼식·돌잔치·생일·기업 행사를 모두 만듭니다.
   행사마다 다른 것은 «어떤 칸을 켜는가»와 «무엇이라 부르는가» 뿐이라,
   렌더러를 여러 벌 두지 않고 설정 하나로 갈라 놓았습니다.

   개발을 모르는 사람이 고쳐야 하는 것은 InviteConfig 하나입니다.
   나머지 타입은 그 파일을 안전하게 채우도록 돕는 안내판입니다.
   ============================================================ */

import type { FontId } from "@/lib/fonts";

/* ------------------------------------------------------------
   테마 — 색과 글꼴 한 벌
   ------------------------------------------------------------ */

export interface Theme {
  id: string;
  /** 고르는 화면에 뜨는 이름 */
  label: string;
  /** 한 줄 설명 */
  note: string;

  /** 페이지 바탕 */
  bg: string;
  /** 카드·인용문처럼 한 겹 올라온 면 */
  surface: string;
  /** 본문 글자 */
  ink: string;
  /** 보조 글자 */
  inkSoft: string;
  /** 캡션·라벨 */
  muted: string;
  /** 헤어라인 */
  line: string;

  /** 강조색 — 라벨, 아이콘, 큰 날짜 */
  accent: string;
  /** 버튼·링크처럼 «본문 대비»가 필요한 진한 강조색 */
  accentDeep: string;
  /** 아주 옅은 강조 틴트 */
  accentSoft: string;

  headingFont: FontId;
  bodyFont: FontId;
}

/* ------------------------------------------------------------
   섹션 — 켜고 끄는 단위
   ------------------------------------------------------------ */

export type SectionId =
  | "greeting" /* 초대 글 */
  | "detail" /* 일시·장소 */
  | "countdown" /* 남은 날짜와 달력 */
  | "gallery" /* 사진 */
  | "location" /* 오시는 길 */
  | "contact" /* 연락하기 */
  | "rsvp" /* 참석 회신 */
  | "account" /* 마음 전하실 곳 */
  | "notice"; /* 안내사항 */

export const SECTION_LABELS: Record<SectionId, string> = {
  greeting: "초대 글",
  detail: "일시 · 장소",
  countdown: "남은 날짜",
  gallery: "갤러리",
  location: "오시는 길",
  contact: "연락하기",
  rsvp: "참석 회신",
  account: "마음 전하실 곳",
  notice: "안내사항",
};

/* ------------------------------------------------------------
   설정 — 사용자가 채우는 전부
   ------------------------------------------------------------ */

/** 연락처 한 줄 */
export interface Contact {
  /** 관계나 역할 — "신랑", "아버지", "주최", "문의" */
  role: string;
  name: string;
  /** 숫자와 하이픈만. 비우면 전화 버튼이 나오지 않습니다. */
  phone?: string;
}

/** 계좌 한 줄 */
export interface Account {
  /** "신랑측", "혼주", "돌잔치" 처럼 묶는 이름 */
  group: string;
  bank: string;
  number: string;
  holder: string;
}

/** 안내사항 한 줄 */
export interface Notice {
  title: string;
  body: string;
}

/** 오시는 길의 교통편 한 줄 */
export interface Transport {
  /** "지하철", "버스", "주차" */
  kind: string;
  body: string;
}

export interface InviteConfig {
  /* ── 어떤 행사인가 ── */
  /** 테마 id — lib/invite/themes.ts 에 있는 것 중 하나 */
  theme: string;
  /** 브라우저 탭과 공유 미리보기에 뜨는 제목 */
  shareTitle: string;
  shareDescription: string;

  /* ── 표지 ── */
  cover: {
    /** 위쪽 작은 영문 라벨 */
    eyebrow: string;
    /** 큰 제목. 줄바꿈은 \n 으로 */
    title: string;
    /** 제목 아래 한 줄 */
    subtitle: string;
    /** public/ 아래 경로. 비우면 색면만 깔립니다. */
    image?: string;
    /** 사진 위 글자가 읽히도록 사진을 어둡게 (0~80) */
    dim?: number;
  };

  /* ── 언제, 어디서 ── */
  event: {
    /** YYYY-MM-DD */
    date: string;
    /** HH:mm (24시간) */
    time: string;
    /** 장소 이름 */
    place: string;
    /** 층·홀 이름 */
    hall?: string;
    address: string;
    /** 지도 앱에서 찾을 검색어. 비우면 주소를 씁니다. */
    mapQuery?: string;
    transports?: Transport[];
  };

  /* ── 글 ── */
  greeting: {
    /** 인용문처럼 위에 얹는 짧은 한 줄 */
    lead?: string;
    title: string;
    /** 줄바꿈은 \n, 문단 사이는 \n\n */
    body: string;
    /** 글 끝에 놓는 이름 — "김도윤 · 이서연" 처럼 */
    sign?: string;
  };

  /* ── 사진 ── */
  gallery: string[];

  /* ── 사람 ── */
  contacts: Contact[];

  /* ── 참석 회신 ── */
  rsvp: {
    title: string;
    body: string;
    /** 회신을 받을 곳. 전화번호나 폼 주소. */
    to: string;
    /** 회신 마감 안내 (선택) */
    deadline?: string;
  };

  /* ── 마음 전하실 곳 ── */
  accounts: Account[];

  /* ── 안내 ── */
  notices: Notice[];

  /* ── 어떤 칸을 켤지 ── */
  sections: SectionId[];

  /** 맨 아래에 남기는 한 줄 */
  closing?: string;
}

/** 행사 종류별 기본 설정 */
export interface Preset {
  id: string;
  /** 목록에 뜨는 이름 */
  label: string;
  /** 목록에 뜨는 한 줄 */
  note: string;
  config: InviteConfig;
}
