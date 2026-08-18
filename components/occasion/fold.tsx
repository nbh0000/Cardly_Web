import Link from "next/link";
import { Cover, designStyle } from "@/components/occasion/faces";
import { sampleFor } from "@/lib/occasion/occasions";
import type { Design, InviteData } from "@/lib/occasion/types";

/* 목록에 서 있는 접힌 카드.

   납작한 사각형 섬네일 대신 «접히는 물건» 으로 보여 줍니다. 뒷장이
   비스듬히 삐져나와 있어서, 누르면 열린다는 것을 설명 없이 압니다.

   상호작용이 없으므로 서버 컴포넌트입니다. 스물넉 장이 깔리는
   목록이라 자바스크립트를 한 줄도 붙이지 않는 편이 낫습니다.
   닫혀 있을 때 보이지 않는 두 면(속 왼쪽·뒤표지)은 아예 그리지
   않습니다 — 어차피 뒷면이라 화면에 나오지 않습니다. */

export function ClosedCard({
  design,
  data,
  className,
}: {
  design: Design;
  data?: Pick<InviteData, "eyebrow" | "title" | "date" | "host">;
  className?: string;
}) {
  const sample = data ?? sampleFor(design.id, design.occasion);

  return (
    <div
      className={`fc fc-flat ${className ?? ""}`}
      data-view="1"
      style={
        {
          ...designStyle(design),
          "--fc-stage": "0.9",
          "--fc-pw": "68%",
        } as React.CSSProperties
      }
    >
      <div className="fc-model">
        <div className="fc-page fc-page-1">
          <div className="fc-face">
            <Cover design={design} data={sample} thumb />
          </div>
        </div>
        {/* 뒤로 삐져나오는 속장 — 종이색만 보입니다 */}
        <div className="fc-page fc-page-3">
          <div className="fc-face" style={{ background: "var(--oc-inside)" }} />
        </div>
        <span className="fc-shadow" aria-hidden />
      </div>
    </div>
  );
}

export function Fold({ design }: { design: Design }) {
  return (
    <Link href={`/invitation-card/${design.id}/`} className="group block">
      <ClosedCard design={design} />

      <div className="mt-4 text-center">
        <p className="font-serif text-[1.0625rem] text-ink transition-colors group-hover:text-rose-deep">
          {design.name}
        </p>
        <p className="mt-1.5 text-[0.75rem] leading-relaxed text-muted">
          {design.note}
        </p>
      </div>
    </Link>
  );
}
