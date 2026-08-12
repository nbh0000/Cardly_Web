/**
 * 명함 템플릿 — 장식 8종 × 색 팔레트 6종 = 48종.
 *
 * 명함은 90 × 50 mm 실제 크기로 렌더하고, 화면에서만 scale() 로 줄여
 * 보여줍니다. 그래서 저장한 PNG 는 인쇄 규격 그대로 나옵니다.
 */

export type CardDecoId =
  | "bar"
  | "band"
  | "frame"
  | "arc"
  | "panel"
  | "diagonal"
  | "rules"
  | "corner";

export type CardPaper =
  | "matte"
  | "cotton"
  | "kraft"
  | "linen"
  | "pearl"
  | "metal";

export type CardCorner = "soft" | "round" | "square";

/** 캔버스 위 요소 한 개 */
export type CardItem = {
  id: string;
  /** company | name | role | detail | logo | text | line | dot | square | image */
  type: string;
  text: string;
  /** 카드 폭 대비 좌측 위치(%) */
  x: number;
  /** 카드 높이 대비 상단 위치(%) */
  y: number;
  /** 기준 크기 대비 배율(%) */
  size: number;
  side: "front" | "back";
  align?: "left" | "center";
  color?: string;
  src?: string;
};

type Placement = {
  company: [number, number];
  name: [number, number];
  role: [number, number];
  contacts: [[number, number], [number, number], [number, number]];
  align: "left" | "center";
};

/** 장식마다 글이 겹치지 않도록 배치를 따로 잡아 둡니다. */
const PLACEMENTS: Record<CardDecoId, Placement> = {
  bar: {
    company: [9, 22],
    name: [9, 38],
    role: [9, 57],
    contacts: [
      [9, 74],
      [9, 84],
      [50, 84],
    ],
    align: "left",
  },
  band: {
    company: [16, 20],
    name: [16, 36],
    role: [16, 55],
    contacts: [
      [16, 72],
      [16, 82],
      [55, 82],
    ],
    align: "left",
  },
  frame: {
    company: [13, 19],
    name: [13, 36],
    role: [13, 55],
    contacts: [
      [13, 71],
      [13, 80],
      [52, 80],
    ],
    align: "left",
  },
  arc: {
    company: [9, 24],
    name: [9, 42],
    role: [9, 61],
    contacts: [
      [9, 76],
      [9, 85],
      [48, 85],
    ],
    align: "left",
  },
  panel: {
    company: [9, 15],
    name: [9, 31],
    role: [9, 50],
    contacts: [
      [9, 71],
      [37, 71],
      [65, 71],
    ],
    align: "left",
  },
  diagonal: {
    company: [33, 20],
    name: [33, 37],
    role: [33, 56],
    contacts: [
      [33, 73],
      [33, 83],
      [66, 83],
    ],
    align: "left",
  },
  rules: {
    company: [50, 22],
    name: [50, 39],
    role: [50, 58],
    contacts: [
      [24, 75],
      [50, 75],
      [76, 75],
    ],
    align: "center",
  },
  corner: {
    company: [50, 26],
    name: [50, 43],
    role: [50, 61],
    contacts: [
      [24, 78],
      [50, 78],
      [76, 78],
    ],
    align: "center",
  },
};

const DECOS: { id: CardDecoId; label: string; paper: CardPaper; corner: CardCorner }[] =
  [
    { id: "bar", label: "탑바", paper: "matte", corner: "soft" },
    { id: "band", label: "사이드밴드", paper: "cotton", corner: "square" },
    { id: "frame", label: "프레임", paper: "linen", corner: "soft" },
    { id: "arc", label: "아크", paper: "pearl", corner: "round" },
    { id: "panel", label: "패널", paper: "matte", corner: "soft" },
    { id: "diagonal", label: "다이애그널", paper: "metal", corner: "square" },
    { id: "rules", label: "괘선", paper: "cotton", corner: "soft" },
    { id: "corner", label: "코너", paper: "kraft", corner: "square" },
  ];

const PALETTES = [
  { key: "ivory", label: "아이보리", bg: "#fdfbf7", text: "#2e2a27", accent: "#8a6558" },
  { key: "white", label: "화이트", bg: "#ffffff", text: "#1c1a18", accent: "#22364f" },
  { key: "sand", label: "샌드", bg: "#f2ece1", text: "#2b2721", accent: "#a8763c" },
  { key: "mist", label: "미스트", bg: "#eef1f6", text: "#1d2b3d", accent: "#35507a" },
  { key: "charcoal", label: "차콜", bg: "#1f2124", text: "#f2f0ec", accent: "#c8a96a" },
  { key: "forest", label: "포레스트", bg: "#14231d", text: "#e8efea", accent: "#8fb9a3" },
];

export type CardTemplate = {
  id: string;
  name: string;
  deco: CardDecoId;
  paper: CardPaper;
  corner: CardCorner;
  bg: string;
  text: string;
  accent: string;
  placement: Placement;
};

export const CARD_TEMPLATES: CardTemplate[] = DECOS.flatMap((deco) =>
  PALETTES.map((palette) => ({
    id: `${deco.id}-${palette.key}`,
    name: `${palette.label} ${deco.label}`,
    deco: deco.id,
    paper: deco.paper,
    corner: deco.corner,
    bg: palette.bg,
    text: palette.text,
    accent: palette.accent,
    placement: PLACEMENTS[deco.id],
  })),
);

export const DEFAULT_CARD_TEMPLATE = CARD_TEMPLATES[0];

export const PAPER_LABEL: [CardPaper, string][] = [
  ["matte", "매트"],
  ["cotton", "코튼"],
  ["kraft", "크라프트"],
  ["linen", "리넨"],
  ["pearl", "펄"],
  ["metal", "메탈"],
];

export const CORNER_LABEL: [CardCorner, string][] = [
  ["soft", "약한 라운드"],
  ["round", "둥근 모서리"],
  ["square", "직각"],
];

/** 추가할 수 있는 요소 */
export const ADDABLE: [string, string, string][] = [
  ["text", "텍스트", "새 텍스트"],
  ["detail", "연락처", "010-0000-0000"],
  ["logo", "로고 텍스트", "LOGO"],
  ["line", "구분선", ""],
  ["dot", "원", ""],
  ["square", "사각형", ""],
];

/** 도형은 텍스트를 편집하지 않습니다. */
export const SHAPE_TYPES = ["line", "dot", "square", "image"];

export const SAMPLE_ITEMS: CardItem[] = [
  { id: "company", type: "company", text: "MY STUDIO", x: 9, y: 22, size: 100, side: "front" },
  { id: "name", type: "name", text: "김민준", x: 9, y: 38, size: 100, side: "front" },
  { id: "role", type: "role", text: "Product Designer", x: 9, y: 57, size: 100, side: "front" },
  { id: "email", type: "detail", text: "hello@example.com", x: 9, y: 74, size: 100, side: "front" },
  { id: "phone", type: "detail", text: "010 1234 5678", x: 9, y: 84, size: 100, side: "front" },
  { id: "website", type: "detail", text: "example.com", x: 50, y: 84, size: 100, side: "front" },
  { id: "back-logo", type: "logo", text: "MY STUDIO", x: 50, y: 40, size: 100, side: "back", align: "center" },
  { id: "back-web", type: "detail", text: "example.com", x: 50, y: 58, size: 100, side: "back", align: "center" },
];
