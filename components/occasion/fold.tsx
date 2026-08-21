import Link from "next/link";
import {
  Cover,
  designStyle,
  InsideLeft,
  InsideRight,
} from "@/components/occasion/faces";
import { getOccasion, sampleFor } from "@/lib/occasion/occasions";
import type { Design, InviteData } from "@/lib/occasion/types";

/* 목록에 서 있는 접힌 카드.

   납작한 사각형 섬네일 대신 «접히는 물건» 으로 보여 줍니다. 뒷장이
   비스듬히 삐져나와 있어서, 마우스를 얹으면 그 자리에서 열립니다 —
   설명 문구 없이도 무엇인지 압니다.

   여는 일은 전부 CSS 가 합니다(app/occasion.css 의 .oc-fold:hover).
   자바스크립트가 없으므로 서버 컴포넌트이고, 목록에 스무 장이 깔려도
   상태를 스무 개 들고 있지 않습니다.

   큰 카드와 완전히 같은 조판을 zoom 으로 줄여 보여 줍니다. 넉 면 가운데
   뒤표지는 어느 상태에서도 보이지 않으므로 그리지 않습니다. */

export function ClosedCard({
  design,
  data,
}: {
  design: Design;
  data?: InviteData;
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
          <div className="fc-page fc-page-2">
            <div className="fc-face">
              <InsideLeft data={sample} />
            </div>
          </div>
          <div className="fc-page fc-page-3">
            <div className="fc-face">
              <InsideRight data={sample} daysLeft={null} />
            </div>
          </div>
          <span className="fc-shadow" aria-hidden />
        </div>
      </div>
    </div>
  );
}

export function Fold({ design }: { design: Design }) {
  const occasion = getOccasion(design.occasion);

  return (
    <Link
      href={`/invitation-card/${design.id}/`}
      className="oc-fold group block focus-visible:outline-none"
    >
      <ClosedCard design={design} />

      <div className="mt-3 text-center">
        <p className="font-serif text-[1rem] leading-snug text-ink transition-colors group-hover:text-rose-deep group-focus-visible:text-rose-deep">
          {design.name}
        </p>
        <p className="mt-1 text-[0.75rem] text-muted">{occasion.label}</p>
      </div>
    </Link>
  );
}
