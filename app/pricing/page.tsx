import type { Metadata } from "next";
import Link from "next/link";
import { BackendNotice } from "@/components/publish/backend-notice";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  FREE_LINK_DAYS,
  formatPrice,
  OCCASION_PLANS,
  PAID_GRACE_DAYS,
  PRICES,
  WEDDING_PLANS,
  type PlanSpec,
} from "@/lib/plan";

export const metadata: Metadata = {
  title: "요금 안내",
  description: `모바일 청첩장 ${formatPrice(PRICES.wedding)}, 초대장 ${formatPrice(
    PRICES.occasion,
  )}. 하나에 한 번만 결제하는 방식이고 구독이 아닙니다. 무료로도 ${FREE_LINK_DAYS}일짜리 링크를 바로 발행할 수 있습니다.`,
  alternates: { canonical: "/pricing/" },
};

const GROUPS: {
  kind: "wedding" | "occasion";
  title: string;
  blurb: string;
  href: string;
  plans: PlanSpec[];
}[] = [
  {
    kind: "wedding",
    title: "모바일 청첩장",
    blurb:
      "예식 몇 달 전부터 돌리고, 예식이 끝난 뒤에도 사진과 방명록이 남아 있어야 하는 물건입니다.",
    href: "/templates",
    plans: WEDDING_PLANS,
  },
  {
    kind: "occasion",
    title: "초대장",
    blurb:
      "돌잔치·생일·집들이·개업·모임. 며칠 안에 끝나는 카드 한 장이라 값도 그만큼입니다.",
    href: "/invitation-card",
    plans: OCCASION_PLANS,
  },
];

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-28 pb-section md:pt-36">
        <div className="shell">
          <header className="mx-auto max-w-narrow text-center">
            <span className="eyebrow eyebrow-center">Pricing</span>
            <h1 className="mt-5 font-serif text-h1 text-ink">요금 안내</h1>
            <p className="mt-5 text-body text-ink-soft">
              만들어 보는 것은 값이 없습니다. 링크를 발행하는 것도 무료로
              됩니다 — {FREE_LINK_DAYS}일 동안 열려 있습니다. 결제는 그 기한을
              늘리고 하단 표기를 지울 때 한 번만 합니다.
            </p>
            <p className="mt-3 text-caption text-muted">
              이력서와 명함은 전부 무료입니다. 로그인도 필요 없습니다.
            </p>
          </header>

          <BackendNotice />

          {GROUPS.map((group) => (
            <section key={group.kind} className="mt-section">
              <div className="mx-auto max-w-narrow text-center">
                <h2 className="font-serif text-h2 text-ink">{group.title}</h2>
                <p className="mt-3 text-caption text-ink-soft">{group.blurb}</p>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2 md:gap-7">
                {group.plans.map((plan) => {
                  const premium = plan.id === "premium";
                  return (
                    <div
                      key={plan.id}
                      className={`flex flex-col rounded-lg p-7 sm:p-8 ${
                        premium
                          ? "bg-ink text-ivory shadow-lift"
                          : "border border-line bg-white shadow-soft"
                      }`}
                    >
                      <div className="flex h-7 items-center justify-between gap-3">
                        <h3
                          className={`font-sans text-eyebrow uppercase ${
                            premium ? "text-ivory/75" : "text-rose-deep"
                          }`}
                        >
                          {plan.name}
                        </h3>
                        {premium && (
                          <span className="rounded-full bg-ivory/15 px-2.5 py-1 text-[0.6875rem] tracking-[0.1em] text-ivory">
                            한 번만 결제
                          </span>
                        )}
                      </div>

                      <p
                        className={`mt-4 font-serif text-h1 ${
                          premium ? "text-ivory" : "text-ink"
                        }`}
                      >
                        {plan.price}
                      </p>
                      <p
                        className={`mt-1.5 text-[0.75rem] ${
                          premium ? "text-ivory/60" : "text-muted"
                        }`}
                      >
                        {premium
                          ? `${group.title} 하나당 한 번 · 구독이 아닙니다`
                          : "카드 등록도, 결제 정보 입력도 없습니다"}
                      </p>

                      <p
                        className={`mt-5 text-caption leading-relaxed ${
                          premium ? "text-ivory/70" : "text-ink-soft"
                        }`}
                      >
                        {plan.tagline}
                      </p>

                      <ul className="mt-6 mb-7 grid gap-2.5">
                        {plan.features.map((f) => (
                          <li
                            key={f}
                            className={`flex gap-2.5 text-[0.875rem] leading-relaxed ${
                              premium ? "text-ivory/90" : "text-ink-soft"
                            }`}
                          >
                            <span
                              aria-hidden
                              className={premium ? "text-ivory/60" : "text-rose-deep"}
                            >
                              ✓
                            </span>
                            {f}
                          </li>
                        ))}
                      </ul>

                      <Link
                        href={group.href}
                        className={`mt-auto block rounded-full py-3 text-center text-[0.875rem] transition-colors ${
                          premium
                            ? "bg-ivory text-ink hover:bg-white"
                            : "border border-line text-ink hover:border-rose"
                        }`}
                      >
                        {premium ? "만들고 결제하기" : "무료로 시작하기"}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          <section className="mx-auto mt-section max-w-narrow">
            <h2 className="font-serif text-h3 text-ink">자주 묻는 것</h2>
            <dl className="mt-6 grid gap-6">
              {[
                {
                  q: "결제하지 않아도 하객에게 보낼 수 있나요?",
                  a: `보낼 수 있습니다. 로그인해서 «링크 발행» 을 누르면 그 자리에서 주소가 만들어지고, ${FREE_LINK_DAYS}일 동안 열려 있습니다. 하단에 «Cardly로 만들었어요» 표기가 붙고, 참석 여부와 방명록은 잠깁니다.`,
                },
                {
                  q: "결제하면 무엇이 달라지나요?",
                  a: `링크가 예식일(초대장은 행사일)에서 ${PAID_GRACE_DAYS}일 뒤까지 열려 있고, 하단 표기가 사라집니다. 참석 여부 집계와 방명록이 열리고, 청첩장은 갤러리 사진 장수 제한도 없어집니다.`,
                },
                {
                  q: "왜 무료 링크는 기한이 있나요?",
                  a: `링크가 살아 있는 동안은 사진과 글을 저희가 보관합니다. 그 비용이 무한정 쌓이지 않으려면 어딘가에서 끊어야 합니다. 다만 «보내 보는 것» 까지는 값 없이 되어야 한다고 생각해서, 막는 대신 ${FREE_LINK_DAYS}일이라는 기한을 두었습니다.`,
                },
                {
                  q: "하객도 가입해야 하나요?",
                  a: "아닙니다. 링크를 받은 사람은 아무것도 하지 않고 바로 봅니다. 참석 여부를 남길 때도 이름만 적으면 됩니다. 계정은 만드는 사람에게만 필요합니다.",
                },
                {
                  q: "기한이 지나면 어떻게 되나요?",
                  a: "링크가 «기간이 지나 닫혔어요» 안내로 바뀝니다. 내용은 내 카드함에 그대로 남아 있어서, 다시 결제하거나 다시 발행하면 같은 주소로 열립니다.",
                },
                {
                  q: "환불되나요?",
                  a: "결제 후 7일 안에, 링크를 하객에게 보내기 전이라면 전액 환불해 드립니다. help@cardly.kr 로 주문번호와 함께 알려 주세요. 이미 링크를 돌린 뒤에는 제공이 끝난 것으로 봅니다.",
                },
                {
                  q: "이력서와 명함도 나중에 유료가 되나요?",
                  a: "아닙니다. 이력서와 명함은 브라우저 안에서 끝나 서버 비용이 들지 않습니다. 계속 무료로 둘 생각입니다.",
                },
              ].map((item) => (
                <div key={item.q}>
                  <dt className="text-[0.9375rem] text-ink">{item.q}</dt>
                  <dd className="mt-2 text-body text-ink-soft">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
