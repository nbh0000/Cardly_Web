import Link from "next/link";
import { EditorShowcase } from "@/components/editor-showcase";
import { Faq } from "@/components/faq";
import { Features } from "@/components/features";
import { FinalCta } from "@/components/final-cta";
import { Hero } from "@/components/hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Steps } from "@/components/steps";
import { TemplateGrid } from "@/components/template-grid";
import { Testimonials } from "@/components/testimonials";
import { TEMPLATES } from "@/lib/invitation";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        <Hero />

        {/* 템플릿 갤러리 — 이 사이트의 주인공 */}
        <section className="py-section">
          <div className="shell">
            <div className="mx-auto max-w-narrow text-center">
              <span className="eyebrow eyebrow-center">Wedding Templates</span>
              <h2 className="mt-5 font-serif text-h1 text-ink">
                청첩장은 템플릿을 누르면 바로 편집됩니다
              </h2>
              <p className="mt-5 text-body text-ink-soft">
                미니멀부터 플라워, 모던 에디토리얼까지 {TEMPLATES.length}종.
                만들어 보는 데는 비용이 들지 않고, 마음에 들 때 결제합니다.
              </p>
            </div>

            <div className="mt-block">
              <TemplateGrid limit={8} />
            </div>

            <div className="mt-block text-center">
              <Link href="/templates" className="btn btn-ghost">
                템플릿 전체 보기
              </Link>
            </div>
          </div>
        </section>

        <EditorShowcase />
        <Features />
        <Steps />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>

      <SiteFooter />
    </>
  );
}
