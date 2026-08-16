import Link from "next/link";
import { Invitation } from "@/components/invite/invitation";
import type { InviteConfig } from "@/lib/invite/types";

/**
 * 초대장을 놓는 무대.
 *
 * 좁은 화면에서는 초대장이 화면을 그대로 채웁니다. 넓은 화면에서는
 * 양옆에 바탕을 깔고 가운데 한 칸으로 세웁니다 — 초대장은 손에 쥐고
 * 보는 물건이라 데스크톱에서 좌우로 늘어나면 어색합니다.
 *
 * 돌아가는 링크는 화면 위에 떠 있되, 초대장을 받은 사람이 보는 화면과
 * 섞이지 않도록 아주 조용하게 둡니다.
 */
export function InviteStage({
  config,
  backLabel = "템플릿 목록",
}: {
  config: InviteConfig;
  backLabel?: string;
}) {
  return (
    <div className="wi-stage">
      <Link href="/invitation-card" className="wi-back">
        ‹ {backLabel}
      </Link>
      <Invitation config={config} />
    </div>
  );
}
