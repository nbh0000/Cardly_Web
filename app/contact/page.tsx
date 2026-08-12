import type { Metadata } from "next";
import { LegacyRedirect } from "@/components/legacy-redirect";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/* 예전 Cardly 사이트에서 색인된 주소입니다. 새 위치로 넘겨 줍니다. */
export const metadata: Metadata = {
  title: "문의는 첫 화면 아래 안내를 이용해 주세요",
  description: "고객 문의 주소는 모든 페이지 맨 아래에 적어 두었습니다.",
  alternates: { canonical: "/" },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <LegacyRedirect
        to="/"
        title="문의는 첫 화면 아래 안내를 이용해 주세요"
        note="고객 문의 주소는 모든 페이지 맨 아래에 적어 두었습니다."
      />
      <SiteFooter />
    </>
  );
}
