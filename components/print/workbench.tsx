"use client";

/**
 * 편집기를 여는 자리.
 *
 * 무엇을 열지는 세 가지로 정해집니다.
 *   ?doc=…  계정에 저장해 둔 것을 이어서 (가장 셉니다)
 *   ?t=…    고른 템플릿으로 새로 시작
 *   아무것도 없으면 브라우저에 남아 있던 초안, 그것도 없으면 빈 종이
 *
 * 이 판단을 렌더 도중에 하면 «빌드 때 그린 그림» 과 «브라우저가 그린
 * 그림» 이 어긋나므로, 브라우저에 붙은 뒤에 한 번 더 그립니다.
 */

import { useEffect, useState } from "react";
import { useMounted, useQueryParam } from "@/lib/backend/browser";
import { PrintEditor } from "@/components/print/editor";
import { blankDoc } from "@/lib/print/doc";
import { findCategory } from "@/lib/print/specs";
import { findTemplate } from "@/lib/print/templates";
import { canSave, loadPrintDoc, type PrintDocRow } from "@/lib/print/save";
import type { PrintCategoryId } from "@/lib/print/specs";
import type { PrintDoc } from "@/lib/print/types";

export function storageKeyFor(category: string) {
  return `cardly:print:${category}`;
}

function fromStorage(category: PrintCategoryId): PrintDoc | null {
  try {
    const raw = window.localStorage.getItem(storageKeyFor(category));
    if (!raw) return null;
    const doc = JSON.parse(raw) as PrintDoc;
    if (doc && doc.width > 0 && doc.height > 0 && Array.isArray(doc.elements)) return doc;
  } catch {
    /* 저장소를 막아 둔 브라우저이거나 깨진 초안 */
  }
  return null;
}

function startingDoc(category: PrintCategoryId, templateId: string | null): PrintDoc {
  if (templateId) {
    const t = findTemplate(templateId);
    if (t) return structuredClone(t.doc);
  }
  return fromStorage(category) ?? blankDoc(category);
}

export function PrintWorkbench({ category }: { category: PrintCategoryId }) {
  const mounted = useMounted();
  const templateId = useQueryParam("t");
  const docId = useQueryParam("doc");

  const [saved, setSaved] = useState<PrintDocRow | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "gone">(
    docId ? "loading" : "ready",
  );

  useEffect(() => {
    if (!docId || !canSave()) return;
    let alive = true;
    loadPrintDoc(docId)
      .then((row) => {
        if (!alive) return;
        setSaved(row);
        setState(row ? "ready" : "gone");
      })
      .catch(() => alive && setState("gone"));
    return () => {
      alive = false;
    };
  }, [docId]);

  if (!mounted || (docId && state === "loading")) {
    return (
      <div className="pe-loading">
        <p>{findCategory(category)?.label} 편집기를 여는 중…</p>
      </div>
    );
  }

  if (docId && state === "gone") {
    return (
      <div className="pe-loading">
        <p>
          그 인쇄물을 찾지 못했습니다. 내 것이 아니거나 지워졌을 수 있습니다.
        </p>
      </div>
    );
  }

  const initial = saved?.doc ?? startingDoc(category, templateId);

  return (
    <PrintEditor
      key={saved?.id ?? templateId ?? "local"}
      initial={initial}
      storageKey={storageKeyFor(category)}
      docId={saved?.id ?? null}
      paid={saved?.plan === "premium"}
    />
  );
}
