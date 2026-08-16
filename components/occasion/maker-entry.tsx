"use client";

import { useCallback, useState } from "react";
import { Maker } from "@/components/occasion/maker";
import { FALLBACK_DESIGN, getDesign } from "@/lib/occasion/designs";
import { sampleFor } from "@/lib/occasion/occasions";
import { decodeInvite } from "@/lib/occasion/share";
import type { InviteData } from "@/lib/occasion/types";

/* 주소에 실린 값을 읽어 무엇으로 시작할지 정합니다.

     /invitation-card/make/?d=iris   그 디자인의 예시로 시작
     /invitation-card/make/?c=…      만들어 둔 초대장을 이어서 고침

   정적 내보내기라 물음표 뒤는 서버가 모릅니다. 그래서 첫 그림은 기본
   디자인으로 그려지고, 브라우저에서 한 번 더 그려집니다. 효과(effect)가
   아니라 ref 로 읽는 것은 이 저장소의 규칙 때문입니다. */

function starter(): InviteData {
  return sampleFor(FALLBACK_DESIGN.id, FALLBACK_DESIGN.occasion);
}

export function MakerEntry() {
  const [seed, setSeed] = useState<InviteData>(starter);

  const read = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const params = new URLSearchParams(window.location.search);

    const code = params.get("c");
    if (code) {
      const parsed = decodeInvite(code);
      if (parsed) {
        setSeed(parsed);
        return;
      }
    }

    const id = params.get("d");
    if (!id) return;
    const design = getDesign(id);
    if (design.id !== FALLBACK_DESIGN.id) {
      setSeed(sampleFor(design.id, design.occasion));
    }
  }, []);

  return (
    <div ref={read}>
      <Maker key={seed.d} initial={seed} />
    </div>
  );
}
