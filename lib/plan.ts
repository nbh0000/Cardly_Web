/**
 * 요금제 — 무엇이 무료이고 무엇이 유료인지를 정의하는 한 곳.
 *
 * 가격은 화면 곳곳(홈·요금 안내·편집기 배지·결제 화면)에 나타나고, 값이
 * 바뀔 때마다 어긋나기 쉽습니다. 그래서 숫자는 여기에만 적고 나머지는 전부
 * 이 파일을 참조합니다. 데이터베이스에도 같은 숫자가 order_price() 로
 * 한 번 더 적혀 있는데, 그쪽이 «진짜» 입니다 — 브라우저에서 온 금액은
 * 결제 승인 전에 항상 그 값과 대조합니다.
 *
 * ── 왜 링크를 막지 않고 기한을 두는가 ──
 * 링크 발행 자체를 유료로 막으면 결제한 청첩장만 세상에 돌아다니게 됩니다.
 * 청첩장 하나는 하객 수백 명이 보고, 하단 표기를 타고 들어오는 것이 지금
 * 유일한 자연 유입이라 그 길을 스스로 끊는 셈입니다. 그래서 무료로도 링크를
 * 내주되 짧은 기한을 두었습니다. 전환은 결제창이 아니라 예식 날짜가 시킵니다.
 *
 * 원가 측면에서도 같은 답이 나옵니다. 기한이 지난 무료 청첩장의 사진을
 * 정리할 수 있어야 저장 비용이 무한정 쌓이지 않습니다.
 */

import type { SectionKey } from "@/lib/invitation";

export type PlanId = "free" | "premium";
export type ProductKind = "wedding" | "occasion" | "print";

/* ------------------------------------------------------------
   지금은 전부 무료 — 여는 기간
   ------------------------------------------------------------ */

/**
 * 오픈 기간 스위치.
 *
 * 값이 정해진 뒤에도 «아직은 받지 않는» 때가 있습니다. 만드는 사람이
 * 적고, 링크가 도는 것 자체가 유일한 광고이고, 결제 심사가 아직 끝나지
 * 않았을 때입니다. 그동안은 링크 발행과 기능을 전부 열어 둡니다.
 *
 * 스위치를 여기 하나만 두는 이유는, 끄는 날 화면마다 흩어진 조건을
 * 찾아다니지 않기 위해서입니다. false 로 바꾸면 아래 요금표와 결제
 * 단추가 그대로 되살아납니다. 이미 그 시절에 발행된 링크는 그때 정해진
 * 기한을 그대로 들고 갑니다 — 데이터베이스가 발행 시점에 한 번만
 * 계산해 적어 두기 때문입니다.
 *
 * 데이터베이스에도 같은 스위치가 public.free_period() 로 한 번 더 있고,
 * 그쪽이 «진짜» 입니다. 브라우저에서 무엇을 보여 주든 참석 회신·방명록을
 * 실제로 받아 주는 것은 그 함수입니다. 둘을 같이 바꾸세요.
 */
export const FREE_PERIOD = true;

/** 무료 기간 동안 링크가 열려 있는 기간(행사일이 없을 때) */
export const FREE_PERIOD_DAYS = 365;

/** 화면 여기저기에 같은 문장으로 적기 위한 한 줄 */
export const FREE_PERIOD_NOTE =
  "지금은 링크 발행과 모든 기능이 무료입니다";

/** 이 문서가 유료 기능까지 열려 있는지 */
export function unlocked(plan: string | null | undefined): boolean {
  return FREE_PERIOD || plan === "premium";
}

/** 링크가 얼마나 열려 있는지 — 발행 화면이 그대로 씁니다 */
export function linkLifetimeNote(): string {
  return FREE_PERIOD
    ? "무료 기간이라 기한을 걸지 않았습니다 — 행사가 끝날 때까지 열려 있습니다."
    : `무료 발행은 ${FREE_LINK_DAYS}일 동안 열려 있습니다.`;
}

/**
 * 값. 문서 하나에 한 번 결제하면 끝이고, 매달 빠져나가는 구독은 없습니다.
 *
 * 청첩장이 초대장보다 비싼 것은 만드는 데 드는 품이 아니라 «쓰는 기간»
 * 때문입니다. 청첩장은 몇 달 전부터 돌리고 예식 뒤에도 열려 있어야 하며
 * 사진이 수십 장 올라갑니다. 초대장은 며칠 안에 끝나는 카드 한 장입니다.
 */
export const PRICES: Record<ProductKind, number> = {
  wedding: 14_900,
  occasion: 5_900,
  /**
   * 인쇄물은 링크가 아니라 «파일» 을 파는 상품입니다.
   *
   * 그래서 기한이 없습니다 — 한 번 결제한 인쇄물은 몇 년 뒤에 다시 열어
   * 다시 내려받아도 같은 파일이 나옵니다. 값이 초대장보다 싼 것은 저장
   * 비용이 거의 들지 않기 때문입니다. 하객 수백 명이 여는 링크와 달리
   * 인쇄물은 만든 사람 혼자 한 번 받아 갑니다.
   */
  print: 4_900,
};

/**
 * AI 크레딧 묶음.
 *
 * 크레딧은 문서에 붙지 않고 계정에 붙습니다. 그래서 주문에 doc_id 가
 * 없고, 결제가 끝나면 ai_credits 에 숫자를 더합니다.
 * 값은 데이터베이스의 credit_price() 에도 같은 숫자가 있고 그쪽이 «진짜»
 * 입니다 — 브라우저에서 온 금액은 승인 전에 그 값과 대조합니다.
 */
export interface CreditPack {
  id: string;
  credits: number;
  price: number;
  note: string;
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: "credits-50", credits: 50, price: 3_900, note: "문구 50번 또는 그림 10장" },
  { id: "credits-150", credits: 150, price: 9_900, note: "그림 30장 — 가장 많이 고릅니다" },
  { id: "credits-400", credits: 400, price: 19_900, note: "그림 80장" },
];

export function findCreditPack(id: string): CreditPack | undefined {
  return CREDIT_PACKS.find((p) => p.id === id);
}

/** @deprecated 상품별 값을 쓰세요. 남겨 둔 것은 예전 화면 때문입니다. */
export const PREMIUM_PRICE = PRICES.wedding;

/** 무료로 발행한 링크가 살아 있는 기간(일) */
export const FREE_LINK_DAYS = 7;

/** 결제한 문서를 행사 이후로도 열어 두는 기간(일) */
export const PAID_GRACE_DAYS = 30;

/** 무료로 올릴 수 있는 갤러리 사진 장수 */
export const FREE_GALLERY_PHOTOS = 10;

export function formatPrice(won: number): string {
  return `${won.toLocaleString("ko-KR")}원`;
}

export function priceOf(kind: ProductKind): number {
  return PRICES[kind];
}

/**
 * 무료 링크의 만료 시각.
 *
 * 발행 시점부터 재는 이유는, 예식이 한참 남았을 때 미리 만들어 두는 사람이
 * 많기 때문입니다. 예식일 기준으로 재면 그런 사람에게는 기한이 사실상
 * 없는 것이나 마찬가지가 됩니다.
 *
 * 실제 판정은 데이터베이스(compute_expiry)가 합니다. 여기 있는 것은 화면에
 * «며칠 남았습니다» 를 보여 주기 위한 같은 셈입니다.
 */
export function freeLinkExpiry(publishedAt: Date): Date {
  const at = new Date(publishedAt);
  at.setDate(at.getDate() + FREE_LINK_DAYS);
  return at;
}

/** 결제한 문서의 만료 시각 — 행사일에서 유예 기간만큼 더 둡니다. */
export function paidLinkExpiry(eventDate: Date): Date {
  const at = new Date(eventDate);
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
  if (FREE_PERIOD) return false;
  return PREMIUM_SECTIONS.includes(key);
}

/** 섹션 밖의 유료 기능들 */
export const PREMIUM_EXTRAS = {
  /** 갤러리 사진 장수 — 무료는 여기까지 */
  freeGalleryPhotos: FREE_GALLERY_PHOTOS,
  /** 오프닝 애니메이션·화면 효과·배경음악 */
  decoration: true,
} as const;

/** 이 문서에 올릴 수 있는 갤러리 사진 장수 */
export function galleryLimit(plan: string | null | undefined): number {
  return unlocked(plan) ? 60 : FREE_GALLERY_PHOTOS;
}

/* ------------------------------------------------------------
   안내 문구 — 요금 페이지와 홈이 같은 목록을 씁니다
   ------------------------------------------------------------ */

export interface PlanSpec {
  id: PlanId;
  kind: ProductKind;
  name: string;
  price: string;
  tagline: string;
  features: string[];
}

const FREE_COMMON = [
  "디자인 전체 · 무제한 수정",
  "카카오톡 링크 공유 · QR 코드",
  `링크 유지 ${FREE_LINK_DAYS}일 · 하단 Cardly 표기`,
];

export const WEDDING_PLANS: PlanSpec[] = [
  {
    id: "free",
    kind: "wedding",
    name: "무료",
    price: "0원",
    tagline: `링크를 만들어 바로 보내 보실 수 있습니다. ${FREE_LINK_DAYS}일 뒤에 링크가 닫힙니다.`,
    features: [
      ...FREE_COMMON,
      "인사말 · 예식 정보 · 오시는 길",
      "마음 전하실 곳(계좌)",
      `갤러리 사진 ${FREE_GALLERY_PHOTOS}장`,
    ],
  },
  {
    id: "premium",
    kind: "wedding",
    name: "프리미엄",
    price: formatPrice(PRICES.wedding),
    tagline: "청첩장을 돌리기 전에 한 번만 결제하면 끝입니다.",
    features: [
      "무료의 모든 기능",
      `링크 유지 — 예식일 +${PAID_GRACE_DAYS}일까지`,
      "하단 Cardly 표기 제거",
      "참석 여부 집계",
      "방명록",
      "갤러리 사진 무제한",
      "미니앨범 · 타임라인 · 두 사람 이야기 · 영상",
      "오프닝 애니메이션 · 화면 효과 · 배경음악",
      "하객 스냅 모으기 (준비 중)",
    ],
  },
];

export const OCCASION_PLANS: PlanSpec[] = [
  {
    id: "free",
    kind: "occasion",
    name: "무료",
    price: "0원",
    tagline: `카드를 만들어 바로 보내 보실 수 있습니다. ${FREE_LINK_DAYS}일 뒤에 링크가 닫힙니다.`,
    features: [...FREE_COMMON, "네 면 전부 편집", "길 찾기 · 전화 단추"],
  },
  {
    id: "premium",
    kind: "occasion",
    name: "프리미엄",
    price: formatPrice(PRICES.occasion),
    tagline: "초대장 한 장에 한 번만 결제합니다.",
    features: [
      "무료의 모든 기능",
      `링크 유지 — 행사일 +${PAID_GRACE_DAYS}일까지`,
      "하단 Cardly 표기 제거",
      "참석 여부 집계",
      "방명록",
    ],
  },
];

/**
 * 인쇄물 요금표.
 *
 * 다른 둘과 «무엇이 유료인가» 가 다릅니다. 청첩장은 링크의 기한과 기능을
 * 팔지만 인쇄물은 파일 하나를 팝니다. 그래서 무료에서 막는 것이 기능이
 * 아니라 «결과물에 찍히는 표시» 하나뿐입니다 — 편집도 내보내기도 다 됩니다.
 */
export const PRINT_PLANS: PlanSpec[] = [
  {
    id: "free",
    kind: "print",
    name: "무료",
    price: "0원",
    tagline: "만들어 보고, 뽑아 보고, 사장님께 보여 드리는 데까지는 값이 없습니다.",
    features: [
      "템플릿 48종 전부 · 무제한 수정",
      "PDF(벡터) · PNG · JPG 내보내기",
      "실제 mm 규격 · 재단 여백 · 재단 표시",
      "결과물에 «Cardly 미리보기» 표시가 옅게 깔립니다",
      "AI 체험 크레딧 20개",
    ],
  },
  {
    id: "premium",
    kind: "print",
    name: "원본",
    price: formatPrice(PRICES.print),
    tagline: "인쇄물 하나에 한 번. 기한이 없어 몇 년 뒤에 다시 받아도 같은 파일입니다.",
    features: [
      "무료의 모든 기능",
      "«Cardly 미리보기» 표시 없는 원본",
      "인쇄소에 그대로 넘길 수 있는 벡터 PDF",
      "기한 없음 · 다시 내려받기",
      "글꼴 여섯 벌을 파일 안에 심어 드립니다",
    ],
  },
];

/** 예전 화면이 쓰던 이름 — 청첩장 요금표를 가리킵니다 */
export const PLANS = WEDDING_PLANS;

export function plansOf(kind: ProductKind): PlanSpec[] {
  if (kind === "wedding") return WEDDING_PLANS;
  if (kind === "print") return PRINT_PLANS;
  return OCCASION_PLANS;
}
