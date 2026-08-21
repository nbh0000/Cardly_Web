import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ResumeBuilder } from "@/components/studio/resume-builder";
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
    "이력서 양식 다운로드",
    "무료 이력서 양식",
    "경력기술서 양식",
    "이력서 사진 규격",
    "이력서 쓰는 법",
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
      <main id="main" className="flex-1 pt-16 md:pt-20">
        {/* 제목 줄은 아래 편집기와 한 덩어리입니다. 편집기가 화면 끝까지
            차지하므로 제목만 가운데 좁은 단에 두면 두 개의 다른 격자가
            겹쳐 보입니다. 편집기와 같은 가장자리 여백을 씁니다. */}
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-gutter py-5">
          <h1 className="font-serif text-h3 text-ink">이력서 만들기</h1>
          <p className="text-[0.75rem] text-muted">
            A4 한 장이 실시간으로 조판됩니다 · 가입도 결제도 없고, 입력한 내용은
            이 브라우저를 벗어나지 않습니다
          </p>
        </div>

        <ResumeBuilder />
      </main>
      <SiteFooter />
    </>
  );
}
