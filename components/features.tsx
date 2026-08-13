/**
 * 지금 편집기에서 실제로 되는 것만 적습니다.
 *
 * 예전에는 "참석 여부가 자동 집계된다", "링크를 붙여넣으면 카드로
 * 펼쳐진다", "몇 명이 열어봤는지 확인한다" 처럼 아직 없는 기능이
 * 적혀 있었습니다. 하객 응답을 받아 둘 곳이 아직 없어서 지킬 수 없는
 * 약속이었습니다. 준비 중인 것은 아래 PLANNED 로 따로 묶어 두었습니다.
 */
const FEATURES = [
  {
    title: "커버부터 끝까지 내 손으로",
    body: "커버 레이아웃 열한 가지, 글꼴 열일곱 가지, 포인트 색과 글자 크기까지 고칠 수 있습니다. 고친 내용은 그 자리에서 바로 보입니다.",
    icon: (
      <>
        <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
        <path d="M3.5 9h17M9 9v11.5" />
      </>
    ),
  },
  {
    title: "마음 전하는 곳",
    body: "양가 계좌를 정리해 담습니다. 하객이 계좌번호를 한 번에 복사할 수 있게 배치됩니다.",
    icon: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="2.5" />
        <path d="M3 10.5h18M7 15h4" />
      </>
    ),
  },
  {
    title: "오시는 길",
    body: "네이버지도·카카오내비·티맵으로 바로 이어지는 버튼을 놓고, 주차 안내와 셔틀버스 시간표까지 함께 담습니다.",
    icon: (
      <>
        <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.6" />
      </>
    ),
  },
  {
    title: "갤러리",
    body: "사진을 그리드·슬라이드·매거진 세 가지 방식으로 배치합니다. 사진마다 색보정을 맞춰 한 벌처럼 보이게 합니다.",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <circle cx="8.5" cy="10" r="1.6" />
        <path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5" />
      </>
    ),
  },
  {
    title: "오프닝과 화면 효과",
    body: "카드가 3D로 열리는 오프닝을 고르고, 꽃잎·눈·빛망울 같은 효과의 색과 크기까지 직접 맞출 수 있습니다.",
    icon: (
      <>
        <path d="M12 3.5 14.2 9l5.8.5-4.4 3.8 1.3 5.7L12 16l-4.9 3 1.3-5.7L4 9.5 9.8 9Z" />
      </>
    ),
  },
  {
    title: "어른들도 보기 편하게",
    body: "글자 크기를 세 단계로 키울 수 있고, 기기에서 모션 줄이기를 켠 분에게는 효과가 보이지 않습니다.",
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M8.5 12h7M12 8.5v7" />
      </>
    ),
  },
];

/** 아직 안 되는 것 — 숨기지 않고 준비 중이라고 밝힙니다. */
const PLANNED = [
  "내 청첩장 링크 발행과 카카오톡 공유",
  "참석 여부 집계",
  "방명록 · 하객 스냅",
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-cream py-section-lg">
      <div className="shell">
        <div className="mx-auto max-w-narrow text-center">
          <span className="eyebrow eyebrow-center">Features</span>
          <h2 className="mt-5 font-serif text-h1 text-ink">
            지금 편집기에서 되는 것들
          </h2>
          <p className="mt-5 text-body text-ink-soft">
            가입도 결제도 없이, 템플릿을 누르면 바로 여기까지 만들 수 있습니다.
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

        {/* 아직 안 되는 것을 같은 자리에서 밝힙니다.
            숨겨 두면 만들어 본 뒤에야 알게 되고, 그게 더 나쁩니다. */}
        <div className="mt-block rounded-lg border border-line bg-ivory p-7 md:p-8">
          <h3 className="font-serif text-h3 text-ink">아직 준비 중인 것</h3>
          <p className="mt-3 max-w-narrow text-caption text-ink-soft">
            아래는 아직 열리지 않았습니다. 지금은 청첩장을 만들고 미리 보는
            것까지 되고, 하객에게 보낼 내 링크를 만드는 기능은 준비하고
            있습니다. 열리기 전까지는 결제도 받지 않습니다.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {PLANNED.map((p) => (
              <li
                key={p}
                className="rounded-full bg-sand px-3.5 py-1.5 text-[0.75rem] text-ink-soft"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
