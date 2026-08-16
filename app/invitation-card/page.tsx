import type { Metadata } from "next";
import Link from "next/link";
import { Fold } from "@/components/occasion/fold";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { DESIGNS, designsOf } from "@/lib/occasion/designs";
import { OCCASIONS } from "@/lib/occasion/occasions";

const DESCRIPTION = `링크를 누르면 3D로 펼쳐지는 모바일 초대장. 생일·돌잔치·집들이·개업·파티·기념일 ${DESIGNS.length}종. 가입 없이 만들어 카카오톡이나 문자로 바로 보냅니다.`;

export const metadata: Metadata = {
  title: "모바일 초대장 — 3D로 열리는 카드",
  description: DESCRIPTION,
  keywords: [
    "모바일 초대장",
    "웹 초대장",
    "초대장 만들기",
    "생일 초대장",
    "돌잔치 초대장",
    "집들이 초대장",
    "개업 초대장",
    "파티 초대장",
  ],
  alternates: { canonical: "/invitation-card/" },
  openGraph: {
    type: "website",
    url: "/invitation-card/",
    title: "모바일 초대장 | Cardly",
    description: DESCRIPTION,
  },
};

export default function InvitationCardIndex() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-28 pb-section md:pt-36">
        <div className="shell">
          <header className="mx-auto max-w-narrow text-center">
            <span className="eyebrow eyebrow-center">Invitation</span>
            <h1 className="mt-5 font-serif text-h1 text-ink">모바일 초대장</h1>
            <p className="mt-5 text-body text-ink-soft">
              링크를 받은 사람 앞에 «닫힌 카드»가 놓입니다. 앞장을 누르면
              그 장이 왼쪽으로 넘어가며 열리고, 그 아래에서 초대장이
              드러납니다. 만드는 데 가입도 결제도 없고, 다 만들면
              카카오톡이나 문자로 바로 보냅니다.
            </p>
          </header>

          {/* 행사 고르기 — cardly 의 목록처럼 위에 갈래를 걸어 둡니다 */}
          <nav
            aria-label="행사 갈래"
            className="mt-block flex flex-wrap justify-center gap-2"
          >
            {OCCASIONS.map((o) => (
              <a
                key={o.id}
                href={`#${o.id}`}
                className="inline-flex min-h-[44px] items-center rounded-full border border-line bg-white px-4 text-caption text-ink-soft transition-colors hover:border-rose hover:text-rose-deep"
              >
                {o.label}
              </a>
            ))}
          </nav>
        </div>

        {OCCASIONS.map((o, i) => (
          <section
            key={o.id}
            id={o.id}
            className={`shell scroll-mt-28 ${i === 0 ? "mt-section" : "mt-section border-t border-line pt-block"}`}
          >
            <div className="mx-auto max-w-narrow text-center">
              <span className="eyebrow eyebrow-center">{o.en}</span>
              <h2 className="mt-4 font-serif text-h2 text-ink">{o.label}</h2>
              <p className="mt-3 text-caption text-ink-soft">{o.blurb}</p>
            </div>

            <ul className="mt-block grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 md:gap-x-10 lg:mx-auto lg:max-w-4xl">
              {designsOf(o.id).map((d) => (
                <li key={d.id}>
                  <Fold design={d} />
                </li>
              ))}
            </ul>
          </section>
        ))}

        <div className="shell mt-section text-center">
          <Link href="/invitation-card/make/" className="btn btn-primary">
            바로 만들어 보기
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
