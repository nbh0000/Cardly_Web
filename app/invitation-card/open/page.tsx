import type { Metadata } from "next";
import { OpenedCard } from "@/components/card/opened";

/* 받은 카드를 여는 자리입니다. 내용은 주소의 ?c= 안에 들어 있고,
   정적 배포라 서버는 그것을 읽지 않습니다 — 브라우저가 풉니다.
   그래서 카카오톡 링크 미리보기에는 카드 내용이 아니라 공통 문구가
   뜹니다. 카드 안의 이름과 날짜가 대화방에 그대로 노출되지 않는
   편이 오히려 낫습니다. */
export const metadata: Metadata = {
  title: "초대장이 도착했습니다",
  description: "링크를 열면 카드가 펴집니다.",
  robots: { index: false, follow: false },
};

export default function OpenCardPage() {
  return <OpenedCard />;
}
