import type { Metadata } from "next";
import { MakerEntry } from "@/components/occasion/maker-entry";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "초대장 만들기",
  description:
    "생일·돌잔치·집들이·개업·파티·기념일 초대장을 만들어 카카오톡·문자로 보냅니다. 지금은 여는 기간이라 링크 발행과 참석 회신까지 전부 무료입니다.",
  alternates: { canonical: "/invitation-card/make/" },
};

export default function MakePage() {
  return (
    <>
      <SiteHeader />
      {/* 만드는 화면에는 푸터를 두지 않습니다. 아래에 «보내기» 단추가
          고정되어 있어 겹칩니다. */}
      <main id="main" className="flex-1 pt-16 md:pt-20">
        <MakerEntry />
      </main>
    </>
  );
}
