import { Launcher } from "@/components/home/launcher";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/**
 * 홈.
 *
 * 소개 페이지가 아니라 «고르는 화면» 입니다. 한 화면 안에서 끝나고,
 * 스크롤할 것이 없습니다. 무엇을 만드는 곳인지는 넷의 이름과 그림이
 * 이미 말하고 있어서, 그 위에 얹을 문장이 없습니다.
 */
export default function Home() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        <Launcher />
      </main>

      <SiteFooter />
    </>
  );
}
