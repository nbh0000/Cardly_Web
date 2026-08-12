import Link from "next/link";

export type GuideContent = {
  eyebrow: string;
  title: string;
  intro: string;
  steps: [string, string][];
  criteria: { title: string; body: string }[];
  example: { bad: string; good: string; note: string };
  mistakes: string[];
  checklist: string[];
  faq: [string, string][];
};

/**
 * 제작기 아래에 붙는 안내 본문.
 *
 * 편집기만 있는 페이지는 검색 결과에 들어가도 읽을 내용이 없어 금방
 * 밀려납니다. 실제로 도움이 되는 기준과 예시를 함께 실어야 페이지가
 * 유지됩니다. FAQ 는 JSON-LD 로도 같이 내보냅니다.
 */
export function Guide({ content }: { content: GuideContent }) {
  return (
    <section className="border-t border-line bg-cream py-section-sm">
      <div className="shell">
        <header className="mx-auto max-w-narrow text-center">
          <span className="eyebrow eyebrow-center">{content.eyebrow}</span>
          <h2 className="mt-5 font-serif text-h2 text-ink">{content.title}</h2>
          <p className="mt-5 text-body text-ink-soft">{content.intro}</p>
        </header>

        {/* 사용 순서 */}
        <ol className="mt-block grid gap-6 md:grid-cols-4">
          {content.steps.map(([title, body], index) => (
            <li key={title} className="border-t border-line pt-5">
              <span className="font-serif text-h3 text-rose">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-serif text-h3 text-ink">{title}</h3>
              <p className="mt-2 text-caption text-ink-soft">{body}</p>
            </li>
          ))}
        </ol>

        {/* 기준 */}
        <div className="mt-block grid gap-10 md:grid-cols-[1.1fr_1fr]">
          <div>
            <h3 className="font-sans text-[0.75rem] tracking-[0.14em] text-ink uppercase">
              고르는 기준
            </h3>
            <dl className="mt-5 space-y-5">
              {content.criteria.map((item) => (
                <div key={item.title} className="border-l-2 border-rose-mist pl-4">
                  <dt className="font-serif text-h3 text-ink">{item.title}</dt>
                  <dd className="mt-1.5 text-caption text-ink-soft">{item.body}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h3 className="font-sans text-[0.75rem] tracking-[0.14em] text-ink uppercase">
              같은 내용, 다른 문장
            </h3>
            <div className="mt-5 space-y-3">
              <div className="rounded-md border border-line bg-white p-4">
                <b className="text-[0.6875rem] tracking-[0.1em] text-muted uppercase">
                  피할 예
                </b>
                <p className="mt-2 text-caption text-ink-soft line-through decoration-line">
                  {content.example.bad}
                </p>
              </div>
              <div className="rounded-md border border-rose-mist bg-rose-veil p-4">
                <b className="text-[0.6875rem] tracking-[0.1em] text-rose-deep uppercase">
                  권하는 예
                </b>
                <p className="mt-2 text-caption text-ink">{content.example.good}</p>
              </div>
              <p className="text-[0.75rem] text-muted">{content.example.note}</p>
            </div>
          </div>
        </div>

        {/* 실수와 체크리스트 */}
        <div className="mt-block grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="font-sans text-[0.75rem] tracking-[0.14em] text-ink uppercase">
              흔한 실수
            </h3>
            <ul className="mt-5 space-y-2.5">
              {content.mistakes.map((item) => (
                <li key={item} className="flex gap-2.5 text-caption text-ink-soft">
                  <span aria-hidden className="text-rose">
                    ✕
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-sans text-[0.75rem] tracking-[0.14em] text-ink uppercase">
              내보내기 전 점검
            </h3>
            <ul className="mt-5 space-y-2.5">
              {content.checklist.map((item) => (
                <li key={item} className="flex gap-2.5 text-caption text-ink-soft">
                  <span aria-hidden className="text-rose-deep">
                    □
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-block mx-auto max-w-narrow">
          <h3 className="text-center font-serif text-h3 text-ink">
            자주 묻는 질문
          </h3>
          <div className="mt-6 divide-y divide-line border-y border-line">
            {content.faq.map(([question, answer]) => (
              <details key={question} className="group py-4">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-body text-ink">
                  {question}
                  <span
                    aria-hidden
                    className="text-rose transition-transform group-open:rotate-45"
                  >
                    ＋
                  </span>
                </summary>
                <p className="mt-3 text-caption text-ink-soft">{answer}</p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-center">
            <Link href="/" className="btn btn-ghost btn-sm">
              Cardly 전체 도구 보기
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

/** 검색 결과에 질문·답변이 그대로 노출되도록 하는 구조화 데이터 */
export function FaqJsonLd({ faq }: { faq: [string, string][] }) {
  return (
    <script
      type="application/ld+json"
      // 데이터가 전부 이 저장소 안의 상수라 외부 입력이 섞이지 않습니다.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map(([question, answer]) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer },
          })),
        }),
      }}
    />
  );
}
