import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PRIVACY_SECTIONS } from "./sections";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description:
    "Cardly가 어떤 정보를 어디에 저장하고 무엇을 저장하지 않는지 정리했습니다. 이력서·명함 편집 내용은 서버로 전송되지 않고, 청첩장·초대장은 계정에 저장됩니다.",
  alternates: { canonical: "/privacy/" },
};

const SECTIONS = PRIVACY_SECTIONS;

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-28 pb-section md:pt-36">
        <div className="shell">
          <header className="mx-auto max-w-narrow">
            <span className="eyebrow">Privacy</span>
            <h1 className="mt-5 font-serif text-h1 text-ink">
              개인정보처리방침
            </h1>
            <p className="mt-5 text-body text-ink-soft">
              Cardly는 회원가입을 받지 않습니다. 무엇을 저장하지 않는지부터
              먼저 적었습니다.
            </p>
          </header>

          <div className="mx-auto mt-block max-w-narrow space-y-10">
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="font-serif text-h3 text-ink">{section.title}</h2>
                <div className="mt-3 space-y-3">
                  {section.body.map((line) => (
                    <p key={line} className="text-caption text-ink-soft">
                      {line}
                    </p>
                  ))}
                </div>
              </section>
            ))}
            <p className="text-[0.75rem] text-hint">시행일: 2026년 8월 12일</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
