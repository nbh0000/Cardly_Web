/**
 * 빈 문서 만들기와 규격 갈아 끼우기.
 *
 * 규격의 «진짜» 값은 specs.ts 에 있고, 문서는 그 값을 복사해 들고 있습니다.
 * 복사하는 이유는 사용자가 안전선이나 재단 여백을 직접 바꿀 수 있어야 하고,
 * 그렇게 바꾼 값이 규격이 나중에 바뀌어도 그대로 남아야 하기 때문입니다.
 */

import { findCategory, presetSize, type PrintCategory, type PrintSize } from "@/lib/print/specs";
import type { PrintDoc } from "@/lib/print/types";

export function blankDoc(categoryId: string, sizeId?: string): PrintDoc {
  const category = findCategory(categoryId) ?? findCategory("flyer")!;
  const size = (sizeId && category.sizes.find((s) => s.id === sizeId)) || presetSize(category);
  return fromSpec(category, size, []);
}

export function fromSpec(
  category: PrintCategory,
  size: PrintSize,
  elements: PrintDoc["elements"],
  title?: string,
): PrintDoc {
  return {
    category: category.id,
    sizeId: size.id,
    width: size.width,
    height: size.height,
    bleed: category.bleed,
    safe: category.safe,
    dpi: category.dpi,
    duplex: category.duplex,
    perforation: false,
    background: { color: "#ffffff" },
    elements,
    title: title ?? `${category.label} ${size.label}`,
  };
}

/**
 * 규격만 바꾸고 내용은 지킵니다.
 *
 * 요소를 크기 비율만큼 옮겨 줍니다. A4 로 만든 것을 A5 로 바꿨을 때 글자만
 * 원래 자리에 남아 종이 밖으로 나가 있으면, 사용자는 그것을 «망가졌다» 로
 * 받아들이고 처음부터 다시 만듭니다.
 */
export function resizeDoc(doc: PrintDoc, size: PrintSize): PrintDoc {
  const kx = size.width / doc.width;
  const ky = size.height / doc.height;
  const k = Math.min(kx, ky);
  return {
    ...doc,
    sizeId: size.id,
    width: size.width,
    height: size.height,
    elements: doc.elements.map((e) => ({
      ...e,
      x: e.x * kx,
      y: e.y * ky,
      w: e.w * kx,
      h: e.h * ky,
      ...(e.kind === "text" ? { size: Math.max(4, Math.round(e.size * k * 10) / 10) } : {}),
    })),
  };
}
