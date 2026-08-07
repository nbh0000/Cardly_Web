"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  daysUntil,
  formatDateDots,
  formatDateKo,
  formatDateShort,
  formatTimeKo,
  fullName,
  parentName,
  monthGrid,
  parseDate,
  resolveTheme,
  weekdayEn,
  WEEKDAY_LABELS,
  type Account,
  type InvitationData,
  type SectionKey,
  type Template,
} from "@/lib/invitation";

/** 값이 바뀌지 않는 스토어 — 최초 스냅샷만 필요할 때 씁니다. */
const subscribeNever = () => () => {};

const SCALE: Record<InvitationData["fontScale"], number> = {
  sm: 0.92,
  md: 1,
  lg: 1.12,
};

export function InvitationView({
  template,
  data,
  /** 에디터 미리보기에서는 false — 실제 배포본에서만 팝업/음악 자동 실행 */
  live = true,
  /** 갤러리 썸네일용 — 커버만 그립니다 */
  coverOnly = false,
  /** 에디터에서 방금 추가한 섹션 — 잠깐 강조합니다 */
  flash = null,
}: {
  template: Template;
  data: InvitationData;
  live?: boolean;
  coverOnly?: boolean;
  flash?: string | null;
}) {
  const theme = resolveTheme(template, data);
  const headingFamily =
    data.headingFont === "serif" ? "var(--font-serif)" : "var(--font-sans)";

  const style = {
    "--iv-dim": String(data.titleDim / 100),
    "--iv-bg": theme.bg,
    "--iv-ink": theme.ink,
    "--iv-sub": theme.sub,
    "--iv-accent": theme.accent,
    "--iv-accent-soft": theme.accentSoft,
    "--iv-heading": headingFamily,
    "--iv-scale": String(SCALE[data.fontScale]),
    background: theme.bg,
    color: theme.ink,
  } as React.CSSProperties;

  return (
    <div className="iv" style={style}>
      {data.effect !== "none" && !coverOnly && <EffectLayer kind={data.effect} />}
      {!coverOnly && data.opening !== "none" && (
        <OpeningLayer kind={data.opening} />
      )}

      {!coverOnly && data.bgm !== "none" && (
        <BgmPlayer track={data.bgm} autoplay={data.bgmAutoplay} />
      )}

      <div id="sec-cover" className="iv-anchor">
        <Cover template={template} data={data} />
      </div>
      {coverOnly ? null : (
        <>
          <RestOfInvitation data={data} live={live} flash={flash} />
        </>
      )}
    </div>
  );
}

/**
 * 섹션은 data.sectionOrder 순서 그대로 그립니다.
 * 에디터의 "순서 변경"이 여기에 바로 반영됩니다.
 */
function RestOfInvitation({
  data,
  live,
  flash,
}: {
  data: InvitationData;
  live: boolean;
  flash: string | null;
}) {
  // 각 섹션에 앵커를 달아두면 에디터가 해당 위치로 미리보기를 스크롤할 수 있습니다.
  const render = (key: SectionKey) => {
    const node = renderSection(key);
    return node ? (
      <div key={key} id={`sec-${key}`} data-sec={key} className={`iv-anchor${flash === key ? " is-flash" : ""}`}>
        {node}
      </div>
    ) : null;
  };

  const renderSection = (key: SectionKey) => {
    switch (key) {
      case "invitation":
        return (
          <Fragment>
            <Greeting data={data} />
            <Family data={data} />
          </Fragment>
        );
      case "couple":
        return data.showCouple ? <Couple data={data} /> : null;
      case "timeline":
        return data.showTimeline ? <Timeline data={data} /> : null;
      case "album":
        return data.showAlbum ? <Album data={data} /> : null;
      case "notice":
        return data.showNotice ? <Notices data={data} /> : null;
      case "calendar":
        return data.showCalendar ? <CalendarBlock data={data} /> : null;
      case "gallery":
        return data.showGallery ? <Gallery data={data} /> : null;
      case "location":
        return data.showVenueInfo ? <Location data={data} /> : null;
      case "account":
        return data.showAccounts ? <Accounts data={data} /> : null;
      case "video":
        return data.showVideo ? <VideoBlock data={data} /> : null;
      case "guestbook":
        return data.showGuestbook ? <Guestbook data={data} /> : null;
      case "rsvp":
        return data.showRsvp ? <Rsvp data={data} live={live} /> : null;
      case "snap":
        return data.snapEnabled ? <Snap data={data} /> : null;
      case "gift":
        return data.showGift ? <Gift data={data} /> : null;
    }
  };

  return (
    <>
      {data.sectionOrder.map(render)}
      <ShareBlock data={data} />
    </>
  );
}

/* ============================================================
   커버
   ============================================================ */

function Cover({ template, data }: { template: Template; data: InvitationData }) {
  const first = data.nameOrder === "groom-first" ? data.groom : data.bride;
  const second = data.nameOrder === "groom-first" ? data.bride : data.groom;
  const layout = data.coverLayout;

  const names = { first: fullName(first), second: fullName(second) };

  if (layout === "photo") return <CoverPhoto data={data} names={names} />;
  if (layout === "arch") return <CoverArch data={data} names={names} />;
  if (layout === "editorial")
    return <CoverEditorial data={data} names={names} />;
  if (layout === "floral") return <CoverFloral data={data} names={names} />;
  return <CoverCenter data={data} names={names} template={template} />;
}

type Names = { first: string; second: string };

function PhotoSlot({
  src,
  fit,
  className,
  rounded,
}: {
  src?: string;
  fit: "cover" | "contain";
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={`iv-photo ${className ?? ""}`}
      style={{ borderRadius: rounded }}
    >
      {src ? (
        <>
          {/* 사용자가 업로드한 blob/data URL — next/image 최적화 대상이 아닙니다. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" style={{ objectFit: fit }} />
          {/* 디자인 > 타이틀 이미지 어둡기 */}
          <span className="iv-photo-dim" aria-hidden />
        </>
      ) : (
        <PhotoPlaceholder />
      )}
    </div>
  );
}

function PhotoPlaceholder() {
  return (
    <div className="iv-photo-empty">
      <svg viewBox="0 0 48 48" fill="none" aria-hidden>
        <rect
          x="6"
          y="10"
          width="36"
          height="28"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <circle cx="17" cy="20" r="3" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="m9 34 10-9 7 6 6-5 7 8"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
      <span>사진을 등록해 주세요</span>
    </div>
  );
}

function CoverCenter({
  data,
  names,
}: {
  data: InvitationData;
  names: Names;
  template: Template;
}) {
  return (
    <section className="iv-cover iv-cover-center">
      <p className="iv-eyebrow">{data.coverEyebrow}</p>
      <PhotoSlot
        src={data.coverPhoto}
        fit={data.coverPhotoFit}
        className="iv-cover-center-photo"
      />
      <h1 className="iv-cover-names">
        {names.first}
        <span className="iv-amp">&amp;</span>
        {names.second}
      </h1>
      <span className="iv-hairline" />
      <p className="iv-cover-meta">
        {formatDateKo(data.date)} {formatTimeKo(data.time)}
        <br />
        {data.venueName} {data.venueHall}
      </p>
    </section>
  );
}

function CoverPhoto({ data, names }: { data: InvitationData; names: Names }) {
  return (
    <section className="iv-cover iv-cover-photo">
      <PhotoSlot
        src={data.coverPhoto}
        fit={data.coverPhotoFit}
        className="iv-cover-photo-bg"
      />
      <div className="iv-cover-photo-scrim" />
      <div className="iv-cover-photo-text">
        <p className="iv-eyebrow iv-on-photo">{data.coverEyebrow}</p>
        <h1 className="iv-cover-names iv-on-photo">
          {names.first} <span className="iv-dot">·</span> {names.second}
        </h1>
        <p className="iv-cover-meta iv-on-photo">
          {formatDateDots(data.date)} {weekdayEn(data.date)}
          <br />
          {data.venueName}
        </p>
      </div>
    </section>
  );
}

function CoverArch({ data, names }: { data: InvitationData; names: Names }) {
  return (
    <section className="iv-cover iv-cover-arch">
      <p className="iv-eyebrow">{data.coverEyebrow}</p>
      <div className="iv-arch">
        <PhotoSlot src={data.coverPhoto} fit={data.coverPhotoFit} />
      </div>
      <h1 className="iv-cover-names">
        {names.first} <span className="iv-dot">·</span> {names.second}
      </h1>
      <span className="iv-hairline" />
      <p className="iv-cover-meta">
        {formatDateKo(data.date)}
        <br />
        {data.venueName} {data.venueHall}
      </p>
    </section>
  );
}

function CoverEditorial({
  data,
  names,
}: {
  data: InvitationData;
  names: Names;
}) {
  return (
    <section className="iv-cover iv-cover-editorial">
      <p className="iv-eyebrow">{data.coverEyebrow}</p>
      <p className="iv-bigdate">{formatDateShort(data.date)}</p>
      <span className="iv-hairline iv-hairline-left" />
      <PhotoSlot
        src={data.coverPhoto}
        fit={data.coverPhotoFit}
        className="iv-cover-editorial-photo"
      />
      <h1 className="iv-cover-names iv-cover-names-left">
        {names.first}
        <br />
        {names.second}
      </h1>
      <p className="iv-cover-meta iv-cover-meta-left">
        {formatTimeKo(data.time)} · {data.venueName}
      </p>
    </section>
  );
}

function CoverFloral({ data, names }: { data: InvitationData; names: Names }) {
  return (
    <section className="iv-cover iv-cover-floral">
      <Sprig />
      <PhotoSlot
        src={data.coverPhoto}
        fit={data.coverPhotoFit}
        className="iv-cover-floral-photo"
      />
      <h1 className="iv-cover-names iv-cover-names-italic">
        {names.first}
        <span className="iv-amp"> &amp; </span>
        {names.second}
      </h1>
      <span className="iv-pill">{formatDateDots(data.date)}</span>
      <p className="iv-cover-meta">{data.venueName} {data.venueHall}</p>
    </section>
  );
}

function Sprig() {
  return (
    <svg
      className="iv-sprig"
      viewBox="0 0 80 52"
      fill="none"
      stroke="var(--iv-accent)"
      strokeWidth="1.1"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M40 52V16" />
      <path d="M40 40c-9 0-15-5-16-13 9-1 15 4 16 13Z" />
      <path d="M40 40c9 0 15-5 16-13-9-1-15 4-16 13Z" />
      <path d="M40 26c-7 0-12-4-13-10 7-1 12 3 13 10Z" />
      <path d="M40 26c7 0 12-4 13-10-7-1-12 3-13 10Z" />
      <circle cx="40" cy="11" r="4.5" />
      <circle cx="27" cy="6" r="2.6" />
      <circle cx="53" cy="6" r="2.6" />
    </svg>
  );
}

/* ============================================================
   인사말
   ============================================================ */

function Greeting({ data }: { data: InvitationData }) {
  return (
    <Section>
      {data.showDateOnInvitation && (
        <p className="iv-invite-date">{formatDateByStyle(data)}</p>
      )}
      <SectionTitle en="Invitation">{data.greetingTitle}</SectionTitle>
      <p className="iv-body iv-prewrap">{data.greeting}</p>
    </Section>
  );
}

/** 에디터의 "날짜 표기 디자인" 선택을 그대로 따릅니다. */
function formatDateByStyle(data: InvitationData): string {
  switch (data.dateFormat) {
    case "bar":
      return formatDateShort(data.date).replace(".", " | ");
    case "dots":
      return formatDateDots(data.date).replace(/^\d{2}/, "").replace(/^\s*/, "")
        || formatDateDots(data.date);
    case "english": {
      const d = parseDate(data.date);
      const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    }
    default:
      return formatDateKo(data.date);
  }
}

/* ============================================================
   혼주 정보
   ============================================================ */

function Family({ data }: { data: InvitationData }) {
  const groomRow = { p: data.groom, child: "아들", hide: data.hideGroomParents };
  const brideRow = { p: data.bride, child: "딸", hide: data.hideBrideParents };
  const rows =
    data.nameOrder === "groom-first" ? [groomRow, brideRow] : [brideRow, groomRow];

  return (
    <Section tight>
      <div className="iv-family">
        {rows.map(({ p, child, hide }) => (
          <p key={child} className="iv-family-row">
            {hide ? (
              <span className="iv-family-name">{fullName(p)}</span>
            ) : (
              <>
                <span className="iv-family-parents">
                  {p.fatherLate && <Chrysanthemum />}
                  {parentName(p, "father")}
                  <span className="iv-family-dot">·</span>
                  {p.motherLate && <Chrysanthemum />}
                  {parentName(p, "mother")}
                </span>
                <span className="iv-family-rel">
                  의 {p.relation === "" ? child : p.relation}
                </span>
                <span className="iv-family-name">{fullName(p)}</span>
              </>
            )}
          </p>
        ))}
      </div>

      <div className="iv-contact-row">
        <ContactButton
          label="신랑에게 연락하기"
          phone={data.groom.phone}
          parents={[
            { role: "신랑 아버지", name: parentName(data.groom, "father"), phone: data.groom.fatherPhone },
            { role: "신랑 어머니", name: parentName(data.groom, "mother"), phone: data.groom.motherPhone },
            ...data.groomContacts.map((c) => ({ role: c.role, name: c.name, phone: c.phone })),
          ]}
        />
        <ContactButton
          label="신부에게 연락하기"
          phone={data.bride.phone}
          parents={[
            { role: "신부 아버지", name: parentName(data.bride, "father"), phone: data.bride.fatherPhone },
            { role: "신부 어머니", name: parentName(data.bride, "mother"), phone: data.bride.motherPhone },
            ...data.brideContacts.map((c) => ({ role: c.role, name: c.name, phone: c.phone })),
          ]}
        />
      </div>
    </Section>
  );
}

function Chrysanthemum() {
  return (
    <svg className="iv-late" viewBox="0 0 12 12" aria-label="고인" role="img">
      <circle cx="6" cy="6" r="2" fill="currentColor" />
      {Array.from({ length: 8 }).map((_, i) => (
        <ellipse
          key={i}
          cx="6"
          cy="2.4"
          rx="1.1"
          ry="2.1"
          fill="currentColor"
          opacity="0.75"
          transform={`rotate(${i * 45} 6 6)`}
        />
      ))}
    </svg>
  );
}

function ContactButton({
  label,
  phone,
  parents,
}: {
  label: string;
  phone: string;
  parents: { role: string; name: string; phone: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="iv-contact">
      <button type="button" className="iv-btn-soft press" onClick={() => setOpen(true)}>
        {label}
      </button>
      <Sheet open={open} title={label} onClose={() => setOpen(false)}>
        <ul className="iv-contact-list">
          <li>
            <span>본인</span>
            <a href={`tel:${phone}`}>{phone || "-"}</a>
          </li>
          {parents
            .filter((p) => p.name)
            .map((p) => (
              <li key={p.role}>
                <span>
                  {p.role} {p.name}
                </span>
                <a href={`tel:${p.phone}`}>{p.phone || "-"}</a>
              </li>
            ))}
        </ul>
      </Sheet>
    </div>
  );
}

/* ============================================================
   달력 + D-day
   ============================================================ */

function CalendarBlock({ data }: { data: InvitationData }) {
  const dt = parseDate(data.date);
  const cells = useMemo(() => monthGrid(data.date), [data.date]);
  const target = dt.getDate();

  // 서버 스냅샷은 null, 클라이언트에서만 실제 일수를 반환합니다.
  // (useState + useEffect 대신 이 훅을 쓰면 하이드레이션 불일치도 없고
  //  effect 안에서 setState 를 부르지 않아도 됩니다.)
  const dday = useSyncExternalStore(
    subscribeNever,
    () => (data.showDday ? daysUntil(data.date, new Date()) : null),
    () => null,
  );

  return (
    <Section>
      <SectionTitle en="Wedding day">
        {dt.getFullYear()}년 {dt.getMonth() + 1}월
      </SectionTitle>

      <p className="iv-daterow">
        {formatDateKo(data.date)} · {formatTimeKo(data.time)}
      </p>

      <div className="iv-cal">
        {WEEKDAY_LABELS.map((w, i) => (
          <span
            key={w}
            className={`iv-cal-head ${i === 0 ? "iv-cal-sun" : ""}`}
          >
            {w}
          </span>
        ))}
        {cells.map((d, i) => (
          <span
            key={i}
            className={`iv-cal-cell ${d === target ? "iv-cal-mark" : ""} ${
              d !== null && i % 7 === 0 ? "iv-cal-sun" : ""
            }`}
          >
            {d ?? ""}
          </span>
        ))}
      </div>

      {data.showDday && (
        <p className="iv-dday">
          {dday === null ? (
            <span className="iv-dday-skeleton" aria-hidden />
          ) : dday > 0 ? (
            <>
              결혼식까지 <strong>{dday}</strong>일 남았습니다
            </>
          ) : dday === 0 ? (
            <>오늘은 저희의 결혼식입니다</>
          ) : (
            <>함께해 주셔서 감사합니다</>
          )}
        </p>
      )}
    </Section>
  );
}

/* ============================================================
   갤러리
   ============================================================ */

function Gallery({ data }: { data: InvitationData }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const photos = data.gallery;
  const slots = photos.length > 0 ? photos : Array<string>(6).fill("");

  return (
    <Section>
      <SectionTitle en="Gallery">{data.galleryTitle}</SectionTitle>

      <div className={`iv-gallery iv-gallery-${data.galleryType}`}>
        {slots.map((src, i) => (
          <button
            key={i}
            type="button"
            className="iv-gallery-item"
            onClick={() => src && !data.galleryProtect && setLightbox(i)}
            aria-label={`사진 ${i + 1}`}
          >
            <PhotoSlot src={src || undefined} fit="cover" />
          </button>
        ))}
      </div>

      {lightbox !== null && photos[lightbox] && (
        <div
          className="iv-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[lightbox]} alt="" />
          <button
            type="button"
            className="iv-lightbox-close"
            onClick={() => setLightbox(null)}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
      )}
    </Section>
  );
}

/* ============================================================
   오시는 길
   ============================================================ */

function Location({ data }: { data: InvitationData }) {
  const q = encodeURIComponent(`${data.venueName} ${data.venueHall}`);
  const [copied, copy] = useCopy();

  return (
    <Section>
      <SectionTitle en="Location">오시는 길</SectionTitle>

      <p className="iv-venue-name">{data.venueName}</p>
      <p className="iv-venue-sub">{data.venueHall}</p>
      <p className="iv-venue-addr">{data.venueAddress}</p>
      {data.venueTel && (
        <a className="iv-venue-tel" href={`tel:${data.venueTel}`}>
          {data.venueTel}
        </a>
      )}

      {data.showMap && (
        <>
          <div className="iv-map" role="img" aria-label="약도">
            <MapGlyph />
            <span>지도 영역 · 발행 시 실제 지도로 표시됩니다</span>
          </div>
          <div className="iv-map-actions">
            <a
              className="iv-btn-soft"
              href={`https://map.naver.com/p/search/${q}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              네이버지도
            </a>
            <a
              className="iv-btn-soft"
              href={`https://map.kakao.com/?q=${q}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              카카오맵
            </a>
            <button
              type="button"
              className="iv-btn-soft"
              onClick={() => copy(data.venueAddress)}
            >
              {copied ? "복사됨" : "주소 복사"}
            </button>
          </div>
        </>
      )}

      {data.transport.length > 0 && (
        <ul className="iv-transport">
          {data.transport.map((t) => (
            <li key={t.id}>
              <span className="iv-transport-label">{t.label}</span>
              <span className="iv-transport-body iv-prewrap">{t.body}</span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function MapGlyph() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden>
      <path
        d="M20 35s11-9.8 11-17.3A11 11 0 1 0 9 17.7C9 25.2 20 35 20 35Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="20" cy="17" r="4" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

/* ============================================================
   마음 전하실 곳
   ============================================================ */

function Accounts({ data }: { data: InvitationData }) {
  return (
    <Section>
      <SectionTitle en="Gift">{data.accountsTitle}</SectionTitle>
      <p className="iv-body iv-prewrap">{data.accountsNote}</p>

      <div className="iv-accounts">
        <AccountGroup
          label="신랑측"
          items={data.accounts.filter((a) => a.side === "groom")}
        />
        <AccountGroup
          label="신부측"
          items={data.accounts.filter((a) => a.side === "bride")}
        />
      </div>
    </Section>
  );
}

function AccountGroup({ label, items }: { label: string; items: Account[] }) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;

  return (
    <div className="iv-acc">
      <button
        type="button"
        className="iv-acc-head press"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <span>{label} 계좌번호</span>
        <span className="iv-acc-chev" aria-hidden>
          ⌄
        </span>
      </button>
      <Sheet open={open} title={`${label} 계좌번호`} onClose={() => setOpen(false)}>
        <ul className="iv-acc-list is-sheet">
          {items.map((a) => (
            <AccountRow key={a.id} account={a} />
          ))}
        </ul>
      </Sheet>
    </div>
  );
}

function AccountRow({ account }: { account: Account }) {
  const [copied, copy] = useCopy();
  return (
    <li className="iv-acc-row">
      <div>
        <p className="iv-acc-bank">
          {account.bank} <span>{account.number}</span>
        </p>
        <p className="iv-acc-holder">예금주 {account.holder}</p>
      </div>
      <div className="iv-acc-actions">
        <button
          type="button"
          className="iv-btn-mini"
          onClick={() => copy(account.number)}
        >
          {copied ? "복사됨" : "복사"}
        </button>
        {account.kakaopay && (
          <a
            className="iv-btn-mini iv-btn-pay"
            href={account.kakaopay}
            target="_blank"
            rel="noopener noreferrer"
          >
            송금
          </a>
        )}
      </div>
    </li>
  );
}

/* ============================================================
   참석 의사 (RSVP)
   ============================================================ */

function Rsvp({ data, live }: { data: InvitationData; live: boolean }) {
  const [sent, setSent] = useState(false);
  const [popup, setPopup] = useState(false);

  useEffect(() => {
    if (live && data.rsvpPopup) {
      const t = setTimeout(() => setPopup(true), 900);
      return () => clearTimeout(t);
    }
  }, [live, data.rsvpPopup]);

  const form = (compact?: boolean) => (
    <form
      className="iv-rsvp-form"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
        setPopup(false);
      }}
    >
      <fieldset className="iv-field">
        <legend>참석 여부</legend>
        <div className="iv-radio-row">
          <label>
            <input type="radio" name={`att${compact ? "-p" : ""}`} defaultChecked /> 참석
          </label>
          <label>
            <input type="radio" name={`att${compact ? "-p" : ""}`} /> 불참
          </label>
        </div>
      </fieldset>

      <fieldset className="iv-field">
        <legend>구분</legend>
        <div className="iv-radio-row">
          <label>
            <input type="radio" name={`side${compact ? "-p" : ""}`} defaultChecked /> 신랑측
          </label>
          <label>
            <input type="radio" name={`side${compact ? "-p" : ""}`} /> 신부측
          </label>
        </div>
      </fieldset>

      <label className="iv-field">
        <span>성함</span>
        <input type="text" placeholder="성함을 입력해 주세요" required />
      </label>

      {data.rsvpAskCount && (
        <label className="iv-field">
          <span>참석 인원</span>
          <input type="number" min={1} defaultValue={1} />
        </label>
      )}

      {data.rsvpAskMeal && (
        <fieldset className="iv-field">
          <legend>식사 여부</legend>
          <div className="iv-radio-row">
            <label>
              <input type="radio" name={`meal${compact ? "-p" : ""}`} defaultChecked /> 예정
            </label>
            <label>
              <input type="radio" name={`meal${compact ? "-p" : ""}`} /> 안 함
            </label>
          </div>
        </fieldset>
      )}

      <button type="submit" className="iv-btn-primary">
        {sent ? "전달되었습니다" : "참석 의사 전달하기"}
      </button>
    </form>
  );

  return (
    <>
      <Section>
        <SectionTitle en="R.S.V.P">{data.rsvpTitle}</SectionTitle>
        <p className="iv-body iv-prewrap">{data.rsvpNote}</p>
        {form()}
      </Section>

      <Sheet open={popup} title={data.rsvpTitle} onClose={() => setPopup(false)}>
        <p className="iv-popup-note iv-prewrap">{data.rsvpNote}</p>
        {form(true)}
        <button
          type="button"
          className="iv-popup-later"
          onClick={() => setPopup(false)}
        >
          나중에 하기
        </button>
      </Sheet>
    </>
  );
}

/* ============================================================
   방명록
   ============================================================ */

interface Note {
  id: number;
  name: string;
  body: string;
}

function Guestbook({ data }: { data: InvitationData }) {
  const [notes, setNotes] = useState<Note[]>([
    { id: 1, name: "박민수", body: "두 분 결혼 진심으로 축하드려요! 행복하게 사세요 :)" },
    { id: 2, name: "정하영", body: "너무 잘 어울리는 두 사람. 꽃길만 걷기를 바랍니다." },
  ]);
  const seq = useRef(2);

  return (
    <Section>
      <SectionTitle en="Guestbook">{data.guestbookTitle}</SectionTitle>

      <ul className="iv-notes">
        {notes.map((n) => (
          <li key={n.id}>
            <div className="iv-note-head">
              <p className="iv-note-name">{n.name}</p>
              {data.guestbookPassword && (
                <button
                  type="button"
                  className="iv-note-del"
                  onClick={() => {
                    const input = window.prompt("삭제 비밀번호를 입력하세요");
                    if (input === null) return;
                    if (input === data.guestbookPassword) {
                      setNotes((prev) => prev.filter((x) => x.id !== n.id));
                    } else {
                      window.alert("비밀번호가 일치하지 않습니다.");
                    }
                  }}
                >
                  삭제
                </button>
              )}
            </div>
            <p className="iv-note-body">{n.body}</p>
          </li>
        ))}
      </ul>

      <form
        className="iv-rsvp-form"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const name = String(fd.get("name") ?? "").trim();
          const body = String(fd.get("body") ?? "").trim();
          if (!name || !body) return;
          seq.current += 1;
          setNotes((prev) => [...prev, { id: seq.current, name, body }]);
          e.currentTarget.reset();
        }}
      >
        <label className="iv-field">
          <span>이름</span>
          <input name="name" type="text" placeholder="성함" required />
        </label>
        <label className="iv-field">
          <span>메시지</span>
          <textarea name="body" rows={3} placeholder="축하 메시지를 남겨주세요" required />
        </label>
        <button type="submit" className="iv-btn-primary">
          메시지 남기기
        </button>
      </form>
    </Section>
  );
}

/* ============================================================
   공유
   ============================================================ */

function ShareBlock({ data }: { data: InvitationData }) {
  const [copied, copy] = useCopy();

  // Web Share API 가 있으면 네이티브 공유 시트, 없으면 카카오 공유 링크로 대체합니다.
  const share = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: data.shareTitle, text: data.shareDescription, url });
        return;
      } catch {
        /* 사용자가 취소한 경우 — 아무 것도 하지 않습니다. */
      }
    }
    window.open(
      `https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener",
    );
  };

  return (
    <Section>
      <div className="iv-share">
        <button type="button" className="iv-btn-soft press" onClick={() => copy(typeof window === "undefined" ? "" : window.location.href)}>
          {copied ? "링크가 복사되었습니다" : "링크 복사하기"}
        </button>
        <button type="button" className="iv-btn-soft press" onClick={share}>
          카카오톡 공유하기
        </button>
      </div>
      <p className="iv-share-meta">{data.shareTitle}</p>
      {data.shareDescription && (
        <p className="iv-share-meta iv-prewrap">{data.shareDescription}</p>
      )}
    </Section>
  );
}

/* ---------- 배경음악 ---------- */

/**
 * 음원 파일이 아직 없으므로 WebAudio 로 간단한 화음을 만들어 재생합니다.
 * 실제 서비스에서는 track 별 mp3 URL 로 <audio> 를 걸면 됩니다.
 */
const BGM_NOTES: Record<string, number[]> = {
  canon: [261.63, 392.0, 329.63, 261.63, 349.23, 261.63, 293.66, 392.0],
  spring: [329.63, 392.0, 440.0, 523.25, 440.0, 392.0],
  lullaby: [261.63, 329.63, 392.0, 329.63],
  waltz: [349.23, 440.0, 523.25, 440.0, 349.23, 293.66],
};

function BgmPlayer({ track, autoplay }: { track: string; autoplay: boolean }) {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
    void ctxRef.current?.close();
    ctxRef.current = null;
    setPlaying(false);
  }, []);

  const start = useCallback(() => {
    const notes = BGM_NOTES[track];
    if (!notes) return;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    ctxRef.current = ctx;
    let i = 0;
    const tick = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = notes[i % notes.length]!;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.1);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
      i += 1;
    };
    tick();
    timerRef.current = window.setInterval(tick, 1200);
    setPlaying(true);
  }, [track]);

  useEffect(() => stop, [stop]);

  return (
    <button
      type="button"
      className="iv-bgm press"
      onClick={() => (playing ? stop() : start())}
      aria-label={playing ? "음악 끄기" : "음악 켜기"}
      title={autoplay ? "자동 재생은 브라우저 정책상 첫 터치 후 시작됩니다" : undefined}
    >
      {playing ? "♪" : "♪̸"}
    </button>
  );
}

/* ============================================================
   효과 레이어
   ============================================================ */

function EffectLayer({ kind }: { kind: "petal" | "snow" | "sparkle" }) {
  // 위치/지연을 결정적으로 계산해 SSR 과 CSR 결과가 같도록 합니다.
  const bits = Array.from({ length: 18 }, (_, i) => ({
    left: (i * 37) % 100,
    delay: (i * 0.73) % 9,
    dur: 7 + ((i * 1.7) % 6),
    size: 6 + ((i * 3) % 8),
  }));

  return (
    <div className={`iv-effect iv-effect-${kind}`} aria-hidden>
      {bits.map((b, i) => (
        <span
          key={i}
          style={{
            left: `${b.left}%`,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.dur}s`,
            width: b.size,
            height: b.size,
          }}
        />
      ))}
    </div>
  );
}

/* ============================================================
   두 사람 이야기 · 타임라인 · 미니앨범 · 안내사항 · 비디오 · 하객스냅 · 선물하기
   ============================================================ */

function Couple({ data }: { data: InvitationData }) {
  const pairs = [
    { tag: "Groom", p: data.groom, intro: data.groomIntro, photo: data.groomPhoto },
    { tag: "Bride", p: data.bride, intro: data.brideIntro, photo: data.bridePhoto },
  ];
  return (
    <Section>
      <SectionTitle en="Profile">이 조합, 꽤 괜찮습니다</SectionTitle>
      <div className="iv-couple" data-design={data.coupleDesign}>
        {pairs.map(({ tag, p, intro, photo }) => (
          <div key={tag} className="iv-couple-col">
            <span className="iv-couple-tape" style={{ background: data.couplePoint1 }}>
              {tag}
            </span>
            <div className="iv-couple-photo" style={{ background: data.couplePoint1 }}>
              <PhotoSlot src={photo} fit="cover" />
            </div>
            <p className="iv-couple-name" style={{ color: data.couplePoint2 }}>
              {tag === "Groom" ? "신랑" : "신부"} {p.firstName || fullName(p)}
            </p>
            <p className="iv-couple-intro iv-prewrap">{intro}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Timeline({ data }: { data: InvitationData }) {
  if (data.timeline.length === 0) {
    return (
      <Section>
        <SectionTitle en="Our time">{data.timelineTitle}</SectionTitle>
        <p className="iv-empty">타임라인 항목을 추가해 주세요</p>
      </Section>
    );
  }
  return (
    <Section>
      <SectionTitle en="Our time">{data.timelineTitle}</SectionTitle>
      <ol className={`iv-timeline is-${data.timelineShape}`}>
        {data.timeline.map((t) => (
          <li key={t.id}>
            <div className="iv-tl-photo">
              <PhotoSlot src={t.photo} fit="cover" />
            </div>
            <div className="iv-tl-body">
              <p className="iv-tl-period">{t.period}</p>
              <p className="iv-tl-text">{t.body}</p>
              <p className="iv-tl-date">{t.date}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Album({ data }: { data: InvitationData }) {
  const [page, setPage] = useState(0);
  const pages = data.albumPages;
  const current = pages[Math.min(page, pages.length - 1)];
  if (!current) return null;

  return (
    <Section>
      {data.showAlbumText && <SectionTitle en="Mini album">미니앨범</SectionTitle>}
      <div
        className="iv-album"
        style={{
          background: data.albumBg ?? "var(--iv-sub)",
          color: data.albumInk ?? "var(--iv-ink)",
        }}
      >
        <div className={`iv-album-grid is-d${current.designId % 6}`}>
          {Array.from({ length: Math.max(3, Math.min(6, current.photos.length)) }).map((_, i) => (
            <span key={i} className="iv-album-slot">
              <PhotoSlot src={current.photos[i]} fit="cover" />
            </span>
          ))}
        </div>
        {data.showAlbumText && (
          <p className="iv-album-caption">
            {data.groomEnglish || fullName(data.groom)} &amp;{" "}
            {data.brideEnglish || fullName(data.bride)}
          </p>
        )}
      </div>

      {pages.length > 1 && (
        <div className="iv-album-dots">
          {pages.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPage(i)}
              aria-label={`${i + 1}번째 페이지`}
              className={i === page ? "is-on" : ""}
            />
          ))}
        </div>
      )}
    </Section>
  );
}

function Notices({ data }: { data: InvitationData }) {
  if (data.notices.length === 0) {
    return (
      <Section>
        <SectionTitle en="Notice">안내사항</SectionTitle>
        <p className="iv-empty">안내사항을 추가해 주세요</p>
      </Section>
    );
  }
  return (
    <Section>
      <SectionTitle en="Notice">안내사항</SectionTitle>
      <div className="iv-notices">
        {data.notices.map((n) => (
          <NoticeCard key={n.id} title={n.title} body={n.body} photo={n.photo} />
        ))}
      </div>
    </Section>
  );
}

function NoticeCard({
  title,
  body,
  photo,
}: {
  title: string;
  body: string;
  photo?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="iv-notice press" onClick={() => setOpen(true)}>
        <span className="iv-notice-title">{title || "제목 없음"}</span>
        <span className="iv-notice-more">자세히 보기 ›</span>
      </button>
      <Sheet open={open} title={title || "안내사항"} onClose={() => setOpen(false)}>
        {photo && (
          <div className="iv-notice-photo">
            <PhotoSlot src={photo} fit="cover" />
          </div>
        )}
        <p className="iv-body iv-prewrap" style={{ textAlign: "left" }}>
          {body}
        </p>
      </Sheet>
    </>
  );
}

function VideoBlock({ data }: { data: InvitationData }) {
  const yt = data.videoMode === "youtube" ? toYoutubeEmbed(data.videoUrl) : null;
  return (
    <Section>
      <SectionTitle en="Video">비디오</SectionTitle>
      <div className="iv-video">
        {yt ? (
          <iframe
            src={yt}
            title="웨딩 영상"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : data.videoMode === "upload" && data.videoUrl ? (
          <video src={data.videoUrl} poster={data.videoThumb} controls playsInline />
        ) : data.videoThumb ? (
          <PhotoSlot src={data.videoThumb} fit="cover" />
        ) : (
          <span className="iv-empty">동영상을 등록해 주세요</span>
        )}
      </div>
    </Section>
  );
}

function toYoutubeEmbed(url: string): string | null {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/,
  );
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

function Snap({ data }: { data: InvitationData }) {
  return (
    <Section>
      <SectionTitle en="Guest snap">하객스냅</SectionTitle>
      <p className="iv-body">
        오늘 담아주신 사진을 함께 모아요.
        <br />
        아래 버튼으로 바로 올려주세요.
      </p>
      <a
        className="iv-btn-primary"
        href={data.snapDriveUrl || "#"}
        target={data.snapDriveUrl ? "_blank" : undefined}
        rel="noopener noreferrer"
        style={{ marginTop: "1.4em", display: "block", textAlign: "center" }}
      >
        사진 올리기
      </a>
    </Section>
  );
}

function Gift({ data }: { data: InvitationData }) {
  return (
    <Section tight>
      <button type="button" className="iv-gift press">
        {data.giftLabel} <span aria-hidden>🌾</span>
      </button>
    </Section>
  );
}

/* ============================================================
   오프닝 애니메이션
   ============================================================ */

const OPENING_MARK: Record<string, string> = {
  emoji: "💍",
  lace: "❁",
  curtain: "",
  envelope: "✉",
  wrap: "🎀",
};

function OpeningLayer({ kind }: { kind: Exclude<InvitationData["opening"], "none"> }) {
  // 커튼은 좌우로 갈라지고, 나머지는 마크가 있는 베일이 페이드아웃됩니다.
  if (kind === "curtain") {
    return (
      <div className="opening" aria-hidden>
        <span className="opening-half l" />
        <span className="opening-half r" />
      </div>
    );
  }
  return (
    <div className="opening" aria-hidden>
      <span className="opening-veil">
        <span className="opening-mark">{OPENING_MARK[kind]}</span>
      </span>
    </div>
  );
}

/* ============================================================
   공통 조각
   ============================================================ */

function Section({
  children,
  tight,
}: {
  children: React.ReactNode;
  tight?: boolean;
}) {
  return (
    <section className={`iv-section reveal ${tight ? "is-tight" : ""}`}>
      {children}
    </section>
  );
}

/**
 * 아래에서 올라오는 바텀 시트.
 * 닫을 때도 애니메이션이 끝난 뒤 언마운트되도록 상태를 한 번 더 거칩니다.
 */
function Sheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  // 렌더 단계에서 prop 변화를 상태에 반영합니다 (effect 안에서 setState 하지 않기
  // 위한 React 권장 패턴). 닫기 애니메이션이 끝나면 onAnimationEnd 로 언마운트.
  const [phase, setPhase] = useState<"closed" | "open" | "closing">(
    open ? "open" : "closed",
  );

  if (open && phase !== "open") setPhase("open");
  if (!open && phase === "open") setPhase("closing");

  if (phase === "closed") return null;
  const closing = phase === "closing";

  return (
    <>
      <div className="sheet-scrim" onClick={onClose} aria-hidden />
      <div
        className={`sheet ${closing ? "is-closing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onAnimationEnd={() => {
          if (closing) setPhase("closed");
        }}
      >
        <span className="sheet-grip" />
        <div className="sheet-body">
          <div className="iv-sheet-head">
            <p className="iv-sheet-title">{title}</p>
            <button
              type="button"
              onClick={onClose}
              className="iv-sheet-close"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}

function SectionTitle({
  en,
  children,
}: {
  en: string;
  children: React.ReactNode;
}) {
  return (
    <header className="iv-sec-head">
      <span className="iv-sec-en">{en}</span>
      <h2 className="iv-sec-title">{children}</h2>
    </header>
  );
}

function useCopy(): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false);
  const copy = useCallback((text: string) => {
    void navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }, []);
  return [copied, copy];
}
