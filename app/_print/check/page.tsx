import type { Metadata } from "next";
import { PrintSelfCheck } from "@/components/print/selfcheck";

/**
 * 템플릿 자가 점검 — /print/check/
 *
 * 손님에게 보이는 화면이 아니라 만드는 쪽이 쓰는 자리입니다. 마흔여덟 장을
 * 하나씩 열어 «글자 고치기 → 사진 바꾸기 → AI 문구 얹기 → PDF 만들기» 를
 * 실제로 돌리고, 나온 PDF 를 뜯어 봅니다.
 *
 * 배포에서 빼지 않고 남겨 둡니다. 템플릿을 더한 사람이 자기 브라우저에서
 * 한 번 눌러 보는 것이 가장 빠른 확인이고, 검색에는 잡히지 않습니다.
 */
export const metadata: Metadata = {
  title: "인쇄물 템플릿 자가 점검",
  robots: { index: false, follow: false },
};

export default function PrintCheckPage() {
  return (
    <main id="main" className="pc-page">
      <h1>인쇄물 템플릿 자가 점검</h1>
      <p>
        마흔여덟 장을 하나씩 열어 글자를 고치고, 사진을 바꾸고, AI 문구를 얹은 뒤 PDF 를
        만들어 뜯어 봅니다. 한 장에 3~10초가 걸립니다.
      </p>
      <PrintSelfCheck />
    </main>
  );
}
