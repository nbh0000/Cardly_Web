import type { Metadata } from "next";
import { TemplateBuilder } from "@/components/admin/template-builder";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "템플릿 관리",
  robots: { index: false, follow: false },
};

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

          {/* 정적 호스팅이라 저장 방식이 두 갈래인 점을 먼저 밝혀 둡니다.
              이 설명이 없으면 "저장했는데 다른 사람에게 안 보인다"가 됩니다. */}
          <div className="mt-8 max-w-narrow rounded-lg border border-line bg-rose-veil/60 p-5">
            <p className="text-[0.8125rem] leading-relaxed text-ink-soft">
              이 사이트는 서버 없이 정적 파일로만 돌아갑니다. 그래서 저장이 두
              단계입니다.
            </p>
            <ol className="mt-3 grid gap-1.5 text-[0.8125rem] leading-relaxed text-ink-soft">
              <li>
                <b className="text-ink">이 브라우저에 저장</b> — 지금 쓰는
                브라우저의 템플릿 목록과 편집기에 바로 나타납니다. 만들면서
                확인하는 용도입니다.
              </li>
              <li>
                <b className="text-ink">모두에게 배포</b> — 아래 &lsquo;JSON
                내보내기&rsquo;로 받은 파일을{" "}
                <code className="rounded bg-white px-1.5 py-0.5 text-[0.75rem]">
                  lib/published-templates.json
                </code>{" "}
                에 넣고 커밋하면 빌드에 포함되어 모든 방문자에게 보입니다.
              </li>
            </ol>
          </div>

          <div className="mt-block">
            <TemplateBuilder />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
