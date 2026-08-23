"use client";

/**
 * 방금 발행한 링크를 받아 주는 자리.
 *
 * 발행하면 문서는 그 즉시 데이터베이스에 있지만, 그 주소의 HTML 은 다음
 * 빌드에서야 생깁니다(카카오톡 미리보기를 굽기 위해 필요합니다). 그 사이에
 * 링크를 받은 사람은 정적 호스팅에서 404 페이지를 만나게 됩니다.
 *
 * 그래서 404 페이지가 주소를 한 번 봅니다. /w/… 나 /i/… 면 «없는 페이지»
 * 가 아니라 «아직 굽지 않은 청첩장» 이므로, 그 자리에서 내용을 받아 그대로
 * 그려 줍니다. 하객은 아무것도 눈치채지 못합니다.
 *
 * 되찾을 수 있는 주소가 아니면 아무것도 그리지 않고 원래의 404 화면을
 * 그대로 둡니다.
 */

import { PublicView } from "@/components/publish/public-view";
import { usePathname } from "@/lib/backend/browser";
import type { DocKind } from "@/lib/backend/docs";

interface Target {
  kind: DocKind;
  slug: string;
}

function parse(pathname: string): Target | null {
  // basePath 가 붙어 있어도 뒤에서부터 두 조각만 보면 됩니다.
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 2) return null;
  const slug = parts[parts.length - 1]!;
  const section = parts[parts.length - 2]!;
  if (!/^[a-z0-9-]{4,64}$/.test(slug)) return null;
  if (section === "w") return { kind: "wedding", slug };
  if (section === "i") return { kind: "occasion", slug };
  return null;
}

export function SlugFallback({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 첫 그림(빌드 때)에서는 경로를 알 수 없습니다. 404 문구를 먼저 보여 주고
  // 나중에 청첩장으로 바꾸면 하객이 «없는 페이지» 를 한 번 보게 되므로,
  // 판단이 설 때까지는 아무것도 그리지 않습니다.
  if (!pathname) return null;

  const target = parse(pathname);
  if (target) return <PublicView kind={target.kind} slug={target.slug} />;
  return <>{children}</>;
}
