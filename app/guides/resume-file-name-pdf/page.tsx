import type { Metadata } from "next";
import { LegacyRedirect } from "@/components/legacy-redirect";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/* 예전 Cardly 사이트에서 색인된 주소입니다. 새 위치로 넘겨 줍니다. */
export const metadata: Metadata = {
  title: "PDF 제출 안내는 이력서 만들기로 옮겼습니다",
  description: "파일명 규칙과 저장 전 점검 목록을 이력서 만들기 페이지에서 확인하세요.",
  alternates: { canonical: "/resume" },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <LegacyRedirect
        to="/resume"
        title="PDF 제출 안내는 이력서 만들기로 옮겼습니다"
        note="파일명 규칙과 저장 전 점검 목록을 이력서 만들기 페이지에서 확인하세요."
      />
      <SiteFooter />
    </>
  );
}
