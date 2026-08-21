"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { CardActions } from "@/components/occasion/actions";
import {
  Back,
  Cover,
  designStyle,
  InsideLeft,
  InsideRight,
} from "@/components/occasion/faces";
import { findDesign } from "@/lib/occasion/designs";
import { daysUntil } from "@/lib/occasion/format";
import type { Design, InviteData } from "@/lib/occasion/types";

/* ════════════════════════════════════════════════════════════
   접히는 카드

   종이 한 장을 한 번 접으면 면이 넷 생깁니다 — 앞표지, 속 왼쪽, 속
   오른쪽, 뒤표지. 이 컴포넌트는 그 넉 장을 등뼈에 매달아 두고 «지금 어느
   면을 보고 있는가» 만 상태로 들고 있습니다. 각도를 계산하거나 애니메이션을
   돌리는 코드는 없습니다 — 상태가 바뀌면 CSS transition 이 현재 각도에서
   목표 각도까지 채웁니다. 여는 도중에 다시 눌러도 튀지 않고 이어집니다.

   여는 방향은 실제 카드와 같습니다. 접힌 자리가 왼쪽이고, 자유단인
   오른쪽을 들어 왼쪽으로 넘깁니다. 반대로 넘기면 일본 만화 순서가 되어
   한국에서 쓰는 카드로 읽히지 않습니다.

   왜 굳이 여는가 — 초대장은 받아서 «여는» 물건입니다. 링크를 눌렀는데
   곧바로 글이 좌르륵 나오면 그건 초대장이 아니라 안내 페이지입니다.
   ════════════════════════════════════════════════════════════ */

/** 넉 면을 도는 순서. 0 앞표지 · 1 인사말 · 2 일정 · 3 뒤표지 */
const STOPS = ["앞표지", "인사말", "일정", "뒤표지"] as const;

const NARROW = "(max-width: 47.9rem)";

function subscribeNarrow(onChange: () => void) {
  const mq = window.matchMedia(NARROW);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** 좁은 화면에서는 속면을 한 장씩 봅니다 */
function useSinglePage(): boolean {
  return useSyncExternalStore(
    subscribeNarrow,
    () => window.matchMedia(NARROW).matches,
    () => false,
  );
}

/* 값이 바뀌지 않는 스토어 — 브라우저에서만 읽는 값에 씁니다. */
const subscribeNever = () => () => {};

/* 남은 날짜는 «보는 날» 에 따라 달라집니다. 빌드 때 계산해 두면 내일은
   틀린 숫자가 되므로, 첫 그림에서는 비워 두고 브라우저에서만 읽습니다. */
function useDaysLeft(date: string): number | null {
  return useSyncExternalStore(
    subscribeNever,
    () => daysUntil(date),
    () => null,
  );
}

/**
 * 3D 를 쓸 수 있는 환경인지.
 *
 * preserve-3d 를 이해하지 못하면 넉 장이 그대로 겹쳐 보입니다. 그런 곳에는
 * 3D 를 접고 크로스페이드로 떨어뜨립니다 — 여는 동작은 그대로 남고 연출만
 * 단순해집니다. 서버에서는 알 수 없으므로 첫 그림은 3D 로 그리고, 브라우저가
 * «못 한다» 고 답할 때만 평면으로 바꿉니다.
 */
function useFlatFallback(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () =>
      !(
        typeof CSS !== "undefined" &&
        CSS.supports?.("transform-style", "preserve-3d")
      ),
    () => false,
  );
}

export function FoldedCard({
  data,
  design,
  /** 화살표 키로 넘길 수 있게 할지. 편집기 미리보기에서는 끕니다 */
  keyboard = true,
  /** 카드 밖 보조 단추(길찾기·전화·참석)를 함께 그릴지 */
  actions = true,
}: {
  data: InviteData;
  /** 미리 찾아 둔 디자인. 없으면 데이터의 id 로 찾습니다 */
  design?: Design;
  keyboard?: boolean;
  actions?: boolean;
}) {
  const found = design ?? findDesign(data.d);
  const single = useSinglePage();
  const flat = useFlatFallback();
  const daysLeft = useDaysLeft(data.date);
  const [pos, setPos] = useState(0);

  /* 넓은 화면에서는 속면 두 장이 한꺼번에 보이므로 1 과 2 가 같은
     그림입니다. 그래서 1 에서 다음을 누르면 2 를 건너뜁니다. */
  const next = useCallback(() => {
    setPos((p) => (!single && p === 1 ? 3 : Math.min(3, p + 1)));
  }, [single]);

  const prev = useCallback(() => {
    setPos((p) => (!single && p === 3 ? 1 : Math.max(0, p - 1)));
  }, [single]);

  useEffect(() => {
    if (!keyboard) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)
        return;
      /* 카드가 왼쪽으로 넘어가므로 다음 장은 → 입니다. */
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [keyboard, next, prev]);

  if (!found) return null;

  const view = pos === 0 ? 1 : pos === 3 ? 4 : 2;
  /* 넓은 화면의 펼침에서도 focus 를 붙여 둡니다 — 평면 폴백이 어느 면을
     띄울지 알아야 하고, 좁은 화면으로 바뀌는 순간에도 자리가 유지됩니다. */
  const focus = pos === 1 ? 2 : pos === 2 ? 3 : undefined;

  return (
    <div className="oc oc-stage" style={designStyle(found)}>
      <div
        className="fc"
        data-live="1"
        data-view={view}
        data-mode={single ? "single" : "dual"}
        data-focus={focus}
        data-flat={flat ? "1" : undefined}
      >
        <div className="fc-model">
          {/* 1 앞표지 — 누르면 열립니다 */}
          <div className="fc-page fc-page-1">
            <div className="fc-face">
              <button
                type="button"
                className="absolute inset-0 z-10 block h-full w-full cursor-pointer"
                onClick={next}
                aria-label="초대장 열기"
                aria-expanded={pos > 0}
                tabIndex={pos === 0 ? 0 : -1}
              />
              <Cover design={found} priority />
            </div>
          </div>

          {/* 2 속 왼쪽 — 인사말 */}
          <div className="fc-page fc-page-2">
            <div className="fc-face">
              <InsideLeft data={data} />
            </div>
          </div>

          {/* 3 속 오른쪽 — 언제, 어디로 */}
          <div className="fc-page fc-page-3">
            <div className="fc-face">
              <InsideRight data={data} daysLeft={daysLeft} />
            </div>
          </div>

          {/* 4 뒤표지 */}
          <div className="fc-page fc-page-4">
            <div className="fc-face">
              <Back design={found} data={data} />
            </div>
          </div>

          <span className="fc-shadow" aria-hidden />
        </div>

        <button
          type="button"
          className="fc-nav fc-nav-prev"
          onClick={prev}
          disabled={pos === 0}
          aria-label="앞 면"
        >
          <span aria-hidden>‹</span>
        </button>
        <button
          type="button"
          className="fc-nav fc-nav-next"
          onClick={next}
          disabled={pos === 3}
          aria-label="다음 면"
        >
          <span aria-hidden>›</span>
        </button>
      </div>

      <p className="fc-hint" aria-hidden>
        표지를 눌러 보세요
      </p>

      {actions && <CardActions data={data} />}

      <p className="sr-only" aria-live="polite">
        {STOPS[pos]}
      </p>
    </div>
  );
}
