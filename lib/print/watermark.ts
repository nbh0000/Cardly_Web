"use client";

/**
 * 워터마크 — 결제 전에는 이것이 찍힙니다.
 *
 * 무엇을 막고 무엇을 열어 둘지가 이 파일의 전부입니다. 우리는 **막지
 * 않습니다** — 결제하지 않아도 편집도 되고 내보내기도 됩니다. 다만 결과물에
 * 옅은 글자가 사선으로 깔립니다. 인쇄해서 쓸 수는 없지만, 시안으로 돌려
 * 보거나 사장님께 «이렇게 나옵니다» 하고 보여 주기에는 충분합니다.
 *
 * 내려받지 못하게 막는 쪽이 매출에는 나을 것 같지만 실제로는 반대입니다.
 * 인쇄물은 «내가 만든 것이 진짜 그럴듯한가» 를 확인해야 지갑을 엽니다.
 * 확인할 방법이 없으면 그냥 떠납니다.
 *
 * 지우기 쉬운 표시라는 것도 압니다. 포토샵을 열 줄 아는 사람은 지웁니다.
 * 그건 감수합니다 — 그 사람은 애초에 우리 손님이 아니고, 그 사람을 막으려고
 * 나머지 모두를 불편하게 만드는 쪽이 훨씬 손해입니다.
 */

import { degrees, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { mmToPt } from "@/lib/print/specs";

const TEXT = "Cardly 미리보기";

/**
 * 화면을 찍은 캔버스 위에 사선으로 깝니다.
 *
 * 캔버스 크기가 인쇄물마다 크게 다르므로(현수막은 만 픽셀이 넘습니다)
 * 글자 크기를 픽셀이 아니라 «긴 변의 몇 퍼센트» 로 잡습니다.
 */
export function stampCanvas(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const size = Math.max(14, Math.round(Math.max(canvas.width, canvas.height) * 0.028));
  const step = size * 9;

  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = "#000000";
  ctx.font = `700 ${size}px "Nanum Gothic", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 6);

  const reach = Math.hypot(canvas.width, canvas.height);
  for (let y = -reach; y < reach; y += step) {
    for (let x = -reach; x < reach; x += step * 1.6) {
      ctx.fillText(TEXT, x, y);
    }
  }
  ctx.restore();
}

/**
 * PDF 한 면에 사선으로 깝니다.
 *
 * 글꼴을 새로 심지 않고 이미 심어 둔 것을 받아 씁니다. 워터마크 하나
 * 때문에 2MB 짜리 글꼴이 더 들어가면 결제하지 않은 파일이 결제한 파일보다
 * 무거워지는 이상한 일이 벌어집니다.
 */
export function stampPdf(
  page: PDFPage,
  widthMm: number,
  heightMm: number,
  bleedMm: number,
  font: PDFFont,
): void {
  const w = mmToPt(widthMm + bleedMm * 2);
  const h = mmToPt(heightMm + bleedMm * 2);
  const size = Math.max(9, Math.min(w, h) * 0.05);
  const step = size * 9;
  const ink = rgb(0, 0, 0);

  for (let y = -h; y < h * 2; y += step) {
    for (let x = -w; x < w * 2; x += step * 2.2) {
      page.drawText(TEXT, {
        x,
        y,
        size,
        font,
        color: ink,
        opacity: 0.14,
        rotate: degrees(30),
      });
    }
  }
}
