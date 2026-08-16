import { FaceFront } from "@/components/card/faces";
import type { CardDesign, CardDoc } from "@/lib/card/types";

/**
 * 목록 썸네일.
 *
 * 앞면만 보여 주되, 접힌 종이로 보이게 뒷장의 모서리를 비스듬히
 * 빼 둡니다. 앞면 자체는 돌리지 않습니다 — 카드를 고르는 사람에게는
 * 그림이 또렷한 것이 먼저입니다. 손을 얹으면 그때 열립니다.
 */
export function CardThumb({ design, doc }: { design: CardDesign; doc: CardDoc }) {
  return (
    <div className="ct">
      <div className="ct-stage">
        <span className="ct-cast" aria-hidden />
        <div className="ct-leaf" />
        <div className="ct-front">
          <div className="ct-face">
            <FaceFront design={design} doc={doc} />
          </div>
          <span className="ct-edge" aria-hidden />
          <span className="ct-spine" aria-hidden />
        </div>
      </div>
    </div>
  );
}
