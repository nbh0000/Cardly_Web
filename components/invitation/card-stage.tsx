"use client";

import { useRef, useState, type ReactNode } from "react";

/**
 * 초대장을 3D 카드로 세워 두는 무대.
 *
 * 청첩장 미리보기는 폰 프레임 안에 납작하게 들어가지만, 초대장은
 * 어디서 보든 카드로 보여야 합니다 — 목록에서도, 미리보기에서도,
 * 받는 사람이 링크를 열었을 때도. 그래서 미리보기와 발행본에는
 * 이 무대를 씌웁니다.
 *
 * 화면 안에서 실제로 스크롤되는 물건이라 각도는 얕게 둡니다. 크게
 * 돌리면 글자가 흐려지고 터치 좌표가 어긋나서 읽을 수가 없습니다.
 * 마우스를 올려 움직이면 그 방향으로 조금 더 기울어, 이것이 평면이
 * 아니라는 것만 알려 줍니다.
 */
export function CardStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number } | null>(null);

  /* 포인터가 있는 기기에서만 기울입니다. 손가락으로 스크롤하는 중에
     카드가 따라 돌면 읽는 데 방해만 됩니다. */
  const track = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    const nx = (e.clientX - box.left) / box.width - 0.5;
    const ny = (e.clientY - box.top) / box.height - 0.5;
    setTilt({ x: nx, y: ny });
  };

  return (
    <div className="deck" ref={ref} onPointerMove={track} onPointerLeave={() => setTilt(null)}>
      <div
        className="deck-card"
        style={
          tilt
            ? ({
                "--deck-yaw": `${(-tilt.x * 9).toFixed(2)}deg`,
                "--deck-pitch": `${(tilt.y * 5).toFixed(2)}deg`,
              } as React.CSSProperties)
            : undefined
        }
      >
        {/* 종이 단면 — 카드가 두께를 가진 물건으로 보이게 합니다 */}
        <span className="deck-edge deck-edge-r" aria-hidden />
        <span className="deck-edge deck-edge-b" aria-hidden />

        <div className="deck-face">{children}</div>

        <span className="deck-sheen" aria-hidden />
      </div>
      <span className="deck-cast" aria-hidden />
    </div>
  );
}
