import type { MetadataRoute } from "next";

// output: export 에서는 라우트 핸들러가 정적으로 고정되어야 합니다.
export const dynamic = "force-static";

/**
 * 발행된 청첩장(/i/<slug>)과 관리자 화면은 색인 대상이 아닙니다.
 * 나머지는 모두 열어 둡니다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/i/"],
      },
    ],
    sitemap: "https://cardly.kr/sitemap.xml",
    host: "https://cardly.kr",
  };
}
