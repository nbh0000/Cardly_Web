const QA = [
  {
    q: "정말 전부 무료인가요?",
    a: "네. 템플릿, 편집 기능, 사진 업로드, 참석 의사 집계, 방명록까지 모든 기능을 무료로 쓰실 수 있습니다. 결제 절차 자체가 없습니다.",
  },
  {
    q: "만들다가 중간에 저장할 수 있나요?",
    a: "편집 중인 내용은 임시저장 버튼으로 브라우저에 보관됩니다. 다시 들어오시면 이어서 편집할 수 있어요.",
  },
  {
    q: "완성한 뒤에도 내용을 수정할 수 있나요?",
    a: "링크는 그대로 둔 채 내용만 언제든 바꿀 수 있습니다. 이미 청첩장을 받은 하객에게도 수정된 내용이 바로 반영됩니다.",
  },
  {
    q: "사진은 몇 장까지 넣을 수 있나요?",
    a: "대표 사진 1장과 갤러리 사진 30장까지 넣을 수 있습니다. 업로드한 사진은 자동으로 최적화되어 모바일에서도 빠르게 열립니다.",
  },
  {
    q: "어른들이 보시기에 불편하지 않을까요?",
    a: "글자 크기를 세 단계로 조절할 수 있고, 별도 앱 설치 없이 링크만 누르면 바로 열립니다. 통화 버튼과 계좌 복사 버튼도 크게 배치되어 있습니다.",
  },
];

export function Faq() {
  return (
    <section className="py-section">
      <div className="shell">
        <div className="grid gap-block lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <span className="eyebrow">FAQ</span>
            <h2 className="mt-5 font-serif text-h1 text-ink">자주 묻는 질문</h2>
            <p className="mt-5 text-caption text-ink-soft">
              찾으시는 답이 없다면{" "}
              <a
                href="#"
                className="text-rose-deep underline underline-offset-4"
              >
                카카오톡 채널
              </a>
              로 문의해 주세요. 평일 10–18시에 답변드립니다.
            </p>
          </div>

          <ul className="border-t border-line">
            {QA.map((item) => (
              <li key={item.q} className="border-b border-line">
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                    <span className="font-serif text-h3 text-ink">
                      {item.q}
                    </span>
                    <span
                      aria-hidden
                      className="relative grid h-6 w-6 shrink-0 place-items-center"
                    >
                      <span className="absolute h-px w-3.5 bg-rose-deep" />
                      <span className="absolute h-3.5 w-px bg-rose-deep transition-transform duration-300 group-open:rotate-90 group-open:opacity-0" />
                    </span>
                  </summary>
                  <p className="max-w-narrow pr-10 pb-6 text-caption text-ink-soft">
                    {item.a}
                  </p>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
