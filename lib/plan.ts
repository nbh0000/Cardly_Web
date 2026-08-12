/**
 * 요금제 — 무엇이 무료이고 무엇이 유료인지를 정의하는 한 곳.
 *
 * 가격 정책은 자주 바뀌고, 바뀔 때마다 화면 곳곳의 문구와 배지가 어긋나기
 * 쉽습니다. 그래서 홈·요금 안내 페이지·편집기 배지가 모두 이 파일을
 * 참조하도록 하고, 어느 기능이 유료인지도 SectionKey 로 못박아 둡니다.
 *
 * 결제 자체는 아직 붙지 않았습니다. 지금은 "무엇이 유료인지"를 정직하게
 * 표시하는 단계이고, 결제 연동 후 이 값들이 그대로 잠금 판정에 쓰입니다.
 */

import type { SectionKey } from "@/lib/invitation";

export type PlanId = "free" | "premium";

/** 원화. 한 청첩장에 한 번 결제하면 예식일까지 유지됩니다. */
export const PREMIUM_PRICE = 19_000;

export function formatPrice(won: number): string {
  return `${won.toLocaleString("ko-KR")}원`;
}

/* ------------------------------------------------------------
   유료 기능
   ------------------------------------------------------------ */

/**
 * 프리미엄에서 열리는 섹션.
 *
 * 기준은 "이게 없어도 청첩장을 보낼 수 있는가"입니다. 인사말·예식 정보·
 * 오시는 길·계좌처럼 청첩장의 뼈대는 무료로 두고, 하객의 응답을 받는 기능과
 * 꾸미기 추가분을 유료로 둡니다.
 */
export const PREMIUM_SECTIONS: SectionKey[] = [
  "rsvp",
  "guestbook",
  "snap",
  "album",
  "timeline",
  "couple",
  "video",
];

export function isPremiumSection(key: SectionKey): boolean {
  return PREMIUM_SECTIONS.includes(key);
}

/** 섹션 밖의 유료 기능들 */
export const PREMIUM_EXTRAS = {
  /** 갤러리 사진 장수 — 무료는 여기까지 */
  freeGalleryPhotos: 10,
  /** 오프닝 애니메이션·화면 효과·배경음악 */
  decoration: true,
} as const;

/* ------------------------------------------------------------
   안내 문구 — 요금 페이지와 홈이 같은 목록을 씁니다
   ------------------------------------------------------------ */

export interface PlanSpec {
  id: PlanId;
  name: string;
  price: string;
  tagline: string;
  features: string[];
}

export const PLANS: PlanSpec[] = [
  {
    id: "free",
    name: "무료",
    price: "0원",
    tagline: "청첩장을 만들어 링크로 보내는 데 필요한 것은 다 들어 있습니다.",
    features: [
      "디자인 템플릿 전체",
      "무제한 수정",
      "인사말 · 예식 정보 · 오시는 길",
      "마음 전하실 곳(계좌)",
      `갤러리 사진 ${PREMIUM_EXTRAS.freeGalleryPhotos}장`,
      "카카오톡 링크 공유 · QR 코드",
    ],
  },
  {
    id: "premium",
    name: "프리미엄",
    price: formatPrice(PREMIUM_PRICE),
    tagline: "하객의 응답을 받고, 청첩장을 더 오래 보게 만듭니다.",
    features: [
      "무료의 모든 기능",
      "참석 여부 집계",
      "방명록",
      "하객 스냅 모으기",
      "미니앨범 · 타임라인 · 두 사람 이야기",
      "갤러리 사진 무제한",
      "오프닝 애니메이션 · 화면 효과 · 배경음악",
      "하단 Cardly 표기 제거",
    ],
  },
];
