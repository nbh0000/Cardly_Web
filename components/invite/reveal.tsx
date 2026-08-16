"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";

/* ============================================================
   스크롤 등장

   화면에 들어오면 살짝 떠오르며 나타납니다. 그것뿐입니다 — 회전하거나
   튀거나 늘어나지 않습니다. 초대장은 읽히는 것이 먼저고, 움직임은
   «여기부터 새 이야기»라는 표시 이상을 하면 방해가 됩니다.

   붙는 자리에서 한 번 재고, 아직 아래에 있는 것만 관찰합니다.
   관찰에만 맡기면 두 가지가 깨집니다.
     · 이미 화면 위로 지나간 것 — 링크를 타고 문서 중간으로 들어오거나
       스크롤 위치가 복원된 방문자에게 위쪽이 투명한 채로 남습니다.
     · 처음부터 화면 밖에 있던 것 — 브라우저가 관찰 시작 시점에
       콜백을 보내 주지 않는 경우가 있어, 영영 나타나지 않습니다.

   ref 콜백에서 재는 이유는 그때가 «요소가 붙고 배치까지 끝난» 첫
   시점이기 때문입니다. effect 로 미루면 한 프레임 늦습니다.
   ============================================================ */

/** 아래에서 이만큼 올라왔을 때 나타납니다 (뷰포트 높이의 88%) */
const TRIGGER = 0.88;

export function Reveal({
  children,
  /** 같은 줄에 여러 개가 들어올 때 순서대로 늦춥니다 (ms) */
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  as?: "div" | "section" | "li" | "figure";
  className?: string;
}) {
  const [shown, setShown] = useState(false);
  const io = useRef<IntersectionObserver | null>(null);
  const raf = useRef(0);

  /* 참조 콜백의 정체성이 매번 바뀌면 React 가 붙였다 뗐다를 반복하므로
     useCallback 으로 고정합니다. */
  const attach = useCallback((el: HTMLElement | null) => {
    io.current?.disconnect();
    io.current = null;
    cancelAnimationFrame(raf.current);
    if (!el) return;

    /* 한 프레임 기다렸다가 잽니다. 요소가 붙는 순간에는 스타일시트가
       아직 적용되지 않아 모든 칸이 화면 맨 위에 포개져 있을 수 있고,
       그 상태로 재면 «전부 이미 보인다»는 잘못된 답이 나옵니다. */
    raf.current = requestAnimationFrame(() => {
      if (el.getBoundingClientRect().top < window.innerHeight * TRIGGER) {
        setShown(true);
        return;
      }
      const obs = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting && e.boundingClientRect.top >= 0) continue;
            setShown(true);
            obs.disconnect();
            io.current = null;
          }
        },
        {
          rootMargin: `0px 0px -${Math.round((1 - TRIGGER) * 100)}% 0px`,
          threshold: 0.05,
        },
      );
      obs.observe(el);
      io.current = obs;
    });
  }, []);

  return (
    <Tag
      ref={attach}
      className={`wi-reveal ${shown ? "is-in" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
