/**
 * 안심 줄 — 셋만.
 *
 * 문구는 지금 실제로 참인 것만 적습니다. 예전 홈에는 "입력 내용은 서버로
 * 보내지 않습니다" 가 사이트 전체에 걸려 있었는데, 청첩장·초대장이 계정에
 * 저장되기 시작한 뒤로는 그 문장이 거짓이 되었습니다. 안심시키려고 적은
 * 문장이 사실과 어긋나면 안심이 아니라 사고가 됩니다. 그래서 «어느
 * 도구에서» 참인지를 함께 적습니다.
 */

const ITEMS = [
  {
    icon: <PersonIcon />,
    title: "가입 없이 시작",
    body: "고르고 만드는 데까지는 로그인이 필요 없습니다.",
  },
  {
    icon: <LockIcon />,
    title: "이력서·명함은 서버에 안 남습니다",
    body: "브라우저 안에서 끝나고 파일로 바로 받습니다.",
  },
  {
    icon: <TagIcon />,
    title: "보내는 것까지 무료",
    body: "링크 발행도 값이 없습니다. 결제는 기한을 늘릴 때만.",
  },
];

export function TrustBand() {
  return (
    <section className="hm-trust">
      <div className="hm-shell">
        <ul className="hm-trust-grid">
          {ITEMS.map((item) => (
            <li key={item.title} className="hm-trust-item">
              {item.icon}
              <span className="text-[0.9375rem] font-semibold text-ink">
                {item.title}
              </span>
              <span className="hm-note max-w-[18rem]">{item.body}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* 아이콘은 선 하나짜리로 그립니다 — 색을 쓰면 포인트 색이 둘이 됩니다. */

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4.8 20c.7-3.6 3.6-5.6 7.2-5.6s6.5 2 7.2 5.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="4.5"
        y="10.5"
        width="15"
        height="9.5"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8.2 10.5V7.8a3.8 3.8 0 0 1 7.6 0v2.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 11.2V5a1 1 0 0 1 1-1h6.2a2 2 0 0 1 1.4.6l7 7a2 2 0 0 1 0 2.8l-5.8 5.8a2 2 0 0 1-2.8 0l-7-7a2 2 0 0 1-.6-1.4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="8.6" cy="8.6" r="1.4" fill="currentColor" />
    </svg>
  );
}
