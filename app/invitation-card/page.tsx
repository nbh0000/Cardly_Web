import type { Metadata } from "next";
import Link from "next/link";
import { Fold } from "@/components/occasion/fold";
import { FoldedCard } from "@/components/occasion/folded-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { DESIGNS, designsOf } from "@/lib/occasion/designs";
import { OCCASIONS, sampleFor } from "@/lib/occasion/occasions";

const DESCRIPTION = `생일·돌잔치·집들이·개업·파티·기념일 초대장을 ${DESIGNS.length}가지 디자인으로 만듭니다. 링크를 누르면 카드가 3D 로 열리고, 가입도 결제도 없이 카카오톡과 문자로 보냅니다.`;

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

/* 머리에 세워 두는 견본. 목록 첫 벌을 그대로 씁니다 — 따로 고른
   «잘 나오는 한 벌» 을 두면 홈과 목록이 어긋납니다. */
const HERO = DESIGNS[0]!;

export default function InvitationCardPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-28 pb-section md:pt-36">
        <div className="shell">
          <header className="mx-auto max-w-narrow text-center">
            <span className="eyebrow eyebrow-center">Invitation</span>
            <h1 className="mt-5 font-serif text-h1 text-ink">초대장</h1>
            <p className="mt-5 text-body text-ink-soft">
              받는 사람은 링크를 누르고, 표지를 넘겨 카드를 엽니다. 안에
              인사말과 일정이 각각 한 면씩 들어 있습니다. 만드는 데도 여는
              데도 가입이 필요 없습니다.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/invitation-card/make/" className="btn btn-primary">
                초대장 만들기
              </Link>
            </div>
          </header>

          {/* 설명 대신 물건을 둡니다. 눌러서 열어 보면 무엇인지 압니다. */}
          <div className="mt-block">
            <FoldedCard data={sampleFor(HERO.id, HERO.occasion)} />
          </div>
        </div>

        {OCCASIONS.map((o) => (
          <section key={o.id} className="mt-section" id={o.id}>
            <div className="shell">
              <header className="max-w-narrow">
                <span className="eyebrow">{o.en}</span>
                <h2 className="mt-3 font-serif text-h2 text-ink">{o.label}</h2>
                <p className="mt-3 text-caption text-ink-soft">{o.blurb}</p>
              </header>

              <ul className="oc-grid mt-block grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
                {designsOf(o.id).map((d) => (
                  <li key={d.id}>
                    <Fold design={d} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
