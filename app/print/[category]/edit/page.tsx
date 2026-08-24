import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrintWorkbench } from "@/components/print/workbench";
import { findCategory, PRINT_CATEGORIES, type PrintCategoryId } from "@/lib/print/specs";

/**
 * 편집 화면 — /print/<갈래>/edit/
 *
 * 어느 템플릿으로 시작할지는 주소의 물음표 뒤(?t=)로 받습니다. 정적
 * 내보내기라 마흔여덟 장마다 편집 화면을 따로 굽는 대신, 갈래마다 한 장씩
 * 굽고 나머지는 브라우저가 골라 엽니다.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return PRINT_CATEGORIES.map((c) => ({ category: c.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/print/[category]/edit">): Promise<Metadata> {
  const { category } = await params;
  const c = findCategory(category);
  return {
    title: c ? `${c.label} 편집` : "인쇄물 편집",
    robots: { index: false, follow: false },
  };
}

export default async function PrintEditPage({ params }: PageProps<"/print/[category]/edit">) {
  const { category } = await params;
  if (!findCategory(category)) notFound();
  return <PrintWorkbench category={category as PrintCategoryId} />;
}
