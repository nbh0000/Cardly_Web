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
import { isSubstitutedInPdf, PDF_FALLBACK_FONT, printFont } from "@/lib/print/fonts";
import { minImageDpi } from "@/lib/print/specs";
import { getDoc } from "@/lib/backend/docs";
import { paymentsEnabled, startCheckout } from "@/lib/backend/payments";
import { formatPrice, PRICES } from "@/lib/plan";
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

export function ExportDialog({
  doc,
  paid = false,
  docId = null,
  onClose,
}: {
  doc: PrintDoc;
  /** 결제해서 워터마크가 풀렸는지 */
  paid?: boolean;
  /** 계정에 저장해 둔 문서라면 그 id — 결제하려면 필요합니다 */
  docId?: string | null;
  onClose: () => void;
}) {
  const [bleed, setBleed] = useState(doc.bleed > 0);
  const [cropMarks, setCropMarks] = useState(doc.bleed > 0);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const warnings = checkPrint(doc.elements, doc, minImageDpi(doc.dpi));

  const substituted = Array.from(
    new Set(
      doc.elements
        .filter((e) => e.kind === "text" && isSubstitutedInPdf(e.font))
        .map((e) => (e.kind === "text" ? printFont(e.font).label : "")),
    ),
  ).filter(Boolean);

  const safeName = (doc.title || "인쇄물").replace(/[\\/:*?"<>|]/g, "");

  const payReady = Boolean(docId) && paymentsEnabled;

  /**
   * 결제창 열기.
   *
   * 문서를 계정에 저장한 뒤에만 열립니다. 주문은 문서에 붙고, 문서가
   * 없으면 «무엇을 샀는지» 가 남지 않기 때문입니다.
   */
  const buy = async () => {
    if (!docId) return;
    setBusy("pay");
    setError(null);
    try {
      const row = await getDoc(docId);
      if (!row) throw new Error("저장된 인쇄물을 찾지 못했습니다.");
      await startCheckout(row);
    } catch (e) {
      setError(e instanceof Error ? e.message : "결제창을 열지 못했습니다.");
      setBusy(null);
    }
  };

  const run = async (kind: "pdf" | "png" | "jpg") => {
    setBusy(kind);
    setError(null);
    setNote(null);
    try {
      if (kind === "pdf") {
        const blob = await exportPdf(doc, { bleed, cropMarks, watermark: !paid });
        download(blob, `${safeName}.pdf`);
        setNote("PDF 를 내려받았습니다.");
      } else {
        const node = document.getElementById(bleed ? "pe-paper" : "pe-page");
        if (!node) throw new Error("편집 화면을 찾지 못했습니다.");
        const res = await exportImage(doc, node, kind, { bleed, watermark: !paid });
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

        {!paid && (
          <section className="pe-paywall">
            <p className="pe-paywall-title">지금은 «Cardly 미리보기» 표시가 함께 찍힙니다</p>
            <p className="pe-paywall-body">
              시안으로 돌려 보는 데는 문제가 없습니다. 인쇄소에 넘길 원본은 이 인쇄물 하나에
              {" "}
              {formatPrice(PRICES.print)}이고, 한 번 결제하면 기한 없이 다시 받을 수 있습니다.
            </p>
            {payReady ? (
              <button
                type="button"
                className="pe-btn pe-btn-solid"
                disabled={busy !== null}
                onClick={() => void buy()}
              >
                {busy === "pay" ? "결제창을 여는 중…" : `${formatPrice(PRICES.print)} 결제하고 원본 받기`}
              </button>
            ) : (
              <p className="pe-paywall-body">
                {docId
                  ? "결제 준비가 아직 끝나지 않았습니다."
                  : "먼저 위 막대의 «계정에 저장» 을 눌러 주세요. 저장한 뒤에 결제할 수 있습니다."}
              </p>
            )}
          </section>
        )}

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
          PDF 는 글자와 도형이 벡터로 들어가 아무리 확대해도 깨지지 않습니다. 쓴 글꼴은 파일 안에
          그대로 심으므로 인쇄소 컴퓨터에 그 글꼴이 없어도 같은 모양으로 찍힙니다.
          {substituted.length > 0 &&
            ` 다만 ${withRo(substituted.join("·"))} 쓴 글자는 지금 목록에 없는 글꼴이라 ${PDF_FALLBACK_FONT.label}으로 바뀝니다.`}
          {" "}
          줄바꿈 위치는 브라우저가 아니라 우리가 계산하므로 화면과 미세하게 다를 수 있습니다.
          글꼴을 통째로 심어서 파일은 2~6MB 정도가 됩니다.
        </p>

        <button type="button" className="pe-modal-close" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}
