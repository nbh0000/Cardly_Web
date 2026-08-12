import type { Metadata } from "next";
import { LegacyRedirect } from "@/components/legacy-redirect";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/* 예전 Cardly 사이트에서 색인된 주소입니다. 새 위치로 넘겨 줍니다. */
export const metadata: Metadata = {
  title: "이력서 작성법은 이력서 만들기로 옮겼습니다",
  description: "좋은 이력서를 만드는 기준을 이력서 만들기 페이지 아래에서 확인하세요.",
  alternates: { canonical: "/resume" },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <LegacyRedirect
        to="/resume"
        title="이력서 작성법은 이력서 만들기로 옮겼습니다"
        note="좋은 이력서를 만드는 기준을 이력서 만들기 페이지 아래에서 확인하세요."
      />
      <SiteFooter />
    </>
  );
}
