import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { FaqJsonLd, Guide } from "@/components/studio/guide";
import { ResumeBuilder } from "@/components/studio/resume-builder";
import { RESUME_GUIDE } from "@/lib/studio/guide-content";
import { RESUME_TEMPLATES } from "@/lib/studio/resume-templates";

const DESCRIPTION = `회원가입도 결제도 없이 이력서를 직접 만들고 PDF·Word로 저장하세요. 실제 채용 서류 조판을 그대로 옮긴 ${RESUME_TEMPLATES.length}종 템플릿, 기간 우측 정렬과 성과 불릿, 완성도 점검까지.`;

export const metadata: Metadata = {
  title: "무료 이력서 만들기 — PDF·Word 저장",
  description: DESCRIPTION,
  keywords: [
    "이력서 양식",
    "무료 이력서",
    "이력서 만들기",
    "이력서 템플릿",
    "이력서 PDF",
    "경력기술서",
    "신입 이력서",
  ],
  alternates: { canonical: "/resume/" },
  openGraph: {
    type: "website",
    url: "/resume/",
    title: "무료 이력서 만들기 | Cardly",
    description: DESCRIPTION,
  },
};

export default function ResumePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-28 md:pt-32">
        <div className="shell">
          <header className="mx-auto max-w-narrow text-center">
            <span className="eyebrow eyebrow-center">Resume</span>
            <h1 className="mt-5 font-serif text-h1 text-ink">이력서 만들기</h1>
            <p className="mt-5 text-body text-ink-soft">
              항목을 채우면 A4 한 장이 실시간으로 조판됩니다. 가입도 결제도
              없고, 입력한 내용은 이 브라우저를 벗어나지 않습니다.
            </p>
          </header>

          <div className="mt-block pb-section-sm">
            <ResumeBuilder />
          </div>
        </div>

        <Guide content={RESUME_GUIDE} />
      </main>
      <SiteFooter />
      <FaqJsonLd faq={RESUME_GUIDE.faq} />
    </>
  );
}
