import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { asset } from "@/lib/asset";
import { dateDots, timeKo } from "@/lib/invite/format";
import { PRESETS } from "@/lib/invite/presets";
import { getTheme, THEMES, themeVars } from "@/lib/invite/themes";

const DESCRIPTION = `결혼식·돌잔치·생일·기업 행사까지 하나의 템플릿으로 만드는 모바일 웹 초대장. 행사 정보와 사진, 색만 바꾸면 되고 ${THEMES.length}가지 테마와 ${PRESETS.length}가지 행사 프리셋이 준비되어 있습니다.`;

export const metadata: Metadata = {
  title: "웹 초대장 템플릿 — 모바일 중심 · 테마 6종",
  description: DESCRIPTION,
  keywords: [
    "웹 초대장",
    "모바일 초대장",
    "초대장 템플릿",
    "청첩장 템플릿",
    "돌잔치 초대장",
    "생일 초대장",
    "기업 행사 초대장",
  ],
  alternates: { canonical: "/invitation-card/" },
  openGraph: {
    type: "website",
    url: "/invitation-card/",
    title: "웹 초대장 템플릿 | Cardly",
    description: DESCRIPTION,
  },
};

export default function InvitationTemplatePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-28 pb-section md:pt-36">
        <div className="shell">
          <header className="mx-auto max-w-narrow text-center">
            <span className="eyebrow eyebrow-center">Web Invitation</span>
            <h1 className="mt-5 font-serif text-h1 text-ink">웹 초대장 템플릿</h1>
            <p className="mt-5 text-body text-ink-soft">
              결혼식, 돌잔치, 생일, 기업 행사를 하나의 템플릿으로 만듭니다.
              모바일에서 가장 보기 좋게 짜였고, 넓은 화면에서는 가운데 한
              칸으로 섭니다. 행사 정보와 사진, 색만 바꾸면 됩니다.
            </p>
          </header>

          {/* ── 행사 프리셋 ── */}
          <section className="mt-block">
            <div className="mx-auto max-w-narrow text-center">
              <h2 className="font-serif text-h2 text-ink">행사별 프리셋</h2>
              <p className="mt-3 text-caption text-ink-soft">
                행사에 따라 켜는 칸과 부르는 말이 다릅니다. 가장 가까운 것을
                고른 뒤 내용만 바꾸세요.
              </p>
            </div>

            <ul className="mt-block grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {PRESETS.map((p) => {
                const t = getTheme(p.config.theme);
                return (
                  <li key={p.id}>
                    <Link
                      href={`/invitation-card/${p.id}/`}
                      className="group block overflow-hidden rounded-lg border border-line bg-white transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:border-rose hover:shadow-lift"
                    >
                      {/* 표지 미리보기 — 실제 테마 색과 사진을 그대로 씁니다 */}
                      <div
                        className="relative aspect-[4/5] overflow-hidden"
                        style={{ background: t.surface }}
                      >
                        {p.config.cover.image && (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={asset(p.config.cover.image)}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]"
                            />
                            <span
                              aria-hidden
                              className="absolute inset-0"
                              style={{
                                background:
                                  "linear-gradient(to bottom, rgb(20 16 12/.5), rgb(20 16 12/.12) 40%, rgb(20 16 12/.72))",
                              }}
                            />
                          </>
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                          <p
                            className="text-[0.625rem] tracking-[0.3em]"
                            style={{ color: t.accent }}
                          >
                            {p.config.cover.eyebrow}
                          </p>
                          <p className="mt-2 font-serif text-[1.375rem] leading-snug whitespace-pre-line">
                            {p.config.cover.title}
                          </p>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="font-serif text-[1.0625rem] text-ink">
                            {p.label}
                          </span>
                          <span className="text-[0.6875rem] tracking-[0.12em] text-muted">
                            {t.label}
                          </span>
                        </div>
                        <p className="mt-2 text-caption text-ink-soft">{p.note}</p>
                        <p className="mt-3 text-[0.75rem] text-muted">
                          {dateDots(p.config.event.date)}{" "}
                          {timeKo(p.config.event.time)} · 섹션{" "}
                          {p.config.sections.length}칸
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* ── 테마 ── */}
          <section className="mt-section border-t border-line pt-block">
            <div className="mx-auto max-w-narrow text-center">
              <h2 className="font-serif text-h2 text-ink">테마 {THEMES.length}종</h2>
              <p className="mt-3 text-caption text-ink-soft">
                설정 파일에서 <code className="font-mono">theme</code> 한 줄만
                바꾸면 초대장 전체의 색과 글꼴이 바뀝니다. 조판은 그대로입니다.
              </p>
            </div>

            <ul className="mt-block grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {THEMES.map((t) => (
                <li
                  key={t.id}
                  className="rounded-lg border border-line p-5"
                  style={{ ...themeVars(t), background: t.bg }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className="font-serif text-[1.0625rem]"
                      style={{ color: t.ink }}
                    >
                      {t.label}
                    </span>
                    <code
                      className="font-mono text-[0.6875rem]"
                      style={{ color: t.muted }}
                    >
                      &quot;{t.id}&quot;
                    </code>
                  </div>
                  <p className="mt-2 text-caption" style={{ color: t.inkSoft }}>
                    {t.note}
                  </p>
                  <div className="mt-4 flex gap-1.5" aria-hidden>
                    {[t.bg, t.surface, t.accentSoft, t.accent, t.accentDeep, t.ink].map(
                      (c) => (
                        <span
                          key={c}
                          className="h-7 flex-1 rounded"
                          style={{ background: c, boxShadow: `inset 0 0 0 1px ${t.line}` }}
                        />
                      ),
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* ── 쓰는 법 ── */}
          <section className="mt-section border-t border-line pt-block">
            <div className="mx-auto max-w-narrow">
              <h2 className="text-center font-serif text-h2 text-ink">
                내 초대장으로 바꾸기
              </h2>
              <p className="mt-3 text-center text-caption text-ink-soft">
                개발을 몰라도 됩니다. 파일 하나만 고치면 됩니다.
              </p>

              <ol className="mt-block grid gap-5">
                {[
                  [
                    "설정 파일을 엽니다",
                    "lib/invite/config.ts — 이 파일 하나가 내 초대장을 만듭니다. 큰따옴표 안의 글자만 바꾸고 쉼표와 괄호는 그대로 두세요.",
                  ],
                  [
                    "행사 정보를 채웁니다",
                    "이름, 날짜(연-월-일), 시간(24시간), 장소, 주소, 인사말, 연락처. 글 안에서 \\n 을 넣으면 줄이 바뀝니다.",
                  ],
                  [
                    "사진을 넣습니다",
                    "public 폴더에 사진을 두고 경로를 적습니다. public/photos/main.jpg 에 넣었다면 \"/photos/main.jpg\" 라고 씁니다.",
                  ],
                  [
                    "색을 고릅니다",
                    "맨 위 theme 값을 ivory · sage · blush · sky · ink · mocha 중 하나로 바꾸면 전체 색과 글꼴이 함께 바뀝니다.",
                  ],
                  [
                    "필요 없는 칸을 뺍니다",
                    "맨 아래 sections 목록에서 줄을 지우면 그 칸이 사라지고, 순서를 바꾸면 초대장에서도 그 순서가 됩니다.",
                  ],
                ].map(([t, d], i) => (
                  <li key={t} className="flex gap-4">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-rose-veil font-serif text-[0.8125rem] text-rose-deep">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-serif text-h3 text-ink">{t}</p>
                      <p className="mt-1.5 text-caption text-ink-soft">{d}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-block flex flex-wrap justify-center gap-2">
                <Link href="/invitation-card/my/" className="btn btn-primary">
                  내 초대장 미리보기
                </Link>
                <Link
                  href={`/invitation-card/${PRESETS[0]!.id}/`}
                  className="btn btn-ghost bg-white"
                >
                  결혼식 예시 보기
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
