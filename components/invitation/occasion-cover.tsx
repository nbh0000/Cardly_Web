/* ============================================================
   초대장 커버 열두 종

   청첩장 커버와 갈라 두는 이유는 단순합니다. 청첩장 커버는 전부
   사진 슬롯을 중심에 두고 짜여 있는데, 초대장에는 올릴 사진이 없는
   경우가 대부분입니다. 생일 초대장을 만드는 사람이 커버에 쓸 사진을
   먼저 찍어 와야 한다면 그건 도구가 일을 떠넘기는 것입니다.

   그래서 여기 열두 종은 사진 한 장 없이 완성됩니다. 대신 종이 위에서
   실제로 쓰이는 인쇄물의 꼴을 빌립니다 — 입장권, 우표, 게시문,
   꼬리표, 간판, 라인업 포스터.
   ============================================================ */

import {
  formatDateDots,
  formatDateKo,
  formatTimeKo,
  parseDate,
  weekdayEn,
  type InvitationData,
} from "@/lib/invitation";

type Props = { data: InvitationData };

/** 커버 아래에 붙는 공통 정보 — 언제, 어디서 */
function Meta({ data, className = "" }: Props & { className?: string }) {
  return (
    <p className={`iv-cover-meta ${className}`}>
      {formatDateKo(data.date)} {formatTimeKo(data.time)}
      <br />
      {data.venueName} {data.venueHall}
    </p>
  );
}

/** 행사 이름과 주최자 — 초대장 커버의 두 줄 */
function Title({ data, className = "" }: Props & { className?: string }) {
  return (
    <h1 className={`iv-cover-names ${className}`}>
      {data.eventTitle}
      {data.hostName ? (
        <>
          <br />
          <span className="oc-host">{data.hostName}</span>
        </>
      ) : null}
    </h1>
  );
}

/* ---------- 1. 컨페티 ---------- */

/** 흩뿌려진 색종이. 위치는 고정 배열이라 렌더마다 흔들리지 않습니다. */
const CONFETTI = [
  [6, 12, -18], [22, 5, 34], [38, 16, -7], [58, 8, 22], [76, 14, -30],
  [90, 6, 12], [12, 78, 26], [30, 88, -14], [50, 94, 8], [70, 84, -22],
  [88, 92, 18], [4, 46, 40], [95, 52, -35], [16, 30, 10], [82, 34, -12],
] as const;

function CoverConfetti({ data }: Props) {
  return (
    <section className="iv-cover oc oc-confetti">
      <span className="oc-confetti-layer" aria-hidden>
        {CONFETTI.map(([x, y, r], i) => (
          <i
            key={i}
            data-v={i % 3}
            style={{ left: `${x}%`, top: `${y}%`, rotate: `${r}deg` }}
          />
        ))}
      </span>
      <p className="iv-eyebrow">{data.coverEyebrow}</p>
      <p className="oc-script">{data.coverScript}</p>
      <Title data={data} className="oc-title-xl" />
      <span className="oc-rule" aria-hidden />
      <Meta data={data} />
    </section>
  );
}

/* ---------- 2. 풍선 ---------- */

const BALLOONS = [
  [10, 0.9, 0], [26, 0.62, 1], [44, 1, 2], [62, 0.7, 0], [80, 0.85, 1],
  [92, 0.55, 2],
] as const;

function CoverBalloon({ data }: Props) {
  return (
    <section className="iv-cover oc oc-balloon">
      <span className="oc-balloon-sky" aria-hidden>
        {BALLOONS.map(([x, s, v], i) => (
          <i key={i} data-v={v} style={{ left: `${x}%`, scale: String(s) }}>
            <b />
          </i>
        ))}
      </span>
      <p className="iv-eyebrow">{data.coverEyebrow}</p>
      <p className="oc-script oc-script-lg">{data.coverScript}</p>
      <Title data={data} />
      <span className="oc-rule" aria-hidden />
      <Meta data={data} />
    </section>
  );
}

/* ---------- 3. 빅데이트 ----------
   날짜 숫자를 커버의 주인공으로 씁니다. 행사 초대장에서 사람들이
   실제로 확인하려는 것이 그것이라서, 제일 큰 활자를 거기에 씁니다. */

function CoverBigdate({ data }: Props) {
  const d = parseDate(data.date);
  return (
    <section className="iv-cover oc oc-bigdate">
      <p className="iv-eyebrow">{data.coverEyebrow}</p>

      <div className="oc-bigdate-block" aria-hidden>
        <span className="oc-bigdate-mon">
          {String(d.getMonth() + 1).padStart(2, "0")}
        </span>
        <span className="oc-bigdate-slash" />
        <span className="oc-bigdate-day">
          {String(d.getDate()).padStart(2, "0")}
        </span>
      </div>
      <p className="oc-bigdate-sub">
        {d.getFullYear()} · {weekdayEn(data.date)}
      </p>

      <p className="oc-script">{data.coverScript}</p>
      <Title data={data} />
      <Meta data={data} className="oc-meta-spaced" />
    </section>
  );
}

/* ---------- 4. 입장권 ---------- */

function CoverTicket({ data }: Props) {
  return (
    <section className="iv-cover oc oc-ticket">
      <div className="oc-ticket-body">
        <div className="oc-ticket-main">
          <p className="iv-eyebrow">{data.coverEyebrow}</p>
          <Title data={data} className="oc-title-tight" />
          <p className="oc-script">{data.coverScript}</p>

          <dl className="oc-ticket-rows">
            <div>
              <dt>DATE</dt>
              <dd>{formatDateDots(data.date)}</dd>
            </div>
            <div>
              <dt>TIME</dt>
              <dd>{formatTimeKo(data.time)}</dd>
            </div>
            <div>
              <dt>PLACE</dt>
              <dd>
                {data.venueName} {data.venueHall}
              </dd>
            </div>
          </dl>
        </div>

        <span className="oc-ticket-perf" aria-hidden />

        <div className="oc-ticket-stub">
          <span className="oc-ticket-stub-text">
            {weekdayEn(data.date)} · {formatDateDots(data.date)}
          </span>
        </div>
      </div>
    </section>
  );
}

/* ---------- 5. 네온 간판 ---------- */

function CoverMarquee({ data }: Props) {
  return (
    <section className="iv-cover oc oc-marquee">
      <span className="oc-marquee-glow" aria-hidden />
      <div className="oc-marquee-board">
        <span className="oc-marquee-bulbs" aria-hidden>
          {Array.from({ length: 14 }, (_, i) => (
            <i key={i} style={{ animationDelay: `${(i % 7) * 0.12}s` }} />
          ))}
        </span>
        <p className="iv-eyebrow">{data.coverEyebrow}</p>
        <p className="oc-neon">{data.coverScript}</p>
        <Title data={data} className="oc-title-tight" />
      </div>
      <Meta data={data} className="oc-meta-spaced" />
    </section>
  );
}

/* ---------- 6. 라인업 ----------
   페스티벌 포스터의 조판. 큰 이름 한 줄, 그 아래 작은 항목들. */

function CoverLineup({ data }: Props) {
  const lines = (data.eventTitle || "").split(" ").filter(Boolean);
  return (
    <section className="iv-cover oc oc-lineup">
      <p className="iv-eyebrow">{data.coverEyebrow}</p>

      <h1 className="oc-lineup-title">
        {(lines.length ? lines : [data.eventTitle]).map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </h1>

      <span className="oc-lineup-bar" aria-hidden />

      <p className="oc-lineup-row">
        {formatDateDots(data.date)} <i>/</i> {formatTimeKo(data.time)}
      </p>
      <p className="oc-lineup-row">{data.venueName}</p>
      {data.hostName && <p className="oc-lineup-host">{data.hostName}</p>}
      <p className="oc-script oc-script-sm">{data.coverScript}</p>
    </section>
  );
}

/* ---------- 7. 스티커 콜라주 ---------- */

const STICKERS = ["★", "♥", "✿", "☺", "✦"] as const;

function CoverSticker({ data }: Props) {
  return (
    <section className="iv-cover oc oc-sticker">
      <span className="oc-sticker-scatter" aria-hidden>
        {STICKERS.map((s, i) => (
          <i key={i} data-v={i % 3}>
            {s}
          </i>
        ))}
      </span>

      <div className="oc-sticker-card">
        <p className="iv-eyebrow">{data.coverEyebrow}</p>
        <p className="oc-script oc-script-lg">{data.coverScript}</p>
        <Title data={data} />
        <span className="oc-rule" aria-hidden />
        <Meta data={data} />
      </div>
    </section>
  );
}

/* ---------- 8. 창가 ----------
   집들이. 창틀 너머로 빛이 드는 그림 하나면 무슨 초대인지 압니다. */

function CoverHouse({ data }: Props) {
  return (
    <section className="iv-cover oc oc-house">
      <div className="oc-house-window" aria-hidden>
        <span className="oc-house-light" />
        <span className="oc-house-mullion oc-house-mullion-v" />
        <span className="oc-house-mullion oc-house-mullion-h" />
        <span className="oc-house-sill" />
      </div>

      <p className="iv-eyebrow">{data.coverEyebrow}</p>
      <p className="oc-script oc-script-lg">{data.coverScript}</p>
      <Title data={data} />
      <span className="oc-rule" aria-hidden />
      <Meta data={data} />
    </section>
  );
}

/* ---------- 9. 꼬리표 ---------- */

function CoverTag({ data }: Props) {
  return (
    <section className="iv-cover oc oc-tag">
      <span className="oc-tag-string" aria-hidden />
      <div className="oc-tag-card">
        <span className="oc-tag-hole" aria-hidden />
        <p className="iv-eyebrow">{data.coverEyebrow}</p>
        <p className="oc-script">{data.coverScript}</p>
        <Title data={data} className="oc-title-tight" />
        <span className="oc-rule" aria-hidden />
        <Meta data={data} />
      </div>
    </section>
  );
}

/* ---------- 10. 게시문 ---------- */

function CoverNotice({ data }: Props) {
  return (
    <section className="iv-cover oc oc-notice">
      <div className="oc-notice-frame">
        <p className="iv-eyebrow">{data.coverEyebrow}</p>
        <span className="oc-notice-rule" aria-hidden />
        <Title data={data} className="oc-title-serif" />
        <p className="oc-script">{data.coverScript}</p>

        <dl className="oc-notice-rows">
          <div>
            <dt>일시</dt>
            <dd>
              {formatDateKo(data.date)}
              <br />
              {formatTimeKo(data.time)}
            </dd>
          </div>
          <div>
            <dt>장소</dt>
            <dd>
              {data.venueName} {data.venueHall}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

/* ---------- 11. 우표 ---------- */

function CoverStamp({ data }: Props) {
  const d = parseDate(data.date);
  return (
    <section className="iv-cover oc oc-stamp">
      <div className="oc-stamp-head">
        <figure className="oc-stamp-piece">
          <span className="oc-stamp-inner">
            <b>{String(d.getMonth() + 1).padStart(2, "0")}</b>
            <i>{String(d.getDate()).padStart(2, "0")}</i>
          </span>
        </figure>
        <span className="oc-postmark" aria-hidden>
          <span>{weekdayEn(data.date)}</span>
          <span>{d.getFullYear()}</span>
        </span>
      </div>

      <p className="iv-eyebrow">{data.coverEyebrow}</p>
      <p className="oc-script">{data.coverScript}</p>
      <Title data={data} className="oc-title-serif" />
      <span className="oc-rule" aria-hidden />
      <Meta data={data} />
    </section>
  );
}

/* ---------- 12. 리본 ---------- */

function CoverRibbon({ data }: Props) {
  return (
    <section className="iv-cover oc oc-ribbon">
      <span className="oc-ribbon-band" aria-hidden>
        <i />
        <b />
        <i />
      </span>

      <p className="iv-eyebrow">{data.coverEyebrow}</p>
      <p className="oc-script oc-script-lg">{data.coverScript}</p>
      <Title data={data} className="oc-title-serif" />
      <span className="oc-rule" aria-hidden />
      <Meta data={data} />
    </section>
  );
}

/* ------------------------------------------------------------
   분기 한 곳
   ------------------------------------------------------------ */

const COVERS = {
  confetti: CoverConfetti,
  balloon: CoverBalloon,
  bigdate: CoverBigdate,
  ticket: CoverTicket,
  marquee: CoverMarquee,
  lineup: CoverLineup,
  sticker: CoverSticker,
  house: CoverHouse,
  tag: CoverTag,
  notice: CoverNotice,
  stamp: CoverStamp,
  ribbon: CoverRibbon,
} as const;

export type OccasionCoverLayout = keyof typeof COVERS;

export function isOccasionCover(layout: string): layout is OccasionCoverLayout {
  return layout in COVERS;
}

export function OccasionCover({
  layout,
  data,
}: {
  layout: OccasionCoverLayout;
  data: InvitationData;
}) {
  const C = COVERS[layout];
  return <C data={data} />;
}
