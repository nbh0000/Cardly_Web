"use client";

/**
 * 마흔여덟 장을 실제로 열어 보는 자리.
 *
 * scripts/print-check.mjs 는 «값» 을 봅니다 — 좌표가 안전선 안에 있는가,
 * 글꼴이 몇 벌인가. 그건 정적인 검사라 «열면 실제로 그려지는가» 는 답하지
 * 못합니다. PDF 를 만들다 죽는 것도, 사진이 404 인 것도 거기서는 안 잡힙니다.
 *
 * 그래서 여기서 한 장씩 진짜로 돌립니다. 사람이 편집기에서 하는 순서를
 * 그대로 흉내 냅니다.
 *
 *   ① 템플릿을 연다            (문서 만들기)
 *   ② 첫 글자를 고친다          (텍스트 수정)
 *   ③ 사진을 다른 것으로 바꾼다  (이미지 교체)
 *   ④ AI 가 준 문구를 얹는다     (문구 적용 — 부르지는 않고 결과만 넣습니다)
 *   ⑤ PDF 를 만든다            (내보내기)
 *
 * ④ 에서 진짜로 Gemini 를 부르지 않는 이유는 둘입니다. 마흔여덟 번 부르면
 * 크레딧이 그만큼 나가고, 무엇보다 이 화면이 검사하려는 것은 «AI 가 좋은
 * 문구를 주는가» 가 아니라 «받은 문구가 문서에 제대로 들어가는가» 입니다.
 *
 * 만든 PDF 는 내려받지 않고 바로 뜯어봅니다 — 몇 면인지, 크기가 규격과
 * 맞는지, 글자가 벡터로 들어갔는지, 그리고 쓰인 글자의 폭이 글꼴 표에
 * 빠짐없이 들어 있는지. 마지막 것이 예전에 «14:00» 을 «14:  00» 으로
 * 만들었던 그 검사입니다.
 */

import { useState } from "react";
import { PDFDocument, PDFName, PDFRawStream, decodePDFRawStream } from "pdf-lib";
import type { PDFContext } from "pdf-lib";
import { exportPdf } from "@/lib/print/export-pdf";
import { checkPrint } from "@/lib/print/model";
import { minImageDpi, mmToPt } from "@/lib/print/specs";
import { PRINT_TEMPLATES } from "@/lib/print/templates";
import type { PrintDoc, PrintElement } from "@/lib/print/types";

interface Result {
  id: string;
  category: string;
  ok: boolean;
  pages?: number;
  sizeMm?: string;
  glyphs?: number;
  bytes?: number;
  ms?: number;
  warnings?: number;
  steps: string[];
  problem?: string;
}

/** ② 첫 글자를 고칩니다 */
function editFirstText(doc: PrintDoc): { doc: PrintDoc; done: boolean } {
  const at = doc.elements.findIndex((e) => e.kind === "text");
  if (at < 0) return { doc, done: false };
  const elements = [...doc.elements];
  const el = elements[at] as Extract<PrintElement, { kind: "text" }>;
  elements[at] = { ...el, text: "점검 문구 · 2026년 3월 14:00–17:00" };
  return { doc: { ...doc, elements }, done: true };
}

/** ③ 사진을 다른 파일로 바꿉니다 */
function swapFirstImage(doc: PrintDoc, src: string): { doc: PrintDoc; done: boolean } {
  const at = doc.elements.findIndex((e) => e.kind === "image");
  if (at < 0) return { doc, done: false };
  const elements = [...doc.elements];
  const el = elements[at] as Extract<PrintElement, { kind: "image" }>;
  elements[at] = { ...el, src, naturalWidth: 2048, naturalHeight: 2048 };
  return { doc: { ...doc, elements }, done: true };
}

/** ④ AI 가 준 문구를 얹습니다 — 실제 호출은 하지 않습니다 */
function applyAiLine(doc: PrintDoc, line: string): { doc: PrintDoc; done: boolean } {
  const at = doc.elements.findIndex((e) => e.kind === "text");
  if (at < 0) return { doc, done: false };
  const elements = [...doc.elements];
  const el = elements[at] as Extract<PrintElement, { kind: "text" }>;
  elements[at] = { ...el, text: line };
  return { doc: { ...doc, elements }, done: true };
}

/** ⑤ 만든 PDF 를 뜯어봅니다 */
async function inspectPdf(blob: Blob, doc: PrintDoc, bleed: number) {
  const pdf = await PDFDocument.load(await blob.arrayBuffer());

  /* pdf-lib 의 저수준 객체는 타입이 촘촘해서, 여기서만 느슨하게 봅니다.
     하는 일은 «글꼴마다 들어 있는 글자 폭 표(W)를 훑는 것» 하나입니다. */
  const look = (v: unknown) => (pdf.context as unknown as PDFContext).lookup(v as never);
  const covered = new Set<number>();
  pdf.context.enumerateIndirectObjects().forEach(([, obj]) => {
    try {
      const dict = obj as unknown as { get?: (n: unknown) => unknown };
      if (!dict.get) return;
      if (String(dict.get(PDFName.of("Subtype"))) !== "/CIDFontType2") return;
      const arr = (look(dict.get(PDFName.of("W"))) as unknown as { asArray(): unknown[] }).asArray();
      for (let i = 0; i < arr.length - 1; i += 2) {
        const start = (look(arr[i]) as unknown as { asNumber(): number }).asNumber();
        const widths = look(arr[i + 1]) as unknown as { size(): number };
        for (let k = 0; k < widths.size(); k++) covered.add(start + k);
      }
    } catch {
      /* CIDFont 가 아닌 객체 */
    }
  });

  let glyphs = 0;
  const missing = new Set<number>();
  for (const page of pdf.getPages()) {
    const contents = page.node.Contents() as unknown;
    const raw =
      contents instanceof PDFRawStream
        ? contents
        : (look((contents as { get(i: number): unknown }).get(0)) as PDFRawStream);
    const text = new TextDecoder("latin1").decode(decodePDFRawStream(raw).decode());
    for (const m of text.matchAll(/<([0-9A-Fa-f]+)>\s*Tj/g)) {
      const hex = m[1]!;
      for (let i = 0; i < hex.length; i += 4) {
        const gid = parseInt(hex.slice(i, i + 4), 16);
        glyphs++;
        if (!covered.has(gid)) missing.add(gid);
      }
    }
  }

  const page0 = pdf.getPage(0);
  const wantW = mmToPt(doc.width + bleed * 2);
  const wantH = mmToPt(doc.height + bleed * 2);
  const sizeOk =
    Math.abs(page0.getWidth() - wantW) < 1 && Math.abs(page0.getHeight() - wantH) < 1;

  return {
    pages: pdf.getPageCount(),
    glyphs,
    missing: [...missing],
    sizeOk,
    sizeMm: `${Math.round((page0.getWidth() / 72) * 25.4)} × ${Math.round((page0.getHeight() / 72) * 25.4)}`,
  };
}

export function PrintSelfCheck() {
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [at, setAt] = useState(0);

  const run = async () => {
    setBusy(true);
    setResults([]);
    const out: Result[] = [];

    for (const [i, t] of PRINT_TEMPLATES.entries()) {
      setAt(i + 1);
      const started = performance.now();
      const steps: string[] = ["열기"];
      let problem: string | undefined;
      let info: Awaited<ReturnType<typeof inspectPdf>> | undefined;
      let bytes = 0;

      try {
        let doc = structuredClone(t.doc);

        const edited = editFirstText(doc);
        doc = edited.doc;
        if (edited.done) steps.push("글자 수정");

        const swapped = swapFirstImage(doc, "/print-art/menu-linen-texture.jpg");
        doc = swapped.doc;
        if (swapped.done) steps.push("사진 교체");

        const ai = applyAiLine(doc, "봄맞이 감사 행사 — 3월 한 달간 20% 할인");
        doc = ai.doc;
        if (ai.done) steps.push("AI 문구");

        const blob = await exportPdf(doc, { bleed: true, cropMarks: true });
        bytes = blob.size;
        steps.push("PDF");

        info = await inspectPdf(blob, doc, doc.bleed);
        if (!info.sizeOk) problem = `PDF 크기가 규격과 다릅니다 (${info.sizeMm}mm)`;
        else if (info.glyphs === 0) problem = "PDF 에 글자가 하나도 들어가지 않았습니다";
        else if (info.missing.length) problem = `글자 폭이 빠졌습니다: ${info.missing.join(",")}`;
      } catch (e) {
        problem = e instanceof Error ? e.message : String(e);
      }

      out.push({
        id: t.id,
        category: t.category,
        ok: !problem,
        pages: info?.pages,
        sizeMm: info?.sizeMm,
        glyphs: info?.glyphs,
        bytes,
        ms: Math.round(performance.now() - started),
        warnings: checkPrint(t.doc.elements, t.doc, minImageDpi(t.doc.dpi)).length,
        steps,
        problem,
      });
      setResults([...out]);
    }

    setBusy(false);
  };

  const failed = results.filter((r) => !r.ok);

  return (
    <div className="pc-root">
      <div className="pc-bar">
        <button type="button" className="pe-btn pe-btn-solid" disabled={busy} onClick={() => void run()}>
          {busy ? `${at} / ${PRINT_TEMPLATES.length} …` : `${PRINT_TEMPLATES.length}장 점검 시작`}
        </button>
        {results.length > 0 && (
          <span className="pc-sum">
            성공 {results.length - failed.length} · 실패 {failed.length}
          </span>
        )}
      </div>

      {results.length > 0 && (
        <table className="pc-table">
          <thead>
            <tr>
              <th>템플릿</th>
              <th>갈래</th>
              <th>단계</th>
              <th>면</th>
              <th>크기(mm)</th>
              <th>글자</th>
              <th>MB</th>
              <th>ms</th>
              <th>경고</th>
              <th>결과</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id} className={r.ok ? undefined : "is-bad"}>
                <td>{r.id}</td>
                <td>{r.category}</td>
                <td>{r.steps.join(" → ")}</td>
                <td>{r.pages ?? "—"}</td>
                <td>{r.sizeMm ?? "—"}</td>
                <td>{r.glyphs ?? "—"}</td>
                <td>{r.bytes ? (r.bytes / 1_048_576).toFixed(1) : "—"}</td>
                <td>{r.ms}</td>
                <td>{r.warnings}</td>
                <td>{r.ok ? "○" : `✗ ${r.problem}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 기계가 읽을 수 있게 한 덩이로도 남깁니다 */}
      {!busy && results.length > 0 && (
        <pre id="pc-json" hidden>
          {JSON.stringify({
            total: results.length,
            failed: failed.length,
            problems: failed.map((r) => ({ id: r.id, problem: r.problem })),
          })}
        </pre>
      )}
    </div>
  );
}
