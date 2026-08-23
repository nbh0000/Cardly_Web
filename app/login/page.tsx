import type { Metadata } from "next";
import { LoginPanel } from "@/components/account/login-panel";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "로그인",
  description:
    "청첩장·초대장을 계정에 저장하고 발행하기 위한 로그인입니다. 하객은 로그인 없이 링크만으로 봅니다.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-28 pb-section md:pt-36">
        <div className="shell">
          <header className="mx-auto max-w-narrow text-center">
            <span className="eyebrow eyebrow-center">Cardly</span>
            <h1 className="mt-5 font-serif text-h1 text-ink">로그인</h1>
            <p className="mt-5 text-body text-ink-soft">
              만든 청첩장과 초대장을 계정에 두고, 어느 기기에서나 이어서
              고칩니다.
            </p>
          </header>

          <div className="mt-block">
            <LoginPanel />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
