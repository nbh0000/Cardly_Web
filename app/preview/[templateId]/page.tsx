import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InvitationView } from "@/components/invitation/invitation-view";
import { createDefaultData, getTemplate, TEMPLATES } from "@/lib/invitation";

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ templateId: t.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/preview/[templateId]">): Promise<Metadata> {
  const { templateId } = await params;
  const t = getTemplate(templateId);
  return { title: t ? `${t.name} 미리보기` : "미리보기" };
}

export default async function PreviewPage({
  params,
}: PageProps<"/preview/[templateId]">) {
  const { templateId } = await params;
  const template = getTemplate(templateId);
  if (!template) notFound();

  const data = createDefaultData(template.id);

  return (
    <div className="min-h-dvh bg-cream">
      {/* 데스크톱에서는 폰 프레임 안에, 모바일에서는 전체 화면으로 */}
      <div className="mx-auto max-w-[26rem] md:py-10">
        {/*
          데스크톱에서는 폰 프레임을 화면 높이로 묶고 그 안에서 스크롤시킵니다.
          프레임 높이가 청첩장 전체 길이(수천 px)만큼 늘어나면 iv-stage-md 로
          가둔 바텀 시트가 프레임 맨 아래 — 화면 밖 — 에 그려집니다.
        */}
        <div className="iv-stage-md md:overflow-hidden md:rounded-phone md:bg-white md:p-2 md:shadow-lift md:ring-1 md:ring-line">
          <div className="md:h-[calc(100dvh-11rem)] md:overflow-y-auto md:overscroll-contain md:rounded-[1.5rem]">
            <InvitationView template={template} data={data} />
          </div>
        </div>

        <div className="flex gap-2 px-4 py-6 md:px-0">
          <Link href="/templates" className="btn btn-ghost flex-1 bg-ivory">
            다른 템플릿
          </Link>
          <Link href={`/editor/${template.id}`} className="btn btn-primary flex-1">
            이 템플릿으로 만들기
          </Link>
        </div>
      </div>
    </div>
  );
}
