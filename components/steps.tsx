import { TEMPLATES } from "@/lib/invitation";

const STEPS = [
  {
    n: "01",
    title: "템플릿 선택",
    body: `${TEMPLATES.length}종 중에서 두 사람의 분위기에 맞는 디자인을 고릅니다. 색상·폰트는 나중에 언제든 바꿀 수 있어요.`,
  },
  {
    n: "02",
    title: "내용 입력",
    body: "사진과 인사말, 예식 정보를 순서대로 채워 넣습니다. 문구가 막히면 예시 문장을 그대로 가져다 쓰세요.",
  },
  {
    n: "03",
    title: "링크 공유",
    body: "완성과 동시에 링크가 발급됩니다. 카카오톡·문자·인스타그램 어디에 붙여넣어도 예쁘게 열립니다.",
  },
];

export function Steps() {
  return (
    <section id="how" className="scroll-mt-20 py-section">
      <div className="shell">
        <div className="mx-auto max-w-narrow text-center">
          <span className="eyebrow eyebrow-center">How it works</span>
          <h2 className="mt-5 font-serif text-h1 text-ink">
            세 단계, 평균 7분
          </h2>
        </div>

        <ol className="mt-block grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((s, i) => (
            <li key={s.n} className="relative md:pr-6">
              {/* 단계 연결선 (데스크톱) */}
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="absolute top-4 -right-2 hidden h-px w-8 bg-line md:block"
                />
              )}
              <span className="font-serif text-h2 text-rose">{s.n}</span>
              <h3 className="mt-4 font-serif text-h3 text-ink">{s.title}</h3>
              <p className="mt-3 text-caption text-ink-soft">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
