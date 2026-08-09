import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomEditor } from "@/components/admin/custom-editor";

export const metadata: Metadata = {
  title: "청첩장 편집",
  robots: { index: false, follow: false },
};

/**
 * 관리자 페이지에서 만든 템플릿으로 편집기를 여는 자리.
 *
 * 빌트인 템플릿은 /editor/[templateId] 로 미리 생성되지만, 커스텀 템플릿은
 * 빌드 시점에 존재하지 않으므로 정적 경로를 만들 수 없습니다. 대신 고정 경로
 * 하나를 두고 ?id= 로 어떤 템플릿인지 넘겨받습니다.
 */
export default function CustomEditorPage() {
  return (
    <Suspense>
      <CustomEditor />
    </Suspense>
  );
}
