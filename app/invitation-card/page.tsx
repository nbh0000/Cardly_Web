import type { Metadata } from "next";
import Link from "next/link";
import { Fold } from "@/components/occasion/fold";
import { SampleLinks } from "@/components/publish/sample-links";
import { Gallery } from "@/components/occasion/gallery";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { DESIGNS } from "@/lib/occasion/designs";
import { OCCASIONS } from "@/lib/occasion/occasions";

const DESCRIPTION = `결혼·돌잔치·생일·집들이·개업·파티·연말 초대장을 ${DESIGNS.length}가지 디자인으로 만듭니다. 카드에 마우스를 얹으면 그 자리에서 열리고, 링크를 발행해 카카오톡으로 보냅니다. 무료 발행은 7일 동안 열립니다.`;

export const metadata: Metadata = {
  title: `초대장 만들기 — 열리는 카드 ${DESIGNS.length}종`,
  description: DESCRIPTION,
  keywords: [
    "초대장 만들기",
    "모바일 초대장",
    "생일 초대장",
    "돌잔치 초대장",
    "집들이 초대장",
    "개업 초대장",
    "무료 초대장",
    "초대장 템플릿",
    "온라인 초대장",
    "초대장 링크",
  ],
  alternates: { canonical: "/invitation-card/" },
  openGraph: {
    type: "website",
    url: "/invitation-card/",
    title: "초대장 만들기 | Cardly",
    description: DESCRIPTION,
  },
};

/** 갈래마다 몇 장인지 — 칩에 적습니다 */
const COUNT = Object.fromEntries(
  OCCASIONS.map((o) => [o.id, DESIGNS.filter((d) => d.occasion === o.id).length]),
);

export default function InvitationCardPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-28 pb-section md:pt-32">
        <div className="shell">
          <header className="mx-auto max-w-narrow text-center">
            <span className="eyebrow eyebrow-center">Invitation Cards</span>
            <h1 className="mt-5 font-serif text-h1 text-ink">초대장</h1>
            <p className="mt-5 text-body text-ink-soft">
              카드에 마우스를 얹으면 그 자리에서 열립니다. 받는 사람도
              똑같이, 링크를 누르고 표지를 넘겨 엽니다. 안에는 인사말과
              일정이 한 면씩 들어 있습니다.
            </p>
            <p className="mt-3 text-caption text-muted">
              디자인 {DESIGNS.length}종 · 링크 발행은 무료, 참석 회신까지
            </p>
          </header>

          <div className="mt-block">
            <Gallery count={COUNT}>
              {DESIGNS.map((d) => (
                <li key={d.id} data-o={d.occasion}>
                  <Fold design={d} />
                </li>
              ))}
            </Gallery>
          </div>

          <div className="mt-block text-center">
            <Link href="/invitation-card/make/" className="btn btn-primary">
              빈 카드로 시작하기
            </Link>
          </div>
        </div>

        {/* 고르기 전에 «받는 화면» 을 열어 볼 수 있어야 합니다. */}
        <div className="mt-section border-t border-line-soft pt-section">
          <SampleLinks
            kind="occasion"
            title="샘플 초대장 열어보기"
            note="받는 사람이 여는 화면 그대로입니다. 표지를 눌러 보세요."
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
