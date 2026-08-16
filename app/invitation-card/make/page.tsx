import type { Metadata } from "next";
import { MakerEntry } from "@/components/occasion/maker-entry";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "초대장 만들어 보내기",
  description:
    "행사 정보를 채우면 카드가 바로 바뀝니다. 가입도 결제도 없이 만들고, 링크 하나로 카카오톡이나 문자로 보냅니다.",
  alternates: { canonical: "/invitation-card/make/" },
  robots: { index: false },
};

export default function MakePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-24 md:pt-28">
        <MakerEntry />
      </main>
      <SiteFooter />
    </>
  );
}
