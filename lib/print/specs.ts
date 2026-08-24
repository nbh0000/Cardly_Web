/**
 * 인쇄물 규격 — 이 파일 하나가 «무엇을 만들 수 있는가» 를 정합니다.
 *
 * 2차에서 템플릿을 대량으로 만들 때 템플릿은 여기 있는 id 만 가리킵니다.
 * 그래서 규격이 바뀌어도 템플릿을 고칠 일이 없고, 새 규격을 더할 때도
 * 이 배열에 한 줄을 넣으면 편집기·내보내기·안내가 모두 따라옵니다.
 *
 * ── 단위 ──
 * 모든 치수는 mm 입니다. 인쇄소가 mm 로 말하고, 재단도 mm 로 합니다.
 * 화면과 파일에 필요한 픽셀은 dpi 를 곱해 그때그때 만듭니다(pxAt).
 * px 를 원본으로 들고 있으면 dpi 가 바뀔 때마다 값이 어긋납니다.
 *
 * ── 재단 여백(bleed) ──
 * 종이는 정확히 잘리지 않습니다. 그래서 배경을 재단선 밖으로 3mm 더
 * 그려 두고, 잘린 뒤에도 흰 테두리가 남지 않게 합니다. 반대로 글자는
 * 재단선 안쪽 3mm(안전선) 안에 두어야 잘리지 않습니다.
 */

export type PrintCategoryId =
  | "flyer"
  | "coupon"
  | "poster"
  | "banner"
  | "standing-banner"
  | "menu";

export interface PrintSize {
  id: string;
  label: string;
  /** 재단 뒤 실제 크기 */
  width: number;
  height: number;
  /** 접는 인쇄물의 칸 수 — 3단 접이식 같은 것 */
  panels?: number;
  /** 이 갈래의 기본값인지 */
  preset?: boolean;
}

export interface PrintCategory {
  id: PrintCategoryId;
  label: string;
  /** 목록에 보이는 한 줄 */
  note: string;
  sizes: PrintSize[];
  /** 앞뒤 양면을 만들 수 있는지 */
  duplex: boolean;
  /** 기본 재단 여백(mm). 0 이면 여백 없이 시작합니다 */
  bleed: number;
  /** 안전선(mm) — 이 안쪽에 글자를 두어야 합니다 */
  safe: number;
  /** 인쇄 해상도. 현수막처럼 멀리서 보는 것은 낮춰도 됩니다 */
  dpi: number;
  /** 절취선 표시를 쓸 수 있는지 */
  perforation?: boolean;
}

/** 300dpi 가 상업 인쇄의 기본입니다. 현수막은 실물이 커서 150 으로 충분합니다. */
const PRINT_DPI = 300;
const LARGE_DPI = 150;

export const PRINT_CATEGORIES: PrintCategory[] = [
  {
    id: "flyer",
    label: "홍보 전단지",
    note: "A4·A5 낱장. 앞뒤로 찍어 돌리는 가장 흔한 인쇄물입니다.",
    sizes: [
      { id: "a4", label: "A4 210 × 297", width: 210, height: 297, preset: true },
      { id: "a5", label: "A5 148 × 210", width: 148, height: 210 },
      { id: "a4-landscape", label: "A4 가로 297 × 210", width: 297, height: 210 },
    ],
    duplex: true,
    bleed: 3,
    safe: 3,
    dpi: PRINT_DPI,
  },
  {
    id: "coupon",
    label: "쿠폰",
    note: "잘라 쓰는 작은 조각. 절취선을 그려 넣을 수 있습니다.",
    sizes: [
      { id: "180x70", label: "180 × 70", width: 180, height: 70, preset: true },
      { id: "100x50", label: "100 × 50", width: 100, height: 50 },
      { id: "90x50", label: "명함 크기 90 × 50", width: 90, height: 50 },
    ],
    duplex: true,
    bleed: 3,
    safe: 3,
    dpi: PRINT_DPI,
    perforation: true,
  },
  {
    id: "poster",
    label: "포스터",
    note: "벽에 붙이는 큰 낱장. 멀리서 읽히는 크기가 중요합니다.",
    sizes: [
      { id: "a3", label: "A3 297 × 420", width: 297, height: 420, preset: true },
      { id: "a2", label: "A2 420 × 594", width: 420, height: 594 },
      { id: "b2", label: "B2 515 × 728", width: 515, height: 728 },
    ],
    duplex: false,
    bleed: 3,
    safe: 5,
    dpi: PRINT_DPI,
  },
  {
    id: "banner",
    label: "현수막",
    note: "건물과 도로에 거는 큰 천. 미터 단위로 만듭니다.",
    sizes: [
      { id: "5000x900", label: "5000 × 900", width: 5000, height: 900, preset: true },
      { id: "4000x700", label: "4000 × 700", width: 4000, height: 700 },
      { id: "3000x600", label: "3000 × 600", width: 3000, height: 600 },
    ],
    duplex: false,
    // 현수막은 재단이 아니라 봉제·고리라 여백을 크게 잡습니다.
    bleed: 30,
    safe: 60,
    dpi: LARGE_DPI,
  },
  {
    id: "standing-banner",
    label: "배너",
    note: "행사장에 세우는 X배너·롤업. 아래쪽은 사람에 가립니다.",
    sizes: [
      { id: "x-600x1800", label: "X배너 600 × 1800", width: 600, height: 1800, preset: true },
      { id: "rollup-850x2000", label: "롤업 850 × 2000", width: 850, height: 2000 },
      { id: "rollup-800x1800", label: "롤업 800 × 1800", width: 800, height: 1800 },
    ],
    duplex: false,
    bleed: 10,
    // 아래 200mm 는 거치대에 가리므로 글자를 두지 않습니다.
    safe: 20,
    dpi: LARGE_DPI,
  },
  {
    id: "menu",
    label: "메뉴판",
    note: "가게에 두는 차림표. 한 장짜리부터 세 번 접는 것까지.",
    sizes: [
      { id: "a4-1col", label: "A4 세로 1단", width: 210, height: 297, preset: true },
      { id: "a3-2col", label: "A3 가로 2단", width: 420, height: 297, panels: 2 },
      { id: "a4-trifold", label: "3단 접이식 (A4 3분할)", width: 297, height: 210, panels: 3 },
    ],
    duplex: true,
    bleed: 3,
    safe: 5,
    dpi: PRINT_DPI,
  },
];

export function findCategory(id: string): PrintCategory | undefined {
  return PRINT_CATEGORIES.find((c) => c.id === id);
}

export function presetSize(category: PrintCategory): PrintSize {
  return category.sizes.find((s) => s.preset) ?? category.sizes[0]!;
}

/* ------------------------------------------------------------
   단위 환산
   ------------------------------------------------------------ */

/** mm → px. 인쇄 파일을 만들 때 씁니다. */
export function pxAt(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi);
}

/** mm → pt(1/72인치). PDF 는 pt 로 말합니다. */
export function mmToPt(mm: number): number {
  return (mm / 25.4) * 72;
}

/**
 * 편집 화면에서 쓰는 배율.
 *
 * 현수막은 5000mm(=300dpi 로 59,000px)입니다. 그 크기로 DOM 을 그리면
 * 브라우저가 버티지 못합니다. 그래서 «편집은 작게, 내보내기는 크게» 로
 * 나눕니다 — 화면에서는 긴 변이 1200px 을 넘지 않도록 줄여 그리고,
 * 저장할 때만 실제 해상도로 다시 그립니다.
 */
export function editorScale(widthMm: number, heightMm: number): number {
  const longest = Math.max(widthMm, heightMm);
  const target = 1200; // 편집 화면에서 다루기 좋은 긴 변(px)
  const raw = target / (longest * 3.7795); // mm → px(96dpi) 근사
  return Math.min(1, Math.max(0.02, raw));
}

/** 저해상도 경고 기준 — 이 값보다 낮으면 인쇄에서 흐려집니다 */
export const MIN_IMAGE_DPI = 150;

/**
 * 이 인쇄물에서 사진이 몇 dpi 는 되어야 하는가.
 *
 * 하나로 정할 수 없습니다. A4 전단지는 손에 쥐고 30cm 앞에서 보지만
 * 현수막은 5m 짜리를 20m 밖에서 봅니다. 실제로 대형 인쇄소도 실물 크기
 * 기준 72~100dpi 면 받아 줍니다. 그래서 «그 인쇄물의 인쇄 해상도 절반» 을
 * 바닥으로 잡되, 72 아래로는 내려가지 않게 했습니다.
 */
export function minImageDpi(dpi: number): number {
  return Math.max(72, Math.round(dpi / 2));
}
