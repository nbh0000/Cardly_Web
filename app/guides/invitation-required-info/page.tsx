import type { Metadata } from "next";
import { LegacyRedirect } from "@/components/legacy-redirect";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/* 예전 Cardly 사이트에서 색인된 주소입니다. 새 위치로 넘겨 줍니다. */
export const metadata: Metadata = {
  title: "초대장 안내는 모바일 청첩장으로 옮겼습니다",
  description: "행사 정보를 빠짐없이 넣는 방법은 모바일 청첩장 편집기에서 항목별로 안내합니다.",
  alternates: { canonical: "/templates" },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <LegacyRedirect
        to="/templates"
        title="초대장 안내는 모바일 청첩장으로 옮겼습니다"
        note="행사 정보를 빠짐없이 넣는 방법은 모바일 청첩장 편집기에서 항목별로 안내합니다."
      />
      <SiteFooter />
    </>
  );
}
