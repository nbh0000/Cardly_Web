"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/resume", label: "이력서" },
  { href: "/business-card", label: "명함" },
  { href: "/templates", label: "모바일 청첩장" },
];

export function SiteHeader() {
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
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled || open
          ? "border-b border-line-soft bg-ivory/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
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
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-caption text-ink-soft transition-colors hover:text-rose-deep"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/pricing"
            className="rounded-full bg-rose-veil px-2.5 py-1 text-[0.6875rem] text-rose-deep transition-colors hover:bg-rose-mist"
          >
            요금 안내
          </Link>
          <Link href="/resume" className="btn btn-primary btn-sm">
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
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-b border-line-soft py-4 font-serif text-h3 text-ink last:border-0"
            >
              {item.label}
            </Link>
          ))}
          <div className="py-6">
            <Link
              href="/resume"
              onClick={() => setOpen(false)}
              className="btn btn-primary w-full"
            >
              무료로 만들기
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
