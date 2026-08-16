import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InviteCard } from "@/components/occasion/card";
import { Fold } from "@/components/occasion/fold";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ART, ART_SOURCE } from "@/lib/occasion/art";
import { DESIGNS, designsOf } from "@/lib/occasion/designs";
import { getOccasion, sampleFor } from "@/lib/occasion/occasions";

export function generateStaticParams() {
  return DESIGNS.map((d) => ({ design: d.id }));
}

function find(id: string) {
  return DESIGNS.find((d) => d.id === id);
}

export async function generateMetadata({
  params,
}: PageProps<"/invitation-card/[design]">): Promise<Metadata> {
  const { design } = await params;
  const d = find(design);
  if (!d) return { title: "초대장" };

  const o = getOccasion(d.occasion);
  const description = `${o.label} 모바일 초대장 «${d.name}». ${d.note} 링크를 누르면 카드가 3D로 열립니다.`;

  return {
    title: `${d.name} — ${o.label} 모바일 초대장`,
    description,
    alternates: { canonical: `/invitation-card/${d.id}/` },
    openGraph: {
      type: "website",
      url: `/invitation-card/${d.id}/`,
      title: `${d.name} | Cardly 모바일 초대장`,
      description,
    },
  };
}

export default async function DesignPage({
  params,
}: PageProps<"/invitation-card/[design]">) {
  const { design: id } = await params;
  const design = find(id);
  if (!design) notFound();

  const occasion = getOccasion(design.occasion);
  const sample = sampleFor(design.id, design.occasion);
  const credit = ART[design.art];
  const siblings = designsOf(design.occasion).filter((d) => d.id !== design.id);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-24 pb-section md:pt-32">
        {/* ── 카드 ──
            설명을 먼저 읽히지 않습니다. 초대장은 열어 보면 아는 물건이라,
            누를 수 있는 실물을 맨 위에 둡니다. */}
        <section className="bg-cream/60 py-block">
          <div className="shell">
            <div className="mx-auto max-w-narrow text-center">
              <span className="eyebrow eyebrow-center">
                {occasion.en} · {occasion.label}
              </span>
              <h1 className="mt-4 font-serif text-h1 text-ink">{design.name}</h1>
              <p className="mt-4 text-caption text-ink-soft">
                아래 카드를 눌러 보세요. 받는 사람 화면 그대로입니다.
              </p>
            </div>

            <div className="mt-block">
              <InviteCard data={sample} lockScroll={false} />
            </div>

            <div className="mt-block flex flex-wrap justify-center gap-2">
              <Link
                href={`/invitation-card/make/?d=${design.id}`}
                className="btn btn-primary"
              >
                이 디자인으로 만들기
              </Link>
              <Link href="/invitation-card/" className="btn btn-ghost bg-white">
                다른 디자인 보기
              </Link>
            </div>
          </div>
        </section>

        {/* ── 그림 출처 ── */}
        {credit && (
          <section className="shell mt-section">
            <div className="mx-auto max-w-narrow rounded-lg border border-line bg-white p-6 text-center">
              <p className="eyebrow eyebrow-center">Cover Artwork</p>
              <p className="mt-4 font-serif text-h3 text-ink">
                {credit.artist}, 『{credit.title}』
              </p>
              <p className="mt-1.5 text-caption text-ink-soft">{credit.date}</p>
              <p className="mt-4 text-[0.75rem] text-muted">
                {ART_SOURCE} —{" "}
                <a
                  href={credit.url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2 hover:text-rose-deep"
                >
                  소장품 보기
                </a>
              </p>
            </div>
          </section>
        )}

        {/* ── 같은 행사의 다른 카드 ── */}
        {siblings.length > 0 && (
          <section className="shell mt-section border-t border-line pt-block">
            <h2 className="text-center font-serif text-h2 text-ink">
              {occasion.label} 카드 더 보기
            </h2>
            <ul className="mt-block grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 md:gap-x-10">
              {siblings.map((d) => (
                <li key={d.id}>
                  <Fold design={d} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
