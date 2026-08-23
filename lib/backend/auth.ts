"use client";

/**
 * 로그인 — 만드는 사람에게만 필요합니다.
 *
 * 하객은 절대 로그인하지 않습니다. 링크를 받은 사람이 가입 화면을 만나는
 * 순간 그 청첩장은 실패한 것입니다. 그래서 계정은 «내가 만든 것을 다시
 * 열고, 발행하고, 결제하기 위한» 열쇠일 뿐이고, 보는 쪽에는 없습니다.
 * 이력서·명함도 지금처럼 로그인 없이 씁니다.
 *
 * 방법은 둘입니다.
 *   ① 카카오 — 한국에서 가장 짧은 길입니다. 청첩장을 카카오톡으로 보내는
 *      사람들이라 이미 로그인되어 있는 경우가 대부분입니다.
 *   ② 이메일 링크 — 카카오 계정이 없거나 쓰기 싫은 사람을 위한 뒷길입니다.
 *      비밀번호를 만들지 않으므로 잊어버릴 것도, 털릴 것도 없습니다.
 */

import { useSyncExternalStore } from "react";
import {
  BackendError,
  SUPABASE_ANON,
  SUPABASE_URL,
  backendEnabled,
  currentSession,
  onSessionChange,
  sessionFromToken,
  setSession,
  type Session,
} from "@/lib/backend/client";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "";

/** 로그인을 마치고 돌아올 주소 */
function callbackUrl(next: string): string {
  const origin = SITE || (typeof window === "undefined" ? "" : window.location.origin);
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${origin}${base}/login/?next=${encodeURIComponent(next)}`;
}

/* ------------------------------------------------------------
   React 에서 쓰기
   ------------------------------------------------------------ */

const serverSnapshot = () => null;

/**
 * 지금 로그인한 사람. 서버 그림(정적 HTML)에서는 언제나 null 입니다 —
 * 로그인 여부에 따라 첫 HTML 이 달라지면 정적 배포에서 어긋납니다.
 */
export function useSession(): Session | null {
  return useSyncExternalStore(onSessionChange, currentSession, serverSnapshot);
}

/* ------------------------------------------------------------
   들어가기
   ------------------------------------------------------------ */

export function signInWithKakao(next = "/account"): void {
  const url = new URL(`${SUPABASE_URL}/auth/v1/authorize`);
  url.searchParams.set("provider", "kakao");
  url.searchParams.set("redirect_to", callbackUrl(next));
  window.location.href = url.toString();
}

/** 이메일로 한 번 쓰는 링크 보내기 */
export async function sendMagicLink(email: string, next = "/account"): Promise<void> {
  if (!backendEnabled) throw new BackendError("서버가 연결되어 있지 않습니다.", 0);

  const url = new URL(`${SUPABASE_URL}/auth/v1/otp`);
  url.searchParams.set("redirect_to", callbackUrl(next));

  const res = await fetch(url, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email, create_user: true }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let message = "메일을 보내지 못했습니다.";
    try {
      const j = JSON.parse(body) as { msg?: string; message?: string };
      message = j.msg || j.message || message;
    } catch {
      /* 본문이 비어 있으면 기본 문구 */
    }
    throw new BackendError(message, res.status);
  }
}

/**
 * 로그인 창에서 돌아왔을 때 — 주소에 붙어 온 토큰을 세션으로 바꿉니다.
 *
 * 토큰이 주소창에 남아 있으면 뒤로 가기·공유·기록으로 새어 나갑니다.
 * 그래서 읽자마자 history.replaceState 로 지웁니다.
 */
export async function completeRedirect(): Promise<
  { ok: true; next: string } | { ok: false; message: string } | null
> {
  if (typeof window === "undefined") return null;

  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  const next = query.get("next") || "/account";

  const error = hash.get("error_description") || hash.get("error") || query.get("error_description");
  if (error) {
    clean();
    return { ok: false, message: decodeURIComponent(error) };
  }

  const accessToken = hash.get("access_token");
  if (!accessToken) return null;

  const session = sessionFromToken({
    access_token: accessToken,
    refresh_token: hash.get("refresh_token") ?? undefined,
    expires_in: Number(hash.get("expires_in") ?? 3600),
  });

  // 사용자 정보는 해시에 실려 오지 않으므로 한 번 물어봅니다.
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${accessToken}` },
    });
    if (res.ok) {
      const user = (await res.json()) as {
        id: string;
        email?: string;
        user_metadata?: Record<string, unknown>;
      };
      const filled = sessionFromToken({
        access_token: accessToken,
        refresh_token: hash.get("refresh_token") ?? undefined,
        expires_in: Number(hash.get("expires_in") ?? 3600),
        user,
      });
      setSession(filled);
      clean();
      return { ok: true, next };
    }
  } catch {
    /* 네트워크가 끊겨도 토큰 자체는 살아 있습니다 */
  }

  setSession(session);
  clean();
  return { ok: true, next };

  function clean() {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }
}

export async function signOut(): Promise<void> {
  const s = currentSession();
  setSession(null);
  if (!s) return;
  await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${s.accessToken}` },
  }).catch(() => undefined);
}

/** 화면에 보여 줄 이름 — 카카오 닉네임, 없으면 메일 앞부분 */
export function displayName(session: Session | null): string {
  if (!session) return "";
  return session.user.name || session.user.email?.split("@")[0] || "내 계정";
}
