import { asset } from "@/lib/asset";
import { fontStack } from "@/lib/fonts";
import { ART, ART_SOURCE } from "@/lib/occasion/art";
import { designVars } from "@/lib/occasion/designs";
import {
  dateDots,
  dateKo,
  dateShort,
  mapHref,
  smsHref,
  telHref,
  timeKo,
  toDate,
} from "@/lib/occasion/format";
import type { Design, InviteData } from "@/lib/occasion/types";

/* 카드의 넉 면.

   목록의 6rem 짜리 섬네일과 화면 가득한 카드가 이 파일의 같은
   컴포넌트를 씁니다. 글자 크기가 전부 cqw(면의 폭)에 매달려 있어
   따로 «작은 판» 을 만들지 않아도 어느 크기에서든 같은 조판으로
   앉습니다. 미리보기와 실물이 다르면 그건 미리보기가 아닙니다. */

export function designStyle(d: Design): React.CSSProperties {
  return {
    ...designVars(d),
    "--oc-head": fontStack(d.headFont),
    "--oc-body": fontStack(d.bodyFont),
  } as React.CSSProperties;
}

/** 11.14 — 숫자 판에서 표지의 주인공이 되는 날짜 */
function numeral(ymd: string): string {
  const d = toDate(ymd);
  if (!d) return "";
  return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, "0")}`;
}

/** 이니셜 — 초대하는 사람의 성을 한두 자.
    "이준호 · 김서영" → "이김", "제철상회" → "제" */
function monogram(host: string, title: string): string {
  const source = host.trim() || title.trim();
  if (!source) return "";
  const parts = source
    .split(/[·,/&\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => [...p][0] ?? "")
    .join("");
}

/* ── ① 앞표지 ─────────────────────────────────────────────── */

export function Cover({
  design,
  data,
  priority = false,
  thumb = false,
}: {
  design: Design;
  data: Pick<InviteData, "eyebrow" | "title" | "date" | "host">;
  /** 첫 화면에 크게 뜨는 그림이면 먼저 받아 옵니다 */
  priority?: boolean;
  /** 목록·고르는 칸처럼 작게 뜨는 자리 — 폭 480px 판을 씁니다 */
  thumb?: boolean;
}) {
  return (
    <div className="oc-cover" data-l={design.cover}>
      {design.art && (
        <>
          <div className="oc-cover-art">
            {/* 정적 내보내기라 next/image 최적화 대상이 아닙니다. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset(`/art/${thumb ? "thumb/" : ""}${design.art}`)}
              alt=""
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              decoding="async"
            />
          </div>
          <span className="oc-cover-scrim" aria-hidden />
        </>
      )}

      <span className="oc-deco" aria-hidden />

      <div className="oc-cover-text">
        {data.eyebrow && <span className="oc-cover-eyebrow">{data.eyebrow}</span>}
        <span className="oc-cover-mono" aria-hidden>
          {monogram(data.host, data.title)}
        </span>
        <span className="oc-cover-num" aria-hidden>
          {numeral(data.date)}
        </span>
        <span className="oc-cover-title">{data.title}</span>
        {data.date && <span className="oc-cover-date">{dateDots(data.date)}</span>}
      </div>
    </div>
  );
}

/* ── ② 속 왼쪽 — 초대 글 ──────────────────────────────────── */

export function InsideLeft({ data }: { data: InviteData }) {
  return (
    <div className="oc-in">
      <p className="oc-in-eyebrow">{data.eyebrow || "Invitation"}</p>
      {data.message && <p className="oc-in-msg">{data.message}</p>}
      {data.host && <p className="oc-in-host">{data.host} 드림</p>}
    </div>
  );
}

/* ── ③ 속 오른쪽 — 언제, 어디로 ───────────────────────────── */

export function InsideRight({
  data,
  daysLeft,
}: {
  data: InviteData;
  /** 남은 날. 보는 날마다 달라지므로 밖에서 받습니다 */
  daysLeft: number | null;
}) {
  const mapQuery = data.address || data.place;

  return (
    <div className="oc-in">
      {data.date && (
        <div>
          <p className="oc-when-day">{dateShort(data.date)}</p>
          <p className="oc-when-sub">
            {dateKo(data.date)}
            {data.time && (
              <>
                <br />
                {timeKo(data.time)}
              </>
            )}
          </p>
          {daysLeft !== null && daysLeft >= 0 && (
            <span className="oc-when-left">
              {daysLeft === 0 ? "오늘입니다" : `${daysLeft}일 남았습니다`}
            </span>
          )}
        </div>
      )}

      {(data.place || data.address) && (
        <>
          <div className="oc-rule" />
          <div>
            {data.place && <p className="oc-where-name">{data.place}</p>}
            {data.address && <p className="oc-where-addr">{data.address}</p>}
            {data.note && <p className="oc-note">{data.note}</p>}
          </div>
        </>
      )}

      <div className="oc-acts">
        {mapQuery && (
          <a
            className="oc-act oc-act-solid"
            href={mapHref(mapQuery)}
            target="_blank"
            rel="noreferrer"
          >
            길 찾기
          </a>
        )}
        {data.phone && (
          <a className="oc-act" href={telHref(data.phone)}>
            전화
          </a>
        )}
        {data.rsvp && data.phone && (
          <a
            className="oc-act"
            href={smsHref(
              data.phone,
              `${data.title.replace(/\n/g, " ")} — 참석하겠습니다.`,
            )}
          >
            참석 알리기
          </a>
        )}
      </div>
    </div>
  );
}

/* ── ④ 뒤표지 ─────────────────────────────────────────────── */

export function Back({ design, data }: { design: Design; data: InviteData }) {
  const credit = design.art ? ART[design.art] : undefined;

  return (
    <div className="oc-back">
      {data.host && <p className="oc-back-host">{data.host}</p>}
      <span className="oc-back-line" aria-hidden />
      {credit ? (
        <p className="oc-credit">
          표지 그림 · {credit.artist}
          <br />
          『{credit.title}』, {credit.date}
          <br />
          {ART_SOURCE}
        </p>
      ) : (
        <p className="oc-credit">
          {design.name}
          <br />
          Cardly 초대장
        </p>
      )}
      <span className="oc-back-mark">cardly.kr</span>
    </div>
  );
}
