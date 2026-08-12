import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CardStudio } from "@/components/studio/card-studio";
import { FaqJsonLd, Guide } from "@/components/studio/guide";
import { CARD_TEMPLATES } from "@/lib/studio/card-templates";
import { CARD_GUIDE } from "@/lib/studio/guide-content";

const DESCRIPTION = `회원가입 없이 명함을 직접 디자인하고 인쇄용 고해상도 PNG로 저장하세요. 90 × 50 mm 실제 규격, 재단 안전선 표시, 인쇄 실무 글자 크기를 지킨 ${CARD_TEMPLATES.length}종 템플릿과 양면 편집.`;

export const metadata: Metadata = {
  title: "무료 명함 만들기 — 인쇄용 고화질 저장",
  description: DESCRIPTION,
  keywords: [
    "명함 만들기",
    "무료 명함 제작",
    "명함 템플릿",
    "명함 디자인",
    "명함 규격",
    "명함 인쇄",
    "양면 명함",
  ],
  alternates: { canonical: "/business-card/" },
  openGraph: {
    type: "website",
    url: "/business-card/",
    title: "무료 명함 만들기 | Cardly",
    description: DESCRIPTION,
  },
};

export default function BusinessCardPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-28 md:pt-32">
        <div className="shell">
          <header className="mx-auto max-w-narrow text-center">
            <span className="eyebrow eyebrow-center">Business Card</span>
            <h1 className="mt-5 font-serif text-h1 text-ink">명함 만들기</h1>
            <p className="mt-5 text-body text-ink-soft">
              90 × 50 mm 실제 크기로 편집합니다. 재단 안전선을 보면서 배치하고,
              인쇄소에 그대로 넘길 수 있는 해상도로 저장하세요.
            </p>
          </header>

          <div className="mt-block pb-section-sm">
            <CardStudio />
          </div>
        </div>

        <Guide content={CARD_GUIDE} />
      </main>
      <SiteFooter />
      <FaqJsonLd faq={CARD_GUIDE.faq} />
    </>
  );
}
