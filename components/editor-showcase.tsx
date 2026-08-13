import Link from "next/link";

const CAPABILITIES = [
  "템플릿 · 포인트 색상 · 글꼴 · 글자 크기",
  "커버 레이아웃 5종과 대표 사진",
  "인사말 (예시 문구 불러오기)",
  "신랑 · 신부 · 혼주 정보, 고인 표시",
  "예식 일시 · 달력 · D-day 카운터",
  "예식장 · 지도 · 교통편 안내",
  "갤러리 (그리드 · 슬라이드 · 매거진)",
  "마음 전하실 곳 (계좌 · 카카오페이)",
  "참석 의사 전달 (팝업 · 식사 · 인원)",
  "방명록 · 배경음악 · 화면 효과",
  "카카오톡 공유 카드 미리보기",
];

export function EditorShowcase() {
  return (
    <section className="bg-cream py-section-lg">
      <div className="shell">
        <div className="grid items-center gap-block lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="eyebrow">Editor</span>
            <h2 className="mt-5 font-serif text-h1 text-ink">
              고친 내용이 그 자리에서 보입니다
            </h2>
            <p className="mt-5 text-body text-ink-soft">
              왼쪽에서 입력하면 오른쪽 화면이 즉시 바뀝니다. 하객이 실제로 보게
              될 그대로를 확인하면서 만들 수 있어요.
            </p>

            <ul className="mt-8 grid gap-2.5 sm:grid-cols-2">
              {CAPABILITIES.map((c) => (
                <li key={c} className="flex gap-2 text-caption text-ink-soft">
                  <svg
                    viewBox="0 0 16 16"
                    className="mt-1.5 h-3 w-3 shrink-0"
                    fill="none"
                    stroke="var(--color-rose-deep)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="m2.5 8.5 3.5 3.5 7.5-8" />
                  </svg>
                  {c}
                </li>
              ))}
            </ul>

            <Link href="/editor/linen" className="btn btn-primary mt-9">
              편집기 열어보기
            </Link>
          </div>

          {/* 에디터 화면 목업 */}
          <div className="overflow-hidden rounded-lg bg-ivory shadow-lift ring-1 ring-line">
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-line" />
              <span className="h-2 w-2 rounded-full bg-line" />
              <span className="h-2 w-2 rounded-full bg-line" />
              <span className="ml-2 font-serif text-[0.75rem] text-ink">
                리넨 · 편집 중
              </span>
            </div>
            <div className="grid grid-cols-[1.1fr_1fr]">
              <div className="space-y-3 border-r border-line p-4">
                {[
                  ["템플릿 · 디자인", true],
                  ["메인 화면", false],
                  ["인사말", false],
                  ["신랑 · 신부", false],
                  ["예식 일시", false],
                  ["예식 장소", false],
                  ["갤러리", false],
                ].map(([label, open]) => (
                  <div key={String(label)}>
                    <div className="flex items-center justify-between border-b border-line-soft pb-2">
                      <span className="text-[0.6875rem] text-ink">{label}</span>
                      <span className="text-[0.625rem] text-rose-deep">⌄</span>
                    </div>
                    {open && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {["#B08D80", "#A6606A", "#8A9A7B", "#A98E63"].map((c) => (
                          <span
                            key={c}
                            className="h-4 w-4 rounded-full ring-1 ring-ink/10"
                            style={{ background: c }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="grid place-items-center bg-cream p-4">
                <div className="w-full max-w-[9rem] rounded-xl bg-white p-1.5 shadow-card">
                  <div className="flex aspect-[9/16] flex-col items-center justify-center gap-2 rounded-lg bg-[#FBF8F3] px-3 text-center">
                    <span className="text-[0.4rem] tracking-[0.24em] text-[#B08D80]">
                      INVITATION
                    </span>
                    <span className="h-12 w-9 rounded-t-full bg-[#EFE7DC]" />
                    <span className="font-serif text-[0.7rem] text-[#2E2A27]">
                      김도윤 &amp; 이서연
                    </span>
                    <span className="h-px w-6 bg-[#B08D80]" />
                    <span className="text-[0.4rem] text-[#2E2A27]/60">
                      2026. 05. 24.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
