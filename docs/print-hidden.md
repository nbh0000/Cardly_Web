# 인쇄물 — 지금은 감춰 두었습니다

2026-08-27, 인쇄물(`/print`)을 사이트에서 내렸습니다. **코드는 하나도 지우지
않았습니다.** 화면에서만 사라졌고, 아래 다섯 줄을 되돌리면 그대로 돌아옵니다.

## 무엇을 했나

| 한 일 | 어디 |
| --- | --- |
| 라우트를 밑줄 폴더로 옮김 | `app/print/` → `app/_print/`, `app/print-templates.json/` → `app/_print-templates.json/` |
| 그 폴더를 타입 검사에서 뺌 | `tsconfig.json` 의 `exclude` |
| 머리 차례에서 뺌 | `components/site-header.tsx` |
| 홈 첫 화면의 칸을 뺌 | `components/home/launcher.tsx`, `components/home/mockups.tsx` (PrintMock) |
| 요금 안내에서 인쇄물·AI 크레딧 절을 뺌 | `app/pricing/page.tsx` |
| 카드함의 «+ 인쇄물» 단추를 뺌 | `components/account/card-box.tsx` |
| 사이트맵에서 55개 주소를 뺌 | `app/sitemap.ts` |

Next 는 밑줄로 시작하는 폴더를 라우트로 만들지 않습니다. 그래서 `/print/` 는
지금 404 이고, 빌드에도 들어가지 않습니다.

## 그대로 남아 있는 것

- `lib/print/` 전부 — 규격·자료형·템플릿 48종·PDF 내보내기·AI 호출
- `components/print/` 전부 — 편집기·목록·미리보기·자가 점검
- `public/print-art/` 19장(원본·sm·md), `public/print-fonts/` 글꼴 6벌
- `scripts/print-art.mjs`·`print-variants.mjs`·`print-og.mjs`·`print-check.mjs`
- `supabase/functions/ai-print/`, `supabase/schema.sql` 의 9·10절
- `lib/plan.ts` 의 `PRINT_PLANS`·`CREDIT_PACKS`, `lib/print/save.ts`
- 문서 셋 — `print-editor-decisions.md`, `print-templates.md`, `print-fonts.md`

카드함은 `kind = 'print'` 인 문서를 여전히 알아봅니다. 이미 저장해 둔 인쇄물이
있으면 목록에 그대로 뜨고 편집기로도 열립니다 — 다만 지금은 그 편집기 주소가
없으므로 링크는 404 가 됩니다. 되살리면 다시 열립니다.

## 다시 켜려면

```bash
git mv app/_print app/print
git mv app/_print-templates.json app/print-templates.json
```

그다음 `tsconfig.json` 의 `exclude` 에서 두 줄을 지우고, 위 표의 화면 다섯 곳을
되돌립니다. 정확한 코드는 이 커밋의 부모에 그대로 있습니다:

```bash
git log --oneline -- components/home/launcher.tsx   # 인쇄물 칸이 있던 마지막 커밋
git show <그 커밋>:components/home/launcher.tsx
```

되돌린 뒤에는 확인 두 가지를 다시 돌리세요.

```bash
GITHUB_PAGES=true npx next build
npm run print:check      # 값 검사
# 그리고 /print/check/ 를 브라우저에서 한 번
```

## 남겨 둔 무게

`public/print-art`(29MB)와 `public/print-fonts`(18MB)는 `public/` 안에 있어
빌드 결과물에 그대로 복사됩니다. 아무도 내려받지 않는 파일이지만 배포
아티팩트가 47MB 커집니다. 되살릴 때 경로가 어긋나지 않는 쪽이 낫다고 보고
그대로 두었습니다. 정말 걷어내야 하면 `public/` 밖으로 옮기고, 되살릴 때
다시 넣으면 됩니다.
