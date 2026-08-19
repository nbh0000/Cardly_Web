import Link from "next/link";
import { Cover, designStyle } from "@/components/occasion/faces";
import { sampleFor } from "@/lib/occasion/occasions";
import type { Design, InviteData } from "@/lib/occasion/types";

/* 목록에 서 있는 접힌 카드.

   납작한 사각형 섬네일 대신 «접히는 물건» 으로 보여 줍니다. 뒷장이
   비스듬히 삐져나와 있어서, 누르면 열린다는 것을 설명 없이 압니다.

   큰 카드와 완전히 같은 조판을 zoom 으로 줄여 보여 줍니다. 상호작용이
   없으므로 서버 컴포넌트이고, 닫혀 있을 때 보이지 않는 두 면(속 왼쪽 ·
   뒤표지)은 아예 그리지 않습니다. */

export function ClosedCard({
  design,
  data,
}: {
  design: Design;
  data?: Pick<InviteData, "eyebrow" | "title" | "date" | "host">;
}) {
  const sample = data ?? sampleFor(design.id, design.occasion);

  return (
    <div className="oc oc-thumb" style={designStyle(design)}>
      <div className="fc" data-view="1">
        <div className="fc-model">
          <div className="fc-page fc-page-1">
            <div className="fc-face">
              <Cover design={design} data={sample} thumb />
            </div>
          </div>
          {/* 뒤로 삐져나오는 속장 — 종이색만 보입니다 */}
          <div className="fc-page fc-page-3">
            <div className="fc-face" />
          </div>
          <span className="fc-shadow" aria-hidden />
        </div>
      </div>
    </div>
  );
}

export function Fold({ design }: { design: Design }) {
  return (
    <Link
      href={`/invitation-card/${design.id}/`}
      className="oc group block focus-visible:outline-none"
    >
      <ClosedCard design={design} />

      <div className="mt-4 text-center">
        <p className="font-serif text-[1.0625rem] text-ink transition-colors group-hover:text-rose-deep group-focus-visible:text-rose-deep">
          {design.name}
        </p>
        <p className="mt-1.5 text-[0.75rem] leading-relaxed text-muted">
          {design.note}
        </p>
        <p className="mt-2 text-[0.6875rem] tracking-[0.14em] text-hint uppercase">
          {design.kind === "photo" ? "Photo" : "Graphic"}
        </p>
      </div>
    </Link>
  );
}
