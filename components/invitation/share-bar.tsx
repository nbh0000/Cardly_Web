"use client";

/**
 * 청첩장 아래에 붙는 공유 도구.
 *
 * 카카오톡 공유는 별도 SDK·앱키 없이도 링크만 붙여넣으면 미리보기가 뜹니다
 * (미리보기 내용은 이 페이지의 <meta> 태그에서 옵니다). 그래서 여기서는
 * 링크를 복사하기 쉽게 하고, 청첩장에 넣을 QR 을 내려받게 합니다.
 */

import { useState } from "react";
import { buildQrSvg } from "@/lib/qr";

export function ShareBar({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // 클립보드 권한이 없으면 주소창을 직접 복사하도록 안내만 합니다.
      window.prompt("아래 주소를 복사해 보내주세요", window.location.href);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQr = () => {
    const svg = buildQrSvg(window.location.href);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `${slug}-qr.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(href), 10_000);
  };

  const share = async () => {
    // 모바일 브라우저의 기본 공유 시트 — 카카오톡이 여기에 바로 뜹니다.
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url: window.location.href });
        return;
      } catch {
        /* 사용자가 취소한 경우 */
      }
    }
    void copy();
  };

  return (
    <div className="px-4 py-6 md:px-0">
      <div className="flex gap-2">
        <button type="button" onClick={share} className="btn btn-primary flex-1">
          청첩장 보내기
        </button>
        <button type="button" onClick={copy} className="btn btn-ghost flex-1 bg-ivory">
          {copied ? "복사했습니다" : "링크 복사"}
        </button>
        <button
          type="button"
          onClick={downloadQr}
          className="btn btn-ghost bg-ivory"
          aria-label="QR 코드 내려받기"
        >
          QR
        </button>
      </div>
      <p className="mt-3 text-center text-caption text-muted">
        카카오톡 대화창에 링크를 붙여넣으면 신랑·신부 이름과 사진이 함께
        보입니다.
      </p>
    </div>
  );
}
