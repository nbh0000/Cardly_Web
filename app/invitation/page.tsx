import type { Metadata } from "next";
import { LegacyRedirect } from "@/components/legacy-redirect";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/* 예전 Cardly 사이트에서 색인된 주소입니다. 새 위치로 넘겨 줍니다. */
export const metadata: Metadata = {
  title: "초대장 만들기가 모바일 청첩장으로 바뀌었습니다",
  description: "훨씬 다양한 템플릿과 참석 회신, 링크 공유를 갖춘 모바일 청첩장 편집기로 옮겼습니다.",
  alternates: { canonical: "/templates" },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <LegacyRedirect
        to="/templates"
        title="초대장 만들기가 모바일 청첩장으로 바뀌었습니다"
        note="훨씬 다양한 템플릿과 참석 회신, 링크 공유를 갖춘 모바일 청첩장 편집기로 옮겼습니다."
      />
      <SiteFooter />
    </>
  );
}
