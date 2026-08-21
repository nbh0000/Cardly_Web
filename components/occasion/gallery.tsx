"use client";

import { useState } from "react";
import { OCCASIONS } from "@/lib/occasion/occasions";
import type { OccasionId } from "@/lib/occasion/types";

/* 목록 위의 갈래 고르개.

   카드 스무 장은 서버에서 그려져 children 으로 들어옵니다. 이 조각이
   하는 일은 «어떤 갈래를 보고 있는지» 를 목록에 적어 두는 것뿐이고,
   숨기는 일은 CSS 가 합니다(app/occasion.css 의 .oc-grid[data-filter]).

   카드를 이 컴포넌트 안에서 그리면 스무 장의 조판이 전부 자바스크립트로
   실려 나갑니다. children 으로 받으면 서버에서 그린 HTML 이 그대로
   남아, 검색엔진도 스무 장을 그대로 읽습니다. */

type Filter = OccasionId | "all";

export function Gallery({
  children,
  count,
}: {
  children: React.ReactNode;
  /** 갈래별 장수 — 칩에 적습니다 */
  count: Record<string, number>;
}) {
  const [active, setActive] = useState<Filter>("all");

  const chips: { id: Filter; label: string }[] = [
    { id: "all", label: "전체" },
    ...OCCASIONS.map((o) => ({ id: o.id as Filter, label: o.label })),
  ];

  return (
    <>
      <div className="-mx-gutter overflow-x-auto px-gutter [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div
          role="tablist"
          aria-label="초대장 갈래"
          className="mx-auto flex w-max gap-2 md:justify-center"
        >
          {chips.map((c) => {
            const on = c.id === active;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setActive(c.id)}
                className={`rounded-full border px-4 py-2 text-caption whitespace-nowrap transition-colors duration-200 ${
                  on
                    ? "border-rose-deep bg-rose-deep text-white"
                    : "border-line bg-transparent text-ink-soft hover:border-rose hover:text-rose-deep"
                }`}
              >
                {c.label}
                <span className="ml-1.5 text-[0.6875rem] opacity-60">
                  {c.id === "all"
                    ? Object.values(count).reduce((a, b) => a + b, 0)
                    : (count[c.id] ?? 0)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <ul
        className="oc-grid mt-block grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        data-filter={active}
      >
        {children}
      </ul>
    </>
  );
}
