/* ============================================================
   초대장 — 접힌 카드 한 장

   청첩장과는 다른 물건입니다. 청첩장은 끝없이 스크롤되는 한 장의
   페이지고, 초대장은 손에 쥐는 카드입니다. 그래서 자료 구조도
   청첩장의 InvitationData 를 빌려 쓰지 않고 따로 둡니다.

   카드는 네 면입니다. 실제 접힌 카드가 그렇습니다.

       ┌─────────┬─────────┐        접는 선
       │  BACK   │  FRONT  │   ←  바깥쪽 (닫혀 있을 때 보이는 면)
       ├─────────┼─────────┤
       │  LEFT   │  RIGHT  │   ←  안쪽 (펼쳤을 때 보이는 면)
       └─────────┴─────────┘

     front : 그림과 행사 이름. 카드를 고르는 기준이 되는 면입니다.
     left  : 행사 정보 — 언제, 어디서, 누가.
     right : 손으로 쓴 인사말. 이 면만 사용자가 자유롭게 씁니다.
     back  : 오시는 길과 참석 회신.
   ============================================================ */

import type { FontId } from "@/lib/fonts";

/**
 * 앞면을 무엇으로 채우는가.
 *
 * 도형을 조합해 그림을 흉내 내던 것을 걷어냈습니다. 벡터 도형은
 * 아무리 다듬어도 클립아트로 읽히지, 카드가 되지는 않습니다.
 * 대신 실제 문구류가 쓰는 두 가지 길만 남깁니다.
 *
 *   plate — 진짜 그림 한 점을 앞면에 통째로 앉힙니다.
 *           퍼블릭 도메인(CC0) 명화·판화라 상업적 이용이 자유롭습니다.
 *   type  — 그림 없이 활자와 인쇄 효과만으로 세웁니다.
 *           못 그린 그림이 없으니 짜칠 수가 없습니다.
 */
export type FrontKind = "plate" | "type";

/** 활자 전용 앞면의 조판 다섯 가지 */
export type TypeLayout =
  | "bigdate" /* 날짜 두 자리가 화면을 채웁니다 */
  | "stack" /* 낱말을 한 줄씩 쌓아 올립니다 */
  | "rule" /* 굵은 괘선 사이에 놓입니다 */
  | "corner" /* 모서리에 몰아넣고 크게 비웁니다 */
  | "seal"; /* 가운데 원형 도장 안에 */

/** 앞면에 앉히는 그림 한 점 */
export interface Plate {
  /** public/cards/<file>.webp */
  file: string;
  title: string;
  artist: string;
  date: string;
}

/**
 * 색 한 벌.
 *
 * 그림 카드에서는 그림 둘레의 종이색과 글자색으로만 쓰이고,
 * 활자 카드에서는 조판 전체의 색이 됩니다.
 */
export interface Palette {
  /** 카드 종이색 — 가장 밝은 면 */
  paper: string;
  /** 글자색 */
  ink: string;
  /** 강조색 — 괘선, 라벨, 도장 */
  accent: string;
  /** 보조 면 */
  soft: string;
  /** 가장 어두운 부분 */
  deep: string;
  /** 종이보다 한 겹 진한 바탕 */
  tint: string;
}

export type OccasionId =
  | "birthday"
  | "party"
  | "housewarming"
  | "firstbirthday"
  | "opening"
  | "festival"
  | "gathering"
  | "anniversary"
  | "graduation"
  | "farewell";

export interface Occasion {
  id: OccasionId;
  /** 탭과 목록에 쓰는 이름 */
  label: string;
  /** 갤러리 머리글에 붙는 한 줄 */
  blurb: string;
  /** 이 행사의 기본 내용 */
  preset: {
    title: string;
    subtitle: string;
    host: string;
    place: string;
    address: string;
    greeting: string;
    note: string;
  };
}

export interface CardDesign {
  id: string;
  /** 카드 이름 — 목록에 뜹니다 */
  name: string;
  occasion: OccasionId;
  palette: Palette;
  /** 앞면 제목에 쓰는 글꼴 */
  titleFont: FontId;
  badge?: "NEW" | "BEST";
  /** 그림 카드 */
  front: FrontKind;
  /** front === "plate" 일 때 앉히는 그림 */
  plate?: Plate;
  /** 그림을 종이 안쪽에 액자처럼 앉힐지, 가장자리까지 채울지 */
  plateFit?: "inset" | "bleed";
  /** front === "type" 일 때의 조판 */
  layout?: TypeLayout;
}

/** 손글씨 설정 — 안쪽 오른쪽 면에만 적용됩니다 */
export interface Handwriting {
  font: FontId;
  /** 카드 폭 대비 글자 크기(%) — 카드가 커져도 비율이 유지됩니다 */
  size: number;
  color: string;
  align: "left" | "center";
}

/** 사용자가 채우는 내용 전부 */
export interface CardDoc {
  designId: string;
  /* 앞면 */
  title: string;
  subtitle: string;
  /* 안쪽 왼쪽 — 행사 정보 */
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  host: string;
  place: string;
  address: string;
  /* 안쪽 오른쪽 — 손글씨 */
  greeting: string;
  hand: Handwriting;
  /* 뒷면 */
  note: string;
  /** 참석 회신을 받을 연락처 (비우면 뒷면에 나오지 않습니다) */
  rsvpTo: string;
}

/** 카드의 네 면 */
export type FaceId = "front" | "left" | "right" | "back";

export const FACE_LABELS: Record<FaceId, string> = {
  front: "앞면",
  left: "안쪽 왼쪽",
  right: "안쪽 오른쪽",
  back: "뒷면",
};
