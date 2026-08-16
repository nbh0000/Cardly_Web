"use client";

import Link from "next/link";
import { useState } from "react";
import { FoldCard } from "@/components/invitation/fold-card";
import { InvitationView } from "@/components/invitation/invitation-view";
import {
  formatDateKo,
  formatTimeKo,
  TEMPLATES,
  type InvitationData,
  type Template,
} from "@/lib/invitation";
import { createOccasionData, OCCASIONS, type OccasionKind } from "@/lib/occasion";

/**
 * 초대장 고르기.
 *
 * 행사를 먼저 고르고, 그 행사의 기본 문구가 얹힌 템플릿을 봅니다.
 * 썸네일은 실제 렌더러의 커버를 축소해 그리므로 여기서 본 화면이
 * 편집기에서 그대로 열립니다.
 *
 * 다만 그 커버를 납작하게 눕혀 두지 않습니다. 초대장은 원래 접힌
 * 종이라서, 접힌 채로 서 있어야 무엇인지 한눈에 읽힙니다. 맨 위에는
 * 펼쳐 세운 큰 카드 하나를, 아래에는 접힌 카드들을 늘어놓습니다.
 */
export function OccasionGallery() {
  const [kind, setKind] = useState<OccasionKind>("party");
  const spec = OCCASIONS.find((o) => o.id === kind)!;

  // 맨 위 견본은 목록 첫 템플릿을 씁니다 — 아래 격자와 같은 데이터입니다.
  const heroTemplate = TEMPLATES[0]!;
  const heroData = createOccasionData(heroTemplate.id, kind);

  return (
    <div>
      {/* ── 펼쳐 세운 카드 ── */}
      <StandingCard template={heroTemplate} data={heroData} />

      <div className="mt-block flex flex-wrap justify-center gap-2">
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
        {spec.label} 초대장 · 카드에 손을 얹으면 열립니다. 누르면 문구가
        채워진 채로 편집기가 열립니다
      </p>

      <div className="mt-block grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
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
                <FoldCard inside={<InsidePrint data={data} />}>
                  {/* 161% 폭·높이를 0.62배로 줄여 앞장에 꼭 맞춥니다.
                      기준점이 top-left 여야 오른쪽으로 밀려 잘리지 않습니다. */}
                  <div className="absolute inset-0 origin-top-left scale-[0.62] [height:161%] [width:161%]">
                    <InvitationView
                      template={template}
                      data={data}
                      coverOnly
                    />
                  </div>
                </FoldCard>

                <div className="mt-5 flex items-baseline justify-between gap-2">
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

/** 카드를 열면 안쪽 면에 보이는 것 — 실제 카드처럼 행사 정보가 인쇄돼 있습니다 */
function InsidePrint({ data }: { data: InvitationData }) {
  return (
    <>
      <span className="fold-inside-script">{data.coverScript}</span>
      <span className="fold-inside-rule" aria-hidden />
      <span className="fold-inside-title">{data.eventTitle}</span>
      <span className="fold-inside-meta">
        {formatDateKo(data.date)}
        <br />
        {formatTimeKo(data.time)}
        <br />
        {data.venueName}
      </span>
    </>
  );
}

/**
 * 펼쳐 세운 카드.
 *
 * 두 면이 각각 26도씩 벌어져 서 있습니다. 접힌 선에서 두 면이 만나고,
 * 그 안쪽에 그늘이 지며, 자유단에는 종이 단면이 세워져 있습니다.
 * 오른쪽이 커버, 왼쪽이 인쇄면입니다.
 */
function StandingCard({
  template,
  data,
}: {
  template: Template;
  data: InvitationData;
}) {
  return (
    <div className="stand mx-auto w-full max-w-[560px] px-2">
      <div className="stand-stage aspect-[8/5]">
        <span className="stand-cast" aria-hidden />

        <div className="stand-leaf l">
          <div className="stand-print">
            <span className="fold-inside-script text-[clamp(1rem,3.2vw,1.55rem)]">
              {data.coverScript}
            </span>
            <span className="fold-inside-rule" aria-hidden />
            <span className="fold-inside-title text-[clamp(0.8rem,2.2vw,1.05rem)]">
              {data.eventTitle}
            </span>
            <span className="fold-inside-meta">
              {formatDateKo(data.date)}
              <br />
              {formatTimeKo(data.time)}
              <br />
              {data.venueName}
            </span>
          </div>
        </div>

        <div className="stand-leaf r">
          {/* 커버는 3:4 로 그려지므로, 반쪽 면(4:5)에 맞추려면 폭을 넘겨
              가운데를 보여 줍니다. */}
          <div className="absolute inset-0 origin-top-left scale-[0.5] [height:200%] [width:200%]">
            <InvitationView
              template={template}
              data={{ ...data, fontScale: "sm" }}
              coverOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
}
