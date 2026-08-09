import type { NextConfig } from "next";

/**
 * GitHub Pages 는 정적 파일만 서빙하므로 `next export` 결과를 올립니다.
 *
 * - 로컬 개발(`npm run dev`)에서는 basePath 없이 http://localhost:3000/ 그대로.
 * - GitHub Actions 빌드에서는 GITHUB_PAGES=true 가 주어져
 *   https://<user>.github.io/<repo>/ 경로에 맞게 basePath 가 붙습니다.
 *
 * 저장소 이름을 바꾸면 NEXT_PUBLIC_BASE_PATH 만 바꾸면 됩니다.
 */
const isPages = process.env.GITHUB_PAGES === "true";
const basePath = isPages
  ? (process.env.NEXT_PUBLIC_BASE_PATH ?? "/wedding-web")
  : "";

const nextConfig: NextConfig = {
  // public/ 의 정적 파일을 <img src> 로 직접 참조할 때 붙일 접두사.
  // basePath 는 Next 라우팅에만 적용되므로 클라이언트에도 같은 값을 넘겨줍니다.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  ...(isPages
    ? {
        output: "export",
        basePath,
        assetPrefix: basePath,
        // 정적 내보내기에서는 Next 이미지 최적화 서버를 쓸 수 없습니다.
        images: { unoptimized: true },
        // /templates → /templates/index.html 로 떨어지도록
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
