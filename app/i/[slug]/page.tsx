import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardStage } from "@/components/invitation/card-stage";
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
  if (!rec) return { title: "청첩장 · 초대장" };

  const data = getInvitationData(rec);
  const groom = fullName(data.groom);
  const bride = fullName(data.bride);
  /* 초대장은 두 사람의 결혼이 아닙니다 — 행사 이름과 주최자로 뜹니다. */
  const fallback = data.occasion
    ? [data.eventTitle, data.hostName].filter(Boolean).join(" · ")
    : `${groom} ♥ ${bride} 결혼합니다`;
  const title = data.shareTitle || fallback;
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

  const body = (
    <div className="md:h-[calc(100dvh-11rem)] md:overflow-y-auto md:overscroll-contain md:rounded-[1.5rem]">
      <InvitationView template={template} data={data} />
    </div>
  );

  return (
    <div className={`min-h-dvh ${data.occasion ? "bg-sand" : "bg-cream"}`}>
      {/* 모바일에서는 전체 화면, 데스크톱에서는 폰 프레임 안에 */}
      <div className="mx-auto max-w-[26rem] md:py-10">
        {data.occasion ? (
          /* 초대장은 받는 사람 화면에서도 카드입니다. 링크를 누른 첫
             장면이 접힌 카드가 3D 로 펴지는 것이고, 펴진 뒤에도 카드
             안에서 읽습니다. */
          <div className="iv-stage-md px-3 pt-6 md:px-0 md:pt-0">
            <CardStage>{body}</CardStage>
          </div>
        ) : (
          <div className="iv-stage-md md:overflow-hidden md:rounded-phone md:bg-white md:p-2 md:shadow-lift md:ring-1 md:ring-line">
            {body}
          </div>
        )}

        <ShareBar slug={slug} />
      </div>
    </div>
  );
}
