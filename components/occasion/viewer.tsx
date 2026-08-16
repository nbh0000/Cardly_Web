"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { InviteCard } from "@/components/occasion/card";
import { decodeInvite } from "@/lib/occasion/share";
import type { InviteData } from "@/lib/occasion/types";

/* 받은 사람이 보는 화면.

   주소 뒤에 실린 내용을 풀어 카드를 세웁니다. 여기에는 사이트 머리글도
   바닥글도 없습니다 — 받은 사람에게 이 페이지는 «카드»이지 웹사이트가
   아닙니다. 만든 곳 표시는 맨 아래 한 줄로 족합니다.

   주소는 ref 로 읽습니다. 정적 내보내기라 물음표 뒤는 서버가 모르고,
   이 저장소는 효과(effect) 안에서 setState 를 쓰지 않기로 되어 있습니다.
   ref 콜백은 사이트 안에서 넘어와 붙는 경우에도 반드시 한 번 돕니다. */

export function Viewer() {
  const [data, setData] = useState<InviteData | null>(null);

  const read = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const code = new URLSearchParams(window.location.search).get("c");
    if (!code) return;
    const parsed = decodeInvite(code);
    if (parsed) setData(parsed);
  }, []);

  return (
    <div ref={read} className="min-h-dvh bg-cream">
      {data ? (
        <div className="py-6 sm:py-12">
          <InviteCard data={data} />
          <p className="mt-10 text-center text-[0.6875rem] text-muted">
            <Link
              href="/invitation-card/"
              className="underline underline-offset-2"
            >
              Cardly 로 만든 모바일 초대장
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid min-h-dvh place-items-center px-6">
          <div className="max-w-narrow text-center">
            {/* 아직 주소를 못 읽었을 수도, 링크가 잘렸을 수도 있습니다.
                둘 다 «기다리면 될지도 모르는» 상태라 나무라지 않습니다. */}
            <p className="font-serif text-h2 text-ink">초대장을 여는 중입니다</p>
            <p className="mt-4 text-caption text-ink-soft">
              링크가 중간에 잘리면 카드가 열리지 않습니다. 보내 주신 분께
              전체 주소를 다시 받아 보세요.
            </p>
            <Link href="/invitation-card/" className="btn btn-ghost mt-8 bg-white">
              나도 초대장 만들기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
