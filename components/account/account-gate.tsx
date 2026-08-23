"use client";

import Link from "next/link";
import { backendEnabled } from "@/lib/backend/client";
import { displayName, signOut, useSession } from "@/lib/backend/auth";

/**
 * 로그인한 사람에게만 보이는 자리를 감쌉니다.
 *
 * 정적 배포라 «서버에서 막는» 방법이 없습니다. 그래서 화면을 가리는 것은
 * 예의일 뿐이고, 실제 보호는 데이터베이스가 합니다 — 남의 문서는 애초에
 * 조회되지 않습니다(RLS). 화면만 뚫어도 아무것도 보이지 않습니다.
 */
export function AccountGate({
  children,
  next = "/account",
}: {
  children: React.ReactNode;
  next?: string;
}) {
  const session = useSession();

  if (!backendEnabled) {
    return (
      <div className="mx-auto max-w-narrow rounded-lg border border-line bg-white p-7 text-center">
        <p className="font-serif text-h3 text-ink">계정 기능이 아직 켜지지 않았습니다</p>
        <p className="mt-3 text-caption text-ink-soft">
          이력서·명함과 미리보기는 지금도 그대로 쓰실 수 있습니다.
        </p>
        <Link href="/" className="btn btn-ghost mt-6 bg-white">
          홈으로
        </Link>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-narrow rounded-lg border border-line bg-white p-7 text-center">
        <p className="font-serif text-h3 text-ink">로그인이 필요합니다</p>
        <p className="mt-3 text-caption text-ink-soft">
          만든 청첩장과 초대장은 계정에 저장됩니다.
        </p>
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="btn btn-primary mt-6"
        >
          로그인
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}

/** 계정 화면 위쪽에 붙는 한 줄 — 누구로 들어와 있는지와 나가기 */
export function AccountBar() {
  const session = useSession();
  if (!session) return null;

  return (
    <div className="flex items-center justify-between gap-4 border-b border-line-soft pb-4">
      <p className="truncate text-caption text-ink-soft">
        <span className="text-ink">{displayName(session)}</span> 님으로 로그인
      </p>
      <button
        type="button"
        className="shrink-0 text-[0.75rem] text-muted underline underline-offset-2 hover:text-ink"
        onClick={() => {
          void signOut();
        }}
      >
        로그아웃
      </button>
    </div>
  );
}
