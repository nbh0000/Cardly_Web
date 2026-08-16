import type { Metadata } from "next";
import { InviteStage } from "@/components/invite/stage";
import { MY_INVITE } from "@/lib/invite/config";

/* lib/invite/config.ts 를 그대로 그리는 자리입니다.
   설정 파일에 적은 제목·설명이 카카오톡 링크 미리보기에도 그대로
   쓰입니다. */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: MY_INVITE.shareTitle,
    description: MY_INVITE.shareDescription,
    alternates: { canonical: "/invitation-card/my/" },
    openGraph: {
      type: "website",
      url: "/invitation-card/my/",
      title: MY_INVITE.shareTitle,
      description: MY_INVITE.shareDescription,
    },
  };
}

export default function MyInvitePage() {
  return <InviteStage config={MY_INVITE} backLabel="템플릿 설명" />;
}
