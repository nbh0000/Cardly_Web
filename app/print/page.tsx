import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PRINT_CATEGORIES, presetSize } from "@/lib/print/specs";

const DESCRIPTION =
  "홍보 전단지·쿠폰·포스터·현수막·배너·메뉴판을 브라우저에서 만들고 인쇄용 PDF 로 내려받습니다. 실제 mm 규격과 재단 여백을 그대로 씁니다.";

export const metadata: Metadata = {
  title: "인쇄물 만들기 — 전단지·포스터·현수막·메뉴판",
  description: DESCRIPTION,
  keywords: [
    "전단지 제작",
    "포스터 만들기",
    "현수막 제작",
    "배너 제작",
    "메뉴판 제작",
    "쿠폰 제작",
    "인쇄용 PDF",
  ],
  alternates: { canonical: "/print/" },
  openGraph: {
    type: "website",
    url: "/print/",
    title: "인쇄물 만들기 | Cardly",
    description: DESCRIPTION,
  },
};

export default function PrintIndexPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-28 pb-section md:pt-32">
        <div className="shell">
          <header className="mx-auto max-w-narrow text-center">
            <span className="eyebrow eyebrow-center">Print</span>
            <h1 className="mt-5 font-serif text-h1 text-ink">인쇄물</h1>
            <p className="mt-5 text-body text-ink-soft">
              실제 mm 규격으로 만들고, 재단 여백까지 넣은 PDF 로 내려받습니다.
            </p>
          </header>

          <ul className="mt-block grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRINT_CATEGORIES.map((c) => {
              const size = presetSize(c);
              return (
                <li key={c.id}>
                  <Link href={`/print/${c.id}`} className="pi-card">
                    <span className="pi-card-name">{c.label}</span>
                    <span className="pi-card-size">
                      {size.width} × {size.height} mm
                    </span>
                    <span className="pi-card-note">{c.note}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
