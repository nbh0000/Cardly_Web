import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvitationView } from "@/components/invitation/invitation-view";
import { ShareBar } from "@/components/invitation/share-bar";
import {
  getInvitationData,
  getInvitationRecord,
  getInvitationTemplate,
  listInvitations,
  ogImagePath,
} from "@/lib/invitations";
import { formatDateKo, formatTimeKo, fullName } from "@/lib/invitation";

export function generateStaticParams() {
  return listInvitations().map((r) => ({ slug: r.slug }));
}

/**
 * 카카오톡·문자 링크 미리보기는 여기서 만들어지는 <meta> 를 그대로 읽습니다.
 * 카카오 크롤러는 자바스크립트를 실행하지 않기 때문에, 청첩장마다 다른
 * 제목·사진이 뜨려면 이렇게 청첩장별 HTML 이 미리 만들어져 있어야 합니다.
 */
export async function generateMetadata({
  params,
}: PageProps<"/i/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const rec = getInvitationRecord(slug);
  if (!rec) return { title: "청첩장" };

  const data = getInvitationData(rec);
  const groom = fullName(data.groom);
  const bride = fullName(data.bride);
  const title = data.shareTitle || `${groom} ♥ ${bride} 결혼합니다`;
  // 미리보기 설명은 한 줄이어야 합니다. 줄바꿈이 들어가면 메타 태그가
  // 통째로 빠져 카카오톡에서 설명이 사라집니다.
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
    // 청첩장은 검색에 걸릴 필요가 없습니다.
    robots: { index: false, follow: false },
  };
}

export default async function InvitationPage({ params }: PageProps<"/i/[slug]">) {
  const { slug } = await params;
  const rec = getInvitationRecord(slug);
  if (!rec) notFound();

  const template = getInvitationTemplate(rec);
  if (!template) notFound();

  const data = getInvitationData(rec);

  return (
    <div className="min-h-dvh bg-cream">
      {/* 모바일에서는 전체 화면, 데스크톱에서는 폰 프레임 안에 */}
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
