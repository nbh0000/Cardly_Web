import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  FREE_LINK_DAYS,
  formatPrice,
  PAID_GRACE_DAYS,
  PLANS,
  PREMIUM_PRICE,
} from "@/lib/plan";

export const metadata: Metadata = {
  title: "요금 안내",
  description: `청첩장 제작과 링크 공유는 무료입니다. 무료 링크는 ${FREE_LINK_DAYS}일 뒤 닫히고, ${formatPrice(PREMIUM_PRICE)}에 한 번만 결제하면 예식일 이후까지 유지됩니다.`,
};

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
              만드는 것도, 링크를 만들어 보내 보는 것도 무료입니다. 무료 링크는{" "}
              {FREE_LINK_DAYS}일 뒤에 닫히므로, 청첩장을 정말 돌리실 때 한 번만
              결제하시면 됩니다.
            </p>
          </header>

          <div className="mt-block grid gap-6 md:grid-cols-2 md:gap-7">
            {PLANS.map((plan) => {
              const premium = plan.id === "premium";
              return (
                <section
                  key={plan.id}
                  className={`rounded-lg p-7 sm:p-8 ${
                    premium
                      ? "bg-ink text-ivory shadow-lift"
                      : "border border-line bg-white shadow-soft"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h2
                      className={`font-serif text-h3 ${premium ? "text-ivory" : "text-ink"}`}
                    >
                      {plan.name}
                    </h2>
                    <p
                      className={`font-serif text-[1.375rem] ${
                        premium ? "text-ivory" : "text-ink"
                      }`}
                    >
                      {plan.price}
                    </p>
                  </div>

                  <p
                    className={`mt-3 text-caption leading-relaxed ${
                      premium ? "text-ivory/70" : "text-ink-soft"
                    }`}
                  >
                    {plan.tagline}
                  </p>

                  <ul className="mt-6 grid gap-2.5">
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
                    href="/templates"
                    className={`mt-7 block rounded-full py-3 text-center text-[0.875rem] transition-colors ${
                      premium
                        ? "bg-ivory text-ink hover:bg-white"
                        : "border border-line text-ink hover:border-rose"
                    }`}
                  >
                    {premium ? "만들어 보고 결정하기" : "무료로 시작하기"}
                  </Link>
                </section>
              );
            })}
          </div>

          <section className="mx-auto mt-block max-w-narrow">
            <h2 className="font-serif text-h3 text-ink">자주 묻는 것</h2>
            <dl className="mt-6 grid gap-6">
              {[
                {
                  q: "결제하지 않으면 청첩장을 못 보내나요?",
                  a: `보낼 수 있습니다. 무료로도 링크와 QR을 만들어 카카오톡으로 공유하실 수 있습니다. 다만 무료 링크는 만든 날부터 ${FREE_LINK_DAYS}일이 지나면 닫히고, 그 뒤에 열면 안내 화면이 뜹니다.`,
                },
                {
                  q: `${FREE_LINK_DAYS}일이 지나면 만든 내용이 사라지나요?`,
                  a: "링크만 닫힙니다. 편집하던 내용은 그대로 남아 있어, 결제하시면 같은 주소가 그대로 다시 열립니다. 하객에게 이미 보낸 링크를 다시 보내지 않으셔도 됩니다.",
                },
                {
                  q: "한 번 결제하면 언제까지 쓰나요?",
                  a: `청첩장 하나에 한 번만 결제하시면 예식일에서 ${PAID_GRACE_DAYS}일 뒤까지 유지됩니다. 예식이 끝난 뒤에도 하객이 사진과 방명록을 볼 수 있도록 여유를 둔 것이고, 매달 빠져나가는 구독이 아닙니다.`,
                },
                {
                  q: "만들다가 마음이 바뀌면요?",
                  a: "만드는 동안에는 비용이 들지 않습니다. 몇 개를 만들든, 몇 번을 고치든, 링크를 만들어 미리 보내 보든 마찬가지입니다.",
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
