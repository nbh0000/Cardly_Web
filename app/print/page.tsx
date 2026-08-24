import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TemplateThumb } from "@/components/print/thumb";
import { PRINT_CATEGORIES, presetSize } from "@/lib/print/specs";
import { PRINT_TEMPLATES, templatesFor } from "@/lib/print/templates";
import { formatPrice, PRICES } from "@/lib/plan";

const DESCRIPTION = `전단지·쿠폰·포스터·현수막·배너·메뉴판 템플릿 ${PRINT_TEMPLATES.length}종. 브라우저에서 글자와 사진을 바꾸고, 실제 mm 규격과 재단 여백을 넣은 인쇄용 PDF 로 내려받습니다.`;

export const metadata: Metadata = {
  title: `인쇄물 템플릿 ${PRINT_TEMPLATES.length}종 — 전단지·포스터·현수막·메뉴판`,
  description: DESCRIPTION,
  keywords: [
    "전단지 제작",
    "포스터 만들기",
    "현수막 제작",
    "배너 제작",
    "메뉴판 제작",
    "쿠폰 제작",
    "인쇄용 PDF",
    "인쇄물 템플릿",
  ],
  alternates: { canonical: "/print/" },
  openGraph: {
    type: "website",
    url: "/print/",
    title: "인쇄물 템플릿 | Cardly",
    description: DESCRIPTION,
    images: [{ url: "/og/print-flyer.jpg", width: 1200, height: 630 }],
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
            <p className="mt-3 text-caption text-muted">
              고쳐 보는 것은 무료 · 원본 파일은 한 건 {formatPrice(PRICES.print)}
            </p>
          </header>

          <ul className="mt-block grid gap-6 md:grid-cols-2">
            {PRINT_CATEGORIES.map((c) => {
              const size = presetSize(c);
              const list = templatesFor(c.id);
              const show = list.slice(0, 3);
              return (
                <li key={c.id}>
                  <Link href={`/print/${c.id}`} className="pi-card">
                    <span className="pi-card-head">
                      <span className="pi-card-name">{c.label}</span>
                      <span className="pi-card-size">
                        {size.width} × {size.height} mm · {list.length}종
                      </span>
                    </span>
                    <span className="pi-card-note">{c.note}</span>
                    <span className="pi-card-strip">
                      {show.map((t) => (
                        <TemplateThumb key={t.id} template={t} box={{ w: 108, h: 96 }} />
                      ))}
                    </span>
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
