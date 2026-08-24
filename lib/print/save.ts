"use client";

/**
 * 인쇄물을 계정에 저장하기.
 *
 * 청첩장·초대장이 쓰는 docs 표를 그대로 씁니다(kind = 'print'). 담기는
 * 내용만 다르고 «내 것이고 · 고칠 수 있고 · 결제로 잠금이 풀리는» 삶은
 * 똑같기 때문입니다.
 *
 * 다른 점이 하나 있습니다. 인쇄물은 발행하지 않습니다 — 슬러그도 기한도
 * 없습니다. 파는 것이 링크가 아니라 파일이라서, 결제하면 plan 이
 * premium 이 되고 그걸로 끝입니다. 그 뒤로는 몇 년 뒤에 열어도 같은
 * 파일이 나옵니다.
 */

import { backendEnabled, signedIn } from "@/lib/backend/client";
import { createDoc, getDoc, saveDoc, type DocRow } from "@/lib/backend/docs";
import { findCategory } from "@/lib/print/specs";
import type { PrintDoc } from "@/lib/print/types";

export interface PrintDocRow {
  id: string;
  title: string;
  plan: "free" | "premium";
  doc: PrintDoc;
  updatedAt: string;
}

/** 계정에 저장할 수 있는 상태인지 */
export function canSave(): boolean {
  return backendEnabled && signedIn();
}

function looksLikeDoc(value: unknown): value is PrintDoc {
  const d = value as PrintDoc | undefined;
  return Boolean(d && d.width > 0 && d.height > 0 && Array.isArray(d.elements));
}

export async function loadPrintDoc(id: string): Promise<PrintDocRow | null> {
  const row = await getDoc(id);
  if (!row || row.kind !== "print" || !looksLikeDoc(row.data)) return null;
  return {
    id: row.id,
    title: row.title,
    plan: row.plan,
    doc: row.data as unknown as PrintDoc,
    updatedAt: row.updated_at,
  };
}

/**
 * 새로 만들거나 덮어씁니다.
 *
 * design_id 에는 갈래를 넣습니다. 카드함에서 «어느 편집기로 열어야 하는가»
 * 를 그 값 하나로 알 수 있어야 하기 때문입니다.
 */
export async function persistPrintDoc(
  doc: PrintDoc,
  docId: string | null,
): Promise<string> {
  const title = doc.title.trim() || findCategory(doc.category)?.label || "인쇄물";

  if (docId) {
    await saveDoc(docId, { title, designId: doc.category, data: doc });
    return docId;
  }

  const row: DocRow = await createDoc({
    kind: "print",
    title,
    designId: doc.category,
    data: doc,
  });
  return row.id;
}
