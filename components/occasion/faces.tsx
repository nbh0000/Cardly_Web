import { CoverArt } from "@/components/occasion/cover-art";
import { designVars } from "@/lib/occasion/designs";
import { dateKo, dateShort, timeKo } from "@/lib/occasion/format";
import type { Design, InviteData } from "@/lib/occasion/types";

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

/**
 * 표지는 그림뿐입니다.
 *
 * 제목도 날짜도 얹지 않습니다. 얹으면 두 가지를 동시에 잃습니다 — 글자가
 * 묻히지 않게 깐 베일이 그림을 흐리고, 고쳐 쓰라고 넣어 둔 예시 문구가
 * 그림 위에 인쇄되어 카드가 광고 배너처럼 읽힙니다. 실물 인사장이 그렇듯
 * 앞은 그림이고 말은 안에 있습니다.
 */
export function Cover({
  design,
  priority = false,
  thumb = false,
}: {
  design: Design;
  priority?: boolean;
  thumb?: boolean;
}) {
  return (
    <div className="oc-cover">
      <CoverArt file={design.art} thumb={thumb} priority={priority} />
    </div>
  );
}

/* ── ② 속 왼쪽 — 무엇을 위한 자리인가, 그리고 초대 글 ─────────
   표지에서 내려온 제목이 이 면의 머리가 됩니다. 카드를 열었을 때
   «무슨 자리인지» 가 가장 먼저 읽혀야 합니다.                      */

export function InsideLeft({ data }: { data: InviteData }) {
  return (
    <div className="oc-in">
      <p className="oc-in-eyebrow">{data.eyebrow || "Invitation"}</p>
      {data.title && <p className="oc-in-title">{data.title}</p>}
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
