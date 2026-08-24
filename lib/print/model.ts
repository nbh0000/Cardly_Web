/**
 * 요소를 만들고, 재고, 줄 세우는 순수 함수들.
 *
 * 화면도 상태도 모르는 계산만 두었습니다. 정렬과 스냅은 «어디에 놓을지» 를
 * 정하는 규칙이라 눈으로 확인하기 어려운데, 여기에 모아 두면 값만 넣어
 * 확인할 수 있습니다.
 */

import type {
  ElementId,
  ImageElement,
  PrintElement,
  ShapeElement,
  ShapeKind,
  TextElement,
} from "@/lib/print/types";

export const uid = () => Math.random().toString(36).slice(2, 10);

/* ------------------------------------------------------------
   만들기
   ------------------------------------------------------------ */

export function newText(partial: Partial<TextElement> = {}): TextElement {
  return {
    id: uid(),
    kind: "text",
    x: 20,
    y: 20,
    w: 80,
    h: 14,
    rotation: 0,
    opacity: 1,
    text: "내용을 입력하세요",
    font: "nanum-gothic",
    size: 14,
    weight: 400,
    color: "#111111",
    align: "left",
    lineHeight: 1.4,
    letterSpacing: 0,
    ...partial,
  };
}

export function newImage(src: string, partial: Partial<ImageElement> = {}): ImageElement {
  return {
    id: uid(),
    kind: "image",
    x: 20,
    y: 20,
    w: 60,
    h: 60,
    rotation: 0,
    opacity: 1,
    src,
    fit: "cover",
    brightness: 100,
    contrast: 100,
    saturate: 100,
    ...partial,
  };
}

export function newShape(shape: ShapeKind, partial: Partial<ShapeElement> = {}): ShapeElement {
  return {
    id: uid(),
    kind: "shape",
    shape,
    x: 20,
    y: 20,
    w: shape === "line" || shape === "arrow" ? 80 : 40,
    h: shape === "line" || shape === "arrow" ? 0.8 : 40,
    rotation: 0,
    opacity: 1,
    fill: shape === "line" || shape === "arrow" ? "#111111" : "#2b6cb0",
    strokeWidth: 0,
    ...partial,
  };
}

/* ------------------------------------------------------------
   재기
   ------------------------------------------------------------ */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function boundsOf(list: PrintElement[]): Box | null {
  if (list.length === 0) return null;
  let x1 = Infinity,
    y1 = Infinity,
    x2 = -Infinity,
    y2 = -Infinity;
  for (const e of list) {
    x1 = Math.min(x1, e.x);
    y1 = Math.min(y1, e.y);
    x2 = Math.max(x2, e.x + e.w);
    y2 = Math.max(y2, e.y + e.h);
  }
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

/* ------------------------------------------------------------
   줄 세우기
   ------------------------------------------------------------ */

export type AlignMode = "left" | "hcenter" | "right" | "top" | "vcenter" | "bottom";

/**
 * 정렬 기준.
 *
 * 요소가 하나면 «종이» 를 기준으로, 둘 이상이면 «고른 것들이 차지한 영역» 을
 * 기준으로 맞춥니다. 하나를 고르고 가운데 정렬을 눌렀을 때 제자리에 있으면
 * 고장 난 것으로 보입니다.
 */
export function alignElements(
  list: PrintElement[],
  mode: AlignMode,
  page: Box,
): PrintElement[] {
  const area = list.length > 1 ? boundsOf(list)! : page;
  return list.map((e) => {
    switch (mode) {
      case "left":
        return { ...e, x: area.x };
      case "hcenter":
        return { ...e, x: area.x + (area.w - e.w) / 2 };
      case "right":
        return { ...e, x: area.x + area.w - e.w };
      case "top":
        return { ...e, y: area.y };
      case "vcenter":
        return { ...e, y: area.y + (area.h - e.h) / 2 };
      case "bottom":
        return { ...e, y: area.y + area.h - e.h };
    }
  });
}

/** 셋 이상을 고르면 사이 간격을 고르게 벌립니다 */
export function distribute(list: PrintElement[], axis: "x" | "y"): PrintElement[] {
  if (list.length < 3) return list;
  const key = axis;
  const sizeKey = axis === "x" ? "w" : "h";
  const sorted = [...list].sort((a, b) => a[key] - b[key]);
  const first = sorted[0]!;
  const last = sorted.at(-1)!;
  const span = last[key] + last[sizeKey] - first[key];
  const used = sorted.reduce((sum, e) => sum + e[sizeKey], 0);
  const gap = (span - used) / (sorted.length - 1);

  let cursor = first[key];
  const moved = new Map<ElementId, number>();
  for (const e of sorted) {
    moved.set(e.id, cursor);
    cursor += e[sizeKey] + gap;
  }
  return list.map((e) => ({ ...e, [key]: moved.get(e.id) ?? e[key] }) as PrintElement);
}

/* ------------------------------------------------------------
   스마트 가이드
   ------------------------------------------------------------ */

export interface Guide {
  axis: "x" | "y";
  /** mm */
  at: number;
}

/**
 * 끄는 동안 이웃과 종이의 선에 달라붙습니다.
 *
 * 붙는 기준은 여섯 곳입니다 — 요소의 시작·가운데·끝, 그리고 종이의 같은 셋.
 * 임계값을 화면 배율에 맞춰 받는 이유는, 축소해서 보고 있을 때 mm 로 같은
 * 거리면 화면에서는 훨씬 멀게 느껴지기 때문입니다.
 */
export function snap(
  box: Box,
  others: PrintElement[],
  page: Box,
  thresholdMm: number,
): { x: number; y: number; guides: Guide[] } {
  const guides: Guide[] = [];
  let { x, y } = box;

  const xTargets: number[] = [page.x, page.x + page.w / 2, page.x + page.w];
  const yTargets: number[] = [page.y, page.y + page.h / 2, page.y + page.h];
  for (const e of others) {
    xTargets.push(e.x, e.x + e.w / 2, e.x + e.w);
    yTargets.push(e.y, e.y + e.h / 2, e.y + e.h);
  }

  const edges = (start: number, size: number) => [start, start + size / 2, start + size];

  let bestX: { delta: number; at: number } | null = null;
  for (const edge of edges(box.x, box.w)) {
    for (const t of xTargets) {
      const d = t - edge;
      if (Math.abs(d) <= thresholdMm && (!bestX || Math.abs(d) < Math.abs(bestX.delta))) {
        bestX = { delta: d, at: t };
      }
    }
  }
  if (bestX) {
    x += bestX.delta;
    guides.push({ axis: "x", at: bestX.at });
  }

  let bestY: { delta: number; at: number } | null = null;
  for (const edge of edges(box.y, box.h)) {
    for (const t of yTargets) {
      const d = t - edge;
      if (Math.abs(d) <= thresholdMm && (!bestY || Math.abs(d) < Math.abs(bestY.delta))) {
        bestY = { delta: d, at: t };
      }
    }
  }
  if (bestY) {
    y += bestY.delta;
    guides.push({ axis: "y", at: bestY.at });
  }

  return { x, y, guides };
}

/* ------------------------------------------------------------
   인쇄 점검
   ------------------------------------------------------------ */

export interface PrintWarning {
  id: ElementId;
  kind: "safe" | "resolution";
  message: string;
}

/**
 * 저장하기 전에 잡아야 하는 두 가지.
 *
 *   ① 안전선 밖의 글자 — 재단에서 잘려 나갑니다
 *   ② 해상도가 모자란 사진 — 화면에서는 멀쩡하고 종이에서만 뭉갭니다
 *
 * 둘 다 인쇄를 맡기고 나면 되돌릴 수 없는 종류라, 경고를 «저장할 때» 가
 * 아니라 편집하는 내내 띄웁니다.
 */
export function checkPrint(
  elements: PrintElement[],
  page: { width: number; height: number; safe: number },
  minDpi: number,
): PrintWarning[] {
  const out: PrintWarning[] = [];
  const left = page.safe;
  const top = page.safe;
  const right = page.width - page.safe;
  const bottom = page.height - page.safe;

  for (const e of elements) {
    if (e.hidden) continue;

    if (e.kind === "text") {
      if (e.x < left - 0.5 || e.y < top - 0.5 || e.x + e.w > right + 0.5 || e.y + e.h > bottom + 0.5) {
        out.push({
          id: e.id,
          kind: "safe",
          message: "안전선 밖에 있습니다 — 재단에서 잘릴 수 있습니다",
        });
      }
    }

    if (e.kind === "image" && e.naturalWidth && e.w > 0) {
      // 이 사진이 실제로 인쇄될 밀도 = 원본 픽셀 ÷ 배치된 크기(인치)
      const dpi = e.naturalWidth / (e.w / 25.4);
      if (dpi < minDpi) {
        out.push({
          id: e.id,
          kind: "resolution",
          message: `${Math.round(dpi)}dpi — 인쇄하면 흐릿할 수 있습니다 (${minDpi}dpi 이상 권장)`,
        });
      }
    }
  }
  return out;
}
