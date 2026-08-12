import type { Metadata } from "next";
import { LegacyRedirect } from "@/components/legacy-redirect";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/* 예전 Cardly 사이트에서 색인된 주소입니다. 새 위치로 넘겨 줍니다. */
export const metadata: Metadata = {
  title: "참석 회신 안내는 모바일 청첩장으로 옮겼습니다",
  description: "참석 여부 집계와 오시는 길은 모바일 청첩장 편집기에서 설정합니다.",
  alternates: { canonical: "/templates" },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <LegacyRedirect
        to="/templates"
        title="참석 회신 안내는 모바일 청첩장으로 옮겼습니다"
        note="참석 여부 집계와 오시는 길은 모바일 청첩장 편집기에서 설정합니다."
      />
      <SiteFooter />
    </>
  );
}
