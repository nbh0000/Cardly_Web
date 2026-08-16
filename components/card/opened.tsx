"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { CardBook } from "@/components/card/card-book";
import { getDesign } from "@/lib/card/designs";
import { decodeDoc } from "@/lib/card/doc";

/* ============================================================
   받은 카드

   링크에 담긴 내용을 풀어 카드로 세웁니다. 정적 배포라 서버가 주소의
   ?c= 를 읽을 수 없어서, 브라우저에서 읽어 그립니다. 그래서 첫 프레임은
   "카드를 꺼내는 중"이고, 그 다음 프레임에 카드가 나타나 저절로 펴집니다.
   ============================================================ */

/** 값이 바뀌지 않는 스토어 — 최초 스냅샷만 필요할 때 씁니다. */
const subscribeNever = () => () => {};

export function OpenedCard() {
  /* 서버는 null 을 돌려주므로 첫 프레임은 "꺼내는 중" 입니다.
     문자열 하나만 받아 두고 푸는 것은 useMemo 로 미룹니다 — 스냅샷이
     매번 새 객체를 돌려주면 렌더가 멈추지 않습니다. */
  const token = useSyncExternalStore(
    subscribeNever,
    () => new URLSearchParams(window.location.search).get("c"),
    () => null,
  );

  const state = useMemo(() => {
    if (token === null) return { kind: "loading" } as const;
    const doc = decodeDoc(token);
    const design = doc ? getDesign(doc.designId) : undefined;
    return doc && design
      ? ({ kind: "ok", design, doc } as const)
      : ({ kind: "bad" } as const);
  }, [token]);

  if (state.kind === "loading") {
    return (
      <div className="grid min-h-dvh place-items-center bg-sand">
        <p className="text-caption text-muted">카드를 꺼내는 중…</p>
      </div>
    );
  }

  if (state.kind === "bad") {
    return (
      <div className="grid min-h-dvh place-items-center bg-sand px-6">
        <div className="max-w-narrow text-center">
          <h1 className="font-serif text-h2 text-ink">
            카드를 열 수 없습니다
          </h1>
          <p className="mt-4 text-caption text-ink-soft">
            링크가 도중에 잘렸거나 잘못 복사된 것 같습니다. 보내 주신 분께
            주소 전체를 다시 받아 보세요.
          </p>
          <Link href="/invitation-card" className="btn btn-ghost mt-8 bg-white">
            초대장 만들어 보기
          </Link>
        </div>
      </div>
    );
  }

  const { design, doc } = state;

  return (
    <div className="grid min-h-dvh grid-rows-[1fr_auto] bg-sand">
      <div className="mx-auto flex w-full max-w-3xl items-center px-4 py-10">
        <CardBook design={design} doc={doc} autoOpen className="w-full" />
      </div>

      <footer className="border-t border-line/70 bg-ivory/70 px-4 py-5 text-center">
        <p className="text-[0.75rem] text-muted">
          {doc.title} · {doc.host}
        </p>
        <Link
          href="/invitation-card"
          className="mt-2 inline-block text-[0.75rem] whitespace-nowrap text-rose-deep underline-offset-4 hover:underline"
        >
          나도 초대장 만들기
        </Link>
      </footer>
    </div>
  );
}
