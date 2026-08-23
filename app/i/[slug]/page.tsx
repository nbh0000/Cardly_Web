import type { Metadata } from "next";
import { InvitationView } from "@/components/invitation/invitation-view";
import { ShareBar } from "@/components/invitation/share-bar";
import { PublicView, type SeedDoc } from "@/components/publish/public-view";
import { findDesign } from "@/lib/occasion/designs";
import {
  getInvitationData,
  getInvitationRecord,
  getInvitationTemplate,
  listInvitations,
  ogImagePath,
} from "@/lib/invitations";
import { formatDateKo, formatTimeKo, fullName } from "@/lib/invitation";
import { publishedOf } from "@/lib/published-index";
import { findOccasionSample, occasionSamples } from "@/lib/samples";

/**
 * cardly.kr/i/<주소> — 발행된 초대장.
 *
 * 이 주소에는 예전에 손으로 발행하던 청첩장 몇 건이 이미 나가 있습니다.
 * 링크는 한 번 보내면 되돌릴 수 없으므로, 그 주소들은 그대로 열리게 두고
 * 새 초대장을 같은 자리에서 함께 받습니다. 새 주소는 무작위 열 글자라
 * 예전 주소와 부딪칠 일이 없습니다.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  const published = await publishedOf("occasion");
  return [
    ...listInvitations().map((r) => ({ slug: r.slug })),
    ...occasionSamples().map((s) => ({ slug: s.slug })),
    ...published.map((r) => ({ slug: r.slug })),
  ];
}

export async function generateMetadata({
  params,
}: PageProps<"/i/[slug]">): Promise<Metadata> {
  const { slug } = await params;

  /* ── 예전에 발행한 청첩장 ── */
  const rec = getInvitationRecord(slug);
  if (rec) {
    const data = getInvitationData(rec);
    const groom = fullName(data.groom);
    const bride = fullName(data.bride);
    const title = data.shareTitle || `${groom} ♥ ${bride} 결혼합니다`;
    const description = (
      data.shareDescription ||
      `${formatDateKo(data.date)} ${formatTimeKo(data.time)} · ${data.venueName}`
    )
      .replace(/\s*\n+\s*/g, " · ")
      .trim();

    return {
      title,
      description,
      openGraph: {
        type: "website",
        locale: "ko_KR",
        title,
        description,
        images: [{ url: ogImagePath(data), width: 800, height: 1000 }],
      },
      twitter: { card: "summary_large_image", title, description },
      robots: { index: false, follow: false },
    };
  }

  /* ── 초대장 ── */
  const sample = findOccasionSample(slug);
  const row = sample ? null : (await publishedOf("occasion")).find((r) => r.slug === slug);
  const data = sample?.data ?? (row?.data as Record<string, string> | undefined);
  if (!data) return { title: "초대장", robots: { index: false, follow: false } };

  const designId = sample?.designId ?? row?.design_id ?? "";
  const design = findDesign(designId);
  const title = String(data.title ?? "초대합니다").replace(/\n+/g, " ");
  const description = [data.date && formatDateKo(String(data.date)), data.place]
    .filter(Boolean)
    .join(" · ");

  return {
    title,
    description,
    openGraph: {
      type: "website",
      locale: "ko_KR",
      title,
      description,
      // 표지 그림이 곧 미리보기 그림입니다 — 어떤 카드가 오는지 보입니다.
      ...(design ? { images: [{ url: `art/${design.art}`, width: 1024, height: 1024 }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: false, follow: false },
  };
}

export default async function PublishedInvitation({ params }: PageProps<"/i/[slug]">) {
  const { slug } = await params;

  /* 예전 주소는 예전 그대로 그립니다. */
  const rec = getInvitationRecord(slug);
  if (rec) {
    const template = getInvitationTemplate(rec);
    if (template) {
      const data = getInvitationData(rec);
      return (
        <div className="min-h-dvh bg-cream">
          <div className="mx-auto max-w-[26rem] md:py-10">
            <div className="iv-stage-md md:overflow-hidden md:rounded-phone md:bg-white md:p-2 md:shadow-lift md:ring-1 md:ring-line">
              <div className="md:h-[calc(100dvh-11rem)] md:overflow-y-auto md:overscroll-contain md:rounded-[1.5rem]">
                <InvitationView template={template} data={data} />
              </div>
            </div>
            <ShareBar slug={slug} />
          </div>
        </div>
      );
    }
  }

  const sample = findOccasionSample(slug);
  const seed: SeedDoc | undefined = sample
    ? {
        kind: "occasion",
        designId: sample.designId,
        plan: "premium",
        data: sample.data,
        demo: true,
      }
    : undefined;

  return <PublicView kind="occasion" slug={slug} seed={seed} />;
}
