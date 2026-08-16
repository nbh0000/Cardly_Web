import type { Metadata } from "next";
import { Viewer } from "@/components/occasion/viewer";

export const metadata: Metadata = {
  title: "초대장",
  description: "받으신 초대장입니다. 카드를 눌러 열어 보세요.",
  /* 주소마다 내용이 다른 개인 초대장입니다. 검색에 걸릴 이유가 없습니다. */
  robots: { index: false, follow: false },
};

export default function ViewPage() {
  return <Viewer />;
}
