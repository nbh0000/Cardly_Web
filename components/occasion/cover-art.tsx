"use client";

import { useState } from "react";
import { asset } from "@/lib/asset";

/* 표지 그림 한 장.

   그림이 안 올 수도 있습니다 — 지하철에서 링크를 열었거나, 파일이 배포에
   빠졌거나, 브라우저가 webp 를 모를 수도 있습니다. 그때 흰 종이만 남으면
   «망가진 카드» 로 보입니다. 실패하면 그림을 감추고 종이색 위에 옅은
   강조 틴트만 남겨, 그림이 없는 판인 것처럼 보이게 합니다.

   상태를 들어야 해서 클라이언트 컴포넌트입니다. 목록은 서버 컴포넌트지만
   그 안에 이 조각만 클라이언트로 들어가는 것은 값싼 일입니다. */

export function CoverArt({
  file,
  /** 목록·고르는 칸처럼 작게 뜨는 자리 — 폭 480px 판을 씁니다 */
  thumb = false,
  /** 첫 화면에 크게 뜨는 그림이면 먼저 받아 옵니다 */
  priority = false,
}: {
  file: string;
  thumb?: boolean;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="oc-cover-art" data-failed={failed ? "1" : undefined}>
      {/* 정적 내보내기라 next/image 최적화 대상이 아닙니다. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset(`/art/${thumb ? "thumb/" : ""}${file}`)}
        alt=""
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
