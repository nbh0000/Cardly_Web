"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Reveal } from "@/components/invite/reveal";
import { asset } from "@/lib/asset";
import {
  dateDots,
  dateKo,
  daysUntil,
  mapHref,
  monthDay,
  monthGrid,
  parseDate,
  telHref,
  timeKo,
  weekdayEn,
} from "@/lib/invite/format";
import type { InviteConfig } from "@/lib/invite/types";

/* ============================================================
   초대장의 칸들

   전부 설정 하나(InviteConfig)만 보고 그립니다. 어느 칸을 켤지는
   config.sections 이 정하므로, 행사가 달라져도 이 파일은 그대로입니다.

   조판 규칙 셋을 지킵니다.
     · 본문은 16px 아래로 내려가지 않습니다.
     · 누르는 것은 44px 이상입니다.
     · 섹션 사이 여백을 아끼지 않습니다.
   ============================================================ */

/** 값이 바뀌지 않는 스토어 — 최초 스냅샷만 필요할 때 씁니다. */
const subscribeNever = () => () => {};

type P = { c: InviteConfig };

/** 섹션 머리 — 영문 라벨과 한글 제목 */
function Head({ label, title }: { label: string; title: string }) {
  return (
    <Reveal className="wi-head">
      <p className="wi-label">{label}</p>
      <h2 className="wi-h2">{title}</h2>
    </Reveal>
  );
}

/* ---------- 표지 ---------- */

export function Cover({ c }: P) {
  const { year, month, day } = monthDay(c.event.date);
  return (
    <header className="wi-cover">
      {c.cover.image && (
        <div className="wi-cover-photo">
          {/* 정적 내보내기라 next/image 최적화 대상이 아닙니다. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset(c.cover.image)} alt="" fetchPriority="high" />
          {/* 글자가 놓이는 자리를 지키는 스크림은 항상 그대로 두고,
              전체 밝기만 설정값으로 조절합니다. */}
          <span className="wi-cover-scrim" aria-hidden />
          <span
            className="wi-cover-dim"
            style={{ opacity: (c.cover.dim ?? 28) / 100 }}
            aria-hidden
          />
        </div>
      )}

      <div className={`wi-cover-text ${c.cover.image ? "on-photo" : ""}`}>
        <p className="wi-cover-eyebrow">{c.cover.eyebrow}</p>
        <h1 className="wi-cover-title">
          {c.cover.title.split("\n").map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </h1>
        <p className="wi-cover-sub">{c.cover.subtitle}</p>
      </div>

      <div className={`wi-cover-foot ${c.cover.image ? "on-photo" : ""}`}>
        <span>{year}</span>
        <i />
        <span>
          {month}.{day}
        </span>
        <i />
        <span>{weekdayEn(c.event.date)}</span>
      </div>
    </header>
  );
}

/* ---------- 초대 글 ---------- */

export function Greeting({ c }: P) {
  return (
    <section className="wi-sec" id="greeting">
      {c.greeting.lead && (
        <Reveal className="wi-lead">
          {c.greeting.lead.split("\n").map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </Reveal>
      )}
      <Head label="INVITATION" title={c.greeting.title} />
      <Reveal className="wi-body" delay={80}>
        {c.greeting.body.split("\n").map((l, i) =>
          l ? <span key={i}>{l}</span> : <br key={i} />,
        )}
      </Reveal>
      {c.greeting.sign && (
        <Reveal className="wi-sign" delay={140}>
          {c.greeting.sign}
        </Reveal>
      )}
    </section>
  );
}

/* ---------- 일시 · 장소 ---------- */

export function Detail({ c }: P) {
  return (
    <section className="wi-sec wi-sec-band" id="detail">
      <Head label="WHEN & WHERE" title="일시와 장소" />
      <Reveal className="wi-detail" delay={80}>
        <div className="wi-detail-row">
          <p className="wi-detail-k">일시</p>
          <p className="wi-detail-v">
            {dateKo(c.event.date)}
            <br />
            {timeKo(c.event.time)}
          </p>
        </div>
        <div className="wi-detail-row">
          <p className="wi-detail-k">장소</p>
          <p className="wi-detail-v">
            {c.event.place}
            {c.event.hall && (
              <>
                <br />
                {c.event.hall}
              </>
            )}
          </p>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- 남은 날짜와 달력 ---------- */

export function Countdown({ c }: P) {
  const cells = monthGrid(c.event.date);
  const target = parseDate(c.event.date).getDate();

  /* 남은 날은 브라우저의 «오늘»로만 셉니다. 서버에서 미리 세어 두면
     정적으로 구워진 숫자가 그대로 굳어, 며칠 뒤 방문자에게 틀린 날수가
     보입니다. 서버 스냅샷은 null 이라 첫 프레임에는 자리만 잡습니다. */
  const left = useSyncExternalStore(
    subscribeNever,
    () => daysUntil(c.event.date, new Date()),
    () => null,
  );

  return (
    <section className="wi-sec" id="countdown">
      <Head label="THE DAY" title={dateDots(c.event.date)} />

      <Reveal className="wi-cal" delay={80}>
        <div className="wi-cal-week" aria-hidden>
          {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="wi-cal-grid">
          {cells.map((d, i) => (
            <span key={i} className={d === target ? "is-day" : undefined}>
              {d ?? ""}
            </span>
          ))}
        </div>
      </Reveal>

      <Reveal className="wi-dday" delay={140}>
        {left === null ? (
          <span className="wi-dday-hold" aria-hidden />
        ) : left > 0 ? (
          <p>
            <strong>{left}</strong>일 남았습니다
          </p>
        ) : left === 0 ? (
          <p>
            <strong>오늘</strong>입니다
          </p>
        ) : (
          <p>고맙습니다. 잘 마쳤습니다</p>
        )}
      </Reveal>
    </section>
  );
}

/* ---------- 갤러리 ---------- */

export function Gallery({ c }: P) {
  const [open, setOpen] = useState<number | null>(null);

  /* 라이트박스가 열려 있는 동안 뒤가 스크롤되면 사진이 밀립니다 */
  useEffect(() => {
    if (open === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % c.gallery.length));
      if (e.key === "ArrowLeft")
        setOpen((i) => (i === null ? i : (i - 1 + c.gallery.length) % c.gallery.length));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, c.gallery.length]);

  if (!c.gallery.length) return null;

  return (
    <section className="wi-sec wi-sec-band" id="gallery">
      <Head label="GALLERY" title="사진" />
      <Reveal className="wi-gal" delay={80}>
        {c.gallery.map((src, i) => (
          <button
            key={src + i}
            type="button"
            className="wi-gal-item"
            onClick={() => setOpen(i)}
            aria-label={`${i + 1}번째 사진 크게 보기`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset(src)} alt="" loading="lazy" decoding="async" />
          </button>
        ))}
      </Reveal>

      {open !== null && (
        <div
          className="wi-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="사진 크게 보기"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(null);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset(c.gallery[open]!)} alt="" />
          <button
            type="button"
            className="wi-lightbox-x"
            onClick={() => setOpen(null)}
            aria-label="닫기"
          >
            ✕
          </button>
          <div className="wi-lightbox-nav">
            <button
              type="button"
              onClick={() => setOpen((i) => (i! - 1 + c.gallery.length) % c.gallery.length)}
              aria-label="이전 사진"
            >
              ‹
            </button>
            <span>
              {open + 1} / {c.gallery.length}
            </span>
            <button
              type="button"
              onClick={() => setOpen((i) => (i! + 1) % c.gallery.length)}
              aria-label="다음 사진"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------- 오시는 길 ---------- */

export function Location({ c }: P) {
  const query = c.event.mapQuery || c.event.address;
  return (
    <section className="wi-sec" id="location">
      <Head label="LOCATION" title="오시는 길" />
      <Reveal className="wi-loc" delay={80}>
        <p className="wi-loc-place">{c.event.place}</p>
        <p className="wi-loc-addr">{c.event.address}</p>
        <div className="wi-loc-actions">
          <a
            className="wi-btn"
            href={mapHref(query)}
            target="_blank"
            rel="noreferrer noopener"
          >
            지도 열기
          </a>
          <CopyButton text={c.event.address} label="주소 복사" />
        </div>
      </Reveal>

      {!!c.event.transports?.length && (
        <Reveal className="wi-trans" delay={140}>
          {c.event.transports.map((t) => (
            <div key={t.kind + t.body}>
              <p className="wi-trans-k">{t.kind}</p>
              <p className="wi-trans-v">{t.body}</p>
            </div>
          ))}
        </Reveal>
      )}
    </section>
  );
}

/* ---------- 연락하기 ---------- */

export function Contact({ c }: P) {
  if (!c.contacts.length) return null;
  return (
    <section className="wi-sec wi-sec-band" id="contact">
      <Head label="CONTACT" title="연락하기" />
      <Reveal className="wi-contacts" delay={80}>
        {c.contacts.map((p) => (
          <div key={p.role + p.name} className="wi-contact">
            <div>
              <p className="wi-contact-role">{p.role}</p>
              <p className="wi-contact-name">{p.name}</p>
            </div>
            {p.phone && (
              <a className="wi-btn wi-btn-sm" href={telHref(p.phone)}>
                전화
              </a>
            )}
          </div>
        ))}
      </Reveal>
    </section>
  );
}

/* ---------- 참석 회신 ---------- */

export function Rsvp({ c }: P) {
  if (!c.rsvp.to) return null;
  const isMail = c.rsvp.to.includes("@");
  return (
    <section className="wi-sec" id="rsvp">
      <Head label="RSVP" title={c.rsvp.title} />
      <Reveal className="wi-rsvp" delay={80}>
        <p className="wi-body">{c.rsvp.body}</p>
        {c.rsvp.deadline && <p className="wi-rsvp-due">{c.rsvp.deadline}</p>}
        <a
          className="wi-btn wi-btn-fill"
          href={isMail ? `mailto:${c.rsvp.to}` : telHref(c.rsvp.to)}
        >
          {isMail ? "메일로 회신하기" : "전화로 알리기"}
        </a>
      </Reveal>
    </section>
  );
}

/* ---------- 마음 전하실 곳 ---------- */

export function Accounts({ c }: P) {
  if (!c.accounts.length) return null;
  const groups = [...new Set(c.accounts.map((a) => a.group))];
  return (
    <section className="wi-sec wi-sec-band" id="account">
      <Head label="THANK YOU" title="마음 전하실 곳" />
      <Reveal className="wi-accounts" delay={80}>
        {groups.map((g) => (
          <details key={g} className="wi-acc-group">
            <summary>
              <span>{g}</span>
              <i aria-hidden />
            </summary>
            <div className="wi-acc-list">
              {c.accounts
                .filter((a) => a.group === g)
                .map((a) => (
                  <div key={a.number} className="wi-acc">
                    <p className="wi-acc-bank">
                      {a.bank} {a.number}
                    </p>
                    <p className="wi-acc-holder">{a.holder}</p>
                    <CopyButton text={`${a.bank} ${a.number}`} label="복사" small />
                  </div>
                ))}
            </div>
          </details>
        ))}
      </Reveal>
    </section>
  );
}

/* ---------- 안내사항 ---------- */

export function Notices({ c }: P) {
  if (!c.notices.length) return null;
  return (
    <section className="wi-sec" id="notice">
      <Head label="NOTICE" title="안내사항" />
      <Reveal className="wi-notices" delay={80}>
        {c.notices.map((n) => (
          <div key={n.title} className="wi-notice">
            <p className="wi-notice-t">{n.title}</p>
            <p className="wi-notice-b">{n.body}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

/* ---------- 맺음 ---------- */

export function Closing({ c }: P) {
  return (
    <footer className="wi-closing">
      <Reveal>
        {c.closing && <p className="wi-closing-line">{c.closing}</p>}
        <p className="wi-closing-meta">
          {dateDots(c.event.date)} · {c.event.place}
        </p>
      </Reveal>
    </footer>
  );
}

/* ---------- 복사 버튼 ---------- */

function CopyButton({
  text,
  label,
  small = false,
}: {
  text: string;
  label: string;
  small?: boolean;
}) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      window.setTimeout(() => setDone(false), 1800);
    } catch {
      /* 클립보드가 막힌 브라우저 — 글자는 그대로 읽을 수 있습니다 */
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className={`wi-btn ${small ? "wi-btn-sm" : ""}`}
    >
      {done ? "복사했습니다" : label}
    </button>
  );
}
