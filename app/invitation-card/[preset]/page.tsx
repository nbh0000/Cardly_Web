import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InviteStage } from "@/components/invite/stage";
import { getPreset, PRESETS } from "@/lib/invite/presets";

export function generateStaticParams() {
  return PRESETS.map((p) => ({ preset: p.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/invitation-card/[preset]">): Promise<Metadata> {
  const { preset } = await params;
  const p = getPreset(preset);
  if (!p) return { title: "웹 초대장" };
  const { shareTitle, shareDescription } = p.config;
  return {
    title: `${p.label} 초대장 예시 — ${shareTitle}`,
    description: shareDescription,
    alternates: { canonical: `/invitation-card/${p.id}/` },
    openGraph: {
      type: "website",
      url: `/invitation-card/${p.id}/`,
      title: shareTitle,
      description: shareDescription,
    },
  };
}

export default async function PresetPage({
  params,
}: PageProps<"/invitation-card/[preset]">) {
  const { preset } = await params;
  const p = getPreset(preset);
  if (!p) notFound();
  return <InviteStage config={p.config} />;
}
