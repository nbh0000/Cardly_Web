/* ============================================================
   카드의 네 면

   면마다 성격이 다릅니다.
     front : 그림. 글자는 두 줄뿐입니다 — 더 넣으면 그림이 죽습니다.
     left  : 인쇄된 행사 정보. 날짜를 크게 두는 것이 카드의 관례입니다.
     right : 손으로 쓴 글. 이 면만 사용자가 자유롭게 씁니다.
     back  : 오시는 길과 회신처. 실용 정보의 자리입니다.

   모든 치수는 카드 폭 기준의 cqw(컨테이너 질의 단위)입니다. 카드가
   썸네일로 줄어들든 화면을 가득 채우든 조판 비율이 같아야 하기
   때문입니다. em 이나 rem 을 쓰면 축소한 카드에서 글자만 커집니다.
   ============================================================ */

import { CardArt } from "@/components/card/art";
import { dateKo, dateShort, monthDay, timeKo, weekdayEn } from "@/lib/card/doc";
import type { CardDesign, CardDoc } from "@/lib/card/types";
import { fontStack } from "@/lib/fonts";

type Props = { design: CardDesign; doc: CardDoc };

/** 면마다 공통으로 깔리는 종이 */
function paperStyle(design: CardDesign): React.CSSProperties {
  const p = design.palette;
  return {
    "--cd-paper": p.paper,
    "--cd-ink": p.ink,
    "--cd-accent": p.accent,
    "--cd-soft": p.soft,
    "--cd-deep": p.deep,
  } as React.CSSProperties;
}

/* ---------- 앞면 ---------- */

export function FaceFront({ design, doc }: Props) {
  return (
    <div className={`cd-face cd-front cd-title-${design.titlePlace}`} style={paperStyle(design)}>
      <CardArt art={design.art} palette={design.palette} />

      {/* 그림이 글자 자리까지 올라오면 읽히지 않습니다. 불투명한 띠를
          깔면 스티커처럼 보이므로, 종이색이 가장자리에서 서서히 차오르게
          해 그림이 «잦아드는» 것으로 보이게 합니다. */}
      <span className="cd-front-veil" aria-hidden />

      <div className="cd-front-text">
        <span className="cd-front-mark" aria-hidden />
        <h2 className="cd-front-title" style={{ fontFamily: fontStack(design.titleFont) }}>
          {doc.title}
        </h2>
        {doc.subtitle && <p className="cd-front-sub">{doc.subtitle}</p>}
      </div>
    </div>
  );
}

/* ---------- 안쪽 왼쪽 — 행사 정보 ---------- */

export function FaceLeft({ design, doc }: Props) {
  const { month, day } = monthDay(doc.date);
  return (
    <div className="cd-face cd-left" style={paperStyle(design)}>
      <p className="cd-eyebrow">INVITATION</p>

      <div className="cd-bigdate" aria-hidden>
        <span>{month}</span>
        <i />
        <span>{day}</span>
      </div>
      <p className="cd-bigdate-sub">
        {parseYear(doc.date)} · {weekdayEn(doc.date)}
      </p>

      <span className="cd-rule" aria-hidden />

      <dl className="cd-rows">
        <div>
          <dt>일시</dt>
          <dd>
            {dateKo(doc.date)}
            <br />
            {timeKo(doc.time)}
          </dd>
        </div>
        <div>
          <dt>장소</dt>
          <dd>{doc.place}</dd>
        </div>
        <div>
          <dt>주최</dt>
          <dd>{doc.host}</dd>
        </div>
      </dl>
    </div>
  );
}

function parseYear(iso: string) {
  return iso.slice(0, 4);
}

/* ---------- 안쪽 오른쪽 — 손글씨 ---------- */

export function FaceRight({ design, doc }: Props) {
  const hand = doc.hand;
  return (
    <div className="cd-face cd-right" style={paperStyle(design)}>
      <p
        className="cd-hand"
        style={{
          fontFamily: fontStack(hand.font),
          fontSize: `${(hand.size / 100) * 5.4}cqw`,
          color: hand.color || undefined,
          textAlign: hand.align,
        }}
      >
        {doc.greeting}
      </p>
      <p className="cd-sign" style={{ fontFamily: fontStack(hand.font) }}>
        {doc.host}
      </p>
    </div>
  );
}

/* ---------- 뒷면 — 오시는 길과 회신 ---------- */

export function FaceBack({ design, doc }: Props) {
  const mapHref = doc.address
    ? `https://map.naver.com/v5/search/${encodeURIComponent(doc.address)}`
    : null;
  return (
    <div className="cd-face cd-back" style={paperStyle(design)}>
      <p className="cd-eyebrow">오시는 길</p>
      <p className="cd-back-place">{doc.place}</p>
      <p className="cd-back-addr">{doc.address}</p>
      {mapHref && (
        <a
          className="cd-back-map"
          href={mapHref}
          target="_blank"
          rel="noreferrer noopener"
          /* 카드를 넘기는 중에 눌리지 않도록 — 넘기기는 포인터로,
             지도는 확실한 탭으로만 열립니다. */
          onPointerDown={(e) => e.stopPropagation()}
        >
          지도에서 열기
        </a>
      )}

      {doc.note && (
        <>
          <span className="cd-rule" aria-hidden />
          <p className="cd-eyebrow">안내</p>
          <p className="cd-back-note">{doc.note}</p>
        </>
      )}

      {doc.rsvpTo && (
        <>
          <span className="cd-rule" aria-hidden />
          <p className="cd-eyebrow">참석 회신</p>
          <p className="cd-back-note">{doc.rsvpTo}</p>
        </>
      )}

      <p className="cd-back-foot">
        {dateShort(doc.date)} · {doc.host}
      </p>
    </div>
  );
}

/** 면 하나를 id 로 고릅니다 */
export function CardFace({
  face,
  design,
  doc,
}: Props & { face: "front" | "left" | "right" | "back" }) {
  if (face === "front") return <FaceFront design={design} doc={doc} />;
  if (face === "left") return <FaceLeft design={design} doc={doc} />;
  if (face === "right") return <FaceRight design={design} doc={doc} />;
  return <FaceBack design={design} doc={doc} />;
}
