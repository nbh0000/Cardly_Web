import type { Metadata } from "next";
import { LegacyRedirect } from "@/components/legacy-redirect";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/* 예전 Cardly 사이트에서 색인된 주소입니다. 새 위치로 넘겨 줍니다. */
export const metadata: Metadata = {
  title: "명함 글자 크기 안내는 명함 만들기로 옮겼습니다",
  description: "이름 13pt, 연락처 7.5pt 같은 인쇄 실무 크기가 편집기 기본값에 적용돼 있습니다.",
  alternates: { canonical: "/business-card" },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <LegacyRedirect
        to="/business-card"
        title="명함 글자 크기 안내는 명함 만들기로 옮겼습니다"
        note="이름 13pt, 연락처 7.5pt 같은 인쇄 실무 크기가 편집기 기본값에 적용돼 있습니다."
      />
      <SiteFooter />
    </>
  );
}
