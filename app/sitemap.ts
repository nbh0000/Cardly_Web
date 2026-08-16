import type { MetadataRoute } from "next";
import { DESIGNS } from "@/lib/card/designs";
import { TEMPLATES } from "@/lib/invitation";

const SITE = "https://cardly.kr";

// output: export 에서는 라우트 핸들러가 정적으로 고정되어야 합니다.
export const dynamic = "force-static";

/**
 * 정적 내보내기에서도 빌드 시점에 /sitemap.xml 로 떨어집니다.
 * 주소 끝의 슬래시는 next.config.ts 의 trailingSlash 설정과 맞춰야
 * 서치 콘솔에서 리디렉션으로 잡히지 않습니다.
 */
/**
 * 내용이 실제로 바뀐 날짜를 손으로 적습니다.
 * 빌드 시각을 쓰면 배포할 때마다 모든 페이지의 lastmod 가 갱신되어,
 * 검색엔진에 "전부 새로 쓰였다"는 잘못된 신호를 보내게 됩니다.
 */
const UPDATED = new Date("2026-08-12");

export default function sitemap(): MetadataRoute.Sitemap {
  const core: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: UPDATED, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE}/resume/`,
      lastModified: UPDATED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE}/business-card/`,
      lastModified: UPDATED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE}/templates/`,
      lastModified: UPDATED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE}/invitation-card/`,
      lastModified: UPDATED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE}/pricing/`,
      lastModified: UPDATED,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE}/privacy/`,
      lastModified: UPDATED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE}/terms/`,
      lastModified: UPDATED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const previews: MetadataRoute.Sitemap = TEMPLATES.map((template) => ({
    url: `${SITE}/preview/${template.id}/`,
    lastModified: UPDATED,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  // 초대장 카드 낱장 — 행사별 검색어로 들어오는 자리입니다.
  const cards: MetadataRoute.Sitemap = DESIGNS.map((design) => ({
    url: `${SITE}/invitation-card/${design.id}/`,
    lastModified: UPDATED,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  // 발행된 청첩장(/i/<slug>)과 받은 카드(?c=)는 당사자만 보는 주소라
  // 넣지 않습니다.
  return [...core, ...previews, ...cards];
}
