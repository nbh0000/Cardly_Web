import type { MetadataRoute } from "next";

// output: export 에서는 라우트 핸들러가 정적으로 고정되어야 합니다.
export const dynamic = "force-static";

/**
 * 관리자 화면만 막습니다.
 *
 * 발행된 청첩장(/i/<slug>)도 색인 대상은 아니지만 여기서 막으면 안 됩니다.
 * robots 로 막으면 크롤러가 페이지를 아예 읽지 못해, 그 페이지에 걸어 둔
 * noindex 도 보지 못하고 무엇보다 카카오톡 같은 링크 미리보기가 뜨지
 * 않습니다. 링크 공유가 이 기능의 전부이므로 색인 제외는 페이지 자체의
 * robots 메타(app/i/[slug]/page.tsx)에 맡깁니다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/"],
      },
    ],
    sitemap: "https://cardly.kr/sitemap.xml",
    host: "https://cardly.kr",
  };
}
