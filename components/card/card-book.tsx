"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CardFace } from "@/components/card/faces";
import type { CardDesign, CardDoc } from "@/lib/card/types";

/* ============================================================
   접힌 카드 — 진짜로 열리고 넘어갑니다

   종이 한 장을 반으로 접으면 면이 넷 생깁니다. 그 관계를 그대로
   3D 로 옮겼습니다.

   방향이 중요합니다. 카드는 책과 같이 왼쪽으로 열립니다 — 덮개를
   오른쪽에서 왼쪽으로 넘기면 앞면이 왼쪽에 눕고 안쪽 두 면이
   드러납니다. 반대로 만들면 오른쪽에서 왼쪽으로 읽는 책이 되어
   버립니다.

     · 왼쪽 장(경첩) : 앞면 = 안쪽 왼쪽, 뒷면 = 카드 앞면
     · 오른쪽 장(고정): 앞면 = 안쪽 오른쪽, 뒷면 = 카드 뒷면

   닫혀 있을 때 왼쪽 장은 접는 선(오른쪽 모서리)을 축으로 180도
   접혀 오른쪽 장 위에 포개져 있고, 그 뒷면(=카드 앞면)이 우리 쪽을
   봅니다. 열면 0도로 펴지면서 왼쪽으로 눕습니다. 카드 뒷면을 보려면
   닫고 통째로 뒤집습니다 — 실제로 카드를 뒤집는 동작 그대로입니다.

   세 걸음입니다.
     0 앞면   (닫힌 카드)
     1 안쪽   (펼친 카드)
     2 뒷면   (닫고 뒤집은 카드)
   ============================================================ */

export const STEPS = ["앞면", "왼쪽", "오른쪽", "뒷면"] as const;
export type Step = 0 | 1 | 2 | 3;

export function CardBook({
  design,
  doc,
  /** 마운트하자마자 저절로 펴집니다 — 링크를 받아 연 사람이 보는 장면 */
  autoOpen = false,
  /** 밖에서 걸음을 정할 때 (편집기) */
  step,
  onStep,
  /** 좌우 화살표와 걸음 표시를 붙일지 */
  controls = true,
  className = "",
}: {
  design: CardDesign;
  doc: CardDoc;
  autoOpen?: boolean;
  step?: Step;
  onStep?: (s: Step) => void;
  controls?: boolean;
  className?: string;
}) {
  const [inner, setInner] = useState<Step>(autoOpen ? 0 : step ?? 0);
  const current = step ?? inner;

  const go = useCallback(
    (s: Step) => {
      if (onStep) onStep(s);
      else setInner(s);
    },
    [onStep],
  );

  /* 링크를 열자마자 카드가 저절로 펴집니다. 곧바로 열면 "이미 열려
     있던 것"으로 보여서, 닫힌 상태를 한 박자 보여 준 뒤 엽니다. */
  useEffect(() => {
    if (!autoOpen || step !== undefined) return;
    const t = setTimeout(() => setInner(1), 900);
    return () => clearTimeout(t);
  }, [autoOpen, step]);

  /* 손가락으로 넘기기 */
  const drag = useRef<{ x: number; y: number } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
    const next = dx < 0 ? current + 1 : current - 1;
    if (next >= 0 && next <= 3) go(next as Step);
  };

  const closed = current === 0 || current === 3;
  /* 닫힌 카드는 오른쪽 반만 차지하므로 무대를 왼쪽으로 당겨 화면
     가운데에 둡니다. 뒤집고 나면 왼쪽 반으로 옮겨 가므로 반대로
     밀어야 같은 자리에 옵니다.

     좁은 화면에서는 무대가 두 배 넓고 한 면만 보이므로 옮기는 양도
     두 배입니다. 두 값을 다 내려보내고 어느 쪽을 쓸지는 CSS 가
     고릅니다 — 화면 폭을 자바스크립트로 재면 서버가 그린 결과와
     어긋나기 때문입니다. */
  const shift = current === 0 ? "-25%" : current === 3 ? "25%" : "0%";
  const shiftSm = current === 0 || current === 2 ? "-50%" : "0%";

  return (
    <div className={`cb ${className}`} data-step={current}>
      <div
        className="cb-viewport"
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={() => (drag.current = null)}
      >
        <div
          className="cb-stage"
          style={
            {
              "--cb-shift": shift,
              "--cb-shift-sm": shiftSm,
              "--cb-flip": current === 3 ? "180deg" : "0deg",
              "--cb-flap": closed ? "180deg" : "0deg",
            } as React.CSSProperties
          }
        >
          <span className="cb-cast" aria-hidden />

          {/* 오른쪽 장 — 고정. 뒷면이 이 장의 반대쪽입니다. */}
          <div className="cb-leaf cb-leaf-r">
            <div className="cb-side cb-side-a">
              <CardFace face="right" design={design} doc={doc} />
              <span className="cb-gutter cb-gutter-l" aria-hidden />
            </div>
            <div className="cb-side cb-side-b">
              <CardFace face="back" design={design} doc={doc} />
            </div>
          </div>

          {/* 왼쪽 장 — 넘어가는 덮개. 닫혀 있을 때 앞면이 됩니다. */}
          <div className="cb-leaf cb-leaf-l">
            <div className="cb-side cb-side-a">
              <CardFace face="left" design={design} doc={doc} />
              <span className="cb-gutter cb-gutter-r" aria-hidden />
            </div>
            <div className="cb-side cb-side-b">
              <CardFace face="front" design={design} doc={doc} />
            </div>
            {/* 종이 단면 — 자유단(왼쪽 모서리)에 세워 두는 얇은 띠 */}
            <span className="cb-edge" aria-hidden />
            {/* 넘어가는 동안 지는 그늘 */}
            <span className="cb-shade" aria-hidden />
          </div>
        </div>
      </div>

      {controls && (
        <div className="cb-controls">
          <button
            type="button"
            className="cb-arrow"
            onClick={() => go(Math.max(0, current - 1) as Step)}
            disabled={current === 0}
            aria-label="이전 면"
          >
            ‹
          </button>
          <div className="cb-dots" role="tablist" aria-label="카드 면">
            {STEPS.map((label, i) => (
              <button
                key={label}
                type="button"
                role="tab"
                aria-selected={i === current}
                onClick={() => go(i as Step)}
                className={i === current ? "is-on" : undefined}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="cb-arrow"
            onClick={() => go(Math.min(3, current + 1) as Step)}
            disabled={current === 3}
            aria-label="다음 면"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
