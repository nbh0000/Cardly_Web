"use client";

/**
 * 문서 — 내가 만든 청첩장 한 장, 초대장 한 장.
 *
 * 청첩장과 초대장은 화면도 자료형도 다르지만, «계정에 저장되고 · 주소를
 * 받아 발행되고 · 기한이 있고 · 결제로 연장되는» 삶은 똑같습니다. 그
 * 공통부분만 여기 한 곳에 두고, 안에 담기는 내용(data)은 각자의 모델을
 * 그대로 통째로 넣습니다. 그래서 편집기에 칸이 하나 늘어도 이 파일과
 * 데이터베이스는 손대지 않습니다.
 */

import {
  BackendError,
  backendEnabled,
  callFunction,
  currentSession,
  insert,
  remove,
  rpc,
  select,
  update,
} from "@/lib/backend/client";

export type DocKind = "wedding" | "occasion";
export type DocStatus = "draft" | "published" | "closed";
export type DocPlan = "free" | "premium";

export interface DocRow {
  id: string;
  owner: string;
  kind: DocKind;
  title: string;
  design_id: string;
  data: Record<string, unknown>;
  event_date: string | null;
  slug: string | null;
  status: DocStatus;
  plan: DocPlan;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

const COLUMNS =
  "id,owner,kind,title,design_id,data,event_date,slug,status,plan,published_at,expires_at,created_at,updated_at";

/* ------------------------------------------------------------
   내 문서
   ------------------------------------------------------------ */

export async function listDocs(kind?: DocKind): Promise<DocRow[]> {
  if (!backendEnabled) return [];
  const filter = kind ? `&kind=eq.${kind}` : "";
  return select<DocRow>("docs", `select=${COLUMNS}${filter}&order=updated_at.desc`);
}

export async function getDoc(id: string): Promise<DocRow | null> {
  const rows = await select<DocRow>("docs", `select=${COLUMNS}&id=eq.${id}&limit=1`);
  return rows[0] ?? null;
}

export interface NewDoc {
  kind: DocKind;
  title: string;
  designId: string;
  data: unknown;
  eventDate?: string | null;
}

export async function createDoc(doc: NewDoc): Promise<DocRow> {
  const session = currentSession();
  if (!session) throw new BackendError("로그인이 필요합니다.", 401);

  return insert<DocRow>("docs", {
    owner: session.user.id,
    kind: doc.kind,
    title: doc.title.slice(0, 80),
    design_id: doc.designId,
    data: doc.data,
    event_date: doc.eventDate || null,
  });
}

/**
 * 내용 저장.
 *
 * 발행 상태·요금·기한은 여기서 보내지 않습니다. 보내 봐야 데이터베이스
 * 트리거가 막습니다(guard_doc_columns). 값을 정하는 곳이 하나여야 «결제
 * 안 했는데 프리미엄» 같은 상태가 생기지 않습니다.
 */
export async function saveDoc(
  id: string,
  patch: { title?: string; designId?: string; data?: unknown; eventDate?: string | null },
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (patch.title !== undefined) body.title = patch.title.slice(0, 80);
  if (patch.designId !== undefined) body.design_id = patch.designId;
  if (patch.data !== undefined) body.data = patch.data;
  if (patch.eventDate !== undefined) body.event_date = patch.eventDate || null;
  if (Object.keys(body).length === 0) return;

  await update("docs", `id=eq.${id}`, body);
}

export async function deleteDoc(id: string): Promise<void> {
  await remove("docs", `id=eq.${id}`);
}

/* ------------------------------------------------------------
   발행
   ------------------------------------------------------------ */

export interface PublishResult {
  slug: string;
  plan: DocPlan;
  status: DocStatus;
  expires_at: string | null;
}

/**
 * 발행 — 주소를 받아 옵니다.
 *
 * 주소를 만드는 것도, 기한을 정하는 것도 데이터베이스입니다. 그리고 나서
 * 사이트를 다시 굽도록 신호를 보냅니다. 카카오톡 미리보기에 쓰이는
 * <meta> 는 정적 HTML 에 미리 박혀 있어야 하고, 그 HTML 은 빌드가
 * 만들기 때문입니다. 신호가 실패해도 발행 자체는 이미 끝난 것이라
 * 조용히 넘어갑니다 — 링크는 그 즉시 열립니다.
 */
export async function publishDoc(id: string): Promise<PublishResult> {
  const result = await rpc<PublishResult>("publish_doc", { p_id: id });
  try {
    await callFunction("site-refresh", { slug: result.slug });
  } catch {
    /* 미리보기 HTML 은 다음 배포 때 따라옵니다 */
  }
  return result;
}

export async function closeDoc(id: string): Promise<void> {
  await rpc("close_doc", { p_id: id });
}

/** 예식일을 옮겼을 때 기한을 다시 잽니다 */
export async function refreshExpiry(id: string): Promise<void> {
  await rpc("refresh_expiry", { p_id: id });
}

/* ------------------------------------------------------------
   하객이 보는 쪽 — 로그인 없이 슬러그 하나로 읽습니다
   ------------------------------------------------------------ */

export type PublicDoc =
  | {
      state: "open";
      id: string;
      kind: DocKind;
      design_id: string;
      title: string;
      data: Record<string, unknown>;
      plan: DocPlan;
      event_date: string | null;
      expires_at: string | null;
    }
  | { state: "closed"; kind: DocKind; expired_at: string | null };

export async function fetchPublicDoc(slug: string): Promise<PublicDoc | null> {
  if (!backendEnabled) return null;
  return rpc<PublicDoc | null>("published_doc", { p_slug: slug }, { anon: true });
}

/* ------------------------------------------------------------
   주소
   ------------------------------------------------------------ */

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function docPath(kind: DocKind, slug: string): string {
  return `${BASE}${kind === "wedding" ? "/w" : "/i"}/${slug}/`;
}

export function docUrl(kind: DocKind, slug: string): string {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window === "undefined" ? "https://cardly.kr" : window.location.origin);
  return `${origin}${docPath(kind, slug)}`;
}
