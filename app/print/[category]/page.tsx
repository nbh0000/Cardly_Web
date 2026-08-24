import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TemplateGallery } from "@/components/print/gallery";
import { templatesFor } from "@/lib/print/templates";
import { findCategory, PRINT_CATEGORIES, type PrintCategoryId } from "@/lib/print/specs";

/**
 * 갈래 하나의 템플릿 목록 — /print/flyer/ 같은 주소.
 *
 * 이 화면이 검색으로 들어오는 첫 자리라, <meta> 를 갈래마다 따로 씁니다.
 * «인쇄물 만들기» 하나로 뭉뚱그리면 «전단지 제작» 으로 검색한 사람이
 * 무엇을 보게 되는지 알 수 없습니다.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return PRINT_CATEGORIES.map((c) => ({ category: c.id }));
}

/** 갈래마다 검색에 쓰는 말이 다릅니다 */
const KEYWORDS: Record<PrintCategoryId, string[]> = {
  flyer: ["전단지 제작", "전단지 템플릿", "홍보 전단지", "찌라시 제작", "A4 전단지"],
  coupon: ["쿠폰 제작", "쿠폰 템플릿", "할인권 제작", "스탬프 카드", "절취선 쿠폰"],
  poster: ["포스터 제작", "포스터 템플릿", "공연 포스터", "행사 포스터", "모집 공고"],
  banner: ["현수막 제작", "현수막 문구", "개업 현수막", "축하 현수막", "현수막 시안"],
  "standing-banner": ["배너 제작", "X배너", "롤업 배너", "행사 배너", "배너 시안"],
  menu: ["메뉴판 제작", "메뉴판 템플릿", "카페 메뉴판", "음식점 메뉴판", "3단 메뉴판"],
};

export async function generateMetadata({
  params,
}: PageProps<"/print/[category]">): Promise<Metadata> {
  const { category } = await params;
  const c = findCategory(category);
  if (!c) return { title: "인쇄물" };

  const count = templatesFor(c.id).length;
  const sizes = c.sizes.map((s) => s.label.replace(/\s+/g, " ")).join(" · ");
  const description = `${c.label} 템플릿 ${count}종. ${c.note} 규격 ${sizes}. 브라우저에서 고치고 인쇄용 PDF 로 내려받습니다.`;

  return {
    title: `${c.label} 템플릿 ${count}종 — 무료로 만들고 PDF 로 저장`,
    description,
    keywords: KEYWORDS[c.id],
    alternates: { canonical: `/print/${c.id}/` },
    openGraph: {
      type: "website",
      url: `/print/${c.id}/`,
      title: `${c.label} 템플릿 ${count}종 | Cardly`,
      description,
      images: [{ url: `/og/print-${c.id}.jpg`, width: 1200, height: 630 }],
    },
  };
}

export default async function PrintCategoryPage({ params }: PageProps<"/print/[category]">) {
  const { category } = await params;
  const c = findCategory(category);
  if (!c) return null;

  const templates = templatesFor(c.id);
  const preset = c.sizes.find((s) => s.preset) ?? c.sizes[0]!;

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-28 pb-section md:pt-32">
        <div className="shell">
          <header className="mx-auto max-w-narrow text-center">
            <span className="eyebrow eyebrow-center">
              <Link href="/print" className="hover:text-ink">
                인쇄물
              </Link>
            </span>
            <h1 className="mt-5 font-serif text-h1 text-ink">{c.label}</h1>
            <p className="mt-5 text-body text-ink-soft">{c.note}</p>
            <p className="mt-3 text-caption text-muted">
              기본 규격 {preset.width} × {preset.height} mm · 재단 여백 {c.bleed}mm ·{" "}
              {c.dpi}dpi
            </p>
            <div className="mt-7 flex justify-center gap-2">
              <Link href={`/print/${c.id}/edit`} className="btn btn-primary btn-sm">
                빈 종이로 시작
              </Link>
            </div>
          </header>

          <div className="mt-block">
            <TemplateGallery templates={templates} />
          </div>

          <nav className="mt-block border-t border-line pt-8">
            <p className="text-caption text-muted">다른 인쇄물</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {PRINT_CATEGORIES.filter((o) => o.id !== c.id).map((o) => (
                <li key={o.id}>
                  <Link href={`/print/${o.id}`} className="pg-chip">
                    {o.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
