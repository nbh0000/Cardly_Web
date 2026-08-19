import type { Metadata } from "next";
import { Viewer } from "@/components/occasion/viewer";

/* 예전 공유 주소 — /invitation-card/v/?c=…

   지금은 디자인이 경로에 들어간 주소(/invitation-card/v/<디자인>/?c=…)를
   씁니다. 그래야 카카오톡 미리보기에 표지 그림을 붙일 수 있기 때문입니다.
   그렇지만 이미 보낸 링크가 어느 날 갑자기 안 열리면 안 되므로 이 주소도
   그대로 둡니다. 내용은 물음표 뒤에 다 있고 디자인 id 도 그 안에 있어서,
   경로 없이도 카드는 똑같이 열립니다. 미리보기 그림만 없습니다.

   여기에는 초대장별 OG 를 붙일 수 없습니다 — 주소가 하나뿐이라 어떤
   디자인이 올지 미리 알 수 없기 때문입니다. */
export const metadata: Metadata = {
  title: "초대장",
  robots: { index: false, follow: false },
};

export default function ViewPage() {
  return (
    <main id="main" className="flex-1 overflow-x-clip">
      <Viewer />
    </main>
  );
}
