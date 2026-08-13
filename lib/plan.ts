/**
 * 요금제 — 무엇이 무료이고 무엇이 유료인지를 정의하는 한 곳.
 *
 * 가격 정책은 자주 바뀌고, 바뀔 때마다 화면 곳곳의 문구와 배지가 어긋나기
 * 쉽습니다. 그래서 홈·요금 안내 페이지·편집기 배지가 모두 이 파일을
 * 참조하도록 하고, 어느 기능이 유료인지도 SectionKey 로 못박아 둡니다.
 *
 * ── 왜 링크를 막지 않고 기한을 두는가 ──
 * 링크 발행 자체를 유료로 막으면 결제한 청첩장만 세상에 돌아다니게 됩니다.
 * 청첩장 하나는 하객 수백 명이 보고, 하단 표기를 타고 들어오는 것이 지금
 * 유일한 자연 유입이라 그 길을 스스로 끊는 셈입니다. 그래서 무료로도 링크를
 * 내주되 짧은 기한을 두었습니다. 전환은 결제창이 아니라 예식 날짜가 시킵니다.
 *
 * 원가 측면에서도 같은 답이 나옵니다. 기한이 지난 무료 청첩장의 사진을
 * 정리할 수 있어야 저장 비용이 무한정 쌓이지 않습니다.
 *
 * 결제 자체는 아직 붙지 않았습니다. 지금은 "무엇이 유료인지"를 정직하게
 * 표시하는 단계이고, 결제 연동 후 이 값들이 그대로 잠금 판정에 쓰입니다.
 */

import type { SectionKey } from "@/lib/invitation";

export type PlanId = "free" | "premium";

/** 원화. 한 청첩장에 한 번 결제하면 예식이 끝날 때까지 유지됩니다. */
export const PREMIUM_PRICE = 3_000;

/** 무료로 발행한 링크가 살아 있는 기간(일) */
export const FREE_LINK_DAYS = 7;

/** 결제한 청첩장을 예식일 이후로도 열어 두는 기간(일) */
export const PAID_GRACE_DAYS = 30;

export function formatPrice(won: number): string {
  return `${won.toLocaleString("ko-KR")}원`;
}

/**
 * 무료 링크의 만료 시각.
 *
 * 발행 시점부터 재는 이유는, 예식이 한참 남았을 때 미리 만들어 두는 사람이
 * 많기 때문입니다. 예식일 기준으로 재면 그런 사람에게는 기한이 사실상
 * 없는 것이나 마찬가지가 됩니다.
 */
export function freeLinkExpiry(publishedAt: Date): Date {
  const at = new Date(publishedAt);
  at.setDate(at.getDate() + FREE_LINK_DAYS);
  return at;
}

/**
 * 결제한 청첩장의 만료 시각 — 예식일에서 유예 기간만큼 더 둡니다.
 * 예식이 끝난 뒤에도 하객이 사진과 방명록을 한동안 볼 수 있어야 합니다.
 */
export function paidLinkExpiry(weddingDate: Date): Date {
  const at = new Date(weddingDate);
  at.setDate(at.getDate() + PAID_GRACE_DAYS);
  return at;
}

/** 남은 날짜. 이미 지났으면 0 입니다. */
export function daysLeft(expiry: Date, now: Date): number {
  const ms = expiry.getTime() - now.getTime();
  return ms <= 0 ? 0 : Math.ceil(ms / 86_400_000);
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
    tagline: `링크를 만들어 바로 보내 보실 수 있습니다. ${FREE_LINK_DAYS}일 뒤에 링크가 닫힙니다.`,
    features: [
      "디자인 템플릿 전체",
      "무제한 수정",
      "인사말 · 예식 정보 · 오시는 길",
      "마음 전하실 곳(계좌)",
      `갤러리 사진 ${PREMIUM_EXTRAS.freeGalleryPhotos}장`,
      "카카오톡 링크 공유 · QR 코드",
      `링크 유지 ${FREE_LINK_DAYS}일 · 하단 Cardly 표기`,
    ],
  },
  {
    id: "premium",
    name: "프리미엄",
    price: formatPrice(PREMIUM_PRICE),
    tagline: "청첩장을 돌리기 전에 한 번만 결제하면 끝입니다.",
    features: [
      "무료의 모든 기능",
      `링크 유지 — 예식일 +${PAID_GRACE_DAYS}일까지`,
      "하단 Cardly 표기 제거",
      "참석 여부 집계",
      "방명록",
      "하객 스냅 모으기",
      "미니앨범 · 타임라인 · 두 사람 이야기",
      "갤러리 사진 무제한",
      "오프닝 애니메이션 · 화면 효과 · 배경음악",
    ],
  },
];
