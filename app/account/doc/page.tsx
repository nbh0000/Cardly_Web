import type { Metadata } from "next";
import Link from "next/link";
import { AccountBar, AccountGate } from "@/components/account/account-gate";
import { DocPanel } from "@/components/account/doc-panel";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "링크 관리",
  robots: { index: false, follow: false },
};

export default function DocPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-28 pb-section md:pt-36">
        <div className="shell max-w-[52rem]">
          <AccountGate next="/account">
            <AccountBar />
            <p className="mt-6">
              <Link
                href="/account"
                className="text-[0.75rem] text-muted underline underline-offset-2 hover:text-ink"
              >
                ← 내 카드함
              </Link>
            </p>
            <div className="mt-6">
              <DocPanel />
            </div>
          </AccountGate>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
