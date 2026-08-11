import Link from "next/link";

const COLUMNS = [
  {
    title: "서비스",
    links: [
      { label: "청첩장 템플릿", href: "/templates" },
      { label: "편집기", href: "/editor/linen" },
      { label: "샘플 청첩장", href: "/preview/linen" },
      { label: "요금 안내", href: "/pricing" },
    ],
  },
  {
    title: "고객지원",
    links: [
      { label: "자주 묻는 질문", href: "/" },
      { label: "카카오톡 문의", href: "/" },
      { label: "제휴 문의", href: "/" },
      { label: "공지사항", href: "/" },
    ],
  },
  {
    title: "회사",
    links: [
      { label: "브랜드 소개", href: "/" },
      { label: "이용약관", href: "/" },
      { label: "개인정보처리방침", href: "/" },
      { label: "템플릿 관리", href: "/admin" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-cream pt-section-sm pb-12">
      <div className="shell">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <p className="font-serif text-xl text-ink">
              다온
              <span className="ml-1.5 align-super text-[0.5em] tracking-[0.24em] text-rose-deep">
                DAON
              </span>
            </p>
            <p className="mt-4 max-w-72 text-caption text-muted">
              모든 좋은 일이 다 온다는 뜻. 두 사람의 시작을 가장 아름답게
              전합니다. 만들어 보고 마음에 들면 그때 결제하세요.
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

        <div className="flex flex-col gap-4 text-[0.75rem] leading-relaxed text-hint md:flex-row md:items-end md:justify-between">
          <address className="not-italic">
            다온 · 서울특별시 마포구 양화로 000, 0층
            <br />
            고객문의 help@daon.example · 평일 10:00–18:00
          </address>
          <p>&copy; 2026 DAON. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
