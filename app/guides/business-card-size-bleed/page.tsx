import type { Metadata } from "next";
import { LegacyRedirect } from "@/components/legacy-redirect";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/* 예전 Cardly 사이트에서 색인된 주소입니다. 새 위치로 넘겨 줍니다. */
export const metadata: Metadata = {
  title: "인쇄 규격 안내는 명함 만들기로 옮겼습니다",
  description: "90 × 50 mm 규격과 재단 안전선은 명함 만들기 편집기에서 바로 보면서 작업할 수 있습니다.",
  alternates: { canonical: "/business-card" },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <LegacyRedirect
        to="/business-card"
        title="인쇄 규격 안내는 명함 만들기로 옮겼습니다"
        note="90 × 50 mm 규격과 재단 안전선은 명함 만들기 편집기에서 바로 보면서 작업할 수 있습니다."
      />
      <SiteFooter />
    </>
  );
}
