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

/** 카드 앞면에 인쇄되는 그림 열두 가지 */
export type ArtKind =
  | "bouquet" /* 꽃다발 */
  | "balloons" /* 풍선 다발 */
  | "cake" /* 케이크와 촛불 */
  | "home" /* 집과 창 */
  | "confetti" /* 쏟아지는 색종이 */
  | "arch" /* 아치 너머의 해 */
  | "night" /* 밤 강과 달 */
  | "stripe" /* 굵은 사선 띠 */
  | "wreath" /* 잎 화환 */
  | "stars" /* 별과 궤적 */
  | "ribbon" /* 리본 매듭 */
  | "path"; /* 산으로 난 길 */

export interface Palette {
  /** 카드 종이색 */
  paper: string;
  /** 글자색 */
  ink: string;
  /** 그림의 주색 */
  accent: string;
  /** 그림의 보조 면 */
  soft: string;
  /** 그림에서 가장 어두운 부분 */
  deep: string;
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
  art: ArtKind;
  palette: Palette;
  /** 앞면 글자를 그림 위 어디에 앉힐지 */
  titlePlace: "top" | "bottom";
  /** 앞면 제목에 쓰는 글꼴 */
  titleFont: FontId;
  badge?: "NEW" | "BEST";
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
