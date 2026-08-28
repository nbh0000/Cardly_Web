import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TemplateGrid } from "@/components/template-grid";
import { TEMPLATES } from "@/lib/invitation";

const DESCRIPTION = `모바일 청첩장 템플릿 ${TEMPLATES.length}종. 만들어 링크를 발행하면 하객이 주소만 눌러 봅니다. 지금은 여는 기간이라 링크 발행이 무료이고, 참석 여부와 방명록도 함께 열려 있습니다.`;

export const metadata: Metadata = {
  title: "모바일 청첩장 무료 제작 — 템플릿 " + TEMPLATES.length + "종",
  description: DESCRIPTION,
  keywords: [
    "모바일청첩장",
    "모바일 청첩장 무료",
    "청첩장 제작",
    "청첩장 만들기",
    "무료 청첩장",
    "셀프 청첩장",
    "모바일청첩장 셀프제작",
    "청첩장 템플릿",
    "청첩장 문구",
    "카카오톡 청첩장",
  ],
  alternates: { canonical: "/templates/" },
  openGraph: {
    type: "website",
    url: "/templates/",
    title: "모바일 청첩장 무료 제작 | Cardly",
    description: DESCRIPTION,
  },
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
              템플릿을 누르면 바로 편집기가 열립니다. 만들어 보는 데는 비용이
              들지 않고, 링크 발행도 무료로 됩니다.
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
