"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Accounts,
  Closing,
  Contact,
  Countdown,
  Detail,
  Gallery,
  Greeting,
  Location,
  Notices,
  Rsvp,
} from "@/components/invite/sections";
import { asset } from "@/lib/asset";
import { dateDots } from "@/lib/invite/format";
import { getTheme, themeVars } from "@/lib/invite/themes";
import type { InviteConfig, SectionId } from "@/lib/invite/types";
import { fontStack } from "@/lib/fonts";

/* ============================================================
   3D 로 열리는 초대장

   링크를 누르면 «닫힌 카드»가 먼저 놓입니다. 앞장을 누르면 그 장이
   왼쪽으로 넘어가며 열리고, 그 아래에서 초대장이 드러납니다.
   스크롤은 카드가 열린 뒤에야 풀립니다.

   왜 이렇게 만드는가 — 초대장은 받아서 «여는» 물건입니다. 링크를
   눌렀는데 곧바로 글이 좌르륵 나오면 그건 청첩장 웹페이지지 초대장이
   아닙니다. 여는 동작이 있어야 카드가 됩니다.

   방향은 책과 같습니다. 덮개는 왼쪽 모서리를 경첩으로 삼아 오른쪽에서
   왼쪽으로 넘어갑니다. 반대로 만들면 오른쪽에서 왼쪽으로 읽는 책이
   됩니다.

   모션 최소화를 켠 분에게는 여는 연출 없이 바로 열린 상태로 둡니다.
   ============================================================ */

const SECTIONS: Record<SectionId, (p: { c: InviteConfig }) => React.ReactNode> = {
  greeting: Greeting,
  detail: Detail,
  countdown: Countdown,
  gallery: Gallery,
  location: Location,
  contact: Contact,
  rsvp: Rsvp,
  account: Accounts,
  notice: Notices,
};

type Phase = "shut" | "turning" | "open";

export function InviteCard({ config }: { config: InviteConfig }) {
  const theme = getTheme(config.theme);
  const [phase, setPhase] = useState<Phase>("shut");
  const timer = useRef(0);

  const open = useCallback(() => {
    setPhase((p) => {
      if (p !== "shut") return p;
      /* 넘어가는 동안에는 아직 스크롤을 풀지 않습니다. 다 넘어간 뒤에
         풀어야 «열고 나서 읽는» 순서가 지켜집니다. */
      timer.current = window.setTimeout(() => setPhase("open"), 1500);
      return "turning";
    });
  }, []);

  /* 모션을 줄이겠다고 한 분에게는 연출을 걸지 않습니다.
     열려 있는 상태로 시작하는 것이 맞지, 느리게 여는 것이 아닙니다. */
  const skip = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("open");
    }
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  /* 카드가 닫혀 있는 동안 뒤쪽이 스크롤되면, 열기도 전에 내용이
     지나가 버립니다. */
  useEffect(() => {
    if (phase === "open") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  return (
    <div
      ref={skip}
      className="o3"
      data-phase={phase}
      style={
        {
          ...themeVars(theme),
          "--wi-heading": fontStack(theme.headingFont),
          "--wi-body": fontStack(theme.bodyFont),
        } as React.CSSProperties
      }
    >
      <div className="o3-card">
        {/* ── 안쪽: 초대장 ──
            표지는 덮개가 맡고 있으므로 안쪽에서 다시 그리지 않습니다.
            같은 사진과 이름이 또 나오면 «열어도 그대로»로 보여서, 여는
            동작이 아무것도 하지 않은 셈이 됩니다. */}
        <div className="o3-inside wi">
          {config.sections.map((id) => {
            const S = SECTIONS[id];
            return S ? <S key={id} c={config} /> : null;
          })}
          <Closing c={config} />
        </div>

        {/* ── 덮개: 눌러서 여는 앞장 ── */}
        <button
          type="button"
          className="o3-cover"
          onClick={open}
          aria-label="초대장 열기"
          tabIndex={phase === "shut" ? 0 : -1}
        >
          {config.cover.image && (
            <span className="o3-cover-photo" aria-hidden>
              {/* 정적 내보내기라 next/image 최적화 대상이 아닙니다. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset(config.cover.image)} alt="" fetchPriority="high" />
              <i className="o3-cover-scrim" />
            </span>
          )}

          <span className="o3-cover-text">
            <span className="o3-cover-eyebrow">{config.cover.eyebrow}</span>
            <span className="o3-cover-title">
              {config.cover.title.split("\n").map((l, i) => (
                <span key={i}>{l}</span>
              ))}
            </span>
            <span className="o3-cover-date">{dateDots(config.event.date)}</span>
          </span>

          <span className="o3-open-hint">
            <i aria-hidden />
            눌러서 열어 보세요
          </span>

          {/* 종이 단면 — 자유단(오른쪽)에 세워 두는 얇은 띠 */}
          <span className="o3-edge" aria-hidden />
          {/* 넘어가는 동안 지는 그늘 — 경첩 쪽이 가장 어둡습니다 */}
          <span className="o3-shade" aria-hidden />
        </button>

        {/* 덮개가 넘어가며 안쪽에 드리우는 그림자 */}
        <span className="o3-castin" aria-hidden />
      </div>
    </div>
  );
}
