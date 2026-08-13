import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  formatPrice,
  PAID_GRACE_DAYS,
  PLANS,
  PREMIUM_PRICE,
} from "@/lib/plan";

export const metadata: Metadata = {
  title: "요금 안내",
  description: `청첩장을 만들고 미리 보는 것은 무료입니다. 링크 발행은 준비 중이라 지금은 결제를 받지 않으며, 열리면 ${formatPrice(PREMIUM_PRICE)}에 한 번만 결제하는 방식이 될 예정입니다.`,
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
              아래는 링크 발행이 열렸을 때의 예정 요금입니다. 지금은 결제를
              받지 않고, 청첩장을 만들고 미리 보는 것까지 값 없이 쓰실 수
              있습니다.
            </p>
          </header>

          {/* 결제를 받지 않는 동안에는 그 사실이 요금표보다 먼저 보여야
              합니다. 아래 표만 두면 살 수 있는 것처럼 읽힙니다. */}
          <div className="mx-auto mt-8 max-w-narrow rounded-lg border border-rose bg-rose-veil/60 p-6 text-center">
            <p className="font-serif text-h3 text-ink">
              지금은 결제를 받지 않습니다
            </p>
            <p className="mt-3 text-caption text-ink-soft">
              하객에게 보낼 내 청첩장 링크를 만드는 기능이 아직 열리지
              않았습니다. 그 기능 없이 돈을 받는 것은 맞지 않아, 열리는 날까지
              결제창을 닫아 두었습니다. 이력서와 명함은 지금도 전부 무료입니다.
            </p>
          </div>

          <div className="mt-block grid gap-6 md:grid-cols-2 md:gap-7">
            {PLANS.map((plan) => {
              const premium = plan.id === "premium";
              return (
                <section
                  key={plan.id}
                  className={`flex flex-col rounded-lg p-7 sm:p-8 ${
                    premium
                      ? "bg-ink text-ivory shadow-lift"
                      : "border border-line bg-white shadow-soft"
                  }`}
                >
                  {/* 요금제 이름보다 금액이 먼저 읽혀야 합니다.
                      예전에는 둘이 같은 크기라 정작 판단 근거인 숫자가
                      묻혔습니다. 이름은 라벨로 내리고 금액을 키웠습니다. */}
                  {/* 배지가 있는 카드만 줄이 두꺼워져 두 금액의 기준선이
                      어긋납니다. 줄 높이를 고정해 나란히 맞춥니다. */}
                  <div className="flex h-7 items-center justify-between gap-3">
                    <h2
                      className={`font-sans text-eyebrow uppercase ${
                        premium ? "text-ivory/75" : "text-rose-deep"
                      }`}
                    >
                      {plan.name}
                    </h2>
                    {premium && (
                      <span className="rounded-full bg-ivory/15 px-2.5 py-1 text-[0.6875rem] tracking-[0.1em] text-ivory">
                        발행 시 예정
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
                      ? "발행이 열리면 청첩장 하나당 한 번 · 구독이 아닙니다"
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

                  {/* mt-auto 로 두 카드의 항목 수가 달라도 버튼이 같은 줄에 섭니다. */}
                  <Link
                    href="/templates"
                    className={`mt-auto block rounded-full py-3 text-center text-[0.875rem] transition-colors ${
                      premium
                        ? "bg-ivory text-ink hover:bg-white"
                        : "border border-line text-ink hover:border-rose"
                    }`}
                  >
                    {premium ? "지금 미리 만들어 보기" : "무료로 시작하기"}
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
                  q: "지금 청첩장을 하객에게 보낼 수 있나요?",
                  a: "아직 보내실 수 없습니다. 하객에게 보낼 내 청첩장 주소를 만드는 기능이 준비 중이라, 지금은 템플릿을 골라 만들고 화면으로 확인하는 것까지 됩니다. 이 부분이 열리기 전까지는 결제도 받지 않습니다.",
                },
                {
                  q: "지금 만들어 둔 내용은 나중에 쓸 수 있나요?",
                  a: "편집기의 ‘청첩장 저장하기’를 누르면 지금 쓰는 브라우저에 저장됩니다. 다만 사진은 저장되지 않고, 브라우저 데이터를 지우거나 다른 기기에서 열면 남아 있지 않습니다. 계정에 안전하게 보관하는 기능도 발행과 함께 준비하고 있습니다.",
                },
                {
                  q: "요금은 어떻게 될 예정인가요?",
                  a: `발행이 열리면 청첩장 하나에 한 번만 결제하는 방식이 될 예정입니다. 예식일에서 ${PAID_GRACE_DAYS}일 뒤까지 링크를 열어 두어, 예식이 끝난 뒤에도 하객이 사진을 볼 수 있게 할 계획입니다. 매달 빠져나가는 구독은 만들지 않습니다.`,
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
