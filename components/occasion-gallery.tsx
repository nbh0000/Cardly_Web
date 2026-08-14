"use client";

import Link from "next/link";
import { useState } from "react";
import { InvitationView } from "@/components/invitation/invitation-view";
import { TEMPLATES } from "@/lib/invitation";
import { createOccasionData, OCCASIONS, type OccasionKind } from "@/lib/occasion";

/**
 * 초대장 고르기.
 *
 * 행사를 먼저 고르고, 그 행사의 기본 문구가 얹힌 템플릿을 봅니다.
 * 썸네일은 청첩장 갤러리와 같이 실제 렌더러의 커버를 축소해 그리므로
 * 여기서 본 화면이 편집기에서 그대로 열립니다.
 */
export function OccasionGallery() {
  const [kind, setKind] = useState<OccasionKind>("party");
  const spec = OCCASIONS.find((o) => o.id === kind)!;

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {OCCASIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setKind(o.id)}
            aria-pressed={o.id === kind}
            className={`rounded-full border px-4 py-2 text-caption whitespace-nowrap transition-colors ${
              o.id === kind
                ? "border-rose-deep bg-rose-deep text-white"
                : "border-line bg-white text-ink-soft hover:border-rose"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-caption text-muted">
        {spec.label} 초대장 · 템플릿을 누르면 문구가 채워진 채로 편집기가
        열립니다
      </p>

      <div className="mt-block grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
        {TEMPLATES.slice(0, 12).map((template) => {
          const data = {
            ...createOccasionData(template.id, kind),
            fontScale: "sm" as const,
          };
          return (
            <article key={template.id} className="group">
              <Link
                href={`/editor/${template.id}/?occasion=${kind}`}
                className="block"
              >
                <div className="relative aspect-3/4 overflow-hidden rounded-lg bg-white shadow-soft ring-1 ring-line transition-[transform,box-shadow] duration-400 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-1.5 group-hover:shadow-lift">
                  {/* 청첩장 카드와 같은 축소 방식 — 기준점이 top-left 여야
                      오른쪽으로 밀려 잘리지 않습니다. */}
                  <div className="absolute inset-0 origin-top-left scale-[0.62] [height:161%] [width:161%]">
                    <InvitationView template={template} data={data} coverOnly />
                  </div>
                </div>
                <div className="mt-3.5 flex items-baseline justify-between gap-2">
                  <span className="font-serif text-[0.9375rem] text-ink">
                    {template.name}
                  </span>
                  <span className="text-[0.75rem] text-muted">
                    {spec.label}
                  </span>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
