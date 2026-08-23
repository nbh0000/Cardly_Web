/**
 * Supabase 를 REST 로 직접 부르는 얇은 층.
 *
 * @supabase/supabase-js 를 쓰지 않습니다. 이 사이트는 정적 배포라 번들
 * 크기가 그대로 첫 화면 비용이 되는데, 여기서 필요한 것은 로그인·표
 * 몇 개·저장소 업로드·함수 호출뿐이라 fetch 로 충분합니다.
 *
 * anon 키는 브라우저에 노출되는 것을 전제로 만들어진 공개 키입니다. 실제
 * 보호는 이 키가 아니라 테이블의 RLS 정책이 합니다(supabase/schema.sql).
 * 그래서 이 파일에는 «누가 무엇을 할 수 있는가» 를 판단하는 코드가 없습니다.
 * 그 판단은 전부 데이터베이스가 합니다.
 *
 * 환경변수가 비어 있으면 backendEnabled 가 false 가 되고, 화면은 로그인·
 * 발행 단추를 감춘 채 «만들어 보기» 까지만 동작합니다. 키 없이도 사이트가
 * 그대로 서 있어야 배포가 안전합니다.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** 계정·저장·발행을 쓸 수 있는 환경인지 */
export const backendEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON);

/* ------------------------------------------------------------
   세션

   토큰은 localStorage 에 둡니다. 쿠키를 쓸 수 없기 때문입니다 — 정적
   배포라 쿠키를 읽어 줄 서버가 없고, 어차피 모든 판단은 DB 가 합니다.
   ------------------------------------------------------------ */

const SESSION_KEY = "cardly:session";
/** 예전 관리자 로그인이 쓰던 키. 한 번 옮겨 주고 지웁니다. */
const LEGACY_TOKEN_KEY = "daon:sb-token";

export interface SessionUser {
  id: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
}

export interface Session {
  accessToken: string;
  refreshToken: string | null;
  /** epoch 초 */
  expiresAt: number;
  user: SessionUser;
}

let cached: Session | null | undefined;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function onSessionChange(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function readStored(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw) as Session;

    // 예전 관리자 토큰만 있는 경우 — 사용자 정보는 아래에서 채웁니다.
    const legacy = window.localStorage.getItem(LEGACY_TOKEN_KEY);
    if (legacy) {
      return {
        accessToken: legacy,
        refreshToken: null,
        expiresAt: 0,
        user: { id: "", email: null, name: null, avatar: null },
      };
    }
  } catch {
    /* 저장소를 막아 둔 브라우저 */
  }
  return null;
}

export function currentSession(): Session | null {
  if (cached === undefined) cached = readStored();
  return cached;
}

export function setSession(s: Session | null) {
  cached = s;
  try {
    if (s) window.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch {
    /* 무시 */
  }
  emit();
}

export function signedIn(): boolean {
  return Boolean(currentSession());
}

/* ------------------------------------------------------------
   토큰 — 만료되기 전에 조용히 갱신합니다
   ------------------------------------------------------------ */

let refreshing: Promise<string | null> | null = null;

/**
 * 지금 쓸 수 있는 액세스 토큰.
 *
 * 만료 1 분 전부터는 미리 갱신합니다. 갱신이 실패하면(리프레시 토큰이
 * 만료됐거나 계정이 지워졌으면) 세션을 비웁니다 — 그래야 화면이 «로그인»
 * 으로 돌아가고, 사용자가 저장되지 않는 편집기를 계속 쓰지 않게 됩니다.
 */
export async function accessToken(): Promise<string | null> {
  const s = currentSession();
  if (!s) return null;

  const now = Math.floor(Date.now() / 1000);
  if (s.expiresAt === 0 || s.expiresAt - 60 > now) return s.accessToken;
  if (!s.refreshToken) return s.accessToken;

  refreshing ??= (async () => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
        {
          method: "POST",
          headers: { apikey: SUPABASE_ANON, "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: s.refreshToken }),
        },
      );
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as TokenResponse;
      setSession(sessionFromToken(json));
      return json.access_token;
    } catch {
      setSession(null);
      return null;
    } finally {
      refreshing = null;
    }
  })();

  return refreshing;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  user?: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown>;
  };
}

export function sessionFromToken(t: TokenResponse): Session {
  const meta = t.user?.user_metadata ?? {};
  const pick = (...keys: string[]) => {
    for (const k of keys) {
      const v = meta[k];
      if (typeof v === "string" && v) return v;
    }
    return null;
  };
  return {
    accessToken: t.access_token,
    refreshToken: t.refresh_token ?? null,
    expiresAt: Math.floor(Date.now() / 1000) + (t.expires_in ?? 3600),
    user: {
      id: t.user?.id ?? "",
      email: t.user?.email ?? null,
      name: pick("name", "full_name", "nickname", "preferred_username"),
      avatar: pick("avatar_url", "picture", "profile_image"),
    },
  };
}

/* ------------------------------------------------------------
   요청
   ------------------------------------------------------------ */

export class BackendError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** PostgREST 가 돌려주는 오류 본문에서 사람이 읽을 문장만 꺼냅니다. */
function messageOf(text: string, status: number): string {
  try {
    const j = JSON.parse(text) as { message?: string; error_description?: string; msg?: string };
    return j.message || j.error_description || j.msg || `요청이 실패했습니다 (${status})`;
  } catch {
    return text || `요청이 실패했습니다 (${status})`;
  }
}

async function request(path: string, init: RequestInit & { anon?: boolean } = {}) {
  if (!backendEnabled) throw new BackendError("서버가 연결되어 있지 않습니다.", 0);

  const token = init.anon ? null : await accessToken();
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${token ?? SUPABASE_ANON}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new BackendError(messageOf(text, res.status), res.status);
  }
  return res;
}

/** 데이터베이스 함수 호출 */
export async function rpc<T>(
  fn: string,
  args: Record<string, unknown> = {},
  opts: { anon?: boolean } = {},
): Promise<T> {
  const res = await request(`/rest/v1/rpc/${fn}`, {
    method: "POST",
    body: JSON.stringify(args),
    anon: opts.anon,
  });
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

/** 표 조회 — query 는 PostgREST 문법 그대로입니다 */
export async function select<T>(table: string, query: string): Promise<T[]> {
  const res = await request(`/rest/v1/${table}?${query}`, { cache: "no-store" });
  return (await res.json()) as T[];
}

export async function insert<T>(table: string, row: unknown): Promise<T> {
  const res = await request(`/rest/v1/${table}`, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(row),
  });
  const rows = (await res.json()) as T[];
  return rows[0] as T;
}

export async function update<T>(
  table: string,
  query: string,
  patch: unknown,
): Promise<T[]> {
  const res = await request(`/rest/v1/${table}?${query}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(patch),
  });
  return (await res.json()) as T[];
}

export async function upsert(table: string, row: unknown): Promise<void> {
  await request(`/rest/v1/${table}`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(row),
  });
}

export async function remove(table: string, query: string): Promise<void> {
  await request(`/rest/v1/${table}?${query}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
}

/** 엣지 함수 호출 (결제 승인 등) */
export async function callFunction<T>(
  name: string,
  body: Record<string, unknown>,
): Promise<T> {
  const token = await accessToken();
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${token ?? SUPABASE_ANON}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  const json = text ? (JSON.parse(text) as unknown) : {};
  if (!res.ok) {
    const message = (json as { message?: string }).message;
    throw new BackendError(message ?? `요청이 실패했습니다 (${res.status})`, res.status);
  }
  return json as T;
}

/* ------------------------------------------------------------
   사진 저장소
   ------------------------------------------------------------ */

export function publicPhotoUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/photos/${path}`;
}

/**
 * 사진 한 장 올리기. 경로는 반드시 {내 아이디}/… 로 시작해야 합니다 —
 * 저장소 정책이 그 폴더 밖으로는 쓰지 못하게 막고 있습니다.
 */
export async function uploadPhoto(file: Blob, path: string): Promise<string> {
  const token = await accessToken();
  if (!token) throw new BackendError("로그인이 필요합니다.", 401);

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/photos/${path}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${token}`,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "true",
    },
    body: file,
  });
  if (!res.ok) {
    throw new BackendError(messageOf(await res.text().catch(() => ""), res.status), res.status);
  }
  return publicPhotoUrl(path);
}

export async function deletePhoto(path: string): Promise<void> {
  const token = await accessToken();
  if (!token) return;
  await fetch(`${SUPABASE_URL}/storage/v1/object/photos/${path}`, {
    method: "DELETE",
    headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` },
  }).catch(() => undefined);
}
