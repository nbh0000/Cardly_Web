import type { Metadata } from "next";
import { LegacyRedirect } from "@/components/legacy-redirect";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/* 예전 Cardly 사이트에서 색인된 주소입니다. 새 위치로 넘겨 줍니다. */
export const metadata: Metadata = {
  title: "초대 문구 안내는 모바일 청첩장으로 옮겼습니다",
  description: "인사말 예시는 모바일 청첩장 편집기의 초대 글 항목에서 바로 고를 수 있습니다.",
  alternates: { canonical: "/templates" },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <LegacyRedirect
        to="/templates"
        title="초대 문구 안내는 모바일 청첩장으로 옮겼습니다"
        note="인사말 예시는 모바일 청첩장 편집기의 초대 글 항목에서 바로 고를 수 있습니다."
      />
      <SiteFooter />
    </>
  );
}
