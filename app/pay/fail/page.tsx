import type { Metadata } from "next";
import { PayFail } from "@/components/account/pay-result";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "결제 취소",
  robots: { index: false, follow: false },
};

export default function PayFailPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-28 pb-section md:pt-36">
        <div className="shell">
          <PayFail />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
