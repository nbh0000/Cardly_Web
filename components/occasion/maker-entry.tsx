"use client";

import { useSyncExternalStore } from "react";
import { Maker } from "@/components/occasion/maker";
import { FALLBACK_DESIGN, getDesign } from "@/lib/occasion/designs";
import { sampleFor } from "@/lib/occasion/occasions";

/* /invitation-card/make/?d=<디자인> 으로 들어옵니다.

   정적 내보내기라 주소의 물음표 뒤는 서버가 모릅니다. 그래서 첫
   그림은 기본 디자인으로 그리고, 브라우저에서 읽은 값으로 바꿔
   답니다. Maker 에 key 를 걸어 두어 디자인이 정해지는 순간 초기값이
   제대로 들어간 채로 새로 시작합니다. */

const subscribeNever = () => () => {};

function usePickedId(): string {
  return useSyncExternalStore(
    subscribeNever,
    () => new URLSearchParams(window.location.search).get("d") ?? "",
    () => "",
  );
}

export function MakerEntry() {
  const picked = usePickedId();
  const design = picked ? getDesign(picked) : FALLBACK_DESIGN;

  return (
    <Maker key={design.id} initial={sampleFor(design.id, design.occasion)} />
  );
}
