/**
 * 템플릿을 짜는 연장.
 *
 * 마흔여덟 장을 손으로 적으면 같은 말이 마흔여덟 번 반복됩니다. 그렇다고
 * 함수 하나로 찍어 내면 마흔여덟 장이 다 똑같아 보입니다 — 그건 «AI 가
 * 만든 티» 가 가장 잘 나는 지점입니다.
 *
 * 그래서 여기 있는 것은 «판» 이 아니라 «자와 연필» 입니다. 각 템플릿은
 * 자기 짜임을 직접 적고, 이 파일은 되풀이되는 잡일만 맡습니다 — 규격 찾기,
 * 요소 번호 매기기, 그림 주소 잇기, 없는 그림 걸러내기.
 *
 * ── 요소 번호 ──
 * id 를 무작위로 주면 서버에서 그린 것과 브라우저에서 그린 것이 달라지고,
 * 무엇보다 «어느 요소가 문제인가» 를 사람이 말할 수 없게 됩니다. 그래서
 * `<템플릿아이디>-1` 처럼 순서대로 붙입니다.
 */

import { artUrl, artSize } from "@/lib/print/art";
import { fromSpec } from "@/lib/print/doc";
import { findCategory, type PrintCategoryId } from "@/lib/print/specs";
import type {
  ImageElement,
  PrintBackground,
  PrintDoc,
  PrintElement,
  PrintTemplate,
  ShapeElement,
  ShapeKind,
  TextElement,
} from "@/lib/print/types";
import type { IndustryId, PaletteId, StyleId } from "@/lib/print/taxonomy";

/* ------------------------------------------------------------
   색 — 인쇄에서 잘 나오는 잉크만 모아 두었습니다

   화면에서 예쁜 형광 계열은 CMYK 로 넘어가면 탁해집니다. 여기 있는 값은
   전부 한 번 더 눌러 둔 색이라, 모니터에서 본 것과 종이에서 본 것의 차이가
   작습니다. 템플릿은 이 중에서 두세 개만 골라 씁니다.
   ------------------------------------------------------------ */

export const INK = {
  black: "#141414",
  soft: "#3f3f46",
  grey: "#71717a",
  line: "#d4d4d8",
  paper: "#ffffff",
  cream: "#f7f5f0",
  sand: "#efe9df",

  navy: "#16305c",
  blue: "#1d4ed8",
  sky: "#3b82f6",
  teal: "#0f766e",
  green: "#166534",
  olive: "#4d7c0f",

  red: "#b91c1c",
  crimson: "#9f1239",
  orange: "#c2410c",
  amber: "#d97706",
  gold: "#a16207",

  plum: "#6d28d9",
  rose: "#be185d",
  pink: "#f4c9d7",
  mint: "#cfe8e3",
  powder: "#dbe6f5",
} as const;

/* ------------------------------------------------------------
   연필
   ------------------------------------------------------------ */

/**
 * 값이 undefined 인 항목을 걷어냅니다.
 *
 * `{ ...기본값, ...받은값 }` 에서 받은 값이 undefined 이면 기본값을 덮어
 * 지웁니다. priceRow 처럼 «글꼴을 지정하지 않으면 기본 글꼴» 을 기대하는
 * 자리에서 이게 조용히 글꼴을 지워 버립니다. 점검 스크립트가 «글꼴 3종
 * (gothic-a1, , nanum-gothic)» 이라고 알려 주어 찾았습니다.
 */
function defined<T extends object>(p: T): T {
  const out = {} as T;
  for (const [key, value] of Object.entries(p)) {
    if (value !== undefined) (out as Record<string, unknown>)[key] = value;
  }
  return out;
}

/** 글자. 크기는 pt, 자리는 mm */
export function text(p: Partial<TextElement> & { text: string }): TextElement {
  return {
    id: "",
    kind: "text",
    x: 0,
    y: 0,
    w: 60,
    h: 10,
    rotation: 0,
    opacity: 1,
    font: "nanum-gothic",
    size: 11,
    weight: 400,
    color: INK.black,
    align: "left",
    lineHeight: 1.5,
    letterSpacing: 0,
    ...defined(p),
  };
}

export function shape(kind: ShapeKind, p: Partial<ShapeElement> = {}): ShapeElement {
  return {
    id: "",
    kind: "shape",
    shape: kind,
    x: 0,
    y: 0,
    w: 40,
    h: 40,
    rotation: 0,
    opacity: 1,
    fill: INK.black,
    strokeWidth: 0,
    ...defined(p),
  };
}

export const rect = (p: Partial<ShapeElement> = {}) => shape("rect", p);
export const ellipse = (p: Partial<ShapeElement> = {}) => shape("ellipse", p);

/** 가로 실선 한 줄. 굵기는 h 로 줍니다 */
export function rule(p: Partial<ShapeElement> = {}): ShapeElement {
  return shape("rect", { h: 0.4, fill: INK.line, ...p });
}

/**
 * 생성한 그림 한 장.
 *
 * 아직 만들지 않은 그림을 가리키면 null 을 돌려줍니다. 키 없이 저장소만
 * 받은 사람도 사이트를 띄울 수 있어야 하기 때문입니다 — 그 경우 템플릿은
 * 배경 없이, 글자와 도형만으로 열립니다.
 */
export function image(artId: string, p: Partial<ImageElement> = {}): ImageElement | null {
  const src = artUrl(artId);
  if (!src) return null;
  const size = artSize(artId);
  return {
    id: "",
    kind: "image",
    x: 0,
    y: 0,
    w: 60,
    h: 60,
    rotation: 0,
    opacity: 1,
    src,
    fit: "cover",
    brightness: 100,
    contrast: 100,
    saturate: 100,
    naturalWidth: size?.width,
    naturalHeight: size?.height,
    ...defined(p),
  };
}

/** 배경에 까는 그림. 없으면 색만 남습니다 */
export function artBackground(
  artId: string,
  color: string,
  opacity = 1,
): PrintBackground {
  const src = artUrl(artId);
  return src ? { color, image: src, imageOpacity: opacity } : { color };
}

/* ------------------------------------------------------------
   조판 도우미
   ------------------------------------------------------------ */

/**
 * 이름과 값을 좌우로 벌린 한 줄 — 메뉴판이 계속 씁니다.
 *
 * 값을 «오른쪽 정렬한 별도 요소» 로 두는 것이 핵심입니다. 이름과 값을 한
 * 글자열에 담고 가운데를 공백으로 메우면, 글꼴이 바뀌는 순간 값이 들쭉날쭉
 * 해지고 사용자가 고칠 방법이 없습니다.
 */
export function priceRow(opts: {
  x: number;
  y: number;
  w: number;
  name: string;
  price: string;
  desc?: string;
  nameSize?: number;
  priceSize?: number;
  descSize?: number;
  color?: string;
  descColor?: string;
  font?: string;
  priceFont?: string;
  priceWidth?: number;
  side?: "front" | "back";
}): PrintElement[] {
  const {
    x,
    y,
    w,
    name,
    price,
    desc,
    nameSize = 12,
    priceSize = nameSize,
    descSize = Math.max(7, nameSize * 0.68),
    color = INK.black,
    descColor = INK.grey,
    font = "nanum-gothic",
    priceFont = font,
    priceWidth = 26,
    side,
  } = opts;

  const out: PrintElement[] = [
    text({
      x,
      y,
      w: w - priceWidth - 4,
      h: nameSize * 0.42,
      text: name,
      size: nameSize,
      weight: 700,
      color,
      font,
    }),
    text({
      x: x + w - priceWidth,
      y,
      w: priceWidth,
      h: nameSize * 0.42,
      text: price,
      size: priceSize,
      weight: 700,
      color,
      align: "right",
      font: priceFont,
    }),
  ];

  if (desc) {
    out.push(
      text({
        x,
        y: y + nameSize * 0.46,
        w: w - priceWidth - 4,
        h: descSize * 0.42,
        text: desc,
        size: descSize,
        color: descColor,
        font,
      }),
    );
  }
  return side ? out.map((e) => ({ ...e, side })) : out;
}

/** 점 하나로 시작하는 안내 줄들 */
export function bullets(opts: {
  x: number;
  y: number;
  w: number;
  lines: string[];
  size?: number;
  gap?: number;
  color?: string;
  font?: string;
  side?: "front" | "back";
}): PrintElement[] {
  const { x, y, w, lines, size = 10, gap = size * 0.62, color = INK.soft, font, side } = opts;
  return lines.map((line, i) =>
    text({
      x,
      y: y + i * gap,
      w,
      h: size * 0.4,
      text: `· ${line}`,
      size,
      color,
      font,
      side,
    }),
  );
}

/* ------------------------------------------------------------
   묶기
   ------------------------------------------------------------ */

export interface Draft {
  id: string;
  name: string;
  note: string;
  industry: IndustryId;
  style: StyleId;
  palette: PaletteId[];
  art?: string[];
  tags?: string[];
  /** specs.ts 의 sizeId. 비우면 그 갈래의 기본 규격 */
  size?: string;
  background?: PrintBackground;
  backgroundBack?: PrintBackground;
  perforation?: boolean;
  perforationAxis?: "x" | "y";
  perforationAt?: number;
  /** 이름을 목록이 아니라 문서에도 쓰고 싶을 때 */
  title?: string;
  /** 종이 크기를 받아 요소를 늘어놓습니다 */
  build(page: { w: number; h: number; safe: number; bleed: number }): (PrintElement | null)[];
}

/**
 * 초안 하나를 실제 템플릿으로.
 *
 * 규격은 여기서 specs.ts 를 찾아 넣습니다. 템플릿이 210·297 을 직접 적으면
 * 규격이 바뀌는 날 마흔여덟 장을 전부 고쳐야 합니다.
 */
export function compose(category: PrintCategoryId, draft: Draft): PrintTemplate {
  const spec = findCategory(category)!;
  const size =
    (draft.size ? spec.sizes.find((s) => s.id === draft.size) : undefined) ??
    spec.sizes.find((s) => s.preset) ??
    spec.sizes[0]!;

  const base = fromSpec(spec, size, [], draft.title ?? draft.name);

  const elements = draft
    .build({ w: size.width, h: size.height, safe: spec.safe, bleed: spec.bleed })
    .filter((e): e is PrintElement => e !== null)
    .map((el, i) => ({ ...el, id: `${draft.id}-${i + 1}` }));

  const doc: PrintDoc = {
    ...base,
    background: draft.background ?? base.background,
    backgroundBack: draft.backgroundBack,
    perforation: draft.perforation ?? base.perforation,
    perforationAxis: draft.perforationAxis,
    perforationAt: draft.perforationAt,
    elements,
  };

  return {
    id: draft.id,
    name: draft.name,
    category,
    note: draft.note,
    industry: draft.industry,
    style: draft.style,
    palette: draft.palette,
    art: draft.art,
    tags: draft.tags,
    doc,
  };
}

/** 한 갈래의 초안 묶음을 템플릿 목록으로 */
export function composeAll(category: PrintCategoryId, drafts: Draft[]): PrintTemplate[] {
  return drafts.map((d) => compose(category, d));
}
