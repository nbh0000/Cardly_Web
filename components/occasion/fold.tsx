import Link from "next/link";
import { Cover, designStyle } from "@/components/occasion/cover";
import { sampleFor } from "@/lib/occasion/occasions";
import type { Design } from "@/lib/occasion/types";

/* 목록에 서 있는 접힌 카드.

   납작한 사각형 섬네일 대신 «접히는 물건»으로 보여 줍니다. 뒷장이
   왼쪽으로 조금 벌어져 있어서, 누르면 열린다는 것을 설명 없이 압니다.
   손을 올리면 더 벌어집니다. */

export function Fold({ design }: { design: Design }) {
  const sample = sampleFor(design.id, design.occasion);

  return (
    <Link
      href={`/invitation-card/${design.id}/`}
      className="oc oc-fold-link group block"
      style={designStyle(design)}
    >
      <div className="oc-fold">
        <div className="oc-fold-in">
          <span className="oc-fold-shadow" aria-hidden />
          <span className="oc-fold-back" aria-hidden />
          <div className="oc-fold-front">
            <Cover
              design={design}
              eyebrow={sample.eyebrow}
              title={sample.title}
              date={sample.date}
            />
          </div>
        </div>
      </div>

      <div className="mt-7 text-center">
        <p className="font-serif text-[1.0625rem] text-ink transition-colors group-hover:text-rose-deep">
          {design.name}
        </p>
        <p className="mt-1.5 text-[0.75rem] text-muted">{design.note}</p>
      </div>
    </Link>
  );
}
