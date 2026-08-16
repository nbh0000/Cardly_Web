"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CardBook } from "@/components/card/card-book";
import { CardThumb } from "@/components/card/card-thumb";
import { designsFor, getDesign, OCCASIONS } from "@/lib/card/designs";
import { createDoc } from "@/lib/card/doc";
import type { CardDesign, OccasionId } from "@/lib/card/types";

/* ============================================================
   초대장 고르기

   cardly.net 의 카드 목록과 같은 흐름입니다.
     행사를 고른다 → 카드들이 접힌 채로 늘어선다 → 하나를 누르면
     그 카드가 화면 가운데서 펼쳐지고, 거기서 만들기로 넘어갑니다.

   카드를 누르면 다른 페이지로 보내지 않고 그 자리에서 펼칩니다.
   고르는 중에는 목록을 떠나지 않는 것이 맞습니다 — 마음에 안 들면
   닫고 옆 카드를 보면 되니까요.
   ============================================================ */

export function CardGallery() {
  const [occasion, setOccasion] = useState<OccasionId>("birthday");
  const [openId, setOpenId] = useState<string | null>(null);

  const spec = OCCASIONS.find((o) => o.id === occasion)!;
  const list = useMemo(() => designsFor(occasion), [occasion]);
  const open = openId ? getDesign(openId) : undefined;

  const close = useCallback(() => setOpenId(null), []);

  return (
    <div>
      {/* ── 행사 고르기 ── */}
      <div className="-mx-gutter overflow-x-auto px-gutter [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div
          role="tablist"
          aria-label="행사 종류"
          className="mx-auto flex w-max gap-2 md:justify-center"
        >
          {OCCASIONS.map((o) => {
            const on = o.id === occasion;
            return (
              <button
                key={o.id}
                role="tab"
                aria-selected={on}
                onClick={() => {
                  setOccasion(o.id);
                  setOpenId(null);
                }}
                className={`rounded-full border px-4 py-2 text-caption whitespace-nowrap transition-colors ${
                  on
                    ? "border-rose-deep bg-rose-deep text-white"
                    : "border-line bg-white text-ink-soft hover:border-rose"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-6 text-center text-caption text-muted">
        {spec.blurb} · {list.length}장
      </p>

      {/* ── 카드들 ── */}
      <ul className="mt-block grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
        {list.map((design) => (
          <li key={design.id} className="group">
            <button
              type="button"
              onClick={() => setOpenId(design.id)}
              className="w-full text-left"
              aria-haspopup="dialog"
            >
              <CardThumb design={design} doc={createDoc(design.id)} />
              <span className="mt-5 flex items-baseline justify-between gap-2">
                <span className="font-serif text-[0.9375rem] text-ink">
                  {design.name}
                </span>
                {design.badge && (
                  <span className="text-[0.6875rem] tracking-[0.14em] text-rose-deep">
                    {design.badge}
                  </span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {open && <CardModal design={open} onClose={close} />}
    </div>
  );
}

/* ------------------------------------------------------------
   카드 하나를 집어 든 화면
   ------------------------------------------------------------ */

function CardModal({
  design,
  onClose,
}: {
  design: CardDesign;
  onClose: () => void;
}) {
  const doc = useMemo(() => createDoc(design.id), [design.id]);
  const occasion = OCCASIONS.find((o) => o.id === design.occasion)!;

  /* 창이 열려 있는 동안 뒤쪽이 스크롤되면 카드가 화면 밖으로
     밀려납니다. Esc 로도 닫히게 해 둡니다. */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="cm-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`${design.name} 카드`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="cm-panel">
        <div className="grid gap-8 p-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-10 md:p-10">
          {/* 카드 — 열자마자 펴집니다 */}
          <CardBook design={design} doc={doc} autoOpen />

          <div className="flex flex-col">
            <span className="eyebrow">{occasion.label}</span>
            <h2 className="mt-3 font-serif text-h2 text-ink">{design.name}</h2>
            <p className="mt-3 text-caption text-ink-soft">{occasion.blurb}</p>

            <div className="mt-7 grid gap-2">
              <Link
                href={`/invitation-card/write/${design.id}/`}
                className="btn btn-primary"
              >
                이 카드에 쓰기
              </Link>
              <Link
                href={`/invitation-card/${design.id}/`}
                className="btn btn-ghost bg-white"
              >
                카드 자세히 보기
              </Link>
            </div>

            <dl className="mt-8 grid gap-3 border-t border-line pt-6 text-caption">
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-muted">면</dt>
                <dd className="text-ink-soft">
                  앞면 · 안쪽 두 면 · 뒷면 (접힌 카드 한 장)
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-muted">쓰는 곳</dt>
                <dd className="text-ink-soft">
                  안쪽 오른쪽 면에 손글씨로 씁니다
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-muted">보내기</dt>
                <dd className="text-ink-soft">
                  링크 하나. 받는 분 화면에서 카드가 펴집니다
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-muted">값</dt>
                <dd className="text-ink-soft">
                  만들고 보내는 것까지 값이 들지 않습니다
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={onClose}
              className="mt-8 self-start text-caption text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
