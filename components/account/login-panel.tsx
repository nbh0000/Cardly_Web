"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { backendEnabled } from "@/lib/backend/client";
import {
  completeRedirect,
  sendMagicLink,
  signInWithKakao,
  useSession,
} from "@/lib/backend/auth";

/**
 * 로그인 — 카카오가 앞, 이메일이 뒤.
 *
 * 순서에 이유가 있습니다. 청첩장을 카카오톡으로 보내는 사람들이라 대부분
 * 이미 카카오에 로그인되어 있고, 그러면 누르는 순간 끝납니다. 이메일은
 * 카카오를 안 쓰거나 쓰기 싫은 사람을 위한 뒷길이라 아래에 둡니다.
 *
 * 비밀번호는 만들지 않습니다. 일 년에 한 번 쓸 서비스의 비밀번호는 반드시
 * 잊히고, 그 순간 청첩장을 못 고치게 됩니다.
 */
export function LoginPanel() {
  const router = useRouter();
  const session = useSession();
  const [state, setState] = useState<"idle" | "checking" | "sent">("checking");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  /* 로그인 창에서 돌아오는 길 — 주소에 붙어 온 토큰을 거둬들입니다. */
  useEffect(() => {
    let alive = true;
    completeRedirect()
      .then((result) => {
        if (!alive) return;
        if (result?.ok) router.replace(result.next);
        else if (result) setError(result.message);
        setState("idle");
      })
      .catch(() => alive && setState("idle"));
    return () => {
      alive = false;
    };
  }, [router]);

  /* 이미 로그인한 사람이 다시 들어오면 그냥 통과시킵니다. */
  useEffect(() => {
    if (state === "idle" && session) {
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next || "/account");
    }
  }, [session, state, router]);

  if (!backendEnabled) {
    return (
      <div className="mx-auto max-w-narrow rounded-lg border border-line bg-white p-7 text-center">
        <p className="font-serif text-h3 text-ink">계정 기능이 아직 켜지지 않았습니다</p>
        <p className="mt-3 text-caption text-ink-soft">
          이력서·명함·미리보기는 로그인 없이 그대로 쓰실 수 있습니다.
        </p>
      </div>
    );
  }

  if (state === "sent") {
    return (
      <div className="mx-auto max-w-narrow rounded-lg border border-line bg-white p-7 text-center">
        <p className="font-serif text-h3 text-ink">메일을 보냈습니다</p>
        <p className="mt-3 text-caption text-ink-soft">
          {email} 로 보낸 링크를 누르면 바로 들어옵니다.
          <br />
          메일이 보이지 않으면 스팸함도 확인해 주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-narrow">
      <button
        type="button"
        onClick={() => signInWithKakao(nextPath())}
        className="press flex min-h-[52px] w-full items-center justify-center gap-2 rounded-md bg-[#FEE500] px-5 text-[0.9375rem] text-[#191600]"
      >
        <KakaoGlyph />
        카카오로 시작하기
      </button>

      <div className="my-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[0.75rem] text-muted">또는</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          sendMagicLink(email.trim(), nextPath())
            .then(() => setState("sent"))
            .catch((err: unknown) =>
              setError(err instanceof Error ? err.message : "메일을 보내지 못했습니다."),
            )
            .finally(() => setBusy(false));
        }}
      >
        <label className="block">
          <span className="text-caption text-ink">이메일</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="me@example.com"
            className="mt-2 min-h-[48px] w-full rounded-md border border-line bg-white px-3.5 text-body text-ink outline-none transition-colors placeholder:text-hint focus:border-rose"
          />
        </label>
        <button type="submit" className="btn btn-ghost bg-white" disabled={busy}>
          {busy ? "보내는 중…" : "로그인 링크 받기"}
        </button>
      </form>

      {error && <p className="mt-4 text-center text-[0.8125rem] text-rose-deep">{error}</p>}

      <p className="mt-8 text-center text-[0.75rem] leading-relaxed text-muted">
        계정은 청첩장·초대장을 저장하고 발행하는 데만 씁니다.
        <br />
        하객은 로그인 없이 링크만으로 봅니다. 이력서·명함도 로그인이 필요 없습니다.
      </p>
    </div>
  );
}

function nextPath(): string {
  if (typeof window === "undefined") return "/account";
  return new URLSearchParams(window.location.search).get("next") || "/account";
}

function KakaoGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M12 3C6.9 3 2.8 6.3 2.8 10.3c0 2.6 1.7 4.9 4.3 6.2-.2.7-.7 2.5-.8 2.9-.1.5.2.5.4.4.2-.1 2.6-1.8 3.6-2.5.6.1 1.1.1 1.7.1 5.1 0 9.2-3.3 9.2-7.3S17.1 3 12 3Z" />
    </svg>
  );
}
