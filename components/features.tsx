const FEATURES = [
  {
    title: "참석 여부, 실시간으로",
    body: "하객이 청첩장 안에서 바로 응답합니다. 식사 인원과 동반 인원까지 자동으로 집계돼 예식장에 그대로 전달할 수 있어요.",
    icon: (
      <>
        <path d="M4 12.5 9.5 18 20 6.5" />
      </>
    ),
  },
  {
    title: "마음 전하는 곳",
    body: "양가 계좌를 카카오페이·토스 송금 링크와 함께 정리해 드립니다. 하객은 계좌번호를 한 번에 복사할 수 있습니다.",
    icon: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="2.5" />
        <path d="M3 10.5h18M7 15h4" />
      </>
    ),
  },
  {
    title: "오시는 길 원터치",
    body: "네이버지도·카카오내비·티맵을 버튼 하나로 연결하고, 주차 안내와 셔틀버스 시간표까지 함께 담습니다.",
    icon: (
      <>
        <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.6" />
      </>
    ),
  },
  {
    title: "갤러리 · 방명록",
    body: "사진 최대 60장을 슬라이드와 그리드로 배치하고, 하객이 남긴 축하 메시지를 한곳에 모아 오래 간직하세요.",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <circle cx="8.5" cy="10" r="1.6" />
        <path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5" />
      </>
    ),
  },
  {
    title: "카카오톡 공유 최적화",
    body: "링크를 붙여넣으면 대표 사진과 문구가 담긴 카드로 예쁘게 펼쳐집니다. 미리보기 이미지도 직접 고를 수 있어요.",
    icon: (
      <>
        <path d="M12 4c-4.7 0-8.5 2.9-8.5 6.5 0 2.3 1.6 4.3 4 5.5l-.8 3.2 3.6-2a11 11 0 0 0 1.7.1c4.7 0 8.5-2.9 8.5-6.5S16.7 4 12 4Z" />
      </>
    ),
  },
  {
    title: "D-day 알림과 통계",
    body: "몇 명이 열어봤는지, 어디서 들어왔는지 확인하고 예식 전날 자동 알림으로 하객에게 한 번 더 안내합니다.",
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7v5.3l3.4 2" />
      </>
    ),
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-cream py-section-lg">
      <div className="shell">
        <div className="mx-auto max-w-narrow text-center">
          <span className="eyebrow eyebrow-center">Features</span>
          <h2 className="mt-5 font-serif text-h1 text-ink">
            예쁘기만 한 청첩장은 만들지 않습니다
          </h2>
          <p className="mt-5 text-body text-ink-soft">
            디자인만큼 중요한 건 결혼식을 준비하는 두 사람의 수고를 줄이는
            일이니까요.
          </p>
        </div>

        <ul className="mt-block grid gap-px overflow-hidden rounded-lg bg-line-soft sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li key={f.title} className="bg-cream p-8 md:p-9">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-rose-veil">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="var(--color-rose-deep)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {f.icon}
                </svg>
              </span>
              <h3 className="mt-5 font-serif text-h3 text-ink">{f.title}</h3>
              <p className="mt-3 text-caption text-ink-soft">{f.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
