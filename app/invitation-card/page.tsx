import type { Metadata } from "next";
import { OccasionGallery } from "@/components/occasion-gallery";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { OCCASIONS } from "@/lib/occasion";
import { formatPrice, PREMIUM_PRICE } from "@/lib/plan";

const DESCRIPTION = `생일·파티·집들이·돌잔치·개업·페스티벌까지 ${OCCASIONS.length}가지 행사 초대장을 가입 없이 만들어 보세요. 3D로 펼쳐지는 오프닝과 화면 효과까지 값 없이 씁니다.`;

export const metadata: Metadata = {
  title: "모바일 초대장 만들기 — 생일·파티·집들이",
  description: DESCRIPTION,
  keywords: [
    "모바일 초대장",
    "초대장 만들기",
    "생일 초대장",
    "파티 초대장",
    "집들이 초대장",
    "돌잔치 초대장",
    "개업 초대장",
  ],
  alternates: { canonical: "/invitation-card/" },
  openGraph: {
    type: "website",
    url: "/invitation-card/",
    title: "모바일 초대장 만들기 | Cardly",
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
            <span className="eyebrow eyebrow-center">Invitation</span>
            <h1 className="mt-5 font-serif text-h1 text-ink">모바일 초대장</h1>
            <p className="mt-5 text-body text-ink-soft">
              생일, 파티, 집들이, 돌잔치, 개업, 페스티벌까지. 행사를 고르면
              문구가 채워진 채로 편집기가 열리고, 청첩장과 같은 3D 오프닝과
              화면 효과를 그대로 쓸 수 있습니다.
            </p>
          </header>

          {/* 청첩장과 같은 조건입니다 — 만드는 것은 무료, 링크 발행은 준비 중.
              지킬 수 없는 약속을 다시 만들지 않으려고 여기에 먼저 적습니다. */}
          <div className="mx-auto mt-8 max-w-narrow rounded-lg border border-line bg-cream p-6 text-center">
            <p className="text-caption text-ink-soft">
              만들고 미리 보는 것은 값이 들지 않습니다. 하객에게 보낼 내 초대장
              링크를 만드는 기능은 청첩장과 함께 준비 중이고, 열리면 초대장
              하나당 {formatPrice(PREMIUM_PRICE)}으로 한 번만 결제하는 방식이
              될 예정입니다. 그전까지는 결제를 받지 않습니다.
            </p>
          </div>

          <div className="mt-block">
            <OccasionGallery />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
