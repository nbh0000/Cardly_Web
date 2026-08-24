/**
 * 인쇄물 문서의 자료형.
 *
 * ── 좌표는 전부 mm 입니다 ──
 * 화면 픽셀이 아니라 종이 위의 밀리미터로 들고 있습니다. 그래야 A4 로
 * 만든 것을 A3 로 바꿔도 위치가 그대로고, 300dpi 든 150dpi 든 같은 값에서
 * 파일이 나옵니다. 픽셀로 들고 있으면 «어느 배율에서의 픽셀인가» 를 항상
 * 함께 기억해야 하고, 언젠가 반드시 어긋납니다.
 *
 * 글자 크기만 pt 입니다. 인쇄에서 글자는 pt 로 말하고(10pt·12pt), 그것이
 * 그대로 인쇄소와 나누는 말이기 때문입니다.
 *
 * ── 2차(템플릿 대량 제작)를 위한 약속 ──
 * 템플릿은 이 자료형 그대로 JSON 한 덩어리입니다. 필드를 더할 때는 반드시
 * 선택(optional)으로 더하세요. 이미 저장된 문서가 새 필드를 모른 채로도
 * 열려야 합니다. 필드를 지우거나 뜻을 바꾸는 것은 저장된 문서를 깨뜨립니다.
 */

import type { PrintCategoryId } from "@/lib/print/specs";
import type { IndustryId, PaletteId, StyleId } from "@/lib/print/taxonomy";

export type ElementId = string;

export type TextAlign = "left" | "center" | "right" | "justify";

export interface BaseElement {
  id: ElementId;
  /** 종이 왼쪽 위에서부터(mm). 재단선 기준입니다 */
  x: number;
  y: number;
  w: number;
  h: number;
  /** 도 단위. 가운데를 축으로 돕니다 */
  rotation: number;
  opacity: number;
  locked?: boolean;
  hidden?: boolean;
  /** 이 요소가 속한 면 — 양면 인쇄물에서만 씁니다 */
  side?: "front" | "back";
  /** 묶음. 같은 값을 가진 것끼리 함께 움직입니다 */
  group?: string;
}

export interface TextElement extends BaseElement {
  kind: "text";
  text: string;
  /** lib/fonts.ts 의 FontId */
  font: string;
  /** pt */
  size: number;
  weight: number;
  color: string;
  align: TextAlign;
  /** 배수 (1.4 = 140%) */
  lineHeight: number;
  /** em 단위 자간 */
  letterSpacing: number;
  italic?: boolean;
  underline?: boolean;
  /** 글자 뒤에 까는 색 */
  highlight?: string;
  shadow?: Shadow;
}

export interface ImageElement extends BaseElement {
  kind: "image";
  src: string;
  /** 원본 픽셀 — 인쇄 해상도 경고에 씁니다 */
  naturalWidth?: number;
  naturalHeight?: number;
  fit: "cover" | "contain";
  /** 0~1. cover 로 채울 때 어느 부분을 보일지 */
  focusX?: number;
  focusY?: number;
  radius?: number;
  brightness?: number;
  contrast?: number;
  saturate?: number;
  shadow?: Shadow;
}

export type ShapeKind =
  | "rect"
  | "ellipse"
  | "line"
  | "arrow"
  | "star"
  | "bubble"
  | "triangle";

export interface ShapeElement extends BaseElement {
  kind: "shape";
  shape: ShapeKind;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  radius?: number;
  shadow?: Shadow;
}

export interface Shadow {
  x: number;
  y: number;
  blur: number;
  color: string;
}

export type PrintElement = TextElement | ImageElement | ShapeElement;

export interface PrintBackground {
  color: string;
  /** 두 색 그라데이션. 각도는 도 단위 */
  gradient?: { from: string; to: string; angle: number };
  image?: string;
  imageOpacity?: number;
}

export interface PrintDoc {
  /** 규격 갈래 */
  category: PrintCategoryId;
  /** specs.ts 의 사이즈 id. 직접 입력한 크기면 "custom" */
  sizeId: string;
  /** mm — sizeId 가 custom 일 때도 여기 값이 진짜입니다 */
  width: number;
  height: number;
  bleed: number;
  safe: number;
  dpi: number;
  duplex: boolean;
  /** 절취선 그리기 — 쿠폰처럼 잘라 쓰는 인쇄물에서만 */
  perforation?: boolean;
  /** 절취선 방향. y = 가로줄(위아래로 나눔), x = 세로줄(좌우로 나눔) */
  perforationAxis?: "x" | "y";
  /** 절취선 위치. 0~1, 기본 0.5 */
  perforationAt?: number;
  background: PrintBackground;
  backgroundBack?: PrintBackground;
  elements: PrintElement[];
  /** 목록에 보이는 이름 */
  title: string;
}

/**
 * 템플릿 한 장.
 *
 * 알맹이는 `doc` 하나이고 나머지는 «어떻게 찾아지는가» 를 위한 딱지입니다.
 * 딱지를 문자열로 아무렇게나 적지 않고 taxonomy.ts 의 id 로 받는 이유는,
 * «cafe» 와 «Cafe» 가 섞이는 순간 거르기가 조용히 새기 때문입니다.
 *
 * `art` 는 이 템플릿이 쓰는 생성 그림의 id 입니다. 실제 프롬프트는
 * art.json 에 있고, 그래서 «이 배경을 다시 뽑으려면 뭐라고 해야 하나» 가
 * 언제든 답이 나옵니다.
 */
export interface PrintTemplate {
  id: string;
  name: string;
  category: PrintCategoryId;
  /** 목록 카드 아래 한 줄 */
  note: string;
  industry: IndustryId;
  style: StyleId;
  palette: PaletteId[];
  /** lib/print/art.json 의 id */
  art?: string[];
  /** 검색에만 쓰는 자유 낱말 */
  tags?: string[];
  doc: PrintDoc;
}

export const isText = (e: PrintElement): e is TextElement => e.kind === "text";
export const isImage = (e: PrintElement): e is ImageElement => e.kind === "image";
export const isShape = (e: PrintElement): e is ShapeElement => e.kind === "shape";
