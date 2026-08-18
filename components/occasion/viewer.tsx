"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { FoldedCard } from "@/components/occasion/folded-card";
import { decodeInvite } from "@/lib/occasion/share";

/* 받는 사람이 보는 화면.

   서버가 없으므로 초대장 내용은 주소 뒤(?c=)에 통째로 실려 옵니다.
   그래서 이 페이지는 «받아서 펴 보는 일» 만 합니다 — 불러올 곳도,
   기다릴 것도 없습니다.

   주소는 서버 렌더 때 알 수 없으므로 첫 그림에서는 비워 두고
   브라우저에서만 읽습니다. */

const subscribeNever = () => () => {};

function useCode(): string | null {
  return useSyncExternalStore(
    subscribeNever,
    () => new URLSearchParams(window.location.search).get("c"),
    () => null,
  );
}

export function Viewer() {
  const code = useCode();
  const data = code ? decodeInvite(code) : null;

  if (!data) {
    return (
      <div className="grid min-h-[70vh] place-items-center px-5">
        {/* 아직 주소를 못 읽었을 뿐인지, 정말 잘못된 링크인지 구분해
            말합니다. 읽기 전에 «잘못된 링크» 라고 띄우면 멀쩡한 초대장을
            받은 사람이 놀랍니다. */}
        <div className="text-center" aria-live="polite">
          {code === null ? (
            <p className="text-caption text-muted">초대장을 펴는 중입니다…</p>
          ) : (
            <>
              <p className="font-serif text-h3 text-ink">
                초대장을 열 수 없습니다
              </p>
              <p className="mt-3 text-caption text-ink-soft">
                링크가 중간에 잘렸을 수 있습니다. 보내 준 분께
                <br />
                링크를 다시 받아 보세요.
              </p>
              <Link
                href="/invitation-card/"
                className="btn btn-ghost mt-7 bg-white"
              >
                초대장 만들어 보기
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-10 sm:py-16">
      <FoldedCard data={data} />

      <p className="mx-auto mt-12 max-w-narrow text-center text-[0.75rem] text-muted">
        이 초대장은{" "}
        <Link href="/invitation-card/" className="underline underline-offset-2">
          Cardly
        </Link>{" "}
        에서 만들었습니다. 가입 없이 무료로 만들 수 있습니다.
      </p>
    </div>
  );
}
