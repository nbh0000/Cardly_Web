"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * 예전 Cardly 사이트에서 색인된 주소를 새 위치로 넘겨 줍니다.
 *
 * 정적 호스팅이라 서버 리디렉션(301)을 쓸 수 없습니다. 그래서 페이지를
 * 실제로 하나 만들어 두고, canonical 로 새 주소를 가리킨 뒤 브라우저에서
 * 곧바로 이동시킵니다. 검색엔진은 이 조합을 이동으로 해석하고, 사람은
 * 자바스크립트가 막혀 있어도 본문의 링크로 갈 수 있습니다.
 */
export function LegacyRedirect({
  to,
  title,
  note,
}: {
  to: string;
  title: string;
  note: string;
}) {
  const router = useRouter();

  useEffect(() => {
    router.replace(to);
  }, [router, to]);

  return (
    <main
      id="main"
      className="flex flex-1 items-center justify-center px-gutter py-section"
    >
      <div className="max-w-narrow text-center">
        <span className="eyebrow eyebrow-center">Moved</span>
        <h1 className="mt-5 font-serif text-h2 text-ink">{title}</h1>
        <p className="mt-5 text-body text-ink-soft">{note}</p>
        <p className="mt-8">
          <Link href={to} className="btn btn-primary">
            바로 이동하기
          </Link>
        </p>
      </div>
    </main>
  );
}
