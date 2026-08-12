import type { Metadata } from "next";
import { LegacyRedirect } from "@/components/legacy-redirect";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/* 예전 Cardly 사이트에서 색인된 주소입니다. 새 위치로 넘겨 줍니다. */
export const metadata: Metadata = {
  title: "소개 페이지가 첫 화면으로 합쳐졌습니다",
  description: "Cardly가 무엇을 만들 수 있는 곳인지는 첫 화면에서 바로 확인할 수 있습니다.",
  alternates: { canonical: "/" },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <LegacyRedirect
        to="/"
        title="소개 페이지가 첫 화면으로 합쳐졌습니다"
        note="Cardly가 무엇을 만들 수 있는 곳인지는 첫 화면에서 바로 확인할 수 있습니다."
      />
      <SiteFooter />
    </>
  );
}
