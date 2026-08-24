"use client";

/**
 * 편집기를 여는 자리.
 *
 * 이어 만들던 것이 브라우저에 있으면 그것을, 없으면 그 갈래의 첫 템플릿을
 * 엽니다. 이 판단을 렌더 도중에 하면 «빌드 때 그린 그림» 과 «브라우저가
 * 그린 그림» 이 어긋나므로, 브라우저에 붙은 뒤에 한 번 더 그립니다.
 */

import { useMounted } from "@/lib/backend/browser";
import { PrintEditor } from "@/components/print/editor";
import { blankDoc } from "@/lib/print/doc";
import { findCategory } from "@/lib/print/specs";
import { templatesFor } from "@/lib/print/templates";
import type { PrintCategoryId } from "@/lib/print/specs";
import type { PrintDoc } from "@/lib/print/types";

export function storageKeyFor(category: string) {
  return `cardly:print:${category}`;
}

function startingDoc(category: PrintCategoryId): PrintDoc {
  try {
    const raw = window.localStorage.getItem(storageKeyFor(category));
    if (raw) {
      const doc = JSON.parse(raw) as PrintDoc;
      // 옛 초안이라도 최소한 이 값들은 있어야 화면이 섭니다
      if (doc && doc.width > 0 && doc.height > 0 && Array.isArray(doc.elements)) return doc;
    }
  } catch {
    /* 저장소를 막아 둔 브라우저이거나 깨진 초안 */
  }
  const first = templatesFor(category)[0];
  return first ? structuredClone(first.doc) : blankDoc(category);
}

export function PrintWorkbench({ category }: { category: PrintCategoryId }) {
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div className="pe-loading">
        <p>{findCategory(category)?.label} 편집기를 여는 중…</p>
      </div>
    );
  }

  return <PrintEditor initial={startingDoc(category)} storageKey={storageKeyFor(category)} />;
}
