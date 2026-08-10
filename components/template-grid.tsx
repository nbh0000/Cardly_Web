"use client";

import { useMemo, useState } from "react";
import { TemplateCard } from "@/components/template-card";
import { useTemplates } from "@/lib/template-store";
import {
  CATEGORY_LABELS,
  TEMPLATES,
  type TemplateCategory,
} from "@/lib/invitation";

type Filter = TemplateCategory | "all";

const FILTERS: Filter[] = ["all", "minimal", "floral", "modern", "classic", "photo"];

export function TemplateGrid({ limit }: { limit?: number }) {
  const [active, setActive] = useState<Filter>("all");
  // 관리자가 등록한 템플릿을 앞쪽에 붙입니다 (마운트 후에 채워집니다).
  const { templates: custom } = useTemplates();

  const visible = useMemo(() => {
    const all = [...custom, ...TEMPLATES];
    const list =
      active === "all"
        ? all
        : all.filter((t) => t.categories.includes(active));
    return limit ? list.slice(0, limit) : list;
  }, [active, limit, custom]);

  return (
    <>
      <div className="-mx-gutter overflow-x-auto px-gutter [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div
          role="tablist"
          aria-label="템플릿 카테고리"
          className="mx-auto flex w-max gap-2 md:justify-center"
        >
          {FILTERS.map((f) => {
            const on = f === active;
            return (
              <button
                key={f}
                role="tab"
                aria-selected={on}
                onClick={() => setActive(f)}
                className={`rounded-full border px-4 py-2 text-caption transition-colors duration-200 ${
                  on
                    ? "border-rose-deep bg-rose-deep text-white"
                    : "border-line bg-transparent text-ink-soft hover:border-rose hover:text-rose-deep"
                }`}
              >
                {CATEGORY_LABELS[f]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-block grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-7 lg:gap-y-12">
        {visible.map((t) => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </div>
    </>
  );
}
