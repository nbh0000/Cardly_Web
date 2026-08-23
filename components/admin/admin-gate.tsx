"use client";

/**
 * 관리자만 지나갑니다.
 *
 * 화면을 가리는 것만으로는 아무것도 막지 못합니다 — 정적 배포라 누구나
 * 이 페이지의 HTML 을 내려받을 수 있습니다. 그래서 «관리자인가» 는
 * 데이터베이스에 물어봅니다(is_admin). 템플릿을 저장하는 쪽도 같은 판단을
 * RLS 로 다시 하므로, 화면을 뚫어도 저장은 되지 않습니다.
 *
 * 여기서 하는 일은 관리자가 아닌 사람에게 «관리 화면이 있다» 는 사실과
 * 목록을 보여 주지 않는 것입니다.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/backend/auth";
import { backendEnabled, rpc } from "@/lib/backend/client";

type State = "checking" | "allowed" | "denied" | "anonymous" | "offline";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const session = useSession();
  /* 물어보기 전까지는 null — 답이 오면 true/false 가 됩니다. */
  const [admin, setAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!backendEnabled || !session) return;
    let alive = true;
    rpc<boolean>("is_admin")
      .then((ok) => alive && setAdmin(ok))
      .catch(() => alive && setAdmin(false));
    return () => {
      alive = false;
    };
  }, [session]);

  /* 로그인 여부와 서버 유무는 그리는 도중에 이미 아는 사실이라 상태로
     들지 않습니다. 물어봐야 아는 것은 «관리자인가» 하나뿐입니다. */
  const state: State = !backendEnabled
    ? "offline"
    : !session
      ? "anonymous"
      : admin === null
        ? "checking"
        : admin
          ? "allowed"
          : "denied";

  if (state === "allowed") return <>{children}</>;

  return (
    <div className="mx-auto max-w-narrow rounded-lg border border-line bg-white p-8 text-center">
      {state === "checking" && <p className="text-caption text-muted">확인하는 중입니다…</p>}

      {state === "offline" && (
        <>
          <p className="font-serif text-h3 text-ink">관리 화면을 쓸 수 없습니다</p>
          <p className="mt-3 text-caption text-ink-soft">
            데이터베이스가 연결되어 있지 않습니다.
          </p>
        </>
      )}

      {state === "anonymous" && (
        <>
          <p className="font-serif text-h3 text-ink">관리자 로그인이 필요합니다</p>
          <Link href="/login?next=/admin" className="btn btn-primary mt-6">
            로그인
          </Link>
        </>
      )}

      {state === "denied" && (
        <>
          <p className="font-serif text-h3 text-ink">권한이 없습니다</p>
          <p className="mt-3 text-caption text-ink-soft">
            이 화면은 템플릿을 관리하는 계정만 볼 수 있습니다.
          </p>
          <Link href="/" className="btn btn-ghost mt-6 bg-white">
            홈으로
          </Link>
        </>
      )}
    </div>
  );
}
