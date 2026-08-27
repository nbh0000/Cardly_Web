import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TemplateThumb } from "@/components/print/thumb";
import { findTemplate, PRINT_TEMPLATES, templatesFor } from "@/lib/print/templates";
import { findArt } from "@/lib/print/art";
import { findCategory } from "@/lib/print/specs";
import { industryLabel, paletteLabel, styleLabel } from "@/lib/print/taxonomy";
import { formatPrice, PRICES } from "@/lib/plan";

/**
 * 템플릿 한 장을 크게 보여 주는 자리 — /print/t/<아이디>/
 *
 * 목록에서 바로 편집기로 넘기지 않는 이유는, 인쇄물은 «열어 보기 전에
 * 규격과 양면 여부를 알아야 하는» 물건이기 때문입니다. 여기서 크게 보고,
 * 무엇이 들어 있는지 읽고, 그 다음에 엽니다.
 *
 * 배경 그림을 만든 프롬프트도 여기 적습니다. 우리가 어떻게 만들었는지를
 * 숨기지 않는 편이 낫고, 사용자가 «비슷한 다른 그림» 을 AI 로 뽑을 때
 * 그대로 참고할 수 있습니다.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return PRINT_TEMPLATES.map((t) => ({ template: t.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/print/t/[template]">): Promise<Metadata> {
  const { template } = await params;
  const t = findTemplate(template);
  if (!t) return { title: "인쇄물 템플릿" };
  const c = findCategory(t.category);
  const description = `${t.note} ${c?.label} · ${t.doc.width} × ${t.doc.height} mm · ${industryLabel(t.industry)} · ${styleLabel(t.style)}. 글자와 사진을 바꾸고 인쇄용 PDF 로 내려받습니다.`;
  return {
    title: `${t.name} — ${c?.label} 템플릿`,
    description,
    alternates: { canonical: `/print/t/${t.id}/` },
    openGraph: {
      type: "website",
      url: `/print/t/${t.id}/`,
      title: `${t.name} | Cardly ${c?.label}`,
      description,
      images: [{ url: `/og/print-${t.category}.jpg`, width: 1200, height: 630 }],
    },
  };
}

export default async function PrintTemplatePage({ params }: PageProps<"/print/t/[template]">) {
  const { template } = await params;
  const t = findTemplate(template);
  if (!t) notFound();

  const c = findCategory(t.category)!;
  const hasBack = t.doc.duplex && t.doc.elements.some((e) => e.side === "back");
  const siblings = templatesFor(t.category).filter((o) => o.id !== t.id);
  const arts = (t.art ?? []).map((id) => findArt(id)).filter(Boolean);

  const counts = {
    text: t.doc.elements.filter((e) => e.kind === "text").length,
    image: t.doc.elements.filter((e) => e.kind === "image").length,
    shape: t.doc.elements.filter((e) => e.kind === "shape").length,
  };

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-28 pb-section md:pt-32">
        <div className="shell">
          <p className="text-caption text-muted">
            <Link href="/print" className="hover:text-ink">
              인쇄물
            </Link>
            {" · "}
            <Link href={`/print/${c.id}`} className="hover:text-ink">
              {c.label}
            </Link>
          </p>

          <div className="mt-6 grid gap-block lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="pv-stage">
              <TemplateThumb template={t} box={{ w: 520, h: 620 }} className="pv-paper" />
              {hasBack && (
                <TemplateThumb
                  template={t}
                  side="back"
                  box={{ w: 520, h: 620 }}
                  className="pv-paper"
                />
              )}
            </div>

            <aside>
              <h1 className="font-serif text-h1 text-ink">{t.name}</h1>
              <p className="mt-3 text-body text-ink-soft">{t.note}</p>

              <Link
                href={`/print/${c.id}/edit/?t=${t.id}`}
                className="btn btn-primary mt-7 w-full justify-center"
              >
                이 템플릿으로 시작
              </Link>
              <p className="mt-3 text-[0.75rem] text-muted">
                고쳐 보는 것은 무료입니다. 워터마크 없는 원본 파일은{" "}
                {formatPrice(PRICES.print)}입니다.
              </p>

              <dl className="pv-specs">
                <Spec label="규격">
                  {t.doc.width} × {t.doc.height} mm
                </Spec>
                <Spec label="인쇄 해상도">{t.doc.dpi} dpi</Spec>
                <Spec label="재단 여백">{t.doc.bleed} mm</Spec>
                <Spec label="안전선">{t.doc.safe} mm</Spec>
                <Spec label="면">{hasBack ? "앞뒤 양면" : "단면"}</Spec>
                {t.doc.perforation && <Spec label="절취선">있음</Spec>}
                <Spec label="요소">
                  글자 {counts.text} · 사진 {counts.image} · 도형 {counts.shape}
                </Spec>
                <Spec label="업종">{industryLabel(t.industry)}</Spec>
                <Spec label="스타일">{styleLabel(t.style)}</Spec>
                <Spec label="색">{t.palette.map(paletteLabel).join(" · ")}</Spec>
              </dl>

              {arts.length > 0 && (
                <section className="pv-art">
                  <h2>배경 그림</h2>
                  {arts.map((a) => (
                    <div key={a!.id}>
                      <p className="pv-art-note">{a!.note}</p>
                      <p className="pv-art-prompt">{a!.prompt}</p>
                      <p className="pv-art-meta">
                        {a!.width} × {a!.height}px · {a!.model ?? "—"}
                      </p>
                    </div>
                  ))}
                  <p className="pv-art-foot">
                    Cardly 가 직접 만든 그림입니다. 비슷한 그림이 필요하면 편집기의 AI 패널에
                    이 문장을 넣어 보세요.
                  </p>
                </section>
              )}
            </aside>
          </div>

          {siblings.length > 0 && (
            <section className="mt-block border-t border-line pt-8">
              <h2 className="text-caption text-muted">같은 갈래의 다른 템플릿</h2>
              <ul className="pv-more">
                {siblings.map((o) => (
                  <li key={o.id}>
                    <Link href={`/print/t/${o.id}`} className="pv-more-card">
                      <TemplateThumb template={o} box={{ w: 132, h: 112 }} />
                      <span>{o.name}</span>
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

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </>
  );
}
