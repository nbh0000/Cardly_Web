import Link from "next/link";
import { InviteCard } from "@/components/invite/card";
import type { InviteConfig } from "@/lib/invite/types";

/**
 * 초대장을 놓는 자리.
 *
 * 돌아가는 링크는 카드를 받은 사람에게 필요 없는 것이라, 있는 줄만
 * 알아볼 정도로 조용히 둡니다.
 */
export function InviteStage({
  config,
  backLabel = "템플릿 목록",
}: {
  config: InviteConfig;
  backLabel?: string;
}) {
  return (
    <>
      <Link href="/invitation-card" className="o3-back">
        ‹ {backLabel}
      </Link>
      <InviteCard config={config} />
    </>
  );
}
