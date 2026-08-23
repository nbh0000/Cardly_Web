"use client";

/**
 * 발행을 마친 뒤 보는 화면 — 링크·QR·보내기.
 *
 * 발행의 끝은 «주소가 생겼다» 가 아니라 «보냈다» 입니다. 그래서 주소를
 * 보여 주고 끝내지 않고, 그 자리에서 카카오톡으로 보내고 QR 을 받고 링크를
 * 복사할 수 있게 둡니다.
 *
 * 미리보기가 예쁘게 뜨기까지 1~2 분 걸린다는 사실도 여기서 정직하게
 * 말합니다. 그 사이에 링크를 붙여넣은 사람이 «왜 사진이 안 뜨지» 하고
 * 지레 포기하지 않도록.
 */

import { useState } from "react";
import { shareAnyhow } from "@/lib/kakao";
import { buildQrSvg } from "@/lib/qr";

export function SharePanel({
  url,
  title,
  description,
  imageUrl,
  slug,
  fresh,
}: {
  url: string;
  title: string;
  description: string;
  imageUrl?: string;
  slug: string;
  /** 방금 발행했는지 — 미리보기 안내를 띄울지 정합니다 */
  fresh?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("아래 주소를 복사해 보내세요", url);
    }
  };

  const downloadQr = () => {
    const svg = buildQrSvg(url);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `${slug}-qr.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(href), 10_000);
  };

  return (
    <div className="grid gap-4">
      <p className="rounded-md border border-line bg-cream px-3.5 py-3 font-mono text-[0.75rem] leading-relaxed break-all text-ink-soft">
        {url}
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => void shareAnyhow({ title, description, url, imageUrl })}
        >
          카카오톡으로 보내기
        </button>
        <button type="button" className="btn btn-ghost bg-white" onClick={copy}>
          {copied ? "복사했습니다" : "링크 복사"}
        </button>
        <a className="btn btn-ghost bg-white" href={url} target="_blank" rel="noreferrer">
          받는 사람 화면으로 열기
        </a>
        <button
          type="button"
          className="btn btn-ghost bg-white"
          onClick={() => setShowQr((v) => !v)}
        >
          {showQr ? "QR 접기" : "QR 코드"}
        </button>
      </div>

      {showQr && (
        <div className="grid justify-items-center gap-3 rounded-lg border border-line bg-white p-6">
          <span
            className="block w-40"
            aria-label="청첩장 주소 QR 코드"
            dangerouslySetInnerHTML={{ __html: buildQrSvg(url) }}
          />
          <button type="button" className="btn btn-ghost btn-sm bg-white" onClick={downloadQr}>
            QR 내려받기 (SVG)
          </button>
          <p className="text-center text-[0.75rem] text-muted">
            종이 청첩장이나 안내판에 그대로 넣을 수 있습니다.
          </p>
        </div>
      )}

      {fresh && (
        <p className="text-[0.75rem] leading-relaxed text-muted">
          링크는 지금 바로 열립니다. 카카오톡에 붙여넣었을 때 사진과 이름이
          함께 뜨는 미리보기는 1~2분 뒤부터 만들어집니다.
        </p>
      )}
    </div>
  );
}
