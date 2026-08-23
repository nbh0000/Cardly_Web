import type { Metadata } from "next";
import { PayComplete } from "@/components/account/pay-result";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "결제 확인",
  robots: { index: false, follow: false },
};

export default function PayCompletePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-28 pb-section md:pt-36">
        <div className="shell">
          <PayComplete />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
