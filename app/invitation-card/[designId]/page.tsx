import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CardBook } from "@/components/card/card-book";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { DESIGNS, getDesign, getOccasion } from "@/lib/card/designs";
import { createDoc } from "@/lib/card/doc";

export function generateStaticParams() {
  return DESIGNS.map((d) => ({ designId: d.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/invitation-card/[designId]">): Promise<Metadata> {
  const { designId } = await params;
  const design = getDesign(designId);
  if (!design) return { title: "초대장 카드" };
  const occasion = getOccasion(design.occasion)!;
  const description = `${occasion.label} 초대장 «${design.name}». ${occasion.blurb}. 접힌 카드 한 장에 손으로 쓰고 링크로 보내세요.`;
  return {
    title: `${design.name} — ${occasion.label} 초대장`,
    description,
    alternates: { canonical: `/invitation-card/${design.id}/` },
    openGraph: {
      type: "website",
      url: `/invitation-card/${design.id}/`,
      title: `${design.name} — ${occasion.label} 초대장 | Cardly`,
      description,
    },
  };
}

export default async function CardDetailPage({
  params,
}: PageProps<"/invitation-card/[designId]">) {
  const { designId } = await params;
  const design = getDesign(designId);
  if (!design) notFound();

  const occasion = getOccasion(design.occasion)!;
  const doc = createDoc(design.id);
  const siblings = DESIGNS.filter(
    (d) => d.occasion === design.occasion && d.id !== design.id,
  );

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-28 pb-section md:pt-36">
        <div className="shell">
          <nav className="text-caption text-muted" aria-label="위치">
            <Link href="/invitation-card" className="hover:text-ink">
              초대장
            </Link>
            <span className="mx-2">›</span>
            <span>{occasion.label}</span>
            <span className="mx-2">›</span>
            <span className="text-ink-soft">{design.name}</span>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
            {/* 카드 — 열면 저절로 펴집니다 */}
            <CardBook design={design} doc={doc} autoOpen />

            <div>
              <span className="eyebrow">{occasion.label}</span>
              <h1 className="mt-4 font-serif text-h1 text-ink">{design.name}</h1>
              {design.plate && (
                <p className="mt-3 text-caption text-muted">
                  «{design.plate.title}» · {design.plate.artist} ·{" "}
                  {design.plate.date}
                </p>
              )}
              <p className="mt-4 text-body text-ink-soft">{occasion.blurb}.</p>

              <div className="mt-8 grid gap-2 sm:max-w-sm">
                <Link
                  href={`/invitation-card/write/${design.id}/`}
                  className="btn btn-primary"
                >
                  이 카드에 쓰기
                </Link>
                <Link
                  href="/invitation-card"
                  className="btn btn-ghost bg-white"
                >
                  다른 카드 보기
                </Link>
              </div>

              <section className="mt-10 border-t border-line pt-8">
                <h2 className="font-serif text-h3 text-ink">카드의 네 면</h2>
                <dl className="mt-4 grid gap-3 text-caption">
                  {[
                    ["앞면", "그림과 행사 이름. 받은 분이 가장 먼저 보는 면입니다."],
                    ["안쪽 왼쪽", "언제, 어디서, 누가. 인쇄된 것처럼 조판됩니다."],
                    ["안쪽 오른쪽", "손으로 쓴 글. 글씨체와 크기를 고를 수 있습니다."],
                    ["뒷면", "오시는 길, 안내, 참석 회신받을 곳."],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-4">
                      <dt className="w-24 shrink-0 text-muted">{k}</dt>
                      <dd className="text-ink-soft">{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              {design.plate && (
                <section className="mt-8 border-t border-line pt-8">
                  <h2 className="font-serif text-h3 text-ink">앞면 그림</h2>
                  <p className="mt-3 text-caption text-ink-soft">
                    «{design.plate.title}», {design.plate.artist},{" "}
                    {design.plate.date}. 메트로폴리탄 미술관 오픈액세스로
                    공개된 퍼블릭 도메인 작품이라 상업적 이용에 제약이
                    없습니다. 카드 뒷면에도 같은 내용이 적힙니다.
                  </p>
                </section>
              )}

              <section className="mt-8 border-t border-line pt-8">
                <h2 className="font-serif text-h3 text-ink">보내는 방법</h2>
                <p className="mt-3 text-caption text-ink-soft">
                  다 쓰고 «링크 만들기»를 누르면 주소가 하나 나옵니다. 카드
                  내용이 그 주소 안에 통째로 담기므로 서버에 저장되는 것이
                  없고, 받는 분이 링크를 누르면 그 자리에서 카드가 펴집니다.
                </p>
              </section>
            </div>
          </div>

          {siblings.length > 0 && (
            <section className="mt-section border-t border-line pt-block">
              <h2 className="font-serif text-h3 text-ink">
                같은 {occasion.label} 카드
              </h2>
              <ul className="mt-6 flex flex-wrap gap-2">
                {siblings.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/invitation-card/${d.id}/`}
                      className="inline-block rounded-full border border-line bg-white px-4 py-2 text-caption text-ink-soft transition-colors hover:border-rose hover:text-ink"
                    >
                      {d.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
