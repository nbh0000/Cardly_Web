import Link from "next/link";
import { SlugFallback } from "@/components/publish/slug-fallback";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const TOOLS = [
  { href: "/resume", label: "이력서 만들기", note: "무료 · PDF·Word 저장" },
  { href: "/business-card", label: "명함 만들기", note: "무료 · 인쇄용 PNG" },
  { href: "/templates", label: "모바일 청첩장", note: "템플릿 고르고 편집" },
];

/**
 * 없는 주소.
 *
 * 다만 /w/… /i/… 는 «아직 굽지 않은 청첩장·초대장» 일 수 있습니다. 발행
 * 직후 몇 분 동안은 그 주소의 HTML 이 아직 없기 때문입니다. 그때는 404
 * 대신 그 문서를 받아 그려 줍니다 — 링크를 받은 하객은 아무것도 눈치채지
 * 못해야 합니다.
 */
export default function NotFound() {
  return (
    <SlugFallback>
      <SiteHeader />
      <main
        id="main"
        className="flex flex-1 items-center justify-center px-gutter py-section"
      >
        <div className="w-full max-w-narrow text-center">
          <span className="eyebrow eyebrow-center">404</span>
          <h1 className="mt-5 font-serif text-h1 text-ink">
            찾으시는 페이지가 없습니다
          </h1>
          <p className="mt-5 text-body text-ink-soft">
            주소가 바뀌었거나 지워진 페이지입니다. 아래에서 필요한 도구로 바로
            가실 수 있습니다.
          </p>

          <div className="mt-block grid gap-3 sm:grid-cols-3">
            {TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="rounded-lg border border-line bg-white px-5 py-6 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-rose"
              >
                <span className="block font-serif text-h3 text-ink">
                  {tool.label}
                </span>
                <span className="mt-1.5 block text-[0.6875rem] text-muted">
                  {tool.note}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </SlugFallback>
  );
}
