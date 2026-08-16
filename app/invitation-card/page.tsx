import type { Metadata } from "next";
import { CardGallery } from "@/components/card/gallery";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { DESIGNS, OCCASIONS } from "@/lib/card/designs";

const DESCRIPTION = `생일·파티·집들이·돌잔치·개업·페스티벌까지 ${OCCASIONS.length}가지 행사, 카드 ${DESIGNS.length}장. 반 고흐·세잔·마네의 퍼블릭 도메인 명화를 앞면에 앉힌 접힌 카드에 손으로 글을 쓰고 링크로 보내세요. 가입도 결제도 없습니다.`;

export const metadata: Metadata = {
  title: "모바일 초대장 — 접어서 보내는 카드",
  description: DESCRIPTION,
  keywords: [
    "모바일 초대장",
    "초대장 만들기",
    "생일 초대장",
    "파티 초대장",
    "집들이 초대장",
    "돌잔치 초대장",
    "개업 초대장",
    "온라인 카드",
  ],
  alternates: { canonical: "/invitation-card/" },
  openGraph: {
    type: "website",
    url: "/invitation-card/",
    title: "모바일 초대장 — 접어서 보내는 카드 | Cardly",
    description: DESCRIPTION,
  },
};

export default function InvitationCardPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-28 pb-section md:pt-36">
        <div className="shell">
          <header className="mx-auto max-w-narrow text-center">
            <span className="eyebrow eyebrow-center">Invitation Cards</span>
            <h1 className="mt-5 font-serif text-h1 text-ink">
              접어서 보내는 초대장
            </h1>
            <p className="mt-5 text-body text-ink-soft">
              긴 페이지가 아니라 카드 한 장입니다. 앞면에 그림, 안쪽에 행사
              정보와 손으로 쓴 글, 뒷면에 오시는 길. 카드를 눌러 펼쳐 보고
              마음에 들면 그 자리에서 쓰기 시작하세요.
            </p>
            <p className="mt-4 text-body text-ink-soft">
              앞면 그림은 반 고흐, 팡탱라투르, 세잔, 마네처럼 실제 미술관에
              걸린 작품입니다. 메트로폴리탄 미술관이 퍼블릭 도메인으로 푼
              것을 카드 크기에 맞춰 앉혔습니다.
            </p>
          </header>

          <div className="mx-auto mt-8 max-w-narrow rounded-lg border border-line bg-cream p-6 text-center">
            <p className="text-caption text-ink-soft">
              가입도 결제도 없습니다. 링크를 만들면 카드 내용이 주소 안에
              통째로 담기므로 서버에 아무것도 남지 않고, 그래서 값을 받을
              것도 없습니다.
            </p>
          </div>

          <div className="mt-block">
            <CardGallery />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
