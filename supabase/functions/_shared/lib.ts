/**
 * 엣지 함수 공용 조각.
 *
 * 브라우저에서 직접 부르는 함수들이라 CORS 를 열어야 하고, 값이 걸린 일을
 * 하므로 결과를 늘 같은 모양으로 돌려줍니다: { ok: true, … } 또는
 * { ok: false, message }. 화면 쪽은 message 를 그대로 사람에게 보여 줍니다.
 *
 * 외부 패키지를 쓰지 않습니다. 필요한 것은 fetch 와 PostgREST 호출뿐이고,
 * 의존성이 없으면 배포가 빨라지고 공급망 사고에서 자유롭습니다.
 */

export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

export function fail(message: string, status = 400): Response {
  return json({ ok: false, message }, status);
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

/**
 * service_role 로 데이터베이스 함수를 부릅니다.
 *
 * 이 키는 RLS 를 지나칩니다. 그래서 엣지 함수 안에서만 존재하고, 어떤
 * 응답에도 실려 나가지 않아야 합니다.
 */
export async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${fn}: ${res.status} ${text}`);
  return (text ? JSON.parse(text) : null) as T;
}

/** 표에서 한 줄 읽기 — 주문 조회처럼 단순한 곳에만 씁니다. */
export async function selectOne<T>(
  table: string,
  query: string,
): Promise<T | null> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}&limit=1`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
  const rows = (await res.json()) as T[];
  return rows[0] ?? null;
}

/* ── 토스페이먼츠 ───────────────────────────────────────────
   시크릿 키로 Basic 인증합니다. 형식은 base64("시크릿키:") 입니다 —
   비밀번호 자리가 비어 있고 콜론은 남습니다.                        */

const TOSS_SECRET = Deno.env.get("TOSS_SECRET_KEY") ?? "";

export function tossAuth(): string {
  return `Basic ${btoa(`${TOSS_SECRET}:`)}`;
}

export const tossConfigured = () => TOSS_SECRET.length > 0;

export interface TossPayment {
  paymentKey: string;
  orderId: string;
  status: string;
  totalAmount: number;
  method?: string;
  approvedAt?: string;
  receipt?: { url?: string };
  failure?: { code?: string; message?: string };
}

export async function tossFetch(
  path: string,
  init?: RequestInit,
): Promise<{ ok: boolean; body: TossPayment & { code?: string; message?: string } }> {
  const res = await fetch(`https://api.tosspayments.com${path}`, {
    ...init,
    headers: {
      Authorization: tossAuth(),
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = await res.json();
  return { ok: res.ok, body };
}
