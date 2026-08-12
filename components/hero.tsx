import Link from "next/link";
import { InvitationView } from "@/components/invitation/invitation-view";
import { CARD_TEMPLATES } from "@/lib/studio/card-templates";
import { createDefaultData, getTemplate } from "@/lib/invitation";
import { RESUME_TEMPLATES } from "@/lib/studio/resume-templates";

/* 카드 안의 미리보기는 실제 템플릿 렌더러를 그대로 씁니다.
   따로 그린 그림이 아니라서 템플릿이 바뀌면 홈도 같이 바뀝니다. */
const RESUME_PICKS = ["banner-navy", "sidebar-forest", "rule-ink"];
const CARD_PICKS = ["band-charcoal", "bar-ivory", "rules-sand"];

function ResumePreview() {
  return (
    <div className="flex w-full items-end justify-center gap-2.5">
      {RESUME_PICKS.map((id, i) => {
        const t = RESUME_TEMPLATES.find((x) => x.id === id);
        if (!t) return null;
        return (
          <span
            key={id}
            className="rthumb w-[30%] shadow-card"
            data-l={t.layout}
            style={
              {
                "--ac": t.accent,
                "--sf": t.soft,
                "--pp": t.paper,
                transform: i === 1 ? "scale(1.14)" : undefined,
                zIndex: i === 1 ? 1 : 0,
              } as React.CSSProperties
            }
          >
            <i />
            <em />
          </span>
        );
      })}
    </div>
  );
}

function CardPreview() {
  return (
    // 명함은 실제 비율이 납작해서 나란히 두면 자리를 많이 먹습니다.
    // 살짝 겹쳐 쌓아 두면 세 장이 한 묶음처럼 읽힙니다.
    <div className="flex w-full flex-col items-center">
      {CARD_PICKS.map((id, i) => {
        const t = CARD_TEMPLATES.find((x) => x.id === id);
        if (!t) return null;
        return (
          <span
            key={id}
            className="cthumb w-[56%] shadow-card"
            data-deco={t.deco}
            data-align={t.placement.align}
            style={
              {
                "--ac": t.accent,
                "--bg": t.bg,
                "--tx": t.text,
                marginTop: i === 0 ? 0 : "-20%",
                transform: `rotate(${(i - 1) * 2.2}deg)`,
                zIndex: i,
              } as React.CSSProperties
            }
          >
            <em />
            <b />
            <i />
          </span>
        );
      })}
    </div>
  );
}

function InvitationPreview() {
  const template = getTemplate("noir");
  if (!template) return null;
  const data = { ...createDefaultData("noir"), fontScale: "sm" as const };
  return (
    <div className="flex w-full justify-center">
      <div className="w-[45%] overflow-hidden rounded-lg bg-white p-1.5 shadow-card ring-1 ring-line">
        <div className="relative aspect-3/4 overflow-hidden rounded-md">
          {/* 축소 기준점이 상단 중앙이면 오른쪽으로 밀려 잘립니다. */}
          <div className="absolute inset-0 origin-top-left scale-[0.62] [height:161%] [width:161%]">
            <InvitationView template={template} data={data} coverOnly />
          </div>
        </div>
      </div>
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
    body: "사진과 인사말을 넣으면 결과가 바로 보이고, 링크 하나로 카카오톡에 보냅니다.",
    meta: "참석 응답 · 마음 전하는 곳 · 링크 공유",
    badge: "유료",
    preview: <InvitationPreview />,
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-section-sm md:pt-36">
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
          <h1 className="mt-6 font-serif text-display text-ink">
            필요한 서류와 카드를,
            <br />
            <em className="not-italic text-rose-deep">브라우저에서 바로</em>
          </h1>
          <p className="mx-auto mt-7 max-w-narrow text-body-lg text-ink-soft">
            이력서와 명함은 회원가입도 결제도 없이 무료입니다. 입력한 내용은
            서버로 보내지 않고 이 브라우저 안에서만 처리됩니다.
          </p>
        </div>

        <div className="rise mt-block grid gap-5 md:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col rounded-lg border border-line bg-white p-6 transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1.5 hover:border-rose hover:shadow-lift"
            >
              <div className="flex items-center justify-between">
                <span className="eyebrow">{tool.eyebrow}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[0.625rem] tracking-[0.1em] ${
                    tool.badge === "무료"
                      ? "bg-rose-veil text-rose-deep"
                      : "bg-sand text-ink-soft"
                  }`}
                >
                  {tool.badge}
                </span>
              </div>

              <div className="mt-6 grid h-48 place-items-center overflow-hidden rounded-md bg-cream/70 px-5">
                {tool.preview}
              </div>

              <h2 className="mt-6 font-serif text-h2 text-ink">{tool.title}</h2>
              <p className="mt-2.5 text-caption text-ink-soft">{tool.body}</p>
              <p className="mt-auto pt-5 text-[0.6875rem] text-hint">
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
