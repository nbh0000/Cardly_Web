import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrintWorkbench } from "@/components/print/workbench";
import { findCategory, PRINT_CATEGORIES, type PrintCategoryId } from "@/lib/print/specs";

export const dynamicParams = false;

export function generateStaticParams() {
  return PRINT_CATEGORIES.map((c) => ({ category: c.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/print/[category]">): Promise<Metadata> {
  const { category } = await params;
  const c = findCategory(category);
  return {
    title: c ? `${c.label} 만들기` : "인쇄물 만들기",
    robots: { index: false, follow: false },
  };
}

export default async function PrintCategoryPage({ params }: PageProps<"/print/[category]">) {
  const { category } = await params;
  if (!findCategory(category)) notFound();
  return <PrintWorkbench category={category as PrintCategoryId} />;
}
