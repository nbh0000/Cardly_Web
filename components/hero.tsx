import Link from "next/link";
import { SampleLinks } from "@/components/publish/sample-links";
import { asset } from "@/lib/asset";
import { InvitationView } from "@/components/invitation/invitation-view";
import { ClosedCard } from "@/components/occasion/fold";
import { artThumb, CARD_TEMPLATES } from "@/lib/studio/card-templates";
import { createDefaultData, getTemplate, TEMPLATES } from "@/lib/invitation";
import { DESIGNS, findDesign } from "@/lib/occasion/designs";
import { RESUME_TEMPLATES } from "@/lib/studio/resume-templates";

/* 카드 안의 미리보기는 실제 템플릿 렌더러를 그대로 씁니다.
   따로 그린 그림이 아니라서 템플릿이 바뀌면 홈도 같이 바뀝니다. */
const RESUME_PICKS = ["banner-navy", "sidebar-forest", "rule-ink"];
/* 앞장은 시그니처 배경 한 장 — 홈에서도 가장 새 템플릿이 보입니다. */
const CARD_PICKS = ["sig-1", "bar-ivory", "rules-sand"];

/* 세 미리보기는 같은 문법을 씁니다.
   — 앞의 한 장을 크게 보여 주고, 뒤의 두 장은 가장자리만 살짝 내밀어
     "종류가 더 있다" 는 것만 말합니다.
   — 세 카드의 그림 면적을 비슷하게 맞춰 시각적 무게를 통일합니다.
   예전처럼 작은 조각 세 개를 나란히 두면 무엇을 만드는 도구인지
   한눈에 읽히지 않아, 앞장 하나를 확실히 크게 세웠습니다. */

/** 뒤에 깔리는 종이 — inset-0 이라 앞장과 크기·비율이 저절로 같습니다. */
function Behind({
  offset,
}: {
  offset: { x: number; y: number; r: number }[];
}) {
  return (
    <>
      {offset.map((o, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute inset-0 rounded-[3px] border border-line bg-white shadow-soft"
          style={{
            transform: `translate(${o.x}px, ${o.y}px) rotate(${o.r}deg)`,
          }}
        />
      ))}
    </>
  );
}

function ResumePreview() {
  const t = RESUME_TEMPLATES.find((x) => x.id === RESUME_PICKS[0]);
  if (!t) return null;
  return (
    <div className="relative h-[10.5rem] aspect-[210/297]">
      <Behind
        offset={[
          { x: 14, y: 10, r: 3 },
          { x: 7, y: 5, r: 1.5 },
        ]}
      />
      <span
        className="rthumb absolute inset-0 shadow-card"
        data-l={t.layout}
        style={
          {
            "--ac": t.accent,
            "--sf": t.soft,
            "--pp": t.paper,
          } as React.CSSProperties
        }
      >
        <i />
        <em />
      </span>
    </div>
  );
}

function CardPreview() {
  const t = CARD_TEMPLATES.find((x) => x.id === CARD_PICKS[0]);
  if (!t) return null;
  return (
    <div className="relative aspect-[90/50] w-[12.5rem]">
      <Behind
        offset={[
          { x: 12, y: 14, r: 3.5 },
          { x: 6, y: 7, r: 1.75 },
        ]}
      />
      <span
        className="cthumb absolute inset-0 shadow-card"
        data-deco={t.deco}
        data-align={t.placement.align}
        style={
          {
            "--ac": t.accent,
            "--bg": t.bg,
            "--tx": t.text,
            backgroundImage: t.art
              ? `url(${asset("/" + artThumb(t.art))})`
              : undefined,
            backgroundPosition: t.art?.position,
            backgroundSize: t.art?.size,
          } as React.CSSProperties
        }
      >
        <em />
        <b />
        <i />
      </span>
    </div>
  );
}

function InvitationPreview() {
  const template = getTemplate("noir");
  if (!template) return null;
  const data = { ...createDefaultData("noir"), fontScale: "sm" as const };
  return (
    <div className="relative aspect-[3/4] h-[10.5rem]">
      <Behind
        offset={[
          { x: 13, y: 9, r: 3 },
          { x: 6.5, y: 4.5, r: 1.5 },
        ]}
      />
      <div className="absolute inset-0 overflow-hidden rounded-[3px] bg-white p-1 shadow-card ring-1 ring-line">
        <div className="relative h-full overflow-hidden rounded-[2px]">
          {/* 축소 기준점이 상단 중앙이면 오른쪽으로 밀려 잘립니다. */}
          <div className="absolute inset-0 origin-top-left scale-[0.62] [height:161%] [width:161%]">
            <InvitationView template={template} data={data} coverOnly />
          </div>
        </div>
      </div>
    </div>
  );
}

/* 초대장은 다른 셋과 다르게 «접힌 물건» 이라 겹쳐 놓은 종이를 깔지
   않습니다. 카드 자체가 이미 두께를 가지고 서 있습니다. */
function InvitationCardPreview() {
  const design = findDesign("wedding-floral-arch");
  if (!design) return null;
  return (
    <div className="w-[9.5rem]">
      <ClosedCard design={design} />
    </div>
  );
}

/* 앞에 서는 둘 — 링크를 만들어 보내는 물건입니다. 값을 받는 곳도 여기고,
   하객 수백 명이 보는 것도 여기입니다. */
const INVITES = [
  {
    href: "/templates",
    eyebrow: "Wedding",
    title: "모바일 청첩장",
    body: "사진과 인사말을 넣고 링크를 발행하면, 하객은 그 주소만 눌러 봅니다. 참석 여부와 방명록이 그대로 모입니다.",
    meta: `템플릿 ${TEMPLATES.length}종 · 링크 발행 · 참석 집계`,
    badge: "무료로 발행",
    preview: <InvitationPreview />,
  },
  {
    href: "/invitation-card",
    eyebrow: "Invitation",
    title: "초대장",
    body: "받는 사람이 표지를 넘겨 여는 접힌 카드입니다. 돌잔치·생일·집들이·개업·파티·연말.",
    meta: `디자인 ${DESIGNS.length}종 · 링크 발행 · 참석 집계`,
    badge: "무료로 발행",
    preview: <InvitationCardPreview />,
  },
];

/* 뒤에 서는 둘 — 브라우저 안에서 끝나는 서류입니다. 계정도 값도 없습니다. */
const DOCS = [
  {
    href: "/resume",
    eyebrow: "Resume",
    title: "이력서",
    body: "기간이 오른쪽에 정렬되고 성과가 불릿으로 붙는, 실제 채용 서류 조판 그대로.",
    meta: `템플릿 ${RESUME_TEMPLATES.length}종 · PDF·Word 저장`,
    badge: "무료",
    preview: <ResumePreview />,
  },
  {
    href: "/business-card",
    eyebrow: "Business Card",
    title: "명함",
    body: "90 × 50 mm 실제 크기로 편집하고, 재단 안전선을 보면서 인쇄용으로 저장합니다.",
    meta: `템플릿 ${CARD_TEMPLATES.length}종 · 양면 · 고해상도 PNG`,
    badge: "무료",
    preview: <CardPreview />,
  },
];

/** 도구 한 칸. 앞의 둘은 크게, 뒤의 둘은 작게 그립니다. */
function ToolCard({
  tool,
  big,
}: {
  tool: (typeof INVITES)[number];
  big?: boolean;
}) {
  return (
    <Link
      href={tool.href}
      className="oc-fold group flex flex-col rounded-lg border border-line bg-white p-6 transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1.5 hover:border-rose hover:shadow-lift"
    >
      <div className="flex items-center justify-between">
        <span className="eyebrow">{tool.eyebrow}</span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[0.6875rem] tracking-[0.1em] ${
            tool.badge.startsWith("무료")
              ? "bg-rose-veil text-rose-deep"
              : "bg-sand text-ink-soft"
          }`}
        >
          {tool.badge}
        </span>
      </div>

      {/* 뒤에 깔린 종이가 오른쪽·아래로 밀려 나므로,
          묶음 전체를 그만큼 되돌려 광학적으로 가운데 맞춥니다. */}
      <div
        className={`mt-6 grid place-items-center overflow-hidden rounded-md bg-cream/70 px-5 ${
          big ? "h-64" : "h-52"
        }`}
      >
        <div className="translate-x-[-7px] translate-y-[-5px]">{tool.preview}</div>
      </div>

      <h2 className={`mt-6 font-serif text-ink ${big ? "text-h1" : "text-h2"}`}>
        {tool.title}
      </h2>
      <p className="mt-2.5 text-caption text-ink-soft">{tool.body}</p>
      <p className="mt-auto pt-5 text-[0.6875rem] text-muted">{tool.meta}</p>
      <span className="mt-3 text-caption text-rose-deep">
        만들기 시작
        <span
          aria-hidden
          className="ml-1 inline-block transition-transform group-hover:translate-x-1"
        >
          →
        </span>
      </span>
    </Link>
  );
}

export function Hero() {
  return (
    <>
      {/* ── 앞자리 : 링크로 보내는 것 ──────────────────────────

          홈은 물건이어야 하고, 물건에 대한 설명이어서는 안 됩니다. 그래서
          머리글은 한 줄로 끝내고 곧바로 카드를 세웁니다. 다만 이 사이트가
          이제 «초대장을 발행하는 곳» 이라는 사실만은 첫 줄에 적습니다 —
          이력서와 명함까지 네 장이 나란히 있으면 무엇을 파는 곳인지
          읽히지 않습니다. */}
      <section className="relative border-b border-line-soft bg-rose-veil/45 pt-28 pb-section md:pt-32">
        <div className="shell">
          <header className="max-w-narrow">
            <h1 className="font-serif text-h1 text-ink">모든 순간의 초대장</h1>
            <p className="mt-4 text-body text-ink-soft">
              결혼, 돌잔치, 생일, 집들이. 링크 하나로 보내고 참석 여부까지
              받습니다. 만들어 보는 것은 값이 없고, 발행도 무료로 됩니다.
            </p>
          </header>

          <div className="rise mt-block grid gap-5 md:grid-cols-2">
            {INVITES.map((tool) => (
              <ToolCard key={tool.href} tool={tool} big />
            ))}
          </div>
        </div>
      </section>

      {/* ── 샘플 : 하객이 받는 화면 그대로 ── */}
      <section className="border-b border-line-soft py-section">
        <SampleLinks />
      </section>

      {/* ── 뒷자리 : 브라우저 안에서 끝나는 서류 ── */}
      <section className="py-section">
        <div className="shell">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2 className="font-serif text-h2 text-ink">이력서와 명함</h2>
            <p className="text-caption text-muted">
              로그인도 결제도 없이, 브라우저 안에서 끝납니다.
            </p>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {DOCS.map((tool) => (
              <ToolCard key={tool.href} tool={tool} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
