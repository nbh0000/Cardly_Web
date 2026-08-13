"use client";

import type { ReactNode } from "react";
import { useState } from "react";

/**
 * 이력서·명함 편집기의 껍데기.
 *
 * 청첩장 편집기(components/editor/editor.tsx)와 같은 구조입니다.
 * 좌측 아이콘 레일로 편집 항목을 고르고, 가운데 패널에서 값을 채우고,
 * 우측에서 결과를 실제 크기로 봅니다. 모바일에서는 편집/미리보기를
 * 탭으로 번갈아 봅니다.
 *
 * 화면을 h-dvh 로 꽉 채우지 않고 헤더 높이만 뺀 크기로 두는 이유는,
 * 편집기 아래에 검색용 안내 본문이 이어져야 하기 때문입니다.
 */

export type StudioSection = {
  id: string;
  label: string;
  icon: ReactNode;
};

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** 레일 아이콘 — 청첩장 편집기와 같은 선 굵기로 맞췄습니다. */
export const ICON = {
  template: (
    <>
      <rect x="3.5" y="3.5" width="7" height="17" rx="1.5" {...stroke} />
      <rect x="13.5" y="3.5" width="7" height="8" rx="1.5" {...stroke} />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" {...stroke} />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="3.4" {...stroke} />
      <path d="M5 20c.8-3.8 3.5-5.6 7-5.6s6.2 1.8 7 5.6" {...stroke} />
    </>
  ),
  work: (
    <>
      <rect x="3" y="7.5" width="18" height="12" rx="2.5" {...stroke} />
      <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3 12.5h18" {...stroke} />
    </>
  ),
  project: (
    <>
      <path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h3.2l1.8 2.2h8A2 2 0 0 1 20.5 9.7v7.8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-10Z" {...stroke} />
    </>
  ),
  school: (
    <>
      <path d="M12 4 21 8.5 12 13 3 8.5 12 4Z" {...stroke} />
      <path d="M6.5 10.6v4.6c0 1.6 2.5 2.8 5.5 2.8s5.5-1.2 5.5-2.8v-4.6" {...stroke} />
    </>
  ),
  badge: (
    <>
      <circle cx="12" cy="9.5" r="5.2" {...stroke} />
      <path d="m8.6 14 -1.1 6 4.5-2.3 4.5 2.3-1.1-6" {...stroke} />
    </>
  ),
  skills: (
    <>
      <path d="M4 6.5h7M4 12h12M4 17.5h8" {...stroke} />
      <circle cx="18.5" cy="6.5" r="2" {...stroke} />
      <circle cx="15" cy="17.5" r="2" {...stroke} />
    </>
  ),
  text: (
    <>
      <path d="M5 6.5V5h14v1.5M12 5v14M9 19h6" {...stroke} />
    </>
  ),
  palette: (
    <>
      <circle cx="12" cy="12" r="8.5" {...stroke} />
      <circle cx="9" cy="9.5" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="14.8" cy="9" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="16" cy="14.5" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  shapes: (
    <>
      <rect x="3.5" y="12.5" width="8" height="8" rx="1.5" {...stroke} />
      <circle cx="16.5" cy="7.5" r="4" {...stroke} />
      <path d="M13 20.5h7.5" {...stroke} />
    </>
  ),
  save: (
    <>
      <path d="M12 3.5v11M8.2 11l3.8 3.8L15.8 11" {...stroke} />
      <path d="M4.5 16.5v2a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2" {...stroke} />
    </>
  ),
};

export function StudioShell({
  sections,
  active,
  onSelect,
  panel,
  previewTitle,
  previewNote,
  actions,
  toolbar,
  children,
}: {
  sections: StudioSection[];
  active: string;
  onSelect: (id: string) => void;
  panel: ReactNode;
  previewTitle: string;
  previewNote?: string;
  actions?: ReactNode;
  /** 미리보기 바로 위에 붙는 얇은 조작 줄 */
  toolbar?: ReactNode;
  children: ReactNode;
}) {
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  return (
    // 위쪽 사이트 헤더(4~5rem)와 페이지 제목 줄(약 5rem)을 뺀 높이.
    // 편집기가 첫 화면을 채우면서도 아래 안내 본문이 이어지게 합니다.
    // 미리보기를 한눈에 보려면 세로가 관건이라 위쪽 크롬만큼만 뺍니다.
    <section className="flex h-[calc(100dvh-8rem)] min-h-[34rem] flex-col overflow-hidden border-y border-line bg-cream md:h-[calc(100dvh-8.5rem)]">
      {/* 모바일 탭 */}
      <div className="grid shrink-0 grid-cols-2 border-b border-line bg-ivory lg:hidden">
        {(["edit", "preview"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={`py-2.5 text-[0.8125rem] transition-colors ${
              tab === t
                ? "border-b-2 border-ink text-ink"
                : "border-b-2 border-transparent text-muted"
            }`}
          >
            {t === "edit" ? "편집" : "미리보기"}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* 아이콘 레일 */}
        <div className={tab === "edit" ? "contents" : "hidden lg:contents"}>
          <nav
            aria-label="편집 항목"
            className="flex shrink-0 gap-1 overflow-x-auto border-line bg-ivory px-2 py-2 [scrollbar-width:none] lg:h-full lg:w-[4.75rem] lg:flex-col lg:gap-0.5 lg:overflow-x-visible lg:overflow-y-auto lg:border-r lg:px-1.5 lg:py-3 [&::-webkit-scrollbar]:hidden"
          >
            {sections.map((item) => {
              const on = item.id === active;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.id)}
                  aria-current={on ? "page" : undefined}
                  className={`group flex shrink-0 flex-col items-center gap-1 rounded-md px-1.5 py-2 transition-transform active:translate-y-px lg:w-full ${
                    on ? "text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-lg transition-colors duration-200 ${
                      on ? "bg-ink text-ivory" : "group-hover:bg-sand"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-[1.15rem] w-[1.15rem]"
                      aria-hidden
                    >
                      {item.icon}
                    </svg>
                  </span>
                  <span className="text-[0.625rem] leading-tight whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* 편집 패널 */}
        <div
          className={`min-h-0 min-w-0 flex-1 overflow-y-auto border-line bg-cream lg:max-w-[27rem] lg:flex-none lg:border-r ${
            tab === "edit" ? "block" : "hidden lg:block"
          }`}
        >
          <div key={active} className="px-5 py-6 lg:px-7">
            {panel}
          </div>
        </div>

        {/* 미리보기 */}
        <div
          className={`relative flex min-h-0 flex-1 flex-col overflow-hidden bg-cream ${
            tab === "preview" ? "flex" : "hidden lg:flex"
          }`}
        >
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-8">
            <p className="flex items-baseline gap-2">
              <span className="font-serif text-[0.9375rem] text-ink">
                {previewTitle}
              </span>
              {previewNote ? (
                <span className="text-[0.6875rem] text-muted">{previewNote}</span>
              ) : null}
            </p>
            {actions ? (
              <div className="flex items-center gap-2">{actions}</div>
            ) : null}
          </div>

          {toolbar ? (
            <div className="shrink-0 px-4 pb-3 lg:px-8">{toolbar}</div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-auto px-4 pb-4 lg:px-8">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

/** 패널 안의 소제목 */
export function PanelHead({
  title,
  note,
  action,
}: {
  title: string;
  note?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h2 className="font-serif text-h3 text-ink">{title}</h2>
        {note ? <p className="mt-1 text-[0.75rem] text-muted">{note}</p> : null}
      </div>
      {action}
    </div>
  );
}
