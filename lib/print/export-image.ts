"use client";

/**
 * PNG·JPG 내보내기.
 *
 * 편집 화면의 종이를 그대로 찍습니다. PDF 와 달리 «화면과 100% 같은 그림» 이
 * 나오는 대신 사진이라 확대하면 깨집니다. 글꼴 자형을 지켜야 하는 사용자에게
 * 권하는 길이기도 합니다 — PDF 는 프리텐다드로 대체되지만 이쪽은 안 그렇습니다.
 *
 * 화면은 작게 그려 두었으므로(editorScale), 찍을 때만 배율을 올려 실제 인쇄
 * 해상도로 만듭니다.
 */

import { pxAt } from "@/lib/print/specs";
import type { PrintDoc } from "@/lib/print/types";

/**
 * 브라우저 캔버스의 한 변 한계.
 *
 * 크롬은 대략 65,535px 까지 받지만 총 픽셀 수에서 먼저 막힙니다. 현수막
 * 5000mm 를 150dpi 로 찍으면 29,527px 이고 실제로는 그리다 실패합니다.
 * 그래서 여기서 잘라 두고, 몇 dpi 로 나왔는지 사용자에게 알려 줍니다.
 */
const MAX_EDGE = 12000;

export interface ImageExportResult {
  blob: Blob;
  width: number;
  height: number;
  /** 실제로 나온 해상도 — 한계에 걸려 낮아졌을 수 있습니다 */
  dpi: number;
}

export async function exportImage(
  doc: PrintDoc,
  node: HTMLElement,
  format: "png" | "jpg",
  options: { bleed: boolean } = { bleed: false },
): Promise<ImageExportResult> {
  const { default: html2canvas } = await import("html2canvas");

  const wMm = doc.width + (options.bleed ? doc.bleed * 2 : 0);
  const hMm = doc.height + (options.bleed ? doc.bleed * 2 : 0);

  const wanted = pxAt(Math.max(wMm, hMm), doc.dpi);
  const dpi = wanted > MAX_EDGE ? Math.floor((MAX_EDGE / Math.max(wMm, hMm)) * 25.4) : doc.dpi;

  const targetW = pxAt(wMm, dpi);
  const onScreen = node.getBoundingClientRect().width || targetW;

  const canvas = await html2canvas(node, {
    scale: targetW / onScreen,
    backgroundColor: format === "jpg" ? "#ffffff" : null,
    useCORS: true,
    logging: false,
    // 안내선·손잡이는 결과물에 들어가면 안 됩니다
    ignoreElements: (el) => el.hasAttribute?.("data-no-export"),
  });

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("이미지를 만들지 못했습니다"))),
      format === "jpg" ? "image/jpeg" : "image/png",
      format === "jpg" ? 0.94 : undefined,
    );
  });

  return { blob, width: canvas.width, height: canvas.height, dpi };
}

export function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // 곧바로 지우면 사파리에서 내려받기가 취소됩니다
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
