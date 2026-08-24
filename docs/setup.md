# 발행·결제를 켜는 순서

이 문서는 «만들기 → 저장 → 발행 → 결제 → 하객 열람» 이 실제로 돌아가게
하려면 사람이 해야 하는 일만 모은 것입니다. 코드는 이미 다 들어가 있고,
아래 값들이 채워지는 순간 기능이 하나씩 켜집니다.

값이 하나도 없어도 사이트는 그대로 섭니다 — 이력서·명함·미리보기는 그대로
되고, 로그인과 발행 단추만 잠깁니다. 그래서 아래를 한 번에 다 하지 않아도
됩니다.

---

## 1. Supabase 프로젝트 (계정·저장·발행)

1. [supabase.com](https://supabase.com) 에서 프로젝트를 만듭니다. 리전은
   **Northeast Asia (Seoul)** 가 가장 가깝습니다.
2. SQL Editor 에 `supabase/schema.sql` 을 통째로 붙여넣고 실행합니다.
   여러 번 실행해도 안전합니다.
3. Project Settings → API 에서 세 값을 복사합니다.
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (빌드에서만 씁니다)
4. GitHub 저장소 → Settings → Secrets and variables → Actions 에 같은 이름으로
   넣습니다. 로컬에서 개발할 때는 `.env.local` 에 넣습니다(`.env.example` 참고).

> **service_role 키는 절대 `NEXT_PUBLIC_` 을 붙이지 마세요.** 그 키는 RLS 를
> 통째로 지나칩니다. 빌드가 발행 목록을 읽을 때만 쓰이고 브라우저로는 나가지
> 않습니다.

### 관리자 지정

템플릿 관리 화면(`/admin`)은 `admins` 표에 들어 있는 계정만 볼 수 있습니다.
한 번 로그인한 뒤 Authentication → Users 에서 자기 UUID 를 복사해:

```sql
insert into public.admins (id) values ('<uuid>');
```

### 청소 (선택)

기한이 지난 문서를 닫아 두면 사진 용량이 쌓이지 않습니다. Database → Cron:

```sql
select cron.schedule('cardly-sweep', '0 4 * * *', $$select public.sweep_expired()$$);
```

---

## 2. 카카오 로그인

1. [developers.kakao.com](https://developers.kakao.com) 에서 애플리케이션을
   만듭니다.
2. **카카오 로그인** 을 켜고 Redirect URI 에 아래를 넣습니다.
   ```
   https://<프로젝트>.supabase.co/auth/v1/callback
   ```
3. 동의 항목에서 **닉네임** 과 **카카오계정(이메일)** 을 선택합니다.
   이메일은 선택 동의로 두어도 됩니다 — 없으면 닉네임만 씁니다.
4. Supabase → Authentication → Providers → Kakao 를 켜고 REST API 키와
   Client Secret 을 넣습니다.
5. Supabase → Authentication → URL Configuration 에서
   Site URL 을 `https://cardly.kr`, Redirect URLs 에
   `https://cardly.kr/login/` 를 추가합니다.

### 카카오톡 공유 (선택)

앱 키 → **JavaScript 키** 를 `NEXT_PUBLIC_KAKAO_JS_KEY` 로 넣고, 플랫폼 →
Web 에 `https://cardly.kr` 을 등록하면 공유 단추가 «카드» 형태로 나갑니다.
키가 없어도 링크 공유는 그대로 되고, 미리보기는 페이지의 `<meta>` 로 뜹니다.

---

## 3. 토스페이먼츠 결제

1. [토스페이먼츠 개발자센터](https://developers.tosspayments.com) 에서 테스트
   키를 발급받습니다. 실제 정산을 받으려면 사업자 심사가 필요합니다.
2. **클라이언트 키**(`test_ck_…` / `live_ck_…`) → `NEXT_PUBLIC_TOSS_CLIENT_KEY`
   (GitHub Secrets 이름은 `TOSS_CLIENT_KEY`)
3. **시크릿 키** 는 브라우저로 나가면 안 됩니다. Supabase 엣지 함수에만 넣습니다.

```bash
npx supabase login
npx supabase link --project-ref <프로젝트-ref>

npx supabase secrets set TOSS_SECRET_KEY=test_sk_...

npx supabase functions deploy pay-confirm  --no-verify-jwt
npx supabase functions deploy pay-webhook  --no-verify-jwt
npx supabase functions deploy site-refresh
```

4. 토스 개발자센터 → 웹훅에 아래 주소를 등록합니다. 결제창에서 돌아오지 못한
   결제를 이 함수가 건져 냅니다.
   ```
   https://<프로젝트>.functions.supabase.co/pay-webhook
   ```

`--no-verify-jwt` 인 이유: 결제창에서 돌아온 직후에는 토큰이 만료돼 있을 수
있습니다. 대신 두 함수 모두 «우리 표에 있는 주문인가 · 토스가 말한 금액이
맞는가» 를 서버에서 다시 확인합니다.

---

## 4. 카카오톡 미리보기 자동 배포 (선택이지만 권장)

발행하면 문서는 그 즉시 열리지만, 카카오톡에 붙였을 때 이름과 사진이 뜨는
미리보기(`<meta>`)는 그 주소의 HTML 이 있어야 합니다. 정적 배포라 그 HTML 은
빌드가 만듭니다. 그래서 발행 직후 빌드를 한 번 걸어 줍니다.

1. GitHub → Settings → Developer settings → Personal access tokens →
   Fine-grained token 을 만듭니다. 저장소는 이 저장소 하나, 권한은
   **Contents: Read and write** 하나면 됩니다.
2. ```bash
   npx supabase secrets set GITHUB_DISPATCH_TOKEN=github_pat_... GITHUB_REPOSITORY=nbh0000/Cardly_Web
   ```

토큰이 없으면 발행은 그대로 되고 미리보기만 다음 배포(하루 두 번 도는 예약
빌드 포함) 뒤에 붙습니다.

---

## 5. 인쇄물 편집기의 AI (선택)

`/print` 의 문구 만들기·배경 그림 만들기는 Gemini 를 부릅니다. 키는 브라우저에
절대 내려가지 않고, 엣지 함수 안에서만 삽니다.

1. [aistudio.google.com](https://aistudio.google.com/apikey) 에서 API 키를 받습니다.
2. ```bash
   npx supabase secrets set GEMINI_API_KEY=...
   npx supabase functions deploy ai-print
   ```

`--no-verify-jwt` 를 **주지 않습니다.** 로그인한 사람만 쓸 수 있어야 하고,
누구인지 알아야 크레딧을 뺄 수 있기 때문입니다.

크레딧은 `supabase/schema.sql` 의 9절이 관리합니다. 처음 쓰는 사람에게 체험분
20개를 한 번 주고, 문구는 1개·그림은 5개를 씁니다. 잔액이 남아 있어도 하루
40번을 넘길 수 없습니다. 값을 바꾸려면 `ai_free_grant()` 와 `ai_daily_limit()`
두 함수만 고치면 됩니다.

키가 없으면 `/print` 는 그대로 열리고 AI 단추만 «키가 설정되지 않았습니다» 로
답합니다. 편집·PDF 내보내기는 키 없이도 전부 동작합니다.

---

## 6. 사업자 정보 (실제 결제를 받기 전 필수)

돈을 받는 순간 전자상거래법 제10조에 따라 상호·대표자·주소·사업자등록번호·
통신판매업 신고번호를 화면에 표시해야 합니다. `components/site-footer.tsx` 의
`BUSINESS` 를 채우세요. 비어 있는 항목은 화면에 나오지 않습니다 — 지어낸 값을
넣는 것보다 비워 두는 편이 낫지만, **실제 결제를 켜기 전에는 반드시 채워야
합니다.**

환불 기준은 `app/terms/page.tsx` 2항에 적어 두었습니다. 실제 정책이 다르면
그쪽을 먼저 고치세요.

---

## 확인

전부 켠 뒤 아래를 순서대로 눌러 보면 파이프라인이 살아 있는지 알 수 있습니다.

1. `/templates` 에서 템플릿을 고르고 편집기에서 내용을 조금 고칩니다.
2. 오른쪽 위에 «계정에 저장됨» 이 뜨는지 봅니다(로그인 후).
3. **링크 발행하기** → 주소가 나오면 시크릿 창에서 그 주소를 엽니다.
   로그인 없이 열려야 합니다.
4. 하단에 «Cardly로 만들었어요» 가 보이면 무료 발행이 맞습니다.
5. `/account` → 링크 관리 → **결제하고 프리미엄으로** → 테스트 카드로 결제.
6. 다시 링크를 열어 표기가 사라지고 참석 여부·방명록이 생겼는지 봅니다.
7. 참석 여부를 남기고, `/account` 의 관리 화면에서 집계가 오르는지 봅니다.
