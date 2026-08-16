import { asset } from "@/lib/asset";
import { fontStack } from "@/lib/fonts";
import { designVars } from "@/lib/occasion/designs";
import { dateDots } from "@/lib/occasion/format";
import type { Design } from "@/lib/occasion/types";

/* 표지 한 면.

   목록의 작은 카드와 화면 가득한 카드가 같은 컴포넌트를 씁니다. 글자
   크기가 카드 너비(cqw)에 매달려 있어서, 따로 «작은 판»을 만들지 않아도
   어느 크기에서든 같은 조판으로 앉습니다. 미리보기와 실물이 다르면
   그건 미리보기가 아닙니다. */

export function designStyle(d: Design): React.CSSProperties {
  return {
    ...designVars(d),
    "--oc-head": fontStack(d.headFont),
    "--oc-body": fontStack(d.bodyFont),
  } as React.CSSProperties;
}

export function Cover({
  design,
  eyebrow,
  title,
  date,
  priority = false,
  hint,
}: {
  design: Design;
  eyebrow: string;
  title: string;
  date: string;
  /** 첫 화면에 크게 뜨는 그림이면 먼저 받아 옵니다 */
  priority?: boolean;
  /** «눌러서 열어 보세요» 표시 */
  hint?: boolean;
}) {
  return (
    <div className="oc-cover" data-l={design.cover} data-hint={hint ? "1" : undefined}>
      <div className="oc-cover-art">
        {/* 정적 내보내기라 next/image 최적화 대상이 아닙니다. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset(`/art/${design.art}`)}
          alt=""
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
        />
      </div>
      <span className="oc-cover-scrim" aria-hidden />

      <div className="oc-cover-text">
        {eyebrow && <span className="oc-cover-eyebrow">{eyebrow}</span>}
        <span className="oc-cover-title">{title}</span>
        {date && <span className="oc-cover-date">{dateDots(date)}</span>}
      </div>

      {hint && (
        <span className="oc-hint">
          눌러서 열어 보세요
          <i aria-hidden />
        </span>
      )}
    </div>
  );
}
