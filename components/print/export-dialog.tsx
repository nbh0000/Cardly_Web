"use client";

/**
 * 내보내기 — 인쇄를 맡기기 직전의 마지막 화면.
 *
 * 여기서 «점검» 을 크게 보여 줍니다. 안전선 밖에 나간 글자와 해상도가
 * 모자란 사진은 화면에서는 멀쩡하고 종이에서만 문제가 되는데, 그때는
 * 되돌릴 수 없기 때문입니다. 경고가 있어도 내보내기를 막지는 않습니다 —
 * 일부러 그렇게 만든 경우가 있고, 결정은 만든 사람의 몫입니다.
 */

import { useState } from "react";
import { exportPdf } from "@/lib/print/export-pdf";
import { download, exportImage } from "@/lib/print/export-image";
import { checkPrint } from "@/lib/print/model";
import { isSubstitutedInPdf, PDF_EMBEDDED_FONT, printFont } from "@/lib/print/fonts";
import { MIN_IMAGE_DPI } from "@/lib/print/specs";
import type { PrintDoc } from "@/lib/print/types";

/**
 * «프리텐다드로» / «고운돋움으로» — 받침에 따라 조사를 고릅니다.
 *
 * 화면에 글꼴 이름을 그대로 넣는 자리라, 이름이 바뀔 때마다 문장이 어색해지는
 * 것을 막습니다. 한글이 아니면(«A1» 같은 이름) 안전하게 «으로» 를 씁니다.
 */
function withRo(word: string): string {
  const last = word.at(-1) ?? "";
  const code = last.charCodeAt(0);
  const hangul = code >= 0xac00 && code <= 0xd7a3;
  if (!hangul) return `${word}으로`;
  const jong = (code - 0xac00) % 28;
  // 받침이 없거나 ㄹ 받침이면 «로»
  return jong === 0 || jong === 8 ? `${word}로` : `${word}으로`;
}

export function ExportDialog({ doc, onClose }: { doc: PrintDoc; onClose: () => void }) {
  const [bleed, setBleed] = useState(doc.bleed > 0);
  const [cropMarks, setCropMarks] = useState(doc.bleed > 0);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const warnings = checkPrint(doc.elements, doc, MIN_IMAGE_DPI);

  const substituted = Array.from(
    new Set(
      doc.elements
        .filter((e) => e.kind === "text" && isSubstitutedInPdf(e.font))
        .map((e) => (e.kind === "text" ? printFont(e.font).label : "")),
    ),
  ).filter(Boolean);

  const safeName = (doc.title || "인쇄물").replace(/[\\/:*?"<>|]/g, "");

  const run = async (kind: "pdf" | "png" | "jpg") => {
    setBusy(kind);
    setError(null);
    setNote(null);
    try {
      if (kind === "pdf") {
        const blob = await exportPdf(doc, { bleed, cropMarks });
        download(blob, `${safeName}.pdf`);
        setNote("PDF 를 내려받았습니다.");
      } else {
        const node = document.getElementById(bleed ? "pe-paper" : "pe-page");
        if (!node) throw new Error("편집 화면을 찾지 못했습니다.");
        const res = await exportImage(doc, node, kind, { bleed });
        download(res.blob, `${safeName}.${kind}`);
        setNote(
          res.dpi < doc.dpi
            ? `${res.width}×${res.height}px (${res.dpi}dpi) — 화면 한계로 ${doc.dpi}dpi 보다 낮게 나왔습니다. 인쇄소에는 PDF 를 주세요.`
            : `${res.width}×${res.height}px (${res.dpi}dpi) 로 내려받았습니다.`,
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "내보내기에 실패했습니다.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="pe-modal-back" onClick={onClose}>
      <div className="pe-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="pe-modal-title">내보내기</h2>

        <section className="pe-check">
          <h3>점검</h3>
          {warnings.length === 0 ? (
            <p className="pe-check-ok">안전선을 넘은 글자도, 해상도가 모자란 사진도 없습니다.</p>
          ) : (
            <ul>
              {warnings.map((w, i) => (
                <li key={i} className={w.kind === "resolution" ? "is-warn" : "is-danger"}>
                  {w.message}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="pe-check">
          <h3>설정</h3>
          <label className="pe-check-row">
            <input type="checkbox" checked={bleed} onChange={(e) => setBleed(e.target.checked)} />
            재단 여백 {doc.bleed}mm 포함 — 인쇄소에 맡길 때 켭니다
          </label>
          <label className="pe-check-row">
            <input
              type="checkbox"
              checked={cropMarks}
              disabled={!bleed}
              onChange={(e) => setCropMarks(e.target.checked)}
            />
            재단 표시 그리기 (PDF 만)
          </label>
        </section>

        <div className="pe-modal-actions">
          <button type="button" className="pe-btn pe-btn-solid" disabled={busy !== null} onClick={() => run("pdf")}>
            {busy === "pdf" ? "만드는 중…" : "PDF (벡터)"}
          </button>
          <button type="button" className="pe-btn" disabled={busy !== null} onClick={() => run("png")}>
            {busy === "png" ? "만드는 중…" : `PNG ${doc.dpi}dpi`}
          </button>
          <button type="button" className="pe-btn" disabled={busy !== null} onClick={() => run("jpg")}>
            JPG
          </button>
        </div>

        {note && <p className="pe-note">{note}</p>}
        {error && <p className="pe-error">{error}</p>}

        <p className="pe-fineprint">
          PDF 는 글자와 도형이 벡터로 들어가 아무리 확대해도 깨지지 않습니다. 다만 PDF 에 심는 글꼴은
          {" "}
          {PDF_EMBEDDED_FONT.label} 한 벌이라
          {substituted.length > 0
            ? ` ${withRo(substituted.join("·"))} 쓴 글자는 자형이 바뀝니다. 자형을 그대로 두려면 PNG 로 내보내세요.`
            : " 다른 글꼴을 쓰면 자형이 바뀝니다."}
          {" "}
          줄바꿈 위치도 브라우저가 아니라 우리가 계산하므로 화면과 미세하게 다를 수 있습니다.
          글꼴을 통째로 심어서 파일은 1~3MB 정도가 됩니다.
        </p>

        <button type="button" className="pe-modal-close" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}
