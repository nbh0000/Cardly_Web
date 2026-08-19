"use client";

import {
  Fragment,
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { SamplePhoto } from "@/components/invitation/sample-photo";
import { asset } from "@/lib/asset";
import { fontStack } from "@/lib/fonts";
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
  EFFECT_DENSITIES,
  type Account,
  type EffectDensity,
  type EffectKind,
  type InvitationData,
  type SectionKey,
  type Template,
} from "@/lib/invitation";

/** 값이 바뀌지 않는 스토어 — 최초 스냅샷만 필요할 때 씁니다. */
const subscribeNever = () => () => {};

/**
 * 바텀 시트를 붙일 자리.
 * 섹션(.reveal)에는 스크롤 연동 transform 이 걸려 있어, 그 안에서 그린
 * position:fixed 요소는 화면이 아니라 "그 섹션"을 기준으로 배치됩니다.
 * 그래서 시트는 청첩장 루트로 빼내어 그립니다.
 */
const SheetHostContext = createContext<HTMLElement | null>(null);

/**
 * 샘플 사진 시작 번호. 템플릿마다 다른 사진이 깔리도록 커버·갤러리의 모든
 * 사진 슬롯이 여기에 자기 슬롯 번호를 더해 씁니다.
 */
const PhotoSeedContext = createContext(0);

/**
 * 오프닝 연출이 아직 도는 중인지.
 * 참석 여부 팝업처럼 스스로 떠오르는 UI 가 오프닝 위에 겹쳐 뜨지 않도록,
 * 연출이 끝난 뒤에 시작하게 하려고 내려보냅니다.
 */
const OpeningContext = createContext(false);

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
  /** 값이 바뀌면 오프닝 애니메이션을 다시 재생합니다 */
  replayKey = "",
}: {
  template: Template;
  data: InvitationData;
  live?: boolean;
  coverOnly?: boolean;
  flash?: string | null;
  replayKey?: string;
}) {
  const [sheetHost, setSheetHost] = useState<HTMLElement | null>(null);

  /* 오프닝은 종류를 바꾸거나 다시 재생을 누르면 처음부터 다시 돕니다.
     key 가 바뀌는 순간 "끝남" 표시도 같이 되돌립니다. */
  const openingKey = data.opening + replayKey;
  const [playedKey, setPlayedKey] = useState(openingKey);
  const [openingDone, setOpeningDone] = useState(false);
  if (playedKey !== openingKey) {
    setPlayedKey(openingKey);
    setOpeningDone(false);
  }
  const openingActive = !coverOnly && data.opening !== "none" && !openingDone;

  const theme = resolveTheme(template, data);
  const headingFamily = fontStack(data.headingFont);

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
    <div
      className={`iv${coverOnly ? " iv-coveronly" : ""}`}
      style={style}
      data-tone={data.photoTone ?? "none"}
    >
      <SheetHostContext value={sheetHost}>
       <PhotoSeedContext value={data.photoSeed ?? 0}>
        <OpeningContext value={openingActive}>
        {data.effect !== "none" && !coverOnly && (
          <EffectLayer
            kind={data.effect}
            density={data.effectDensity ?? "mid"}
            color={data.effectColor}
            scale={data.effectScale}
          />
        )}
        {openingActive && (
          <OpeningLayer
            key={openingKey}
            kind={data.opening as Exclude<InvitationData["opening"], "none">}
            monogram={monogramOf(data)}
            onDone={() => setOpeningDone(true)}
          />
        )}

        {!coverOnly && data.bgm !== "none" && (
          <BgmPlayer track={data.bgm} autoplay={data.bgmAutoplay} />
        )}

        <div id="sec-cover" className="iv-anchor">
          <Cover template={template} data={data} />
        </div>
        {coverOnly ? null : (
          <RestOfInvitation data={data} live={live} flash={flash} />
        )}

        {/* 시트가 붙는 자리 — 섹션의 transform 밖이어야 화면 기준으로 뜹니다. */}
        {!coverOnly && <div ref={setSheetHost} />}
        </OpeningContext>
       </PhotoSeedContext>
      </SheetHostContext>
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
  /* 섹션끼리 붙어 있으면 어디서 끊기는지 보이지 않아, 한 칸 걸러 옅은 면을
     깔아 경계를 만듭니다. 숨긴 섹션은 아예 그리지 않으므로 실제로 그려진
     것만 세야 면이 두 번 이어지지 않습니다.
     "인사말" 자리는 인사말과 연락처 두 덩어리를 함께 그려 두 칸을 씁니다. */
  const sections = () => {
    const out: React.ReactNode[] = [];
    let band = 0;
    for (const key of data.sectionOrder) {
      const node = renderSection(key);
      if (!node) continue;
      // 앵커를 달아두면 에디터가 해당 위치로 미리보기를 스크롤할 수 있습니다.
      out.push(
        <div
          key={key}
          id={`sec-${key}`}
          data-sec={key}
          data-band={band % 2}
          className={`iv-anchor${flash === key ? " is-flash" : ""}`}
        >
          {node}
        </div>,
      );
      band += key === "invitation" ? 2 : 1;
    }
    return out;
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
      {sections()}
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
  if (layout === "heart") return <CoverHeart data={data} names={names} />;
  if (layout === "poster") return <CoverPoster data={data} names={names} />;
  if (layout === "polaroid") return <CoverPolaroid data={data} names={names} />;
  if (layout === "band") return <CoverBand data={data} names={names} />;
  if (layout === "filmstrip")
    return <CoverFilmstrip data={data} names={names} />;
  if (layout === "ticket") return <CoverTicket data={data} names={names} />;
  if (layout === "retro") return <CoverRetro data={data} names={names} />;
  if (layout === "garden") return <CoverGarden data={data} names={names} />;
  if (layout === "press") return <CoverPress data={data} names={names} />;
  if (layout === "neon") return <CoverNeon data={data} names={names} />;
  return <CoverCenter data={data} names={names} template={template} />;
}

type Names = { first: string; second: string };

/**
 * 커버 두 줄 사이의 이음표.
 *
 * 신랑과 신부 사이에 놓이는 앰퍼샌드입니다.
 */
function Amp({ wide = false }: { wide?: boolean }) {
  return <span className="iv-amp">{wide ? " & " : "&"}</span>;
}

/** 커버 위에 얹는 영문 캘리그래피 한 줄 */
function ScriptLine({
  data,
  className = "",
}: {
  data: InvitationData;
  className?: string;
}) {
  if (!data.coverScript) return null;
  return <p className={`iv-script ${className}`}>{data.coverScript}</p>;
}

/** 신랑·신부의 영문 이름. 비어 있으면 한글 이름으로 대신합니다. */
function englishNames(data: InvitationData, names: Names) {
  const groomFirst = data.nameOrder === "groom-first";
  return {
    first: (groomFirst ? data.groomEnglish : data.brideEnglish) || names.first,
    second: (groomFirst ? data.brideEnglish : data.groomEnglish) || names.second,
  };
}

function PhotoSlot({
  src,
  fit,
  className,
  rounded,
  /** 기본 이미지 변주 선택용 — 슬롯마다 다른 그림이 나오게 합니다 */
  seed = 0,
}: {
  src?: string;
  fit: "cover" | "contain";
  className?: string;
  rounded?: string;
  seed?: number;
}) {
  const seedBase = use(PhotoSeedContext);
  return (
    <div
      className={`iv-photo ${className ?? ""}`}
      style={{ borderRadius: rounded }}
    >
      {src ? (
        <>
          {/* 업로드한 blob/data URL 이거나, 발행된 청첩장의 public/ 경로입니다.
              후자는 GitHub Pages 의 basePath 를 붙여야 열립니다. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src.startsWith("/") ? asset(src) : src}
            alt=""
            style={{ objectFit: fit }}
          />
          {/* 디자인 > 타이틀 이미지 어둡기 */}
          <span className="iv-photo-dim" aria-hidden />
        </>
      ) : (
        <SamplePhoto seed={seedBase + seed} fit={fit} />
      )}
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
        seed={0}
      />
      <ScriptLine data={data} />
      <h1 className="iv-cover-names">
        {names.first}
        <Amp />
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
        seed={0}
      />
      <div className="iv-cover-photo-scrim" />
      <div className="iv-cover-photo-text">
        <p className="iv-eyebrow iv-on-photo">{data.coverEyebrow}</p>
        <ScriptLine data={data} className="iv-script-lg iv-on-photo" />
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
        <PhotoSlot src={data.coverPhoto} fit={data.coverPhotoFit} seed={0} />
      </div>
      <ScriptLine data={data} />
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
        seed={0}
      />
      <ScriptLine data={data} className="iv-script-left" />
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
        seed={0}
      />
      <ScriptLine data={data} className="iv-script-lg" />
      <h1 className="iv-cover-names iv-cover-names-italic">
        {names.first}
        <Amp wide />
        {names.second}
      </h1>
      <span className="iv-pill">{formatDateDots(data.date)}</span>
      <p className="iv-cover-meta">{data.venueName} {data.venueHall}</p>
    </section>
  );
}

/* ---------- 그래픽 커버 ---------- */

const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** May 17, 2026 */
function formatDateEn(iso: string): string {
  const d = parseDate(iso);
  return `${MONTHS_EN[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** 사진을 하트 모양으로 오려내는 clip-path.
 *  100×92 좌표계를 objectBoundingBox 로 눌러 어떤 비율에도 맞춥니다. */
const HEART_D =
  "M50 90C24 71 2 54 2 32 2 15 14 4 28 4c9 0 17 5 22 13C55 9 63 4 72 4c14 0 26 11 26 28 0 22-22 39-48 58Z";

function HeartClip() {
  return (
    <svg className="iv-defs" aria-hidden focusable="false">
      <defs>
        <clipPath id="iv-heart-clip" clipPathUnits="objectBoundingBox">
          <path d={HEART_D} transform="scale(0.01 0.010869)" />
        </clipPath>
      </defs>
    </svg>
  );
}

/** 커버 여백에 흩뿌리는 하트 스티커 */
function HeartStickers() {
  const spots = [
    { top: "16%", left: "6%", size: "1.5em", rot: -14, solid: true },
    { top: "24%", right: "7%", size: "1em", rot: 12, solid: false },
    { top: "52%", left: "3%", size: "1.1em", rot: 8, solid: false },
    { top: "62%", right: "4%", size: "1.6em", rot: -10, solid: true },
    { bottom: "16%", left: "9%", size: "1.2em", rot: 16, solid: true },
    { bottom: "26%", right: "10%", size: "0.9em", rot: -6, solid: false },
  ];
  return (
    <span className="iv-stickers" aria-hidden>
      {spots.map((s, i) => (
        <svg
          key={i}
          viewBox="0 0 100 92"
          className="iv-sticker-heart"
          style={{
            top: s.top,
            left: s.left,
            right: s.right,
            bottom: s.bottom,
            width: s.size,
            rotate: `${s.rot}deg`,
            opacity: s.solid ? 1 : 0.55,
          }}
        >
          <path d={HEART_D} />
        </svg>
      ))}
    </span>
  );
}

function CoverHeart({ data, names }: { data: InvitationData; names: Names }) {
  return (
    <section className="iv-cover iv-cover-heart">
      <HeartClip />
      {data.showStickers && <HeartStickers />}

      <p className="iv-hand iv-hand-xl">{data.coverScript || "Save the date!"}</p>

      <div className="iv-heart-frame">
        <div className="iv-heart-photo">
          <PhotoSlot src={data.coverPhoto} fit={data.coverPhotoFit} seed={0} />
        </div>
        <svg className="iv-heart-outline" viewBox="0 0 100 92" aria-hidden>
          <path d={HEART_D} />
        </svg>
        {data.showStickers && (
          <>
            <span className="iv-tag iv-tag-a">Groom</span>
            <span className="iv-tag iv-tag-b">Bride</span>
          </>
        )}
      </div>

      <p className="iv-hand iv-heart-quote">
        we&rsquo;re saying
        <br />
        &ldquo; I do ! &rdquo;
      </p>

      <h1 className="iv-cover-names iv-heart-names">
        {names.first} <span className="iv-dot">&middot;</span> {names.second}
      </h1>
      <p className="iv-heart-date">on {formatDateEn(data.date)}</p>
      <p className="iv-cover-meta">
        {data.venueName} {data.venueHall}
      </p>
    </section>
  );
}

function CoverPoster({ data, names }: { data: InvitationData; names: Names }) {
  const en = englishNames(data, names);
  return (
    <section className="iv-cover iv-cover-poster">
      <PhotoSlot
        src={data.coverPhoto}
        fit={data.coverPhotoFit}
        className="iv-poster-bg"
        seed={0}
      />
      <div className="iv-poster-scrim" />

      <div className="iv-poster-top">
        <p className="iv-eyebrow iv-on-photo">{data.coverEyebrow}</p>
        <p className="iv-poster-en">
          {en.first} <Amp /> {en.second}
        </p>
      </div>

      <p className="iv-poster-date" aria-hidden>
        {formatDateDots(data.date)}
      </p>

      <div className="iv-poster-bottom">
        <ScriptLine data={data} className="iv-script-xl iv-on-photo" />
        <h1 className="iv-cover-names iv-on-photo iv-poster-names">
          {names.first} <span className="iv-dot">&middot;</span> {names.second}
        </h1>
        <span className="iv-rule" />
        <p className="iv-cover-meta iv-on-photo">
          {formatDateKo(data.date)} {formatTimeKo(data.time)}
          <br />
          {data.venueName} {data.venueHall}
        </p>
      </div>
    </section>
  );
}

function CoverPolaroid({ data, names }: { data: InvitationData; names: Names }) {
  return (
    <section className="iv-cover iv-cover-polaroid">
      <p className="iv-eyebrow">{data.coverEyebrow}</p>
      <p className="iv-polaroid-date">{formatDateDots(data.date)}</p>

      <div className="iv-polaroid-stack">
        <figure className="iv-polaroid iv-polaroid-back">
          <PhotoSlot src={undefined} fit="cover" seed={2} />
        </figure>
        <figure className="iv-polaroid iv-polaroid-back2">
          <PhotoSlot src={undefined} fit="cover" seed={3} />
        </figure>
        <figure className="iv-polaroid iv-polaroid-front">
          <span className="iv-tape" aria-hidden />
          <PhotoSlot src={data.coverPhoto} fit={data.coverPhotoFit} seed={0} />
          <figcaption className="iv-hand">
            {data.coverScript || "Our Wedding Day"}
          </figcaption>
        </figure>
      </div>

      <h1 className="iv-cover-names iv-polaroid-names">
        {names.first}
        <Amp />
        {names.second}
      </h1>
      <p className="iv-cover-meta">
        {formatDateKo(data.date)} {formatTimeKo(data.time)}
        <br />
        {data.venueName} {data.venueHall}
      </p>
    </section>
  );
}

function CoverBand({ data, names }: { data: InvitationData; names: Names }) {
  const en = englishNames(data, names);
  return (
    <section className="iv-cover iv-cover-band">
      <div className="iv-band-plate">
        <p className="iv-eyebrow">{data.coverEyebrow}</p>
        <div className="iv-band-frame">
          <PhotoSlot src={data.coverPhoto} fit={data.coverPhotoFit} seed={0} />
        </div>
        <ScriptLine data={data} className="iv-script-lg" />
      </div>

      <div className="iv-band-foot">
        <p className="iv-band-en">
          {en.first} <Amp /> {en.second}
        </p>
        <h1 className="iv-cover-names iv-band-names">
          {names.first} <span className="iv-dot">&middot;</span> {names.second}
        </h1>
        <span className="iv-hairline" />
        <p className="iv-cover-meta">
          {formatDateKo(data.date)} {formatTimeKo(data.time)}
          <br />
          {data.venueName} {data.venueHall}
        </p>
      </div>
    </section>
  );
}

function CoverFilmstrip({ data, names }: { data: InvitationData; names: Names }) {
  const en = englishNames(data, names);
  return (
    <section className="iv-cover iv-cover-film">
      <p className="iv-film-reel">{data.coverEyebrow}</p>

      <div className="iv-film-body">
        <div className="iv-filmstrip">
          <span className="iv-film-holes" aria-hidden />
          <div className="iv-film-cell">
            <PhotoSlot src={data.coverPhoto} fit={data.coverPhotoFit} seed={0} />
          </div>
          <div className="iv-film-cell">
            <PhotoSlot src={undefined} fit="cover" seed={1} />
          </div>
          <span className="iv-film-holes iv-film-holes-b" aria-hidden />
        </div>

        <p className="iv-film-date" aria-hidden>
          {formatDateDots(data.date)}
        </p>
      </div>

      <ScriptLine data={data} className="iv-script-lg" />
      <h1 className="iv-cover-names iv-film-names">
        {names.first} <span className="iv-dot">&middot;</span> {names.second}
      </h1>
      <p className="iv-film-en">
        {en.first} &nbsp;/&nbsp; {en.second}
      </p>
      <p className="iv-cover-meta">
        {formatDateKo(data.date)} {formatTimeKo(data.time)}
        <br />
        {data.venueName} {data.venueHall}
      </p>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   컨셉 커버 다섯 판

   청첩장을 다른 물건인 척하게 만드는 판들입니다. 입장권·옛날 포스터·
   신문 호외·밤거리 간판. 물건의 문법을 빌리면 «무슨 자리인지» 가
   글보다 먼저 읽힙니다.

   어떤 판이든 들어가는 값은 같습니다 — 눈썹글, 사진, 두 사람 이름,
   날짜·시각·장소. 판이 달라도 채우는 칸은 같아야 템플릿을 바꿔도
   써 둔 내용이 그대로 옮겨 갑니다.
   ──────────────────────────────────────────────────────────── */

/** 입장권 — 야구장·극장·탑승권이 같이 씁니다 */
function CoverTicket({ data, names }: { data: InvitationData; names: Names }) {
  return (
    <section className="iv-cover iv-cover-ticket">
      <div className="iv-ticket">
        <div className="iv-ticket-top">
          <p className="iv-ticket-brand">{data.coverEyebrow}</p>
          <div className="iv-ticket-photo">
            <PhotoSlot src={data.coverPhoto} fit={data.coverPhotoFit} seed={0} />
          </div>
          <ScriptLine data={data} className="iv-script-lg" />
          <h1 className="iv-cover-names iv-ticket-names">
            {names.first} <span className="iv-dot">&middot;</span> {names.second}
          </h1>
        </div>

        <span className="iv-ticket-rip" aria-hidden />

        {/* 스텁 — 실제 입장권이 그렇듯 «언제·어디로» 만 적습니다 */}
        <div className="iv-ticket-stub">
          <div>
            <span>Date</span>
            <b>{formatDateDots(data.date)}</b>
          </div>
          <div>
            <span>Time</span>
            <b>{formatTimeKo(data.time)}</b>
          </div>
          <div>
            <span>Place</span>
            <b>{data.venueName}</b>
          </div>
        </div>
      </div>
    </section>
  );
}

/** 레트로 — 위아래 사선 띠 + 가운데 액자 */
function CoverRetro({ data, names }: { data: InvitationData; names: Names }) {
  const en = englishNames(data, names);
  return (
    <section className="iv-cover iv-cover-retro">
      <span className="iv-retro-bars" aria-hidden />

      <div className="iv-retro-head">
        <p className="iv-eyebrow iv-retro-eyebrow">{data.coverEyebrow}</p>
        <div className="iv-retro-frame">
          <PhotoSlot src={data.coverPhoto} fit={data.coverPhotoFit} seed={0} />
        </div>
        <h1 className="iv-cover-names iv-retro-names">
          {names.first} <span className="iv-dot">&middot;</span> {names.second}
        </h1>
        <p className="iv-retro-en">
          {en.first} &nbsp;&amp;&nbsp; {en.second}
        </p>
      </div>

      <div className="iv-retro-foot">
        <ScriptLine data={data} />
        <p className="iv-cover-meta">
          {formatDateKo(data.date)} {formatTimeKo(data.time)}
          <br />
          {data.venueName} {data.venueHall}
        </p>
      </div>

      <span className="iv-retro-bars iv-retro-bars-b" aria-hidden />
    </section>
  );
}

/** 야외 — 사진을 끝까지 채우고 아치 하나만 */
function CoverGarden({ data, names }: { data: InvitationData; names: Names }) {
  return (
    <section className="iv-cover iv-cover-garden">
      <PhotoSlot
        src={data.coverPhoto}
        fit={data.coverPhotoFit}
        className="iv-garden-photo"
        seed={0}
      />
      <span className="iv-garden-light" aria-hidden />
      <span className="iv-garden-arch" aria-hidden />

      <div className="iv-garden-text">
        <p className="iv-eyebrow iv-on-photo">{data.coverEyebrow}</p>
        <ScriptLine data={data} className="iv-script-lg iv-on-photo" />
        <h1 className="iv-cover-names iv-on-photo iv-garden-names">
          {names.first} <span className="iv-dot">&middot;</span> {names.second}
        </h1>
        <p className="iv-cover-meta iv-on-photo">
          {formatDateKo(data.date)} {formatTimeKo(data.time)}
          <br />
          {data.venueName} {data.venueHall}
        </p>
      </div>
    </section>
  );
}

/** 호외 — 신문 1면 조판 */
function CoverPress({ data, names }: { data: InvitationData; names: Names }) {
  const en = englishNames(data, names);
  return (
    <section className="iv-cover iv-cover-press">
      <div className="iv-press-masthead">
        <span>{en.first} &amp; {en.second}</span>
        <span>{formatDateDots(data.date)}</span>
      </div>

      <p className="iv-press-kicker">{data.coverEyebrow}</p>
      <h1 className="iv-cover-names iv-press-names">
        {names.first} <span className="iv-dot">&middot;</span> {names.second}
        <br />
        결혼합니다
      </h1>
      <span className="iv-press-rule" aria-hidden />

      <div className="iv-press-body">
        <div className="iv-press-photo">
          <PhotoSlot src={data.coverPhoto} fit={data.coverPhotoFit} seed={0} />
        </div>
        {/* 기사 리드처럼 한 문단. 사용자가 쓴 인사말이 아니라 커버
            전용 문구라, 길어지지 않도록 날짜와 장소만 문장으로 씁니다. */}
        <p className="iv-press-lede">
          {formatDateKo(data.date)} {formatTimeKo(data.time)}, {data.venueName}
          {data.venueHall ? ` ${data.venueHall}` : ""}에서 두 사람이 예식을
          올립니다. 오셔서 자리를 빛내 주십시오.
        </p>
      </div>

      <div className="iv-press-foot">
        <ScriptLine data={data} />
      </div>
    </section>
  );
}

/** 네온 — 밤 사진 위에 켜는 간판 */
function CoverNeon({ data, names }: { data: InvitationData; names: Names }) {
  return (
    <section className="iv-cover iv-cover-neon">
      <PhotoSlot
        src={data.coverPhoto}
        fit={data.coverPhotoFit}
        className="iv-neon-photo"
        seed={0}
      />
      <div className="iv-neon-text">
        <p className="iv-eyebrow iv-on-photo">{data.coverEyebrow}</p>
        <ScriptLine data={data} className="iv-script-lg iv-neon-script" />
        <span className="iv-neon-tube" aria-hidden />
        <h1 className="iv-cover-names iv-neon-names">
          {names.first} <span className="iv-dot">&middot;</span> {names.second}
        </h1>
        <p className="iv-cover-meta iv-on-photo">
          {formatDateKo(data.date)} {formatTimeKo(data.time)}
          <br />
          {data.venueName} {data.venueHall}
        </p>
      </div>
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
          {/* 직접 추가한 연락처는 관계(role)가 겹칠 수 있어 인덱스로 키를 만듭니다. */}
          {parents
            .filter((p) => p.name)
            .map((p, i) => (
              <li key={`${p.role}-${i}`}>
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
            <PhotoSlot src={src || undefined} fit="cover" seed={i + 1} />
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
  // 오프닝 연출이 도는 동안에는 팝업을 띄우지 않습니다.
  const openingActive = use(OpeningContext);

  useEffect(() => {
    if (live && data.rsvpPopup && !openingActive) {
      const t = setTimeout(() => setPopup(true), 900);
      return () => clearTimeout(t);
    }
  }, [live, data.rsvpPopup, openingActive]);

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

/**
 * 정수 연산만 쓰는 결정적 난수.
 * Math.random 을 쓰면 서버가 그린 HTML 과 브라우저가 다시 그린 결과가 달라
 * hydration 이 깨집니다. Math.sin 계열도 엔진마다 끝자리가 다를 수 있어
 * 비트 연산만으로 만듭니다.
 */
function rnd(seed: number): number {
  let t = (seed * 1103515245 + 12345) & 0x7fffffff;
  t ^= t >>> 13;
  t = (t * 1274126177) & 0x7fffffff;
  return t / 0x7fffffff;
}

/** 꽃가루 색 — 테마 포인트색에 파스텔 몇 가지를 섞습니다. */
const CONFETTI_COLORS = [
  "var(--iv-accent)",
  "#F6C6D0",
  "#F7E0A3",
  "#BFD8C4",
  "#C9D8EC",
  "#E8C7E4",
];

/**
 * 청첩장 전체에 깔리는 파티클 레이어.
 *
 * 한 입자는 세 겹으로 나눠 그립니다. transform 은 요소당 하나뿐이라
 * 낙하·좌우 흔들림·회전을 한 요소에 함께 걸 수 없기 때문입니다.
 *   .iv-fx-fall  아래로(빛망울은 위로) 이동
 *   .iv-fx-sway  좌우로 흔들림 + 깊이감(투명도·블러)
 *   .iv-fx-shape 모양 + 회전/반짝임
 *
 * 입자마다 깊이(0 먼 곳 ~ 2 가까운 곳)를 줘서 크기·속도·선명도를 달리하면
 * 평면적인 눈보라가 아니라 공간감 있는 화면이 됩니다.
 */
function EffectLayer({
  kind,
  density,
  color,
  scale,
}: {
  kind: Exclude<EffectKind, "none">;
  density: EffectDensity;
  /** 빈 문자열이면 템플릿 포인트색을 그대로 씁니다 */
  color?: string;
  /** 입자 크기 배율 */
  scale?: number;
}) {
  const count =
    EFFECT_DENSITIES.find((d) => d.id === density)?.count ??
    EFFECT_DENSITIES[1]!.count;
  const sizeScale = scale && scale > 0 ? scale : 1;

  // 빛망울은 크고 느리게, 하트·꽃가루는 작고 가볍게 움직입니다.
  const baseSize = kind === "bokeh" ? 26 : kind === "confetti" ? 8 : 12;
  const spread = kind === "bokeh" ? 34 : kind === "confetti" ? 6 : 10;
  const baseDur = kind === "bokeh" ? 18 : kind === "sparkle" ? 13 : 11;

  const bits = Array.from({ length: count }, (_, i) => {
    const r = (n: number) => rnd(i * 17 + n * 101 + 3);
    const depth = i % 3; /* 0 먼 곳 · 1 중간 · 2 가까운 곳 */
    const scale = [0.62, 0.9, 1.3][depth]!;
    const speed = [1.55, 1.15, 0.85][depth]!;
    return {
      depth,
      left: r(1) * 100,
      /** 음수 지연 — 첫 화면부터 이미 흩날리는 중인 상태로 시작합니다 */
      delay: -r(2) * 16,
      dur: (baseDur + r(3) * baseDur * 0.8) * speed,
      size: (baseSize + r(4) * spread) * scale * sizeScale,
      drift: (r(5) * 2 - 1) * (40 + r(6) * 90),
      sway: 3 + r(7) * 4,
      spin: 4 + r(8) * 9,
      spinDir: r(9) > 0.5 ? 1 : -1,
      opacity: [0.34, 0.6, 0.92][depth]!,
      blur: [1.5, 0.5, 0][depth]!,
      /* 꽃가루는 조각마다 색이 다릅니다. 색을 직접 고른 경우에는
         고른 색 하나로 통일해야 의도대로 보입니다. */
      color: color || CONFETTI_COLORS[Math.floor(r(10) * CONFETTI_COLORS.length)]!,
    };
  });

  return (
    <div
      className={`iv-fx iv-fx-${kind}`}
      aria-hidden
      /* --fx-c 를 주면 효과 CSS 가 포인트색 대신 이 색을 씁니다.
         비워 두면 var(--fx-c, var(--iv-accent)) 의 대체값이 살아납니다. */
      style={color ? ({ "--fx-c": color } as React.CSSProperties) : undefined}
      data-tinted={color ? "" : undefined}
    >
      {bits.map((b, i) => (
        <span
          key={i}
          className="iv-fx-fall"
          data-depth={b.depth}
          style={
            {
              "--x": `${b.left}%`,
              "--size": `${b.size.toFixed(2)}px`,
              "--dur": `${b.dur.toFixed(2)}s`,
              "--delay": `${b.delay.toFixed(2)}s`,
              "--drift": `${b.drift.toFixed(1)}px`,
              "--sway": `${b.sway.toFixed(2)}s`,
              "--spin": `${b.spin.toFixed(2)}s`,
              "--spin-dir": b.spinDir,
              "--o": b.opacity,
              "--blur": `${b.blur}px`,
              "--c": b.color,
            } as React.CSSProperties
          }
        >
          <span className="iv-fx-sway">
            <span className="iv-fx-shape" />
          </span>
        </span>
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
              <PhotoSlot src={photo} fit="cover" seed={tag === "Groom" ? 3 : 5} />
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
        {data.timeline.map((t, i) => (
          <li key={t.id}>
            <div className="iv-tl-photo">
              <PhotoSlot src={t.photo} fit="cover" seed={i + 4} />
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
              <PhotoSlot src={current.photos[i]} fit="cover" seed={i + 2} />
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
            <PhotoSlot src={photo} fit="cover" seed={2} />
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
          <PhotoSlot src={data.videoThumb} fit="cover" seed={4} />
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

/**
 * 오프닝에 얹을 이니셜. 영문 이름이 있으면 첫 글자를, 없으면 한글 이름의
 * 첫 글자를 씁니다. 둘 다 비어 있으면 모노그램 글자는 생략됩니다.
 */
function monogramOf(data: InvitationData) {
  const initial = (en: string, ko: string) => {
    const e = (en ?? "").trim();
    if (e) return e[0]!.toUpperCase();
    const k = (ko ?? "").trim();
    return k ? k[0]! : "";
  };
  const g = initial(data.groomEnglish, data.groom.firstName);
  const b = initial(data.brideEnglish, data.bride.firstName);
  if (!g && !b) return "";
  return g && b ? `${g} & ${b}` : g || b;
}

function OpeningLayer({
  kind,
  monogram,
  onDone,
}: {
  kind: Exclude<InvitationData["opening"], "none">;
  monogram?: string;
  onDone: () => void;
}) {
  /**
   * animationend 는 자식에서도 버블링됩니다. 그대로 받으면 가장 짧은 조각
   * (봉투 뚜껑, 리본, 이모지 하나)이 끝나는 순간 레이어가 사라져 정작 본
   * 연출은 보이지 않습니다. 레이어 안에서 아직 도는 애니메이션이 하나도
   * 없을 때만 정리합니다.
   */
  const finish = (e: React.AnimationEvent<HTMLDivElement>) => {
    const layer = e.currentTarget;
    const running = layer
      .getAnimations({ subtree: true })
      .some((a) => a.playState === "running");
    if (!running) onDone();
  };

  /**
   * 애니메이션이 아예 시작되지 않는 경우(모션 최소화 설정, 탭이 백그라운드에
   * 있어 animationend 를 놓친 경우)에도 레이어가 영원히 남지 않도록
   * 넉넉한 시간 뒤 강제로 걷어냅니다.
   */
  useEffect(() => {
    const t = setTimeout(onDone, 6000);
    return () => clearTimeout(t);
  }, [onDone]);

  /* ── 양문 열기 (3D) ──
     닫힌 카드가 가운데서 갈라져, 두 짝이 경첩을 축으로 앞으로 열립니다.
     각 짝 안의 op-gate-shade 는 열릴수록 진해져서 면이 광원에서
     돌아앉는 느낌을 냅니다. */
  if (kind === "gatefold") {
    return (
      <div className="opening op-gate" aria-hidden onAnimationEnd={finish}>
        {/* 문 안쪽의 그늘 — 열리면서 걷힙니다 */}
        <span className="op-gate-void" />
        {(["l", "r"] as const).map((side) => (
          <span key={side} className={`op-gate-door ${side}`}>
            {/* 앞면만 따로 둡니다. 뒷면 감추기를 문짝에 걸면
                종이 단면(::after)까지 같이 사라집니다. */}
            <span className="op-gate-face op-paper">
              <span className="op-gate-inner" />
              <span className="op-gate-shade" />
            </span>
          </span>
        ))}
        <span className="op-gate-seam">
          {monogram ? <span className="op-gate-mark">{monogram}</span> : null}
        </span>
      </div>
    );
  }

  /* ── 카드 펼치기 (3D) ──
     반으로 접힌 카드의 윗장이 접힌 선을 축으로 뒤로 젖혀지고,
     아랫장이 내려가며 청첩장이 드러납니다. */
  if (kind === "unfold") {
    return (
      <div className="opening op-unfold" aria-hidden onAnimationEnd={finish}>
        <span className="op-unfold-top">
          <span className="op-unfold-face op-paper">
            <span className="op-unfold-frame">
              {monogram ? (
                <span className="op-unfold-mark">{monogram}</span>
              ) : null}
            </span>
            <span className="op-unfold-shade" />
          </span>
        </span>
        <span className="op-unfold-bottom op-paper" />
      </div>
    );
  }

  /* ── 모노그램 ──
     종이 한 장이 화면을 덮고, 가는 겹테두리가 그려진 뒤 두 사람의
     이니셜이 자간을 좁히며 떠오릅니다. 빛이 한 번 스치고 종이가
     위로 들리면서 청첩장이 드러납니다. */
  if (kind === "monogram") {
    return (
      <div className="opening op-mono" aria-hidden onAnimationEnd={finish}>
        <span className="op-mono-paper op-paper">
          <span className="op-mono-frame" />
          <span className="op-mono-frame op-mono-frame-in" />
          <span className="op-mono-center">
            <span className="op-mono-rule op-mono-rule-t" />
            {monogram ? (
              <span className="op-mono-initials">{monogram}</span>
            ) : (
              <span className="op-mono-initials">&amp;</span>
            )}
            <span className="op-mono-rule op-mono-rule-b" />
            <span className="op-mono-word">INVITATION</span>
          </span>
          <span className="op-mono-sheen" />
        </span>
      </div>
    );
  }

  /* ── 실링 왁스 ──
     봉인을 누르는 순간이 한 박자 있고, 봉인이 갈라지며 종이가
     좌우로 물러납니다. */
  if (kind === "seal") {
    return (
      <div className="opening op-seal" aria-hidden onAnimationEnd={finish}>
        <span className="op-seal-paper op-paper l" />
        <span className="op-seal-paper op-paper r" />
        <span className="op-seal-wax">
          <span className="op-seal-wax-half l" />
          <span className="op-seal-wax-half r" />
          <span className="op-seal-mark">
            {monogram ? monogram.replace(/\s*&\s*/, "") : "&"}
          </span>
        </span>
      </div>
    );
  }

  if (kind === "curtain") {
    return (
      <div className="opening op-curtain" aria-hidden onAnimationEnd={finish}>
        <span className="opening-half op-paper l" />
        <span className="opening-half op-paper r" />
        <span className="op-curtain-seam" />
      </div>
    );
  }

  if (kind === "envelope") {
    return (
      <div className="opening op-envelope" aria-hidden onAnimationEnd={finish}>
        <span className="op-env-body" />
        <span className="op-env-stage">
          <span className="op-env-card">
            <span className="op-env-seal">&amp;</span>
            <span className="op-env-rule" />
          </span>
          <span className="op-env-pocket" />
          <span className="op-env-flap" />
        </span>
      </div>
    );
  }

  if (kind === "wrap") {
    return (
      <div className="opening op-wrap" aria-hidden onAnimationEnd={finish}>
        <span className="op-wrap-half l" />
        <span className="op-wrap-half r" />
        <span className="op-wrap-ribbon" />
        {/* 리본은 둥근 사각형이나 타원으로는 리본처럼 보이지 않습니다.
            고리·매듭·꼬리를 가진 실제 형태라서 경로로 그립니다. */}
        <svg className="op-wrap-bow" viewBox="0 0 120 78" aria-hidden>
          <g fill="var(--iv-accent, #b08d80)">
            <path d="M56 34C40 8 8 11 11 31c3 19 32 15 45 5Z" opacity="0.95" />
            <path d="M64 34c16-26 48-23 45-3-3 19-32 15-45 5Z" opacity="0.95" />
            <path d="M56 41c-4 13-9 21-18 32l14-4c6-10 8-19 9-25Z" opacity="0.8" />
            <path d="M64 41c4 13 9 21 18 32l-14-4c-6-10-8-19-9-25Z" opacity="0.8" />
            <ellipse cx="60" cy="37" rx="8" ry="6.5" />
          </g>
        </svg>
      </div>
    );
  }

  if (kind === "lace") {
    return (
      <div className="opening op-lace" aria-hidden onAnimationEnd={finish}>
        <span className="op-lace-veil op-paper">
          <svg viewBox="0 0 120 120" className="op-lace-doily">
            {Array.from({ length: 16 }).map((_, i) => (
              <ellipse
                key={i}
                cx="60"
                cy="20"
                rx="7"
                ry="17"
                transform={`rotate(${i * 22.5} 60 60)`}
                fill="none"
                stroke="var(--iv-accent)"
                strokeWidth="1"
              />
            ))}
            <circle cx="60" cy="60" r="22" fill="none" stroke="var(--iv-accent)" strokeWidth="1" />
            <circle cx="60" cy="60" r="12" fill="none" stroke="var(--iv-accent)" strokeWidth="1" />
          </svg>
        </span>
      </div>
    );
  }

  // emoji — 링과 하트가 차례로 튀어오른 뒤 베일이 걷힙니다
  return (
    <div className="opening op-emoji" aria-hidden onAnimationEnd={finish}>
      <span className="op-emoji-veil op-paper">
        {["💍", "🤍", "💐", "🕊", "✨"].map((e, i) => (
          <span key={e} className="op-emoji-bit" style={{ ["--i" as string]: i }}>
            {e}
          </span>
        ))}
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
  const host = use(SheetHostContext);

  if (open && phase !== "open") setPhase("open");
  if (!open && phase === "open") setPhase("closing");

  if (phase === "closed") return null;
  const closing = phase === "closing";

  const markup = (
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

  return host ? createPortal(markup, host) : markup;
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
