import { DesignGallery } from "@/components/home/design-gallery";
import { HomeHero } from "@/components/home/hero";
import { ToolRows } from "@/components/home/tool-rows";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/**
 * 홈.
 *
 * 남긴 것은 셋뿐입니다.
 *   ① 한 줄로 무엇을 하는 곳인지 + 누를 곳 하나
 *   ② 만들 수 있는 것 넷을 한 줄씩, 결과물을 크게
 *   ③ 디자인은 이만큼 있다 — 그림만
 *
 * 걷어낸 것: 안심 문구 세 줄(«가입 없음 · 서버 저장 안 함 · 무료»),
 * 맨 아래 한 번 더 있던 시작 단추, 줄마다 붙어 있던 영문 라벨과
 * «템플릿 몇 종» 같은 숫자 줄. 셋 다 화면을 채울 뿐 무엇을 만들 수 있는지는
 * 한 글자도 더 말해 주지 않았습니다. 단추는 머리띠에 늘 떠 있습니다.
 *
 * 조판은 app/home.css 의 `.hm-*` 가 들고 있고, 그 규칙은 이 페이지 밖으로
 * 나가지 않습니다.
 */
export default function Home() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="hm flex-1">
        <HomeHero />
        <ToolRows />
        <DesignGallery />
      </main>

      <SiteFooter />
    </>
  );
}
