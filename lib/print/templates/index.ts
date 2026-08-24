/**
 * 템플릿 마흔여덟 장 — 갈래마다 여덟 장.
 *
 * 파일을 갈래별로 나눈 이유는 한 파일이 이천 줄을 넘기면 아무도 열어 보지
 * 않기 때문입니다. 새 템플릿은 해당 갈래 파일에 초안(Draft) 하나를 더하면
 * 되고, 여기는 손대지 않아도 됩니다.
 *
 * 목록 화면이 쓰는 거르기·찾기도 여기 모아 두었습니다. 화면 컴포넌트가
 * 직접 filter 를 짜면 «업종만 고른 경우» 와 «업종과 스타일을 함께 고른
 * 경우» 가 서로 다른 규칙으로 자라납니다.
 */

import type { PrintCategoryId } from "@/lib/print/specs";
import type { PrintTemplate } from "@/lib/print/types";
import type { IndustryId, PaletteId, StyleId } from "@/lib/print/taxonomy";

import { FLYER_TEMPLATES } from "@/lib/print/templates/flyer";
import { COUPON_TEMPLATES } from "@/lib/print/templates/coupon";
import { POSTER_TEMPLATES } from "@/lib/print/templates/poster";
import { BANNER_TEMPLATES } from "@/lib/print/templates/banner";
import { STANDING_BANNER_TEMPLATES } from "@/lib/print/templates/standing-banner";
import { MENU_TEMPLATES } from "@/lib/print/templates/menu";

export const PRINT_TEMPLATES: PrintTemplate[] = [
  ...FLYER_TEMPLATES,
  ...COUPON_TEMPLATES,
  ...POSTER_TEMPLATES,
  ...BANNER_TEMPLATES,
  ...STANDING_BANNER_TEMPLATES,
  ...MENU_TEMPLATES,
];

const BY_ID = new Map(PRINT_TEMPLATES.map((t) => [t.id, t]));

export function findTemplate(id: string): PrintTemplate | undefined {
  return BY_ID.get(id);
}

export function templatesFor(category: PrintCategoryId): PrintTemplate[] {
  return PRINT_TEMPLATES.filter((t) => t.category === category);
}

/* ------------------------------------------------------------
   거르기
   ------------------------------------------------------------ */

export interface TemplateFilter {
  industry?: IndustryId | null;
  style?: StyleId | null;
  palette?: PaletteId | null;
  /** 이름·설명·태그에서 찾습니다 */
  q?: string;
}

export function filterTemplates(
  list: PrintTemplate[],
  filter: TemplateFilter,
): PrintTemplate[] {
  const q = filter.q?.trim().toLowerCase();
  return list.filter((t) => {
    if (filter.industry && t.industry !== filter.industry) return false;
    if (filter.style && t.style !== filter.style) return false;
    if (filter.palette && !t.palette.includes(filter.palette)) return false;
    if (q) {
      const hay = [t.name, t.note, ...(t.tags ?? [])].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/**
 * 이 목록 안에 실제로 있는 딱지만 돌려줍니다.
 *
 * 거르기 단추를 전부 늘어놓으면, 눌러도 결과가 없는 단추가 생깁니다.
 * 그건 사용자에게 «고장» 으로 읽힙니다.
 */
export function facetsOf(list: PrintTemplate[]) {
  return {
    industries: [...new Set(list.map((t) => t.industry))],
    styles: [...new Set(list.map((t) => t.style))],
    palettes: [...new Set(list.flatMap((t) => t.palette))],
  };
}

/** 갈래별 장수 — 목록 화면의 칩에 적습니다 */
export function templateCounts(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const t of PRINT_TEMPLATES) out[t.category] = (out[t.category] ?? 0) + 1;
  return out;
}
