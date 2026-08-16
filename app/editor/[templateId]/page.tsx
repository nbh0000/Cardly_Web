import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Editor } from "@/components/editor/editor";
import { getTemplate, TEMPLATES } from "@/lib/invitation";
import { OCCASION_TEMPLATES } from "@/lib/occasion-templates";

export function generateStaticParams() {
  return [...TEMPLATES, ...OCCASION_TEMPLATES].map((t) => ({
    templateId: t.id,
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/editor/[templateId]">): Promise<Metadata> {
  const { templateId } = await params;
  const t = getTemplate(templateId);
  return {
    title: t ? `${t.name} 편집` : "청첩장·초대장 편집",
    robots: { index: false, follow: false },
  };
}

export default async function EditorPage({
  params,
}: PageProps<"/editor/[templateId]">) {
  const { templateId } = await params;
  if (!getTemplate(templateId)) notFound();
  return <Editor templateId={templateId} />;
}
