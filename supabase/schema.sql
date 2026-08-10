-- ============================================================
-- 다온 — 템플릿 저장소
--
-- Supabase 프로젝트를 만든 뒤 SQL Editor 에 그대로 붙여넣고 실행하세요.
-- 실행 후 .env.local 에 아래 두 줄을 넣으면 관리자 페이지가 DB 모드로 바뀝니다.
--   NEXT_PUBLIC_SUPABASE_URL=https://<프로젝트>.supabase.co
--   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public 키>
-- ============================================================

create table if not exists public.templates (
  -- 주소·참조에 쓰이는 템플릿 아이디 (예: lavender-note)
  id          text primary key,
  name        text not null,
  -- 나머지 설정(카테고리·커버 레이아웃·색·사진 등)은 통째로 담습니다.
  -- 앞으로 필드가 늘어도 마이그레이션 없이 그대로 동작하게 하기 위함입니다.
  payload     jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 갱신 시각 자동 반영
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists templates_touch on public.templates;
create trigger templates_touch
  before update on public.templates
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- 접근 권한
--
-- anon 키는 브라우저에 그대로 노출됩니다. 그래서 그 키만으로는 쓰기가
-- 되지 않도록 막고, 로그인한 사용자에게만 쓰기를 허용합니다.
-- 관리자 계정은 Supabase 대시보드 > Authentication > Users 에서
-- 직접 하나 추가하세요 (회원가입 기능은 만들지 않았습니다).
-- ------------------------------------------------------------

alter table public.templates enable row level security;

drop policy if exists "누구나 읽기" on public.templates;
create policy "누구나 읽기"
  on public.templates for select
  to anon, authenticated
  using (true);

drop policy if exists "로그인한 사용자만 쓰기" on public.templates;
create policy "로그인한 사용자만 쓰기"
  on public.templates for all
  to authenticated
  using (true)
  with check (true);
