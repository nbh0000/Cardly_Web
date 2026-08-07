import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TemplateGrid } from "@/components/template-grid";
import { TEMPLATES } from "@/lib/invitation";

export const metadata: Metadata = {
  title: "청첩장 템플릿",
  description: `${TEMPLATES.length}종의 모바일 청첩장 디자인. 마음에 드는 템플릿을 고르면 바로 편집할 수 있습니다.`,
};

export default function TemplatesPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-28 pb-section md:pt-36">
        <div className="shell">
          <header className="mx-auto max-w-narrow text-center">
            <span className="eyebrow eyebrow-center">Templates</span>
            <h1 className="mt-5 font-serif text-h1 text-ink">청첩장 템플릿</h1>
            <p className="mt-5 text-body text-ink-soft">
              템플릿을 누르면 바로 편집기가 열립니다. 모든 기능은 무료입니다.
            </p>
          </header>

          <div className="mt-block">
            <TemplateGrid />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
