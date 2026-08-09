/**
 * public/ 아래 정적 파일의 실제 경로.
 *
 * GitHub Pages 는 https://<user>.github.io/<repo>/ 하위에 올라가므로 `<img src>`
 * 처럼 Next 라우터를 거치지 않는 참조에는 basePath 를 직접 붙여야 합니다.
 * 값은 next.config.ts 의 `env` 로 빌드 시점에 주입됩니다 (로컬은 빈 문자열).
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  return `${BASE}${path}`;
}
