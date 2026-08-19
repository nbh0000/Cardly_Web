import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Viewer } from "@/components/occasion/viewer";
import { DESIGNS, findDesign } from "@/lib/occasion/designs";
import { getOccasion } from "@/lib/occasion/occasions";

/* 받은 사람이 여는 주소 — /invitation-card/v/<디자인>/?c=…

   내용은 물음표 뒤에 실려 있고, 경로에는 디자인 id 만 들어갑니다. 정적
   배포라 초대장마다 다른 미리보기 이미지를 만들 수는 없지만, 디자인마다
   HTML 을 미리 만들어 두면 각 HTML 에 그 표지 그림을 OG 로 붙일 수 있습니다.
   카카오톡에 링크를 붙였을 때 «어떤 카드가 오는지» 는 썸네일에 보입니다.

   검색엔진에는 올리지 않습니다. 개인이 개인에게 보내는 주소입니다.
   noindex 는 검색 색인만 막고 카카오톡·문자의 링크 미리보기는 그대로
   동작합니다. */

export function generateStaticParams() {
  return DESIGNS.map((d) => ({ design: d.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/invitation-card/v/[design]">): Promise<Metadata> {
  const { design: id } = await params;
  const design = findDesign(id);
  if (!design) return { title: "초대장", robots: { index: false, follow: false } };

  const occasion = getOccasion(design.occasion);
  const title = `${occasion.label} 초대장이 도착했습니다`;
  const description = "표지를 넘기면 카드가 열립니다.";

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      title,
      description,
      images: [
        {
          url: `/og/invitation-card/${design.id}.jpg`,
          width: 1200,
          height: 630,
          alt: `${design.name} 초대장`,
        },
      ],
    },
  };
}

export default async function ViewDesignPage({
  params,
}: PageProps<"/invitation-card/v/[design]">) {
  const { design: id } = await params;
  const design = findDesign(id);
  if (!design) notFound();

  return (
    <main id="main" className="flex-1 overflow-x-clip">
      <Viewer design={design} />
    </main>
  );
}
