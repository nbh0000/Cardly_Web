import Link from "next/link";
import { InvitationView } from "@/components/invitation/invitation-view";
import { createDefaultData, type Template } from "@/lib/invitation";

/**
 * 갤러리 썸네일.
 * 별도 이미지가 아니라 실제 청첩장 렌더러의 커버를 그대로 축소해 그립니다.
 * → 갤러리에서 본 그 화면이 에디터에서 그대로 열립니다.
 */
export function TemplateCard({ template }: { template: Template }) {
  const data = { ...createDefaultData(template.id), fontScale: "sm" as const };

  return (
    <article className="group">
      <Link href={`/editor/${template.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-white shadow-soft ring-1 ring-line transition-[transform,box-shadow] duration-400 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-1.5 group-hover:shadow-lift">
          {/* 161% 폭·높이를 0.62배로 줄여 카드에 꼭 맞춥니다.
              기준점이 top(=상단 중앙)이면 오른쪽으로 밀려 잘리므로 top-left 로 잡습니다.
              높이까지 지정해야 커버가 카드 아래까지 꽉 차게 늘어납니다. */}
          <div className="absolute inset-0 origin-top-left scale-[0.62] [height:161%] [width:161%]">
            <InvitationView template={template} data={data} coverOnly />
          </div>

          {template.badge && (
            <span
              className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[0.625rem] tracking-[0.14em] ${
                template.badge === "NEW"
                  ? "bg-rose-deep text-white"
                  : "bg-white/92 text-ink ring-1 ring-line"
              }`}
            >
              {template.badge}
            </span>
          )}

          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden items-end justify-center bg-linear-to-t from-ink/50 to-transparent pb-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:flex"
          >
            <span className="rounded-full bg-white px-4 py-2 text-[0.75rem] font-medium text-ink shadow-soft">
              이 템플릿으로 만들기
            </span>
          </span>
        </div>

        <div className="mt-3.5 flex items-baseline justify-between gap-2">
          <span className="font-serif text-[0.9375rem] text-ink">
            {template.name}
          </span>
          <span className="text-[0.6875rem] tracking-[0.1em] text-hint uppercase">
            {template.id}
          </span>
        </div>
      </Link>
    </article>
  );
}
