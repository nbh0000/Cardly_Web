import type { Metadata } from "next";
import { LegacyRedirect } from "@/components/legacy-redirect";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/* 예전 Cardly 사이트에서 색인된 주소입니다. 새 위치로 넘겨 줍니다. */
export const metadata: Metadata = {
  title: "이력서 예시는 이력서 만들기로 옮겼습니다",
  description: "직무별 성과 문장 예시를 이력서 만들기 페이지에서 확인하세요.",
  alternates: { canonical: "/resume" },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <LegacyRedirect
        to="/resume"
        title="이력서 예시는 이력서 만들기로 옮겼습니다"
        note="직무별 성과 문장 예시를 이력서 만들기 페이지에서 확인하세요."
      />
      <SiteFooter />
    </>
  );
}
