import type { Metadata } from "next";
import { Viewer } from "@/components/occasion/viewer";

/* 받은 사람이 여는 주소입니다. 내용이 물음표 뒤에 실려 있으므로
   검색엔진에 실릴 것이 없고, 실려서도 안 됩니다. */
export const metadata: Metadata = {
  title: "초대장",
  robots: { index: false, follow: false },
};

export default function ViewPage() {
  return (
    <main id="main" className="flex-1">
      <Viewer />
    </main>
  );
}
