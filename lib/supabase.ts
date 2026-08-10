"use client";

/**
 * Supabase 를 REST 로 직접 부르는 아주 얇은 클라이언트.
 *
 * @supabase/supabase-js 를 쓰지 않는 이유는 이 사이트가 정적 배포라
 * 번들 크기가 그대로 첫 화면 비용이 되기 때문입니다. 여기서 필요한 것은
 * 테이블 하나에 대한 조회·저장·삭제와 관리자 로그인뿐이라 REST 로 충분합니다.
 *
 * anon 키는 브라우저에 노출되는 것을 전제로 설계된 공개 키입니다. 실제 보호는
 * 이 키가 아니라 테이블의 RLS 정책이 합니다(supabase/schema.sql 참고).
 * 읽기는 누구나, 쓰기는 로그인한 관리자만 가능하도록 잡혀 있습니다.
 */

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** 환경변수가 채워져 있으면 DB 모드, 아니면 브라우저 저장 모드 */
export const dbEnabled = Boolean(URL_BASE && ANON);

const TOKEN_KEY = "daon:sb-token";

export function accessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function signedIn(): boolean {
  return Boolean(accessToken());
}

function headers(extra: Record<string, string> = {}): Record<string, string> {
  const token = accessToken();
  return {
    apikey: ANON,
    Authorization: `Bearer ${token ?? ANON}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function must(res: Response): Promise<Response> {
  if (res.ok) return res;
  const body = await res.text().catch(() => "");
  throw new Error(`${res.status} ${res.statusText}${body ? ` — ${body}` : ""}`);
}

/* ---------------- 인증 ---------------- */

export async function signIn(email: string, password: string): Promise<void> {
  const res = await fetch(`${URL_BASE}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = (await (await must(res)).json()) as { access_token?: string };
  if (!json.access_token) throw new Error("로그인 응답에 토큰이 없습니다.");
  window.localStorage.setItem(TOKEN_KEY, json.access_token);
}

export function signOut(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

/* ---------------- 테이블 ---------------- */

export async function selectAll<T>(table: string, order = "created_at"): Promise<T[]> {
  const res = await fetch(
    `${URL_BASE}/rest/v1/${table}?select=*&order=${encodeURIComponent(order)}`,
    { headers: headers(), cache: "no-store" },
  );
  return (await (await must(res)).json()) as T[];
}

/** 같은 기본키가 있으면 갱신, 없으면 추가 */
export async function upsert(table: string, row: unknown): Promise<void> {
  const res = await fetch(`${URL_BASE}/rest/v1/${table}`, {
    method: "POST",
    headers: headers({ Prefer: "resolution=merge-duplicates,return=minimal" }),
    body: JSON.stringify(row),
  });
  await must(res);
}

export async function remove(table: string, column: string, value: string): Promise<void> {
  const res = await fetch(
    `${URL_BASE}/rest/v1/${table}?${column}=eq.${encodeURIComponent(value)}`,
    { method: "DELETE", headers: headers({ Prefer: "return=minimal" }) },
  );
  await must(res);
}
