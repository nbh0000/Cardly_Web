/* ============================================================
   카드 앞면

   도형을 조합해 그림을 흉내 내던 것을 걷어냈습니다. 원과 베지에를
   아무리 다듬어도 벡터 클립아트로 읽히지, 손에 쥐고 싶은 카드가
   되지는 않습니다. 실제 문구류가 쓰는 두 가지 길만 남깁니다.

   ① 그림 카드 (plate)
      진짜 그림 한 점을 앞면에 앉힙니다. 메트로폴리탄 미술관
      오픈액세스(CC0)라 상업적 이용이 자유롭고 출처 표기 의무도
      없지만, 뒷면에 작가와 연도를 적습니다 — 좋은 카드는 원래
      그림을 누가 그렸는지 밝힙니다.

   ② 활자 카드 (type)
      그림 없이 활자와 인쇄 효과만으로 세웁니다. 굵은 괘선, 큰
      숫자, 원형 도장, 넉넉한 여백. 못 그린 그림이 없으니
      짜칠 여지가 없습니다.
   ============================================================ */

import { asset } from "@/lib/asset";
import { monthDay, weekdayEn } from "@/lib/card/doc";
import type { CardDesign, CardDoc } from "@/lib/card/types";
import { fontStack } from "@/lib/fonts";

type Props = { design: CardDesign; doc: CardDoc };

export function CardFront({ design, doc }: Props) {
  return design.front === "plate" ? (
    <PlateFront design={design} doc={doc} />
  ) : (
    <TypeFront design={design} doc={doc} />
  );
}

/* ------------------------------------------------------------
   ① 그림 카드
   ------------------------------------------------------------ */

function PlateFront({ design, doc }: Props) {
  const plate = design.plate!;
  const bleed = design.plateFit === "bleed";
  return (
    <div className={`cf cf-plate ${bleed ? "is-bleed" : "is-inset"}`}>
      <figure className="cf-plate-frame">
        {/* 정적 파일이라 next/image 최적화 대상이 아닙니다(export 빌드). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset(`/cards/${plate.file}.webp`)}
          alt={`${plate.title} — ${plate.artist}`}
          loading="lazy"
          decoding="async"
        />
        {/* 인쇄물의 잉크는 화면만큼 쨍하지 않습니다. 아주 옅게 눌러
            종이에 얹힌 것처럼 만듭니다. */}
        <span className="cf-plate-ink" aria-hidden />
      </figure>

      <div className="cf-text">
        <span className="cf-rule" aria-hidden />
        <h2 className="cf-title" style={{ fontFamily: fontStack(design.titleFont) }}>
          {doc.title}
        </h2>
        {doc.subtitle && <p className="cf-sub">{doc.subtitle}</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   ② 활자 카드
   ------------------------------------------------------------ */

function TypeFront({ design, doc }: Props) {
  const font = fontStack(design.titleFont);
  const { month, day } = monthDay(doc.date);
  const words = (doc.title || "").split(" ").filter(Boolean);

  if (design.layout === "bigdate") {
    return (
      <div className="cf cf-type cf-bigdate">
        <p className="cf-label">{weekdayEn(doc.date)}</p>
        <div className="cf-bigdate-num" aria-hidden>
          <span>{month}</span>
          <span>{day}</span>
        </div>
        <span className="cf-rule cf-rule-wide" aria-hidden />
        <h2 className="cf-title" style={{ fontFamily: font }}>
          {doc.title}
        </h2>
        {doc.subtitle && <p className="cf-sub">{doc.subtitle}</p>}
      </div>
    );
  }

  if (design.layout === "stack") {
    return (
      <div className="cf cf-type cf-stack">
        <p className="cf-label">{doc.subtitle}</p>
        <h2 className="cf-stack-words" style={{ fontFamily: font }}>
          {(words.length ? words : [doc.title]).map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </h2>
        <p className="cf-stack-foot">
          {month}.{day} · {doc.host}
        </p>
      </div>
    );
  }

  if (design.layout === "rule") {
    return (
      <div className="cf cf-type cf-ruled">
        <span className="cf-ruled-bar" aria-hidden />
        <div className="cf-ruled-body">
          <p className="cf-label">{weekdayEn(doc.date)}</p>
          <h2 className="cf-title" style={{ fontFamily: font }}>
            {doc.title}
          </h2>
          {doc.subtitle && <p className="cf-sub">{doc.subtitle}</p>}
        </div>
        <span className="cf-ruled-bar" aria-hidden />
        <p className="cf-ruled-foot">
          {month} / {day}
        </p>
      </div>
    );
  }

  if (design.layout === "corner") {
    return (
      <div className="cf cf-type cf-corner">
        <p className="cf-label">{doc.subtitle}</p>
        <h2 className="cf-title" style={{ fontFamily: font }}>
          {doc.title}
        </h2>
        <div className="cf-corner-foot">
          <span className="cf-rule" aria-hidden />
          <p>
            {month}.{day} {weekdayEn(doc.date)}
          </p>
          <p>{doc.host}</p>
        </div>
      </div>
    );
  }

  /* seal — 가운데 원형 도장 */
  return (
    <div className="cf cf-type cf-seal">
      <span className="cf-seal-ring" aria-hidden>
        <span className="cf-seal-inner">
          <b>{month}</b>
          <i />
          <b>{day}</b>
        </span>
      </span>
      <h2 className="cf-title" style={{ fontFamily: font }}>
        {doc.title}
      </h2>
      {doc.subtitle && <p className="cf-sub">{doc.subtitle}</p>}
      <p className="cf-seal-foot">{doc.host}</p>
    </div>
  );
}
