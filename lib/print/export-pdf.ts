"use client";

/**
 * PDF 내보내기 — 벡터로.
 *
 * 이력서·명함 내보내기(lib/studio/export.ts)는 화면을 사진으로 찍어 PDF 에
 * 붙입니다. 화면과 100% 같다는 장점이 있지만 결과는 사진이라, 확대하면 글자가
 * 깨지고 인쇄소가 «벡터 주세요» 라고 하면 줄 것이 없습니다.
 *
 * 여기서는 pdf-lib 로 처음부터 다시 그립니다. 글자는 글자로, 도형은 도형으로
 * 들어가고 사진만 사진으로 들어갑니다. 대가는 줄바꿈 위치를 브라우저가 아니라
 * 우리가 계산한다는 것 — 화면과 미세하게 다를 수 있고, 그 사실을 내보내기
 * 화면에서 그대로 알립니다.
 *
 * 좌표계가 둘이라 헷갈리기 쉽습니다.
 *   문서 좌표: mm, 왼쪽 위가 원점, y 는 아래로
 *   PDF 좌표 : pt, 왼쪽 아래가 원점, y 는 위로
 * 그 환산은 makeMapper 하나에만 있습니다.
 */

import { PDFDocument, degrees, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { mmToPt } from "@/lib/print/specs";
import { PDF_EMBEDDED_FONT } from "@/lib/print/fonts";
import type { PrintBackground, PrintDoc, PrintElement, TextElement } from "@/lib/print/types";

export interface PdfOptions {
  /** 재단 여백을 포함해 내보낼지 — 인쇄소에 맡길 때 켭니다 */
  bleed: boolean;
  /** 재단 표시(모서리 십자선) */
  cropMarks: boolean;
}

/* CSS 가 첫 줄의 기준선을 놓는 방식을 옮긴 값입니다.
   한글 고딕의 대략적인 위·아래 여유(em 기준). */
const ASC = 0.88;
const DESC = 0.22;

export async function exportPdf(doc: PrintDoc, options: PdfOptions): Promise<Blob> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  /* 쓰는 굵기만 심습니다. 한 벌이 1.3MB 라, 굵은 글자가 없는 문서에까지
     굵은 글꼴을 넣으면 파일이 두 배가 됩니다. */
  const texts = doc.elements.filter((e): e is TextElement => e.kind === "text" && !e.hidden);
  const needsBold = texts.some((e) => e.weight >= 600);
  const needsRegular = texts.some((e) => e.weight < 600) || !needsBold;

  const [regular, bold] = await Promise.all([
    needsRegular ? embed(pdf, PDF_EMBEDDED_FONT.regular) : Promise.resolve(null),
    needsBold ? embed(pdf, PDF_EMBEDDED_FONT.bold) : Promise.resolve(null),
  ]);
  const pick = (weight: number) => (weight >= 600 ? (bold ?? regular!) : (regular ?? bold!));

  const b = options.bleed ? doc.bleed : 0;
  const sides: ("front" | "back")[] = doc.duplex ? ["front", "back"] : ["front"];

  for (const side of sides) {
    const page = pdf.addPage([mmToPt(doc.width + b * 2), mmToPt(doc.height + b * 2)]);
    const map = makeMapper(doc, b);

    const bg = side === "back" ? (doc.backgroundBack ?? doc.background) : doc.background;
    await paintBackground(pdf, page, doc, bg, b);

    const list = doc.elements.filter((e) => (e.side ?? "front") === side && !e.hidden);
    for (const el of list) {
      if (el.kind === "text") drawText(page, el, map, pick);
      else if (el.kind === "shape") drawShape(page, el, map);
      else await drawImage(pdf, page, el, map, doc.dpi);
    }

    if (options.cropMarks && b > 0) drawCropMarks(page, doc, b);
  }

  const bytes = await pdf.save();
  return new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
}

/* ------------------------------------------------------------
   좌표 환산
   ------------------------------------------------------------ */

interface Mapper {
  /** 문서 mm → PDF pt */
  pt(mm: number): number;
  /** 문서 좌표(mm) → PDF 좌표(pt) */
  at(xMm: number, yMm: number): { x: number; y: number };
  /** 회전을 반영해 한 점을 옮긴 뒤 PDF 좌표로 */
  spin(
    xMm: number,
    yMm: number,
    cxMm: number,
    cyMm: number,
    deg: number,
  ): { x: number; y: number };
}

function makeMapper(doc: PrintDoc, bleedMm: number): Mapper {
  const totalH = doc.height + bleedMm * 2;
  const at = (xMm: number, yMm: number) => ({
    x: mmToPt(xMm + bleedMm),
    y: mmToPt(totalH - (yMm + bleedMm)),
  });
  return {
    pt: mmToPt,
    at,
    spin(xMm, yMm, cxMm, cyMm, deg) {
      if (!deg) return at(xMm, yMm);
      const rad = (deg * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const dx = xMm - cxMm;
      const dy = yMm - cyMm;
      return at(cxMm + dx * cos - dy * sin, cyMm + dx * sin + dy * cos);
    },
  };
}

/** "#rrggbb" → pdf-lib 색. 알 수 없는 값은 검정으로 둡니다 */
function color(css: string) {
  const hex = css.trim().replace("#", "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  const n = parseInt(full.slice(0, 6), 16);
  if (Number.isNaN(n)) return rgb(0, 0, 0);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

/**
 * 글꼴을 통째로 심습니다 — 부분만 잘라 심지 않습니다.
 *
 * 쓴 글자만 골라 심으면(subset) 파일이 1.3MB 에서 5KB 로 줄어듭니다. 실제로
 * 해 보았고, 실패했습니다. `@pdf-lib/fontkit` 의 자르개가 짧은 loca 형식에서
 * 글자 자료를 짝수 경계에 맞춰 채우지 않아, 홀수 길이 글자 하나를 지나면
 * 그 뒤의 글자들이 어긋난 자리를 가리킵니다. 화면에서는 «토요일 목공 교실»
 * 이 PDF 에서 «요일 목공 교» 로 나옵니다. 글자가 몇 개 사라진 인쇄물을
 * 인쇄소에서 발견하는 것보다는 파일이 무거운 편이 낫습니다.
 *
 * 그래서 통째로 심고, 대신 실제로 쓰는 굵기만 심습니다.
 */
async function embed(pdf: PDFDocument, url: string): Promise<PDFFont> {
  const bytes = await fetch(url).then((r) => r.arrayBuffer());
  return pdf.embedFont(bytes, { subset: false });
}

/* ------------------------------------------------------------
   배경
   ------------------------------------------------------------ */

async function paintBackground(
  pdf: PDFDocument,
  page: PDFPage,
  doc: PrintDoc,
  bg: PrintBackground,
  bleedMm: number,
) {
  const w = mmToPt(doc.width + bleedMm * 2);
  const h = mmToPt(doc.height + bleedMm * 2);

  // 그라데이션은 PDF 에 그런 도형이 없어, 그 부분만 그림으로 만들어 깝니다.
  if (bg.gradient) {
    const png = await gradientPng(bg.gradient, 1200, Math.round((1200 * (doc.height + bleedMm * 2)) / (doc.width + bleedMm * 2)));
    const img = await pdf.embedPng(png);
    page.drawImage(img, { x: 0, y: 0, width: w, height: h });
  } else {
    page.drawRectangle({ x: 0, y: 0, width: w, height: h, color: color(bg.color) });
  }

  if (bg.image) {
    const raster = await rasterize(bg.image, doc.width + bleedMm * 2, doc.height + bleedMm * 2, doc.dpi, {
      fit: "cover",
    });
    const img = raster.type === "png" ? await pdf.embedPng(raster.bytes) : await pdf.embedJpg(raster.bytes);
    page.drawImage(img, { x: 0, y: 0, width: w, height: h, opacity: bg.imageOpacity ?? 1 });
  }
}

async function gradientPng(
  g: { from: string; to: string; angle: number },
  w: number,
  h: number,
): Promise<Uint8Array> {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = Math.max(1, h);
  const ctx = canvas.getContext("2d")!;
  const rad = ((g.angle - 90) * Math.PI) / 180;
  const cx = w / 2;
  const cy = canvas.height / 2;
  const r = Math.max(w, canvas.height);
  const grad = ctx.createLinearGradient(
    cx - Math.cos(rad) * r * 0.5,
    cy - Math.sin(rad) * r * 0.5,
    cx + Math.cos(rad) * r * 0.5,
    cy + Math.sin(rad) * r * 0.5,
  );
  grad.addColorStop(0, g.from);
  grad.addColorStop(1, g.to);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, canvas.height);
  return dataUrlToBytes(canvas.toDataURL("image/png"));
}

/* ------------------------------------------------------------
   글자
   ------------------------------------------------------------ */

/**
 * 줄바꿈을 우리가 계산합니다.
 *
 * 한글은 단어 사이에 띄어쓰기가 있어도 한 어절이 상자보다 길 수 있어,
 * 어절 단위로 먼저 나누고 그래도 넘치면 글자 단위로 자릅니다.
 */
function wrap(text: string, font: PDFFont, sizePt: number, spacingPt: number, maxPt: number): string[] {
  const width = (s: string) => font.widthOfTextAtSize(s, sizePt) + spacingPt * s.length;
  const out: string[] = [];

  for (const paragraph of text.split("\n")) {
    if (paragraph === "") {
      out.push("");
      continue;
    }
    let line = "";
    for (const word of paragraph.split(/(\s+)/)) {
      if (word === "") continue;
      if (width(line + word) <= maxPt || line === "") {
        // 한 어절 자체가 상자보다 길면 글자 단위로 자릅니다
        if (width(line + word) > maxPt) {
          let piece = line;
          for (const ch of word) {
            if (width(piece + ch) > maxPt && piece !== "") {
              out.push(piece);
              piece = "";
            }
            piece += ch;
          }
          line = piece;
          continue;
        }
        line += word;
      } else {
        out.push(line.trimEnd());
        line = word.trimStart();
      }
    }
    out.push(line.trimEnd());
  }
  return out;
}

function drawText(
  page: PDFPage,
  el: TextElement,
  map: Mapper,
  pick: (weight: number) => PDFFont,
) {
  const font = pick(el.weight);
  const size = el.size; // pt
  const spacing = el.letterSpacing * size;
  const boxW = map.pt(el.w);
  const lines = wrap(el.text, font, size, spacing, boxW);

  const lineH = size * el.lineHeight;
  const firstBaseline = (lineH - (ASC + DESC) * size) / 2 + ASC * size; // pt, 상자 위에서
  const cx = el.x + el.w / 2;
  const cy = el.y + el.h / 2;
  const fill = color(el.color);

  lines.forEach((line, i) => {
    const lineW = font.widthOfTextAtSize(line, size) + spacing * line.length;
    let leftPt = 0;
    if (el.align === "center") leftPt = (boxW - lineW) / 2;
    else if (el.align === "right") leftPt = boxW - lineW;

    // pt 로 잰 것을 다시 mm 로 되돌려 회전에 태웁니다
    const xMm = el.x + (leftPt / 72) * 25.4;
    const yMm = el.y + ((firstBaseline + i * lineH) / 72) * 25.4;

    if (spacing === 0) {
      const p = map.spin(xMm, yMm, cx, cy, el.rotation);
      page.drawText(line, {
        x: p.x,
        y: p.y,
        size,
        font,
        color: fill,
        opacity: el.opacity,
        rotate: degrees(-el.rotation),
      });
      return;
    }

    // 자간이 있으면 글자를 하나씩 놓습니다 — PDF 에는 자간 속성이 없습니다
    let cursorPt = leftPt;
    for (const ch of line) {
      const chXMm = el.x + (cursorPt / 72) * 25.4;
      const p = map.spin(chXMm, yMm, cx, cy, el.rotation);
      page.drawText(ch, {
        x: p.x,
        y: p.y,
        size,
        font,
        color: fill,
        opacity: el.opacity,
        rotate: degrees(-el.rotation),
      });
      cursorPt += font.widthOfTextAtSize(ch, size) + spacing;
    }
  });

  if (el.underline) {
    const y = el.y + ((firstBaseline + size * 0.12) / 72) * 25.4;
    const p1 = map.spin(el.x, y, cx, cy, el.rotation);
    const p2 = map.spin(el.x + el.w, y, cx, cy, el.rotation);
    page.drawLine({ start: p1, end: p2, thickness: size * 0.06, color: fill });
  }
}

/* ------------------------------------------------------------
   도형
   ------------------------------------------------------------ */

function drawShape(page: PDFPage, el: Extract<PrintElement, { kind: "shape" }>, map: Mapper) {
  const cx = el.x + el.w / 2;
  const cy = el.y + el.h / 2;
  const fill = color(el.fill);
  const border = el.stroke && (el.strokeWidth ?? 0) > 0 ? color(el.stroke) : undefined;
  const borderWidth = map.pt(el.strokeWidth ?? 0);

  if (el.shape === "ellipse") {
    const c = map.at(cx, cy);
    page.drawEllipse({
      x: c.x,
      y: c.y,
      xScale: map.pt(el.w / 2),
      yScale: map.pt(el.h / 2),
      color: fill,
      borderColor: border,
      borderWidth,
      opacity: el.opacity,
      rotate: degrees(-el.rotation),
    });
    return;
  }

  if (el.shape === "line" || el.shape === "arrow") {
    const y = cy;
    const thickness = Math.max(map.pt(el.h), 0.5);
    const tail = el.shape === "arrow" ? el.x + el.w - el.h * 1.8 : el.x + el.w;
    page.drawLine({
      start: map.spin(el.x, y, cx, cy, el.rotation),
      end: map.spin(tail, y, cx, cy, el.rotation),
      thickness,
      color: fill,
      opacity: el.opacity,
    });
    if (el.shape === "arrow") {
      const head = el.h * 1.8;
      const a = map.spin(el.x + el.w, y, cx, cy, el.rotation);
      const b = map.spin(el.x + el.w - head, y - el.h, cx, cy, el.rotation);
      const c = map.spin(el.x + el.w - head, y + el.h, cx, cy, el.rotation);
      page.drawSvgPath(`M ${a.x} ${-a.y} L ${b.x} ${-b.y} L ${c.x} ${-c.y} Z`, {
        x: 0,
        y: 0,
        color: fill,
        opacity: el.opacity,
      });
    }
    return;
  }

  // 나머지는 svg 경로 하나로 — 화면과 같은 모양을 씁니다
  const w = map.pt(el.w);
  const h = map.pt(el.h);
  const path =
    el.shape === "rect"
      ? roundedRectPath(w, h, map.pt(el.radius ?? 0))
      : el.shape === "triangle"
        ? `M ${w / 2} 0 L ${w} ${h} L 0 ${h} Z`
        : el.shape === "star"
          ? starPath(w, h)
          : bubblePath(w, h);

  // svg 경로는 왼쪽 위를 기준으로 y 가 아래로 흐릅니다
  const topLeft = map.spin(el.x, el.y, cx, cy, el.rotation);
  page.drawSvgPath(path, {
    x: topLeft.x,
    y: topLeft.y,
    color: fill,
    borderColor: border,
    borderWidth,
    opacity: el.opacity,
    rotate: degrees(-el.rotation),
  });
}

function roundedRectPath(w: number, h: number, r: number): string {
  const rr = Math.min(r, w / 2, h / 2);
  if (rr <= 0) return `M 0 0 H ${w} V ${h} H 0 Z`;
  return [
    `M ${rr} 0`,
    `H ${w - rr}`,
    `Q ${w} 0 ${w} ${rr}`,
    `V ${h - rr}`,
    `Q ${w} ${h} ${w - rr} ${h}`,
    `H ${rr}`,
    `Q 0 ${h} 0 ${h - rr}`,
    `V ${rr}`,
    `Q 0 0 ${rr} 0`,
    "Z",
  ].join(" ");
}

function starPath(w: number, h: number): string {
  const cx = w / 2;
  const cy = h / 2;
  const base = Math.min(w, h) / 2;
  const kx = w / Math.min(w, h);
  const ky = h / Math.min(w, h);
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? base : base * 0.42;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(a) * kx} ${cy + r * Math.sin(a) * ky}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

function bubblePath(w: number, h: number): string {
  const r = Math.min(w, h) * 0.14;
  const body = h * 0.82;
  return [
    `M ${r} 0`,
    `H ${w - r}`,
    `Q ${w} 0 ${w} ${r}`,
    `V ${body - r}`,
    `Q ${w} ${body} ${w - r} ${body}`,
    `H ${w * 0.34}`,
    `L ${w * 0.22} ${h}`,
    `L ${w * 0.24} ${body}`,
    `H ${r}`,
    `Q 0 ${body} 0 ${body - r}`,
    `V ${r}`,
    `Q 0 0 ${r} 0`,
    "Z",
  ].join(" ");
}

/* ------------------------------------------------------------
   사진
   ------------------------------------------------------------ */

async function drawImage(
  pdf: PDFDocument,
  page: PDFPage,
  el: Extract<PrintElement, { kind: "image" }>,
  map: Mapper,
  dpi: number,
) {
  const raster = await rasterize(el.src, el.w, el.h, dpi, {
    fit: el.fit,
    focusX: el.focusX,
    focusY: el.focusY,
    radius: el.radius,
    filter: `brightness(${el.brightness ?? 100}%) contrast(${el.contrast ?? 100}%) saturate(${el.saturate ?? 100}%)`,
  });
  const img = raster.type === "png" ? await pdf.embedPng(raster.bytes) : await pdf.embedJpg(raster.bytes);

  const cx = el.x + el.w / 2;
  const cy = el.y + el.h / 2;
  // drawImage 는 왼쪽 «아래» 를 기준으로 잡습니다
  const anchor = map.spin(el.x, el.y + el.h, cx, cy, el.rotation);
  page.drawImage(img, {
    x: anchor.x,
    y: anchor.y,
    width: map.pt(el.w),
    height: map.pt(el.h),
    opacity: el.opacity,
    rotate: degrees(-el.rotation),
  });
}

/**
 * 사진을 «놓인 크기 그대로» 다시 그립니다.
 *
 * PDF 에는 자르기(clip)가 없어서, cover 로 채운 사진·둥근 모서리·밝기 보정을
 * 그대로 넣을 방법이 없습니다. 그래서 브라우저 캔버스에서 미리 그 모양대로
 * 만들어 넣습니다. 크기는 인쇄 해상도에 맞춰 잡으므로 화질 손해는 없습니다.
 */
async function rasterize(
  src: string,
  wMm: number,
  hMm: number,
  dpi: number,
  opts: {
    fit: "cover" | "contain";
    focusX?: number;
    focusY?: number;
    radius?: number;
    filter?: string;
  },
): Promise<{ bytes: Uint8Array; type: "png" | "jpg" }> {
  const img = await loadImage(src);
  const w = Math.max(1, Math.round((wMm / 25.4) * dpi));
  const h = Math.max(1, Math.round((hMm / 25.4) * dpi));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  const transparent = (opts.radius ?? 0) > 0 || opts.fit === "contain";
  if (opts.radius && opts.radius > 0) {
    const r = Math.min((opts.radius / wMm) * w, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(w, 0, w, h, r);
    ctx.arcTo(w, h, 0, h, r);
    ctx.arcTo(0, h, 0, 0, r);
    ctx.arcTo(0, 0, w, 0, r);
    ctx.closePath();
    ctx.clip();
  }
  if (opts.filter) ctx.filter = opts.filter;

  const ratio = img.naturalWidth / img.naturalHeight;
  const boxRatio = w / h;
  if (opts.fit === "contain") {
    const dw = ratio > boxRatio ? w : h * ratio;
    const dh = ratio > boxRatio ? w / ratio : h;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  } else {
    const sw = ratio > boxRatio ? img.naturalHeight * boxRatio : img.naturalWidth;
    const sh = ratio > boxRatio ? img.naturalHeight : img.naturalWidth / boxRatio;
    const sx = (img.naturalWidth - sw) * (opts.focusX ?? 0.5);
    const sy = (img.naturalHeight - sh) * (opts.focusY ?? 0.5);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  }

  const url = transparent ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.94);
  return { bytes: await dataUrlToBytes(url), type: transparent ? "png" : "jpg" };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("이미지를 불러오지 못했습니다"));
    img.src = src;
  });
}

async function dataUrlToBytes(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  return new Uint8Array(await res.arrayBuffer());
}

/* ------------------------------------------------------------
   재단 표시
   ------------------------------------------------------------ */

/** 인쇄소가 어디를 자를지 아는 표시. 재단선 밖 여백에만 그립니다. */
function drawCropMarks(page: PDFPage, doc: PrintDoc, bleedMm: number) {
  const b = mmToPt(bleedMm);
  const len = Math.min(b, mmToPt(5));
  const w = mmToPt(doc.width);
  const h = mmToPt(doc.height);
  const ink = rgb(0, 0, 0);
  const t = 0.4;
  const corners = [
    { x: b, y: b },
    { x: b + w, y: b },
    { x: b, y: b + h },
    { x: b + w, y: b + h },
  ];
  for (const c of corners) {
    const sx = c.x === b ? -1 : 1;
    const sy = c.y === b ? -1 : 1;
    page.drawLine({
      start: { x: c.x + sx * (b - len), y: c.y },
      end: { x: c.x + sx * b, y: c.y },
      thickness: t,
      color: ink,
    });
    page.drawLine({
      start: { x: c.x, y: c.y + sy * (b - len) },
      end: { x: c.x, y: c.y + sy * b },
      thickness: t,
      color: ink,
    });
  }
}
