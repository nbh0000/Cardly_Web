import Link from "next/link";
import { InvitationView } from "@/components/invitation/invitation-view";
import { createDefaultData, getTemplate } from "@/lib/invitation";

/* 첫 화면에서 곧바로 완성도가 보이도록 그래픽 커버 3종을 세웁니다. */
const FEATURED = ["noir", "heartbeat", "locket"];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-section-sm md:pt-40">
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
          <span className="eyebrow eyebrow-center">
            Mobile Wedding Invitation
          </span>
          <h1 className="mt-6 font-serif text-display text-ink">
            마음에 드는 템플릿을 고르고,
            <br />
            <em className="not-italic text-rose-deep">직접 편집</em>하세요.
          </h1>
          <p className="mx-auto mt-7 max-w-narrow text-body-lg text-ink-soft">
            사진과 인사말을 넣으면 편집기 안에서 결과가 바로 보입니다. 완성한
            청첩장은 링크 하나로 카카오톡에 보낼 수 있습니다.
          </p>

          <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Link href="/templates" className="btn btn-primary">
              템플릿 고르기
            </Link>
            <Link href="/editor/linen" className="btn btn-ghost">
              편집기 바로 써보기
            </Link>
          </div>

          <p className="mt-6 text-caption text-muted">
            모든 기능 무료 · 무제한 수정 · 평균 제작 시간 7분
          </p>
        </div>

        {/* 실제 템플릿 3종을 그대로 렌더링 */}
        <div className="rise mt-block flex items-end justify-center gap-3 sm:gap-5">
          {FEATURED.map((id, i) => {
            const t = getTemplate(id)!;
            const data = { ...createDefaultData(id), fontScale: "sm" as const };
            const featured = i === 1;
            return (
              <Link
                key={id}
                href={`/editor/${id}`}
                className={`group relative block shrink-0 ${
                  featured
                    ? "w-[46%] max-w-[16rem] sm:w-[30%]"
                    : "hidden w-[26%] max-w-[12rem] sm:block"
                }`}
              >
                <div
                  className={`overflow-hidden bg-white ring-1 ring-line transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-2 ${
                    featured
                      ? "rounded-phone p-2 shadow-lift"
                      : "rounded-lg p-1.5 shadow-card"
                  }`}
                >
                  <div
                    className={`relative aspect-[3/4] overflow-hidden ${featured ? "rounded-[1.5rem]" : "rounded-md"}`}
                  >
                    {/* 축소 기준점이 상단 중앙이면 오른쪽으로 밀려 잘립니다. */}
                    <div className="absolute inset-0 origin-top-left scale-[0.62] [height:161%] [width:161%]">
                      <InvitationView template={t} data={data} coverOnly />
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-center font-serif text-[0.8125rem] text-ink">
                  {t.name}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
