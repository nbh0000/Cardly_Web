const REVIEWS = [
  {
    quote:
      "청첩장 하나 만드는 데 며칠 걸릴 줄 알았는데, 퇴근하고 앉아서 한 번에 끝냈어요. 폰트가 예뻐서 그런지 받은 분들이 다 어디서 만들었냐고 물어보시더라고요.",
    name: "이서연 · 최민준",
    meta: "2026.03 · 리넨",
  },
  {
    quote:
      "참석 여부 집계가 진짜 물건이에요. 어머님이 일일이 전화 돌리시던 걸 링크 하나로 끝냈습니다. 식사 인원 맞추는 데 결정적이었어요.",
    name: "박지훈 · 김하늘",
    meta: "2026.04 · 아카이브",
  },
  {
    quote:
      "여러 곳 비교했는데 여기가 제일 담백했어요. 과한 애니메이션 없이 사진이랑 글이 잘 보이는 게 좋았습니다. 어른들도 보기 편하다고 하셨어요.",
    name: "정우진 · 한소미",
    meta: "2026.02 · 블랑",
  },
];

export function Testimonials() {
  return (
    <section id="reviews" className="scroll-mt-20 py-section">
      <div className="shell">
        <div className="mx-auto max-w-narrow text-center">
          <span className="eyebrow eyebrow-center">Reviews</span>
          <h2 className="mt-5 font-serif text-h1 text-ink">
            먼저 결혼한 부부들의 이야기
          </h2>
          <p className="mt-5 flex items-center justify-center gap-2 text-caption text-muted">
            <Stars />
            <span>4.9 / 5.0 · 후기 3,182건</span>
          </p>
        </div>

        <ul className="mt-block grid gap-5 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <li
              key={r.name}
              className="flex flex-col rounded-lg bg-cream p-8 md:p-9"
            >
              <span
                aria-hidden
                className="font-serif text-h1 leading-none text-rose"
              >
                &ldquo;
              </span>
              <p className="mt-3 flex-1 text-caption text-ink-soft">
                {r.quote}
              </p>
              <footer className="mt-7">
                <p className="font-serif text-[0.9375rem] text-ink">{r.name}</p>
                <p className="mt-1 text-[0.75rem] text-muted">{r.meta}</p>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Stars() {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className="h-3.5 w-3.5"
          fill="var(--color-rose)"
        >
          <path d="M10 1.6l2.5 5.3 5.5.8-4 4 1 5.7-5-2.7-5 2.7 1-5.7-4-4 5.5-.8z" />
        </svg>
      ))}
    </span>
  );
}
