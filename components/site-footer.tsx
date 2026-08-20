import Link from "next/link";

/**
 * 사업자 정보.
 *
 * 청첩장 발행이 유료라 전자상거래법 제10조상 상호·대표자·주소·
 * 사업자등록번호·통신판매업 신고번호를 표시해야 합니다.
 * 예전에는 "서울특별시 마포구 양화로 000, 0층" 같은 자리표시 주소가
 * 그대로 나가고 있었는데, 없는 것보다 나쁩니다 — 틀린 정보를
 * 사실처럼 보여 주기 때문입니다.
 *
 * 실제 값이 정해지면 아래를 채우세요. 빈 항목은 화면에 나오지 않으므로
 * 지어낸 값 대신 비워 두는 편이 안전합니다.
 */
const BUSINESS = {
  name: "Cardly",
  owner: "", // 대표자명
  address: "", // 사업장 주소
  registrationNo: "", // 사업자등록번호
  mailOrderNo: "", // 통신판매업 신고번호
  email: "help@cardly.kr",
  hours: "평일 10:00–18:00",
};

const COLUMNS = [
  {
    title: "제작 도구",
    links: [
      { label: "이력서 만들기", href: "/resume" },
      { label: "명함 만들기", href: "/business-card" },
      { label: "모바일 청첩장", href: "/templates" },
      { label: "청첩장 요금 안내", href: "/pricing" },
    ],
  },
  {
    title: "안내",
    links: [
      { label: "이력서 작성 기준", href: "/resume" },
      { label: "명함 인쇄 규격", href: "/business-card" },
      { label: "청첩장 샘플 보기", href: "/preview/linen" },
    ],
  },
  {
    title: "이용 안내",
    links: [
      { label: "이용약관", href: "/terms" },
      { label: "개인정보처리방침", href: "/privacy" },
      { label: "템플릿 관리", href: "/admin" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-cream pt-section-lg pb-12">
      <div className="shell">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <p className="font-serif text-xl text-ink">
              Cardly
              <span className="ml-1.5 align-super text-[0.5em] tracking-[0.24em] text-rose-deep">
                KR
              </span>
            </p>
            <p className="mt-4 max-w-72 text-caption text-muted">
              이력서, 명함, 모바일 청첩장을 브라우저에서 직접 만듭니다.
              입력한 내용은 서버로 보내지 않고, 이력서와 명함은 언제나
              무료입니다.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title}>
              <h3 className="font-sans text-[0.75rem] tracking-[0.14em] text-ink uppercase">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-caption text-muted transition-colors hover:text-rose-deep"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <hr className="rule my-10" />

        <div className="flex flex-col gap-4 text-[0.75rem] leading-relaxed text-muted md:flex-row md:items-end md:justify-between">
          <address className="not-italic">
            {[
              BUSINESS.name,
              BUSINESS.owner && `대표 ${BUSINESS.owner}`,
              BUSINESS.address,
              BUSINESS.registrationNo &&
                `사업자등록번호 ${BUSINESS.registrationNo}`,
              BUSINESS.mailOrderNo &&
                `통신판매업신고 ${BUSINESS.mailOrderNo}`,
            ]
              .filter(Boolean)
              .join(" · ")}
            <br />
            고객문의 {BUSINESS.email} · {BUSINESS.hours}
          </address>
          <p>&copy; 2026 Cardly. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
