"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Editor } from "@/components/editor/editor";
import { useCustomTemplates } from "@/lib/custom-templates";

/**
 * 커스텀 템플릿용 편집기 껍데기.
 *
 * Editor 는 첫 렌더에서 createDefaultData(templateId) 로 초기 상태를 만들기
 * 때문에, 템플릿이 레지스트리에 등록되기 전에 마운트하면 엉뚱한 기본값이
 * 굳어 버립니다. 그래서 목록을 다 읽은 뒤에야 Editor 를 그립니다.
 */
export function CustomEditor() {
  const id = useSearchParams().get("id") ?? "";
  const templates = useCustomTemplates();

  // useCustomTemplates 는 마운트 전(그리고 서버)에서 빈 배열입니다.
  if (templates.length === 0) return <Loading>템플릿을 불러오는 중…</Loading>;

  if (!templates.some((t) => t.id === id)) {
    return (
      <Loading>
        <p>이 브라우저에 &lsquo;{id}&rsquo; 템플릿이 없습니다.</p>
        <Link href="/admin" className="mt-4 inline-block underline">
          템플릿 관리로 가기
        </Link>
      </Loading>
    );
  }

  return <Editor key={id} templateId={id} />;
}

function Loading({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid flex-1 place-items-center p-10 text-center text-body text-ink-soft">
      <div>{children}</div>
    </main>
  );
}
