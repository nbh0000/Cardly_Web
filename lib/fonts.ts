/**
 * 글꼴 목록 — 청첩장·이력서·명함 편집기가 함께 씁니다.
 *
 * 여기 실린 글꼴은 모두 구글 폰트로 배포되는 SIL 오픈 폰트 라이선스(OFL) 글꼴이라
 * 상업적 이용이 무료입니다. 새 글꼴을 들일 때도 이 조건을 지키세요.
 * 실제 파일을 내려받아 자체 호스팅하는 쪽은 `app/fonts.ts` 이고,
 * 이 파일은 CSS 변수 이름만 알고 있는 순수 데이터입니다.
 * (편집기는 클라이언트 컴포넌트라 next/font 를 직접 끌어오지 않도록 나눠 두었습니다.)
 */

export type FontId =
  /* 고딕 */
  | "sans"
  | "nanum-gothic"
  | "gothic-a1"
  | "gowun-dodum"
  /* 명조 */
  | "serif"
  | "nanum-myeongjo"
  | "gowun-batang"
  | "hahmlet"
  /* 손글씨 */
  | "nanum-pen"
  | "nanum-brush"
  | "gaegu"
  | "hi-melody"
  /* 장식 */
  | "diphylleia"
  | "jua"
  | "do-hyeon"
  | "black-han-sans"
  | "kirang-haerang";

export type FontGroup = "고딕" | "명조" | "손글씨" | "장식";

/** 글꼴을 고를 수 있는 편집기 */
export type FontSurface = "invitation" | "resume" | "card";

export interface FontFamily {
  id: FontId;
  /** 편집기에 보이는 이름 */
  label: string;
  group: FontGroup;
  /** inline style 에 그대로 넣는 font-family 값 */
  stack: string;
  /** 어느 편집기에서 고를 수 있는지 — 이력서에는 장식 글꼴을 내보내지 않습니다. */
  surfaces: FontSurface[];
  /**
   * 인쇄용 HTML 처럼 웹폰트를 실을 수 없는 문서에서 쓰는 대체 글꼴.
   * 자체 호스팅한 파일이 닿지 않으므로 운영체제 기본 글꼴로만 씁니다.
   */
  print: string;
}

/* 인쇄 문서에서 쓰는 대체 글꼴 세 갈래 — 웹폰트 없이 인상만 맞춥니다. */
const PRINT_SANS = '"Malgun Gothic","맑은 고딕","Apple SD Gothic Neo",Arial,sans-serif';
const PRINT_SERIF = '"Batang","바탕","AppleMyungjo",Georgia,serif';
const PRINT_HAND = '"Gungsuh","궁서","Apple SD Gothic Neo",cursive';

/** 한글 글자가 빠진 글꼴을 만났을 때 받쳐 주는 본문 글꼴 */
const KO_SANS = 'var(--font-noto-sans-kr),"Malgun Gothic",sans-serif';
const KO_SERIF = 'var(--font-noto-serif-kr),"Batang",serif';

const ALL: FontSurface[] = ["invitation", "resume", "card"];
const DRESSY: FontSurface[] = ["invitation", "card"];

export const FONT_FAMILIES: FontFamily[] = [
  /* ---------- 고딕 ---------- */
  {
    id: "sans",
    label: "본고딕",
    group: "고딕",
    stack: "var(--font-sans)",
    surfaces: ALL,
    print: PRINT_SANS,
  },
  {
    id: "nanum-gothic",
    label: "나눔고딕",
    group: "고딕",
    stack: `var(--f-nanum-gothic),"Nanum Gothic",${KO_SANS}`,
    surfaces: ALL,
    print: PRINT_SANS,
  },
  {
    id: "gothic-a1",
    label: "고딕 A1",
    group: "고딕",
    stack: `var(--f-gothic-a1),${KO_SANS}`,
    surfaces: ALL,
    print: PRINT_SANS,
  },
  {
    id: "gowun-dodum",
    label: "고운돋움",
    group: "고딕",
    stack: `var(--f-gowun-dodum),${KO_SANS}`,
    surfaces: ALL,
    print: PRINT_SANS,
  },

  /* ---------- 명조 ---------- */
  {
    id: "serif",
    label: "본명조",
    group: "명조",
    stack: "var(--font-serif)",
    surfaces: ALL,
    print: PRINT_SERIF,
  },
  {
    id: "nanum-myeongjo",
    label: "나눔명조",
    group: "명조",
    stack: `var(--f-nanum-myeongjo),"Nanum Myeongjo",${KO_SERIF}`,
    surfaces: ALL,
    print: PRINT_SERIF,
  },
  {
    id: "gowun-batang",
    label: "고운바탕",
    group: "명조",
    stack: `var(--f-gowun-batang),${KO_SERIF}`,
    surfaces: ALL,
    print: PRINT_SERIF,
  },
  {
    id: "hahmlet",
    label: "함렛",
    group: "명조",
    stack: `var(--f-hahmlet),${KO_SERIF}`,
    surfaces: ALL,
    print: PRINT_SERIF,
  },

  /* ---------- 손글씨 ---------- */
  {
    id: "nanum-pen",
    label: "나눔손글씨 펜",
    group: "손글씨",
    stack: `var(--f-nanum-pen),${KO_SANS}`,
    surfaces: ["invitation"],
    print: PRINT_HAND,
  },
  {
    id: "nanum-brush",
    label: "나눔손글씨 붓",
    group: "손글씨",
    stack: `var(--f-nanum-brush),${KO_SERIF}`,
    surfaces: DRESSY,
    print: PRINT_HAND,
  },
  {
    id: "gaegu",
    label: "개구",
    group: "손글씨",
    stack: `var(--f-gaegu),${KO_SANS}`,
    surfaces: ["invitation"],
    print: PRINT_HAND,
  },
  {
    id: "hi-melody",
    label: "하이멜로디",
    group: "손글씨",
    stack: `var(--f-hi-melody),${KO_SANS}`,
    surfaces: ["invitation"],
    print: PRINT_HAND,
  },

  /* ---------- 장식 ---------- */
  {
    id: "diphylleia",
    label: "디필레이아",
    group: "장식",
    stack: `var(--f-diphylleia),${KO_SERIF}`,
    surfaces: DRESSY,
    print: PRINT_SERIF,
  },
  {
    id: "jua",
    label: "주아",
    group: "장식",
    stack: `var(--f-jua),${KO_SANS}`,
    surfaces: DRESSY,
    print: PRINT_SANS,
  },
  {
    id: "do-hyeon",
    label: "도현",
    group: "장식",
    stack: `var(--f-do-hyeon),${KO_SANS}`,
    surfaces: DRESSY,
    print: PRINT_SANS,
  },
  {
    id: "black-han-sans",
    label: "검은고딕",
    group: "장식",
    stack: `var(--f-black-han-sans),${KO_SANS}`,
    surfaces: DRESSY,
    print: PRINT_SANS,
  },
  {
    id: "kirang-haerang",
    label: "기랑해랑",
    group: "장식",
    stack: `var(--f-kirang-haerang),${KO_SERIF}`,
    surfaces: DRESSY,
    print: PRINT_SERIF,
  },
];

const BY_ID = new Map(FONT_FAMILIES.map((f) => [f.id, f]));

/** 지워진 글꼴이 저장된 초안에 남아 있어도 화면이 깨지지 않도록 본고딕으로 되돌립니다. */
export const FALLBACK_FONT = FONT_FAMILIES[0]!;

export function fontFamily(id: string | undefined): FontFamily {
  return (id && BY_ID.get(id as FontId)) || FALLBACK_FONT;
}

/** inline style 에 넣을 font-family 값 */
export function fontStack(id: string | undefined): string {
  return fontFamily(id).stack;
}

export function isFontId(id: string): id is FontId {
  return BY_ID.has(id as FontId);
}

/**
 * 브라우저에 저장된 옛 초안은 글꼴을 CSS 값(`var(--font-serif), serif`)째로
 * 담고 있습니다. 그런 초안도 새 목록의 글꼴로 알아듣게 옮겨 줍니다.
 */
export function toFontId(saved: string | undefined): FontId {
  if (!saved) return FALLBACK_FONT.id;
  if (isFontId(saved)) return saved;
  return saved.includes("--font-serif") ? "serif" : FALLBACK_FONT.id;
}

export function fontsFor(surface: FontSurface): FontFamily[] {
  return FONT_FAMILIES.filter((f) => f.surfaces.includes(surface));
}

/** 편집기 목록을 분류별로 묶습니다. 빈 분류는 내보내지 않습니다. */
export function fontGroupsFor(
  surface: FontSurface,
): { group: FontGroup; fonts: FontFamily[] }[] {
  const order: FontGroup[] = ["고딕", "명조", "손글씨", "장식"];
  return order
    .map((group) => ({
      group,
      fonts: fontsFor(surface).filter((f) => f.group === group),
    }))
    .filter((g) => g.fonts.length > 0);
}
