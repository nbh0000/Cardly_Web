import { CoverArt } from "@/components/occasion/cover-art";
import { designVars } from "@/lib/occasion/designs";
import {
  dateDots,
  dateKo,
  dateShort,
  timeKo,
} from "@/lib/occasion/format";
import {
  ON_ART_LAYOUTS,
  type Design,
  type InviteData,
} from "@/lib/occasion/types";

/* 카드의 넉 면.

   목록의 작은 카드와 화면 가득한 카드가 같은 컴포넌트를 씁니다. 크기가
   다른 것은 바깥에서 zoom 으로 줄이기 때문이고, 조판은 완전히 같습니다.
   따로 «작은 판» 을 만들면 반드시 어느 한쪽이 틀어집니다.

   글자 크기는 전부 토큰의 px 값입니다(app/occasion-tokens.css). 카드가
   고정 폭이라 가능한 일이고, 덕분에 어떤 화면에서도 본문이 12px 아래로
   내려가지 않습니다. */

/** 카드 뿌리에 얹는 색 세 개. `oc` 클래스와 함께 써야 토큰이 붙습니다. */
export function designStyle(d: Design): React.CSSProperties {
  return designVars(d) as React.CSSProperties;
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
  priority?: boolean;
  thumb?: boolean;
}) {
  /* 글자가 그림 위에 직접 놓이는 판인지. 그렇다면 글자색은 템플릿이
     아니라 «그 자리의 그림이 밝은가 어두운가» 가 정합니다. */
  const onArt = ON_ART_LAYOUTS.includes(design.cover);

  return (
    <div
      className="oc-cover"
      data-l={design.cover}
      data-on={onArt ? "art" : "paper"}
      data-tone={design.tone}
    >
      <CoverArt file={design.art} thumb={thumb} priority={priority} />
      {onArt && <span className="oc-cover-scrim" aria-hidden />}

      <span className="oc-deco" aria-hidden />

      <div className="oc-cover-text">
        {data.eyebrow && <span className="oc-cover-eyebrow">{data.eyebrow}</span>}
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

/* ── ③ 속 오른쪽 — 언제, 어디로 ───────────────────────────────
   단추는 여기 없습니다. 카드 안은 받아서 읽는 면이고, 누르는 것들은
   카드 밖 아래에 둡니다(components/occasion/actions.tsx).          */

export function InsideRight({
  data,
  daysLeft,
}: {
  data: InviteData;
  /** 남은 날. 보는 날마다 달라지므로 밖에서 받습니다 */
  daysLeft: number | null;
}) {
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
    </div>
  );
}

/* ── ④ 뒤표지 ─────────────────────────────────────────────── */

export function Back({ design, data }: { design: Design; data: InviteData }) {
  return (
    <div className="oc-back">
      {data.host && <p className="oc-back-host">{data.host}</p>}
      <span className="oc-back-line" aria-hidden />
      <p className="oc-credit">
        {design.name}
        <br />
        Cardly 초대장
      </p>
      <span className="oc-back-mark">cardly.kr</span>
    </div>
  );
}
