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

---

## 웹 초대장 템플릿

결혼식·돌잔치·생일·기업 행사를 하나의 템플릿으로 만드는 모바일 중심 초대장입니다.
개발을 몰라도 **설정 파일 하나만 고치면** 내 초대장이 됩니다.

| 경로 | 설명 |
| --- | --- |
| `/invitation-card` | 템플릿 설명 — 행사 프리셋 6종, 테마 6종, 쓰는 법 |
| `/invitation-card/[preset]` | 행사별 예시 초대장 (wedding · firstbirthday · birthday · corporate · opening · gathering) |
| `/invitation-card/my` | `lib/invite/config.ts` 를 그대로 그린 «내 초대장» |

### 내 초대장으로 바꾸기

`lib/invite/config.ts` 한 파일만 고칩니다. 큰따옴표 안의 글자만 바꾸고 쉼표·괄호는 그대로 둡니다.

1. **색** — 맨 위 `theme` 을 `ivory` `sage` `blush` `sky` `ink` `mocha` 중 하나로.
2. **행사 정보** — 이름, 날짜(`2026-10-17`), 시간(`13:00`, 24시간), 장소, 주소, 인사말, 연락처.
3. **사진** — `public/` 에 넣고 경로를 적습니다. `public/photos/main.jpg` → `"/photos/main.jpg"`.
4. **칸 켜고 끄기** — 맨 아래 `sections` 에서 줄을 지우면 사라지고, 순서를 바꾸면 그 순서로 나옵니다.
5. **줄바꿈** — 글 안에서 `\n` 은 한 줄, `\n\n` 은 한 칸.

### 구조

```
lib/invite/
  types.ts     자료 구조 — InviteConfig 가 초대장 전체를 정의합니다
  themes.ts    테마 6종 (색 + 글꼴). CSS 변수로만 나갑니다
  presets.ts   행사별 기본 설정 6종
  config.ts    ★ 사용자가 고치는 파일
  format.ts    날짜·시간·지도·전화 링크
components/invite/
  invitation.tsx  설정을 받아 칸을 순서대로 쌓는 렌더러
  sections.tsx    표지·초대글·일시·달력·갤러리·오시는길·연락처·회신·계좌·안내
  reveal.tsx      스크롤 등장 (IntersectionObserver, 외부 라이브러리 없음)
  stage.tsx       넓은 화면에서 가운데 한 칸으로 세우는 무대
app/invite.css    전용 스타일. 색은 전부 --wi-* 변수
```

### 설계 원칙

- **모바일 우선** — 폭 360px 기준으로 짜고, 48rem 이상에서만 가운데 한 칸으로 세웁니다.
- **본문 17px / 행간 1.9** — 한글이 편히 읽히는 최소선.
- **누르는 것은 44×44px 이상** — 어르신이 누를 수 있어야 합니다.
- **색 대비 AA** — 본문과 버튼 색은 배경 대비 4.5:1 을 넘깁니다.
- **과하지 않은 움직임** — 스크롤 등장(투명도 + 20px 상승)뿐이고,
  `prefers-reduced-motion` 이 켜져 있으면 전부 끕니다.
- **의존성 없음** — 등장 효과·갤러리·라이트박스·카운트다운 모두 브라우저 기본 기능으로 구현했습니다.

### 이미지 라이선스

- `public/samples/` — Pexels 라이선스 (상업적 이용·수정 가능, 출처 표기 불필요)
- `public/invite/` — 메트로폴리탄 미술관 오픈액세스 CC0 (퍼블릭 도메인)
