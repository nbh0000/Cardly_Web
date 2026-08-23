import type { Metadata } from "next";
import { AccountBar, AccountGate } from "@/components/account/account-gate";
import { CardBox } from "@/components/account/card-box";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "내 카드함",
  description: "만든 청첩장과 초대장, 발행한 링크와 결제 내역을 한자리에서 봅니다.",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-28 pb-section md:pt-36">
        <div className="shell">
          <AccountGate>
            <AccountBar />
            <div className="mt-block">
              <CardBox />
            </div>
          </AccountGate>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
