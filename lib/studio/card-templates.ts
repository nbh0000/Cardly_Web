/**
 * 명함 템플릿 — 아트 100종 + 심플 50종 + 장식 48종.
 *
 * 아트와 심플은 예전 Cardly(nbh0000/Website_Cardly)의 `src/main.jsx` 에 있던
 * 것을 그대로 되살린 것입니다. 특히 아트 100종은 실제 명함 배경 사진을
 * 아틀라스 한 장에 스무 칸씩 담아 쓰는데, CSS 로 그린 도형과 달리 종이 질감과
 * 인쇄 후가공까지 담고 있어 이 도구의 인상을 만드는 핵심입니다.
 *
 * 명함은 90 × 50 mm 실제 크기로 렌더하고, 화면에서만 scale() 로 줄여
 * 보여줍니다. 그래서 저장한 PNG 는 인쇄 규격 그대로 나옵니다.
 */

export type CardKind = "art" | "simple" | "deco";

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

/** [x(%), y(%), 글자 크기(%)] — 크기를 적지 않은 자리는 100 으로 봅니다. */
export type Slot = [number, number, number?];

export type Placement = {
  company: Slot;
  name: Slot;
  role: Slot;
  contacts: [Slot, Slot, Slot];
  align: "left" | "center";
};

/**
 * 글자 배치 원형 20가지.
 *
 * 배경마다 비어 있는 자리가 다르기 때문에, 이름과 연락처를 어디에 앉힐지가
 * 배경 그림만큼 중요합니다. 예전 Cardly 가 쓰던 좌표를 그대로 옮겨 왔습니다.
 */
const ARCHETYPES: Placement[] = [
  { company: [7, 10, 90], name: [7, 43, 145], role: [7, 61, 92], contacts: [[7, 82], [39, 82], [71, 82]], align: "left" },
  { company: [62, 11, 82], name: [8, 34, 155], role: [9, 55, 90], contacts: [[9, 76], [9, 84], [63, 84]], align: "left" },
  { company: [8, 12, 88], name: [50, 38, 145], role: [50, 57, 88], contacts: [[8, 80], [40, 80], [70, 80]], align: "center" },
  { company: [72, 12, 84], name: [8, 66, 150], role: [8, 83, 86], contacts: [[58, 65], [58, 75], [58, 85]], align: "left" },
  { company: [8, 45, 86], name: [37, 24, 150], role: [38, 43, 90], contacts: [[38, 67], [38, 77], [68, 77]], align: "left" },
  { company: [42, 10, 90], name: [42, 39, 148], role: [42, 57, 88], contacts: [[42, 76], [42, 84], [70, 84]], align: "left" },
  { company: [8, 12, 90], name: [8, 30, 168], role: [9, 52, 92], contacts: [[9, 74], [9, 83], [62, 83]], align: "left" },
  { company: [50, 13, 92], name: [50, 42, 150], role: [50, 60, 88], contacts: [[18, 82], [50, 82], [76, 82]], align: "center" },
  { company: [73, 75, 84], name: [8, 18, 150], role: [8, 37, 90], contacts: [[8, 66], [8, 76], [8, 86]], align: "left" },
  { company: [8, 10, 86], name: [8, 70, 145], role: [8, 86, 84], contacts: [[58, 17], [58, 27], [58, 37]], align: "left" },
  { company: [46, 14, 88], name: [46, 45, 158], role: [46, 64, 88], contacts: [[8, 79], [38, 79], [69, 79]], align: "left" },
  { company: [8, 82, 86], name: [8, 20, 160], role: [8, 41, 90], contacts: [[55, 60], [55, 71], [55, 82]], align: "left" },
  { company: [68, 12, 82], name: [50, 40, 152], role: [50, 58, 88], contacts: [[14, 80], [46, 80], [74, 80]], align: "center" },
  { company: [10, 16, 88], name: [10, 40, 142], role: [10, 58, 86], contacts: [[61, 39], [61, 51], [61, 63]], align: "left" },
  { company: [44, 84, 84], name: [8, 18, 162], role: [8, 39, 90], contacts: [[8, 70], [39, 70], [69, 70]], align: "left" },
  { company: [8, 11, 86], name: [33, 37, 150], role: [33, 56, 88], contacts: [[33, 76], [58, 76], [58, 85]], align: "left" },
  { company: [50, 12, 90], name: [50, 35, 160], role: [50, 55, 90], contacts: [[50, 72], [50, 80], [50, 88]], align: "center" },
  { company: [75, 12, 82], name: [8, 47, 154], role: [8, 66, 88], contacts: [[8, 83], [39, 83], [69, 83]], align: "left" },
  { company: [8, 13, 88], name: [57, 26, 148], role: [57, 45, 86], contacts: [[57, 65], [57, 75], [57, 85]], align: "left" },
  { company: [8, 78, 84], name: [8, 25, 148], role: [8, 44, 88], contacts: [[50, 25], [50, 36], [50, 47]], align: "left" },
];

/** 배경 그림 한 칸 — 아틀라스에서 잘라 쓸 자리 */
export type CardArt = {
  url: string;
  /** background-position. 아틀라스는 4열 × 5행이라 background-size 는 400% 500% */
  position: string;
};

export type CardTemplate = {
  id: string;
  name: string;
  kind: CardKind;
  /** 목록에서 묶어 보여 줄 갈래 */
  group: string;
  paper: CardPaper;
  corner: CardCorner;
  bg: string;
  text: string;
  accent: string;
  placement: Placement;
  /** 아트 — 배경 사진 */
  art?: CardArt;
  /** 심플 — CSS 로 그린 배경 */
  surface?: string;
  /** 장식 — CSS 도형 레이어 */
  deco?: CardDecoId;
};

/* ------------------------------------------------------------
   아트 100종
   ------------------------------------------------------------ */

/** 아틀라스 다섯 장의 성격. 이름과 포인트색을 여기서 정합니다. */
const ATLASES: { group: string; accent: string }[] = [
  { group: "럭셔리", accent: "#c8a96a" },
  { group: "팝", accent: "#e05a72" },
  { group: "내추럴", accent: "#5f7a5a" },
  { group: "테크", accent: "#4d8ff0" },
  { group: "뉴트럴", accent: "#8a6558" },
];

/**
 * 글자를 흰색으로 깔아야 하는 칸.
 *
 * 배경이 어두운 칸에 검은 글자를 얹으면 읽히지 않습니다. 예전 Cardly 는
 * 아틀라스 4번 전체와 1번의 일부만 어둡다고 보고 있었는데, 실제 그림을 한 칸씩
 * 확인해 보면 맞지 않는 자리가 있어 다시 재어 적었습니다.
 * 칸 번호는 4열 × 5행을 왼쪽 위부터 가로로 센 0-19 입니다.
 */
const DARK_CELLS: number[][] = [
  [1, 2, 3, 5, 8, 10, 14, 15, 16, 18, 19],
  [2, 12, 16],
  [5, 10, 18],
  [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19],
  [1, 7, 10, 11, 16],
];

const ART_TEMPLATES: CardTemplate[] = Array.from({ length: 100 }, (_, i) => {
  const atlas = Math.floor(i / 20);
  const cell = i % 20;
  const column = cell % 4;
  const row = Math.floor(cell / 4);
  const dark = DARK_CELLS[atlas]!.includes(cell);
  const { group, accent } = ATLASES[atlas]!;
  return {
    id: `art-${i + 1}`,
    name: `${group} ${String(cell + 1).padStart(2, "0")}`,
    kind: "art" as const,
    group,
    // 배경이 사진이라 종이 질감을 덧씌우지 않습니다.
    paper: "matte" as const,
    corner: "soft" as const,
    bg: dark ? "#171724" : "#f6f3ec",
    text: dark ? "#f8f5ed" : "#171724",
    accent,
    placement: ARCHETYPES[i % ARCHETYPES.length]!,
    art: {
      url: `card-atlas-clean-${atlas + 1}.png`,
      position: `${(column * 100) / 3}% ${row * 25}%`,
    },
  };
});

/* ------------------------------------------------------------
   심플 50종
   ------------------------------------------------------------ */

const SIMPLE_PALETTES: [string, string][] = [
  ["#ffffff", "#17233b"],
  ["#f8f6f1", "#262626"],
  ["#f4f5f7", "#31516f"],
  ["#fffaf2", "#a67b52"],
  ["#f3f5f0", "#61705b"],
  ["#17191d", "#d7b46a"],
  ["#10243d", "#dbe7f5"],
  ["#f7f1ec", "#a96253"],
  ["#fbfbfa", "#777b82"],
  ["#182b26", "#b7c9b9"],
];

const SIMPLE_PAPERS: CardPaper[] = [
  "matte",
  "cotton",
  "linen",
  "pearl",
  "kraft",
];

const SIMPLE_TEMPLATES: CardTemplate[] = Array.from({ length: 50 }, (_, i) => {
  const [bg, accent] = SIMPLE_PALETTES[i % SIMPLE_PALETTES.length]!;
  const family = i % 5;
  const position = 5 + ((i * 13) % 82);
  const thickness = 1 + (i % 3);
  // 선 한 줄을 어디에 긋느냐로만 나누는, 가장 절제된 갈래입니다.
  const backgrounds = [
    `linear-gradient(90deg, ${accent} 0 ${thickness}%, transparent ${thickness}%)`,
    `linear-gradient(180deg, transparent 0 ${position}%, ${accent} ${position}% ${position + thickness}%, transparent ${position + thickness}%)`,
    `linear-gradient(135deg, ${accent} 0 9%, transparent 9% 91%, ${accent} 91%)`,
    `linear-gradient(90deg, transparent 0 72%, ${accent} 72% 74%, transparent 74%), linear-gradient(180deg, ${accent} 0 2%, transparent 2%)`,
    `linear-gradient(180deg, transparent 0 88%, ${accent} 88% 100%), linear-gradient(90deg, ${accent} 0 18%, transparent 18%)`,
  ];
  // 바탕이 어두운 팔레트(5, 6, 9번)에서는 글자를 밝게 깝니다.
  const dark = [5, 6, 9].includes(i % 10);
  return {
    id: `simple-${i + 1}`,
    name: `심플 ${String(i + 1).padStart(2, "0")}`,
    kind: "simple" as const,
    group: "심플",
    paper: SIMPLE_PAPERS[i % SIMPLE_PAPERS.length]!,
    corner: (["soft", "square", "round"] as const)[i % 3]!,
    bg,
    text: dark ? "#f8f7f2" : "#171724",
    accent,
    placement: ARCHETYPES[i % ARCHETYPES.length]!,
    surface: `${backgrounds[family]}, ${bg}`,
  };
});

/* ------------------------------------------------------------
   장식 48종 — CSS 도형으로만 그리는 갈래
   ------------------------------------------------------------ */

/** 장식마다 글이 겹치지 않도록 배치를 따로 잡아 둡니다. */
const DECO_PLACEMENTS: Record<CardDecoId, Placement> = {
  bar: { company: [9, 22], name: [9, 38], role: [9, 57], contacts: [[9, 74], [9, 84], [50, 84]], align: "left" },
  band: { company: [16, 20], name: [16, 36], role: [16, 55], contacts: [[16, 72], [16, 82], [55, 82]], align: "left" },
  frame: { company: [13, 19], name: [13, 36], role: [13, 55], contacts: [[13, 71], [13, 80], [52, 80]], align: "left" },
  arc: { company: [9, 24], name: [9, 42], role: [9, 61], contacts: [[9, 76], [9, 85], [48, 85]], align: "left" },
  panel: { company: [9, 15], name: [9, 31], role: [9, 50], contacts: [[9, 71], [37, 71], [65, 71]], align: "left" },
  diagonal: { company: [33, 20], name: [33, 37], role: [33, 56], contacts: [[33, 73], [33, 83], [66, 83]], align: "left" },
  rules: { company: [50, 22], name: [50, 39], role: [50, 58], contacts: [[24, 75], [50, 75], [76, 75]], align: "center" },
  corner: { company: [50, 26], name: [50, 43], role: [50, 61], contacts: [[24, 78], [50, 78], [76, 78]], align: "center" },
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

const DECO_PALETTES = [
  { key: "ivory", label: "아이보리", bg: "#fdfbf7", text: "#2e2a27", accent: "#8a6558" },
  { key: "white", label: "화이트", bg: "#ffffff", text: "#1c1a18", accent: "#22364f" },
  { key: "sand", label: "샌드", bg: "#f2ece1", text: "#2b2721", accent: "#a8763c" },
  { key: "mist", label: "미스트", bg: "#eef1f6", text: "#1d2b3d", accent: "#35507a" },
  { key: "charcoal", label: "차콜", bg: "#1f2124", text: "#f2f0ec", accent: "#c8a96a" },
  { key: "forest", label: "포레스트", bg: "#14231d", text: "#e8efea", accent: "#8fb9a3" },
];

const DECO_TEMPLATES: CardTemplate[] = DECOS.flatMap((deco) =>
  DECO_PALETTES.map((palette) => ({
    id: `${deco.id}-${palette.key}`,
    name: `${palette.label} ${deco.label}`,
    kind: "deco" as const,
    group: "장식",
    deco: deco.id,
    paper: deco.paper,
    corner: deco.corner,
    bg: palette.bg,
    text: palette.text,
    accent: palette.accent,
    placement: DECO_PLACEMENTS[deco.id],
  })),
);

/* ------------------------------------------------------------ */

export const CARD_TEMPLATES: CardTemplate[] = [
  ...ART_TEMPLATES,
  ...SIMPLE_TEMPLATES,
  ...DECO_TEMPLATES,
];

/** 목록 위 갈래 고르기 — 아틀라스 다섯 갈래 + 심플 + 장식 */
export const CARD_GROUPS: string[] = [
  ...ATLASES.map((a) => a.group),
  "심플",
  "장식",
];

export const DEFAULT_CARD_TEMPLATE = CARD_TEMPLATES[0]!;

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
  { id: "company", type: "company", text: "MY STUDIO", x: 7, y: 10, size: 90, side: "front" },
  { id: "name", type: "name", text: "김민준", x: 7, y: 43, size: 145, side: "front" },
  { id: "role", type: "role", text: "Product Designer", x: 7, y: 61, size: 92, side: "front" },
  { id: "email", type: "detail", text: "hello@example.com", x: 7, y: 82, size: 100, side: "front" },
  { id: "phone", type: "detail", text: "010 1234 5678", x: 39, y: 82, size: 100, side: "front" },
  { id: "website", type: "detail", text: "example.com", x: 71, y: 82, size: 100, side: "front" },
  { id: "back-logo", type: "logo", text: "MY STUDIO", x: 50, y: 40, size: 100, side: "back", align: "center" },
  { id: "back-web", type: "detail", text: "example.com", x: 50, y: 58, size: 100, side: "back", align: "center" },
];
