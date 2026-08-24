import { PRINT_TEMPLATES } from "@/lib/print/templates";
import { PRINT_ART } from "@/lib/print/art";

/**
 * 템플릿 마흔여덟 장을 기계가 읽을 수 있는 한 덩이로 내보냅니다.
 *
 * 사람이 보는 화면이 아니라 점검 스크립트(scripts/print-check.mjs)가 읽는
 * 파일입니다. 템플릿은 TypeScript 로 적혀 있어 Node 스크립트가 그대로
 * 불러올 수 없는데, 빌드가 한 번 지나가면서 이 파일을 떨궈 주면 그 담이
 * 사라집니다.
 *
 * 정적 내보내기라 빌드 시점에 한 번 만들어지고 그 뒤로 바뀌지 않습니다.
 */
export const dynamic = "force-static";

export async function GET() {
  return Response.json(
    {
      generatedFrom: "lib/print/templates",
      counts: {
        templates: PRINT_TEMPLATES.length,
        art: PRINT_ART.length,
      },
      art: PRINT_ART.map((a) => ({
        id: a.id,
        file: a.file ?? null,
        width: a.width ?? null,
        height: a.height ?? null,
        style: a.style,
        model: a.model ?? null,
        upscaled: a.upscaled ?? false,
        prompt: a.prompt,
      })),
      templates: PRINT_TEMPLATES,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
