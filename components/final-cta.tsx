import Link from "next/link";

export function FinalCta() {
  return (
    <section className="pb-section">
      <div className="shell">
        <div className="relative overflow-hidden rounded-xl bg-rose-veil px-6 py-section-sm text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 70% at 50% 110%, rgba(176,141,128,0.22) 0%, rgba(176,141,128,0) 70%)",
            }}
          />
          <div className="relative mx-auto max-w-narrow">
            <span className="eyebrow eyebrow-center">Start now</span>
            <h2 className="mt-5 font-serif text-h1 text-ink">
              오늘 저녁, 청첩장 하나 끝내고 주무세요
            </h2>
            <p className="mt-5 text-body text-ink-soft">
              가입도 결제도 없습니다. 템플릿을 고르면 바로 편집기가 열립니다.
            </p>
            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
              <Link href="/templates" className="btn btn-primary">
                템플릿 고르기
              </Link>
              <Link href="/editor/linen" className="btn btn-ghost bg-ivory">
                편집기 바로 열기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
