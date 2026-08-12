import type { Metadata } from "next";
import { LegacyRedirect } from "@/components/legacy-redirect";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/* 예전 Cardly 사이트에서 색인된 주소입니다. 새 위치로 넘겨 줍니다. */
export const metadata: Metadata = {
  title: "가이드가 제작기 안으로 들어갔습니다",
  description: "작성 가이드는 이제 이력서·명함 제작기 페이지 아래에서 바로 볼 수 있습니다. 만들면서 확인하세요.",
  alternates: { canonical: "/" },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <LegacyRedirect
        to="/"
        title="가이드가 제작기 안으로 들어갔습니다"
        note="작성 가이드는 이제 이력서·명함 제작기 페이지 아래에서 바로 볼 수 있습니다. 만들면서 확인하세요."
      />
      <SiteFooter />
    </>
  );
}
