import type { NextConfig } from "next";

/**
 * GitHub Pages 는 정적 파일만 서빙하므로 `next export` 결과를 올립니다.
 *
 * 운영 도메인이 cardly.kr 이고 사이트가 그 루트에 올라가므로 basePath 는
 * 비어 있습니다. 다시 user.github.io/<repo> 형태로 되돌려야 할 때만
 * NEXT_PUBLIC_BASE_PATH 에 "/저장소이름" 을 넣어 빌드하세요.
 */
const isPages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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
