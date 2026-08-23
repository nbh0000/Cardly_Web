"use client";

import { backendEnabled } from "@/lib/backend/client";

/**
 * 서버 키가 아직 안 꽂힌 배포에서만 나오는 한 줄.
 *
 * 요금 페이지는 «지금 발행할 수 있다» 고 말합니다. 실제로 그렇게 되려면
 * Supabase 키가 들어가 있어야 하는데, 그 사이에 값을 받겠다고 적어 두면
 * 지킬 수 없는 약속이 됩니다. 그래서 이 문장은 설정에 따라 저절로 나타나고
 * 저절로 사라집니다 — 사람이 지워야 하는 «준비 중» 문구가 아닙니다.
 */
export function BackendNotice() {
  if (backendEnabled) return null;

  return (
    <div className="mx-auto mt-8 max-w-narrow rounded-lg border border-line bg-white p-5 text-center">
      <p className="text-caption text-ink-soft">
        지금 이 배포에는 계정 서버가 연결되어 있지 않아 링크 발행과 결제가
        잠겨 있습니다. 만들어 보고 미리 보는 것은 그대로 되고, 이력서·명함은
        평소와 같습니다.
      </p>
    </div>
  );
}
