import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CardStage } from "@/components/invitation/card-stage";
import { InvitationView } from "@/components/invitation/invitation-view";
import { createDefaultData, getTemplate, TEMPLATES } from "@/lib/invitation";
import { createDataForTemplate, occasionOf } from "@/lib/occasion";
import { OCCASION_TEMPLATES } from "@/lib/occasion-templates";

export function generateStaticParams() {
  return [...TEMPLATES, ...OCCASION_TEMPLATES].map((t) => ({
    templateId: t.id,
  }));
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

  /* 초대장 템플릿은 자기가 어느 행사의 것인지 알고 있습니다. 그래서
     주소에 아무것도 붙이지 않아도 행사 기본값으로 열립니다. */
  const kind = occasionOf(template.id);
  const data = kind ? createDataForTemplate(template.id) : createDefaultData(template.id);

  const body = (
    <div className="md:h-[calc(100dvh-11rem)] md:overflow-y-auto md:overscroll-contain md:rounded-[1.5rem]">
      <InvitationView template={template} data={data} />
    </div>
  );

  return (
    <div className={`min-h-dvh ${kind ? "bg-sand" : "bg-cream"}`}>
      <div className="mx-auto max-w-[26rem] md:py-10">
        {kind ? (
          /* 초대장은 어디서 보든 카드입니다 — 미리보기도 3D 로 세웁니다.
             링크를 열면 접힌 카드가 펴지는 오프닝부터 시작합니다. */
          <div className="iv-stage-md px-3 pt-6 md:px-0 md:pt-0">
            <CardStage>{body}</CardStage>
          </div>
        ) : (
          /*
            데스크톱에서는 폰 프레임을 화면 높이로 묶고 그 안에서 스크롤시킵니다.
            프레임 높이가 청첩장 전체 길이(수천 px)만큼 늘어나면 iv-stage-md 로
            가둔 바텀 시트가 프레임 맨 아래 — 화면 밖 — 에 그려집니다.
          */
          <div className="iv-stage-md md:overflow-hidden md:rounded-phone md:bg-white md:p-2 md:shadow-lift md:ring-1 md:ring-line">
            {body}
          </div>
        )}

        <div className="flex gap-2 px-4 py-6 md:px-0">
          <Link
            href={kind ? "/invitation-card" : "/templates"}
            className="btn btn-ghost flex-1 bg-ivory"
          >
            다른 템플릿
          </Link>
          <Link
            href={kind ? `/editor/${template.id}/?occasion=${kind}` : `/editor/${template.id}`}
            className="btn btn-primary flex-1"
          >
            이 템플릿으로 만들기
          </Link>
        </div>
      </div>
    </div>
  );
}
