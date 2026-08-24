"use client";

/**
 * 템플릿 미리보기 그림.
 *
 * 따로 찍어 둔 스크린샷이 아니라 **편집기가 쓰는 그리개를 그대로 축소한
 * 것**입니다. 템플릿의 글자 하나를 고치면 목록의 그림도 같이 바뀝니다.
 * 스크린샷을 파일로 두면 반드시 어느 날 실물과 어긋나고, 그 어긋남은
 * «미리보기와 다른 것이 나왔다» 는 항의로 돌아옵니다.
 *
 * ── 크기를 픽셀로 받는 이유 ──
 * 그리개는 «1mm 를 몇 px 로 그릴지» 를 인자로 받습니다. 그래서 폭이
 * 정해져야 배율이 정해집니다. 부모의 폭을 CSS 로 따라가게 하려면 컨테이너
 * 질의가 필요한데, 목록·미리보기·홈이 저마다 다른 칸을 쓰는 상황에서는
 * 그쪽이 더 부서지기 쉬웠습니다. 그래서 «담을 상자» 를 픽셀로 받아
 * 그 안에 맞춰 넣습니다.
 */

import { ElementView } from "@/components/print/element-view";
import type { PrintDoc, PrintTemplate } from "@/lib/print/types";

export function DocThumb({
  doc,
  box,
  side = "front",
  className,
}: {
  doc: PrintDoc;
  /** 담을 상자(px). 이 안에 비율 그대로 들어갑니다 */
  box: { w: number; h: number };
  side?: "front" | "back";
  className?: string;
}) {
  const k = Math.min(box.w / doc.width, box.h / doc.height);
  const w = doc.width * k;
  const h = doc.height * k;
  const bg = side === "back" ? (doc.backgroundBack ?? doc.background) : doc.background;

  const elements = doc.elements.filter(
    (e) => (e.side ?? "front") === side && !e.hidden,
  );

  return (
    <span
      className={`pt-thumb ${className ?? ""}`}
      style={{
        width: w,
        height: h,
        background: bg.gradient
          ? `linear-gradient(${bg.gradient.angle}deg, ${bg.gradient.from}, ${bg.gradient.to})`
          : bg.color,
      }}
    >
      {bg.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bg.image} alt="" className="pt-thumb-bg" style={{ opacity: bg.imageOpacity ?? 1 }} />
      )}
      {elements.map((el) => (
        <ElementView key={el.id} el={el} scale={k} />
      ))}
      {doc.perforation && (
        <span
          className={doc.perforationAxis === "x" ? "pt-thumb-perf-v" : "pt-thumb-perf"}
          style={
            doc.perforationAxis === "x"
              ? { left: w * (doc.perforationAt ?? 0.5) }
              : { top: h * (doc.perforationAt ?? 0.5) }
          }
        />
      )}
    </span>
  );
}

export function TemplateThumb({
  template,
  box,
  side,
  className,
}: {
  template: PrintTemplate;
  box: { w: number; h: number };
  side?: "front" | "back";
  className?: string;
}) {
  return <DocThumb doc={template.doc} box={box} side={side} className={className} />;
}
