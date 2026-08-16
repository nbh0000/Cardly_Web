"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Cover, designStyle } from "@/components/occasion/cover";
import { ART, ART_SOURCE } from "@/lib/occasion/art";
import { getDesign } from "@/lib/occasion/designs";
import {
  dateKo,
  dateShort,
  daysUntil,
  mapHref,
  smsHref,
  telHref,
  timeKo,
} from "@/lib/occasion/format";
import type { InviteData } from "@/lib/occasion/types";

/* ════════════════════════════════════════════════════════════
   3D 로 열리는 초대장

   링크를 누르면 «닫힌 카드»가 먼저 놓입니다. 앞장을 누르면 그 장이
   왼쪽으로 넘어가며 열리고, 그 아래에서 초대장이 드러납니다.

   왜 이렇게 만드는가 — 초대장은 받아서 «여는» 물건입니다. 링크를
   눌렀는데 곧바로 글이 좌르륵 나오면 그건 청첩장 웹페이지이지
   초대장이 아닙니다. 여는 동작이 있어야 카드가 됩니다.

   방향은 실제 카드와 같습니다. 접힌 자리가 왼쪽이고, 자유단인
   오른쪽을 들어 왼쪽으로 넘깁니다.
   ════════════════════════════════════════════════════════════ */

type Phase = "shut" | "turning" | "open";

/** 덮개가 다 넘어가는 데 걸리는 시간 (CSS 의 transition 과 같아야 합니다) */
const TURN_MS = 1450;

/* 남은 날짜는 «보는 날»에 따라 달라집니다. 빌드 때 계산해 두면
   내일은 틀린 숫자가 되고, 효과(effect)에서 채우면 lint 규칙에
   걸립니다. 그래서 첫 그림(서버)에서는 비워 두고 브라우저에서만
   읽는 값으로 다룹니다. */
const subscribeNever = () => () => {};

function useDaysLeft(date: string): number | null {
  return useSyncExternalStore(
    subscribeNever,
    () => daysUntil(date),
    () => null,
  );
}

export function InviteCard({
  data,
  /** 편집기 미리보기에서는 스크롤을 잠그지 않습니다 */
  lockScroll = true,
}: {
  data: InviteData;
  lockScroll?: boolean;
}) {
  const design = getDesign(data.d);
  const [phase, setPhase] = useState<Phase>("shut");
  const timer = useRef(0);
  const left = useDaysLeft(data.date);
  const credit = ART[design.art];

  const open = useCallback(() => {
    setPhase((p) => {
      if (p !== "shut") return p;
      /* 넘어가는 동안에는 아직 스크롤을 풀지 않습니다. 다 넘어간 뒤에
         풀어야 «열고 나서 읽는» 순서가 지켜집니다. */
      timer.current = window.setTimeout(() => setPhase("open"), TURN_MS);
      return "turning";
    });
  }, []);

  /* 모션을 줄이겠다고 한 분에게는 연출을 걸지 않습니다. 열려 있는
     상태로 시작하는 것이 맞지, 느리게 여는 것이 아닙니다. */
  const skipIfReduced = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("open");
    }
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!lockScroll || phase === "open") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase, lockScroll]);

  const when = `${dateKo(data.date)} ${timeKo(data.time)}`;
  const mapQuery = data.address || data.place;

  return (
    <div
      ref={skipIfReduced}
      className="oc oc-stage"
      data-phase={phase}
      style={designStyle(design)}
    >
      <div className="oc-sheet">
        {/* ── 첫 화면 — 덮개 아래에 접혀 있는 인사말 ── */}
        <div className="oc-first">
          <div className="oc-in">
            <p className="oc-in-eyebrow oc-lift" style={{ "--i": 0 } as React.CSSProperties}>
              {data.eyebrow || "Invitation"}
            </p>
            <p className="oc-in-title oc-lift" style={{ "--i": 1 } as React.CSSProperties}>
              {data.title}
            </p>
            {data.message && (
              <p className="oc-in-msg oc-lift" style={{ "--i": 2 } as React.CSSProperties}>
                {data.message}
              </p>
            )}
            {data.host && (
              <p className="oc-in-host oc-lift" style={{ "--i": 3 } as React.CSSProperties}>
                {data.host} 드림
              </p>
            )}
          </div>

          <span className="oc-castin" aria-hidden />

          {/* ── 덮개 ── */}
          <button
            type="button"
            className="oc-flap"
            onClick={open}
            aria-label="초대장 열기"
            aria-expanded={phase !== "shut"}
            tabIndex={phase === "shut" ? 0 : -1}
          >
            <span className="oc-flap-face">
              <Cover
                design={design}
                eyebrow={data.eyebrow}
                title={data.title}
                date={data.date}
                priority
                hint
              />
            </span>
            <span className="oc-flap-face oc-flap-rear" aria-hidden>
              <span>{data.host || "INVITATION"}</span>
            </span>
            <span className="oc-flap-edge" aria-hidden />
          </button>
        </div>

        {/* ── 이어지는 지면 ── */}
        <div className="oc-rest">
          <div className="oc-rule oc-lift" style={{ "--i": 4 } as React.CSSProperties} />

          <div className="oc-when oc-lift" style={{ "--i": 5 } as React.CSSProperties}>
            <p className="oc-when-day">{dateShort(data.date)}</p>
            <p className="oc-when-sub">{when}</p>
            {left !== null && left >= 0 && (
              <span className="oc-when-left">
                {left === 0 ? "오늘입니다" : `${left}일 남았습니다`}
              </span>
            )}
          </div>

          {(data.place || data.address) && (
            <div className="oc-where oc-lift" style={{ "--i": 6 } as React.CSSProperties}>
              {data.place && <p className="oc-where-name">{data.place}</p>}
              {data.address && <p className="oc-where-addr">{data.address}</p>}
            </div>
          )}

          {data.note && (
            <p className="oc-note oc-lift" style={{ "--i": 7 } as React.CSSProperties}>
              {data.note}
            </p>
          )}

          <div className="oc-acts oc-lift" style={{ "--i": 8 } as React.CSSProperties}>
            {mapQuery && (
              <a
                className="oc-act oc-act-solid"
                href={mapHref(mapQuery)}
                target="_blank"
                rel="noreferrer"
              >
                지도에서 길 찾기
              </a>
            )}
            {data.phone && (
              <a className="oc-act" href={telHref(data.phone)}>
                전화하기
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
                참석한다고 알리기
              </a>
            )}
          </div>

          {credit && (
            <p className="oc-credit oc-lift" style={{ "--i": 9 } as React.CSSProperties}>
              표지 그림 · {credit.artist}, 『{credit.title}』, {credit.date}
              <br />
              {ART_SOURCE}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
