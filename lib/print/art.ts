/**
 * 생성한 그림 목록 — art.json 을 읽기만 합니다.
 *
 * 원본이 json 인 이유는, 그림을 만드는 쪽이 Node 스크립트이기 때문입니다
 * (scripts/print-art.mjs). 스크립트가 TypeScript 를 읽을 수 없으니 둘이
 * 함께 볼 수 있는 자료형은 json 뿐입니다. 사람이 만든 프롬프트와 기계가
 * 적어 넣은 크기가 한 파일에 있어야 «이 배경은 어떻게 나왔나» 를 나중에도
 * 되짚을 수 있습니다.
 *
 * 그림이 아직 없을 수도 있습니다(키 없이 받은 저장소). 그때도 사이트는
 * 서야 하므로, 없는 그림을 가리키는 템플릿은 배경 없이 열립니다.
 */

import raw from "@/lib/print/art.json";
import { asset } from "@/lib/asset";
import type { StyleId } from "@/lib/print/taxonomy";

export interface PrintArt {
  id: string;
  category: string;
  style: StyleId;
  aspect: string;
  size: string;
  note: string;
  prompt: string;
  /** 만든 뒤에 스크립트가 적습니다 */
  file?: string;
  width?: number;
  height?: number;
  bytes?: number;
  upscaled?: boolean;
  model?: string;
}

export const PRINT_ART = raw.art as PrintArt[];

/** 프롬프트 뒤에 늘 붙는 말 — 재현할 때 필요합니다 */
export const ART_SUFFIX = raw.suffix as string;

const BY_ID = new Map(PRINT_ART.map((a) => [a.id, a]));

export function findArt(id: string): PrintArt | undefined {
  return BY_ID.get(id);
}

/**
 * 그림의 실제 주소. 아직 만들지 않았으면 undefined 입니다.
 *
 * 템플릿은 이 함수를 거쳐서만 그림을 가리킵니다. 파일 이름을 직접 적으면
 * 그림을 다시 뽑아 이름이 바뀔 때 조용히 깨집니다.
 */
export function artUrl(id: string): string | undefined {
  const art = BY_ID.get(id);
  return art?.file ? asset(`/print-art/${art.file}`) : undefined;
}

/** 원본 픽셀 — 해상도 경고 계산에 씁니다 */
export function artSize(id: string): { width: number; height: number } | undefined {
  const art = BY_ID.get(id);
  return art?.width && art?.height ? { width: art.width, height: art.height } : undefined;
}

/**
 * 이 그림을 이 폭(mm)에 놓으면 몇 dpi 인가.
 *
 * 템플릿을 짤 때 손으로 재기 위한 것이자, 점검 스크립트가 쓰는 값입니다.
 * 현수막처럼 실물이 큰 인쇄물은 원본으로 전면을 채울 수 없으므로, 그림을
 * 띠나 판으로 쓰고 남는 자리는 색으로 채웁니다.
 */
export function artDpi(id: string, widthMm: number): number | undefined {
  const size = artSize(id);
  if (!size || widthMm <= 0) return undefined;
  return Math.round(size.width / (widthMm / 25.4));
}
