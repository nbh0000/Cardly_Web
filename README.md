# 다온 (DAON) — 모바일 청첩장 플랫폼

템플릿을 고르고 편집기에서 직접 내용을 채워 모바일 청첩장을 만드는 웹 서비스입니다.
**모든 기능이 무료이며 결제 절차가 없습니다.**

## 화면

| 경로 | 설명 |
| --- | --- |
| `/` | 홈 — 히어로, 템플릿 갤러리, 편집기 소개 |
| `/templates` | 템플릿 12종 전체, 카테고리 필터 |
| `/editor/[templateId]` | 편집기 — 좌측 21개 섹션 / 실시간 폰 미리보기 |
| `/preview/[templateId]` | 완성본 청첩장 전체 화면 |

## 편집기

좌측 아이콘 레일에서 섹션을 고르면 가운데 폼이 바뀌고, 오른쪽 폰 미리보기에 즉시 반영됩니다.

꾸미기 · 디자인 · 배경음악 · 오프닝 · 신랑 정보 · 신부 정보 · 미니앨범 · 예식 정보 ·
초대 글 · 계좌 정보 · 갤러리 · 안내사항 · 하객스냅 · 커플프로필 · 타임라인 · 비디오 ·
방명록 · 선물하기 · 참석여부 · 이미지 · 순서 변경

섹션을 켜면 청첩장에 추가되고 **순서 변경** 목록에 나타납니다. 순서는 드래그로 바꿀 수 있고,
각 패널에서 해당 섹션이 청첩장의 몇 번째에 놓이는지 확인할 수 있습니다.

## 디자인 토큰

색상·타이포·간격은 전부 `app/globals.css` 의 `@theme` 한 곳에서 정의합니다.
아이보리 베이스(`#FDFBF7`)에 더스티 로즈 포인트 1색(`#B08D80`, 텍스트·버튼용 `#8A6558` 은 WCAG AA 통과),
제목은 Noto Serif KR, 본문은 Noto Sans KR 입니다.

- `app/globals.css` — 디자인 토큰과 공통 컴포넌트 클래스
- `app/invitation.css` — 청첩장 렌더러 전용 스타일 (`--iv-*` 테마 변수)
- `app/motion.css` — 바텀 시트, 오프닝 애니메이션, 스크롤 리빌

## 개발

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드
npx tsc --noEmit # 타입 검사
npx eslint app components lib
```

## 배포 (GitHub Pages)

`main` 브랜치에 push 하면 `.github/workflows/deploy.yml` 이 정적 사이트를 빌드해 Pages 에 올립니다.
저장소 이름이 곧 basePath 가 되므로(`https://<user>.github.io/<repo>/`) 별도 설정은 필요 없습니다.

저장소 **Settings → Pages → Source** 를 `GitHub Actions` 로 지정해 주세요.

로컬에서 배포본을 그대로 확인하려면:

```powershell
$env:GITHUB_PAGES="true"; $env:NEXT_PUBLIC_BASE_PATH="/wedding-web"; npm run build
npx serve out
```

## 아직 서버가 필요한 기능

정적 사이트라 아래는 화면만 동작하고 데이터가 보관되지 않습니다.

- 참석 의사(RSVP) · 방명록 제출 — 브라우저 안에서만 반영
- 청첩장 발행 및 링크 생성
- 업로드한 사진 — `blob:` URL 이라 새로고침하면 사라짐 (임시저장은 텍스트만 보관)
- 지도 — 네이버·카카오 지도 SDK 와 API 키 필요
- 하객스냅 구글 드라이브 연동
