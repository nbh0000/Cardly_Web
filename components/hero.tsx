import Link from "next/link";
import { InvitationView } from "@/components/invitation/invitation-view";
import { ClosedCard } from "@/components/occasion/fold";
import { CARD_TEMPLATES } from "@/lib/studio/card-templates";
import { createDefaultData, getTemplate, TEMPLATES } from "@/lib/invitation";
import { DESIGNS, getDesign } from "@/lib/occasion/designs";
import { RESUME_TEMPLATES } from "@/lib/studio/resume-templates";

/* 카드 안의 미리보기는 실제 템플릿 렌더러를 그대로 씁니다.
   따로 그린 그림이 아니라서 템플릿이 바뀌면 홈도 같이 바뀝니다. */
const RESUME_PICKS = ["banner-navy", "sidebar-forest", "rule-ink"];
const CARD_PICKS = ["band-charcoal", "bar-ivory", "rules-sand"];

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
  const design = getDesign("numeral-ink");
  return (
    <div className="w-[9.5rem]">
      <ClosedCard design={design} />
    </div>
  );
}

const TOOLS = [
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
  {
    href: "/templates",
    eyebrow: "Wedding",
    title: "모바일 청첩장",
    // 예전에는 "링크 하나로 카카오톡에 보냅니다" 라고 적혀 있었지만
    // 발행이 아직 열리지 않아 지킬 수 없는 약속이었습니다.
    body: "사진과 인사말을 넣으면 결과가 바로 보입니다. 지금은 만들고 미리 보는 것까지 됩니다.",
    meta: `템플릿 ${TEMPLATES.length}종 · 링크 공유는 준비 중`,
    badge: "미리 만들기",
    preview: <InvitationPreview />,
  },
  {
    href: "/invitation-card",
    eyebrow: "Invitation",
    title: "초대장",
    body: "받는 사람이 표지를 넘겨 여는 접힌 카드입니다. 생일·돌잔치·집들이·개업·파티·기념일.",
    meta: `디자인 ${DESIGNS.length}종 · 링크로 바로 보내기`,
    badge: "무료",
    preview: <InvitationCardPreview />,
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-section md:pt-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70vh]"
        style={{
          background:
            "radial-gradient(70% 55% at 50% 0%, #F4EAE5 0%, rgba(244,234,229,0) 72%)",
        }}
      />

      <div className="shell">
        <div className="rise mx-auto max-w-narrow text-center">
          <span className="eyebrow eyebrow-center">Cardly</span>
          <h1 className="mt-5 font-serif text-display text-ink">
            필요한 서류와 카드를,
            <br />
            <em className="not-italic text-rose-deep">브라우저에서 바로</em>
          </h1>
          <p className="mx-auto mt-5 max-w-narrow text-body-lg text-ink-soft">
            가입도 설치도 없이 네 가지를 만듭니다. 이력서·명함·초대장은 계속
            무료이고, 입력한 내용은 이 브라우저를 벗어나지 않습니다.
          </p>
        </div>

        {/* 도구가 먼저 보여야 합니다 — 무엇을 하는 곳인지 스크롤 없이
            읽히도록 네 가지를 한 줄에 나란히 둡니다. */}
        <div className="rise mt-block grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col rounded-lg border border-line bg-white p-6 transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1.5 hover:border-rose hover:shadow-lift"
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
              <div className="mt-6 grid h-52 place-items-center overflow-hidden rounded-md bg-cream/70 px-5">
                <div className="translate-x-[-7px] translate-y-[-5px]">
                  {tool.preview}
                </div>
              </div>

              <h2 className="mt-6 font-serif text-h2 text-ink">{tool.title}</h2>
              <p className="mt-2.5 text-caption text-ink-soft">{tool.body}</p>
              <p className="mt-auto pt-5 text-[0.6875rem] text-muted">
                {tool.meta}
              </p>
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
          ))}
        </div>
      </div>
    </section>
  );
}
