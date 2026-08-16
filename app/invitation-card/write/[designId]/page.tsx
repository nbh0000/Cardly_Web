import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardWriter } from "@/components/card/writer";
import { DESIGNS, getDesign } from "@/lib/card/designs";

export function generateStaticParams() {
  return DESIGNS.map((d) => ({ designId: d.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/invitation-card/write/[designId]">): Promise<Metadata> {
  const { designId } = await params;
  const design = getDesign(designId);
  return {
    title: design ? `${design.name} 카드에 쓰기` : "카드에 쓰기",
    // 편집 화면은 색인될 이유가 없습니다.
    robots: { index: false, follow: false },
  };
}

export default async function WritePage({
  params,
}: PageProps<"/invitation-card/write/[designId]">) {
  const { designId } = await params;
  const design = getDesign(designId);
  if (!design) notFound();
  return <CardWriter design={design} />;
}
