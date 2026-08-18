import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fold } from "@/components/occasion/fold";
import { FoldedCard } from "@/components/occasion/folded-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ART, ART_SOURCE } from "@/lib/occasion/art";
import { DESIGNS, designsOf, getDesign } from "@/lib/occasion/designs";
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
  const { design: id } = await params;
  const d = find(id);
  if (!d) return { title: "초대장" };

  const o = getOccasion(d.occasion);
  const description = `${o.label} 초대장 «${d.name}». ${d.note} 링크를 누르면 카드가 3D 로 열립니다. 가입 없이 무료로 만들어 카카오톡·문자로 보냅니다.`;

  return {
    title: `${o.label} 초대장 — ${d.name}`,
    description,
    alternates: { canonical: `/invitation-card/${d.id}/` },
    openGraph: {
      type: "website",
      url: `/invitation-card/${d.id}/`,
      title: `${o.label} 초대장 «${d.name}» | Cardly`,
      description,
    },
  };
}

export default async function DesignPage({
  params,
}: PageProps<"/invitation-card/[design]">) {
  const { design: id } = await params;
  if (!find(id)) notFound();

  const design = getDesign(id);
  const occasion = getOccasion(design.occasion);
  const sample = sampleFor(design.id, design.occasion);
  const credit = design.art ? ART[design.art] : undefined;
  const siblings = designsOf(design.occasion).filter((d) => d.id !== design.id);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-28 pb-section md:pt-36">
        <div className="shell">
          <nav className="text-[0.75rem] text-muted">
            <Link href="/invitation-card/" className="hover:text-rose-deep">
              초대장
            </Link>
            <span className="mx-2">›</span>
            <Link
              href={`/invitation-card/#${occasion.id}`}
              className="hover:text-rose-deep"
            >
              {occasion.label}
            </Link>
          </nav>

          <header className="mt-6 max-w-narrow">
            <span className="eyebrow">{occasion.en}</span>
            <h1 className="mt-3 font-serif text-h1 text-ink">{design.name}</h1>
            <p className="mt-4 text-body text-ink-soft">{design.note}</p>
          </header>

          <div className="mt-block">
            <FoldedCard data={sample} />
          </div>

          <div className="mt-block flex flex-wrap justify-center gap-3">
            <Link
              href={`/invitation-card/make/?d=${design.id}`}
              className="btn btn-primary"
            >
              이 카드로 만들기
            </Link>
            <Link href="/invitation-card/" className="btn btn-ghost bg-white">
              다른 디자인 보기
            </Link>
          </div>

          <p className="mx-auto mt-8 max-w-narrow text-center text-[0.75rem] leading-relaxed text-muted">
            글은 예시입니다. 만들기로 넘어가면 그대로 고쳐 쓸 수 있습니다.
            {credit && (
              <>
                <br />
                표지 그림 · {credit.artist}, 『{credit.title}』, {credit.date} —{" "}
                {ART_SOURCE}
              </>
            )}
          </p>
        </div>

        {siblings.length > 0 && (
          <section className="mt-section">
            <div className="shell">
              <h2 className="font-serif text-h3 text-ink">
                같은 자리에 쓰는 다른 디자인
              </h2>
              <ul className="oc-grid mt-block grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
                {siblings.map((d) => (
                  <li key={d.id}>
                    <Fold design={d} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
