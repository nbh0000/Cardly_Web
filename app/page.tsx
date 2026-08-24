import { Closing } from "@/components/home/closing";
import { DesignGallery } from "@/components/home/design-gallery";
import { HomeHero } from "@/components/home/hero";
import { ToolRows } from "@/components/home/tool-rows";
import { TrustBand } from "@/components/home/trust-band";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/**
 * 홈.
 *
 * 위에서 아래로 한 가지씩만 말합니다.
 *   ① 무엇을 하는 곳인가 (+ 누를 곳 하나)
 *   ② 네 가지 도구를 한 줄씩, 결과물을 크게
 *   ③ 안심 세 줄
 *   ④ 디자인은 이만큼 있다 — 그림만
 *   ⑤ 다시 한 번, 누를 곳 하나
 *
 * 조판은 app/home.css 의 `.hm-*` 가 전부 들고 있고, 그 규칙은 이 페이지
 * 밖으로 나가지 않습니다.
 */
export default function Home() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="hm flex-1">
        <HomeHero />
        <ToolRows />
        <TrustBand />
        <DesignGallery />
        <Closing />
      </main>

      <SiteFooter />
    </>
  );
}
