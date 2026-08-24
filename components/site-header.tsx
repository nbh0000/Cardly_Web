"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/backend/auth";
import { backendEnabled } from "@/lib/backend/client";
import { PRINT_CATEGORIES } from "@/lib/print/specs";

/* 무엇을 파는 곳인지가 차례에 드러나야 합니다. 링크를 발행하는 둘이
   앞에 서고, 브라우저 안에서 끝나는 서류가 뒤에 섭니다. */
const NAV: { href: string; label: string; children?: { href: string; label: string }[] }[] = [
  { href: "/templates", label: "모바일 청첩장" },
  { href: "/invitation-card", label: "초대장" },
  { href: "/resume", label: "이력서" },
  { href: "/business-card", label: "명함" },
  {
    href: "/print",
    label: "인쇄물",
    /* 갈래가 여섯이라 차례에 다 세우면 머리가 두 줄이 됩니다. 그래서
       하나만 세우고 나머지는 그 아래로 접어 두었습니다. */
    children: PRINT_CATEGORIES.map((c) => ({ href: `/print/${c.id}`, label: c.label })),
  },
];

export function SiteHeader() {
  const session = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    /* 머리는 언제나 한 겹의 띠입니다.

       예전에는 맨 위에서 투명하게 떠 있다가 스크롤해야 배경이 생겼습니다.
       그러면 «어디까지가 머리이고 어디부터가 내용인지» 가 페이지를 내려야
       비로소 정해집니다. 도구를 고르러 온 사람에게는 그 경계가 처음부터
       분명한 편이 낫습니다 — 띠와 아래 내용을 선 하나로 확실히 나눕니다.
       스크롤하면 그림자만 얹어 띄웁니다. */
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-line-soft bg-ivory/92 backdrop-blur-md transition-shadow duration-300 ${
        scrolled || open ? "shadow-[0_1px_16px_-6px_rgb(40_30_20/0.22)]" : ""
      }`}
    >
      <div className="shell flex h-16 items-center justify-between gap-6 md:h-20">
        <Link
          href="/"
          className="font-serif text-xl tracking-tight text-ink md:text-2xl"
        >
          Cardly
          <span className="ml-1.5 align-super text-[0.5em] tracking-[0.24em] text-rose-deep">
            KR
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV.map((item) =>
            item.children ? (
              <span key={item.href} className="sh-drop">
                <Link
                  href={item.href}
                  className="text-caption text-ink-soft transition-colors hover:text-rose-deep"
                >
                  {item.label}
                </Link>
                <span className="sh-drop-menu">
                  {item.children.map((child) => (
                    <Link key={child.href} href={child.href}>
                      {child.label}
                    </Link>
                  ))}
                </span>
              </span>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-caption text-ink-soft transition-colors hover:text-rose-deep"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/pricing"
            className="rounded-full bg-rose-veil px-2.5 py-1 text-[0.6875rem] text-rose-deep transition-colors hover:bg-rose-mist"
          >
            요금 안내
          </Link>
          {backendEnabled && (
            <Link
              href={session ? "/account" : "/login"}
              className="text-caption text-ink-soft transition-colors hover:text-rose-deep"
            >
              {session ? "내 카드함" : "로그인"}
            </Link>
          )}
          <Link href="/templates" className="btn btn-primary btn-sm">
            무료로 만들기
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          className="-mr-2 grid h-10 w-10 place-items-center md:hidden"
        >
          <span className="relative block h-3.5 w-5">
            <span
              className={`absolute left-0 block h-px w-full bg-ink transition-transform duration-300 ${
                open ? "top-1/2 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 block h-px w-full bg-ink transition-transform duration-300 ${
                open ? "top-1/2 -rotate-45" : "top-full"
              }`}
            />
          </span>
        </button>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-line-soft bg-ivory md:hidden"
      >
        <nav className="shell flex flex-col py-2">
          {NAV.map((item) => (
            <div key={item.href} className="border-b border-line-soft last:border-0">
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block py-4 font-serif text-h3 text-ink"
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="-mt-1 flex flex-wrap gap-2 pb-4">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setOpen(false)}
                      className="rounded-full border border-line px-3 py-1 text-caption text-ink-soft"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="py-6">
            <Link
              href="/templates"
              onClick={() => setOpen(false)}
              className="btn btn-primary w-full"
            >
              무료로 만들기
            </Link>
            {backendEnabled && (
              <Link
                href={session ? "/account" : "/login"}
                onClick={() => setOpen(false)}
                className="mt-3 block text-center text-caption text-ink-soft"
              >
                {session ? "내 카드함" : "로그인"}
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
