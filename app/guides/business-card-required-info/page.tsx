import type { Metadata } from "next";
import { LegacyRedirect } from "@/components/legacy-redirect";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/* 예전 Cardly 사이트에서 색인된 주소입니다. 새 위치로 넘겨 줍니다. */
export const metadata: Metadata = {
  title: "명함 필수 정보 안내는 명함 만들기로 옮겼습니다",
  description: "무엇을 넣고 무엇을 뺄지에 대한 기준을 명함 만들기 페이지에서 확인하세요.",
  alternates: { canonical: "/business-card" },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <LegacyRedirect
        to="/business-card"
        title="명함 필수 정보 안내는 명함 만들기로 옮겼습니다"
        note="무엇을 넣고 무엇을 뺄지에 대한 기준을 명함 만들기 페이지에서 확인하세요."
      />
      <SiteFooter />
    </>
  );
}
