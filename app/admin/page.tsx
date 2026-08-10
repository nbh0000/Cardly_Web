import type { Metadata } from "next";
import Link from "next/link";
import { TemplateBuilder } from "@/components/admin/template-builder";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getInvitationData, listInvitations } from "@/lib/invitations";
import { formatDateKo, fullName } from "@/lib/invitation";

export const metadata: Metadata = {
  title: "템플릿 관리",
  robots: { index: false, follow: false },
};

/**
 * 발행된 청첩장 목록.
 * 하객에게 보내는 주소가 여기 모여 있어야 "그 집 청첩장 주소 뭐였지"를
 * 뒤지지 않습니다.
 */
function PublishedInvitations() {
  const list = listInvitations();

  return (
    <section className="mt-block">
      <h2 className="font-serif text-h2 text-ink">발행된 청첩장</h2>
      <p className="mt-3 max-w-narrow text-body text-ink-soft">
        하객에게 보내는 실제 주소입니다. 카카오톡에 링크를 붙여넣으면 신랑·신부
        이름과 사진이 미리보기로 뜹니다.
      </p>

      <div className="mt-6 rounded-lg border border-line bg-white p-5 sm:p-6">
        <p className="text-[0.8125rem] leading-relaxed text-ink-soft">
          <b className="text-ink">새 청첩장 발행 순서</b>
        </p>
        <ol className="mt-3 grid list-decimal gap-1.5 pl-5 text-[0.8125rem] leading-relaxed text-ink-soft">
          <li>편집기에서 내용을 채우고 &lsquo;발행용 파일 내보내기&rsquo;를 누릅니다.</li>
          <li>
            터미널에서{" "}
            <code className="rounded bg-cream px-1.5 py-0.5 text-[0.75rem]">
              npm run invite:add -- &lt;내려받은 파일&gt;
            </code>{" "}
            을 실행합니다.
          </li>
          <li>커밋하고 푸시하면 약 1분 뒤 주소가 열립니다.</li>
        </ol>
      </div>

      {list.length === 0 ? (
        <p className="mt-6 text-[0.8125rem] text-muted">아직 발행된 청첩장이 없습니다.</p>
      ) : (
        <ul className="mt-6 grid gap-2">
          {list.map((rec) => {
            const data = getInvitationData(rec);
            return (
              <li
                key={rec.slug}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-line bg-white px-4 py-3"
              >
                <span className="font-serif text-[0.9375rem] text-ink">
                  {fullName(data.groom)} &middot; {fullName(data.bride)}
                </span>
                <span className="text-caption text-muted">
                  {formatDateKo(data.date)} · {data.venueName}
                </span>
                <Link
                  href={`/i/${rec.slug}`}
                  className="ml-auto rounded-full border border-line px-3 py-1.5 text-[0.75rem] text-ink-soft hover:border-rose"
                >
                  /i/{rec.slug}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default function AdminPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-28 pb-section md:pt-32">
        <div className="shell">
          <header className="max-w-narrow">
            <span className="eyebrow">Admin</span>
            <h1 className="mt-5 font-serif text-h1 text-ink">템플릿 관리</h1>
            <p className="mt-5 text-body text-ink-soft">
              새 청첩장 템플릿을 만들고 바로 미리보며 등록합니다.
            </p>
          </header>

          {/* 저장이 어디로 가는지 먼저 밝혀 둡니다.
              이 설명이 없으면 "저장했는데 다른 사람에게 안 보인다"가 됩니다. */}
          <div className="mt-8 max-w-narrow rounded-lg border border-line bg-rose-veil/60 p-5">
            <p className="text-[0.8125rem] leading-relaxed text-ink-soft">
              템플릿을 저장하는 방법은 세 가지입니다. 어느 쪽으로 저장되는지는
              아래 &lsquo;저장 위치&rsquo;에 표시됩니다.
            </p>
            <ol className="mt-3 grid gap-1.5 text-[0.8125rem] leading-relaxed text-ink-soft">
              <li>
                <b className="text-ink">데이터베이스</b> — Supabase 를 연결하면
                저장하는 즉시 모든 방문자에게 반영됩니다. 배포도 커밋도 필요
                없습니다. 설정은{" "}
                <code className="rounded bg-white px-1.5 py-0.5 text-[0.75rem]">
                  supabase/schema.sql
                </code>{" "}
                의 안내를 따르세요.
              </li>
              <li>
                <b className="text-ink">이 브라우저에 저장</b> — 연결 전 기본
                동작입니다. 지금 쓰는 브라우저에만 남습니다.
              </li>
              <li>
                <b className="text-ink">파일로 배포</b> — &lsquo;JSON
                내보내기&rsquo;로 받은 파일을{" "}
                <code className="rounded bg-white px-1.5 py-0.5 text-[0.75rem]">
                  lib/published-templates.json
                </code>{" "}
                에 넣고 커밋하면 빌드에 포함됩니다.
              </li>
            </ol>
          </div>

          <PublishedInvitations />

          <div className="mt-block">
            <TemplateBuilder />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
