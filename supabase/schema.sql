-- ============================================================
-- Cardly — 데이터베이스
--
-- Supabase 프로젝트를 만든 뒤 SQL Editor 에 이 파일을 통째로 붙여넣고
-- 실행하세요. 여러 번 실행해도 안전합니다(모두 if not exists / replace).
--
-- 실행 뒤 .env.local 과 GitHub Actions Secrets 에 아래를 넣습니다.
--   NEXT_PUBLIC_SUPABASE_URL=https://<프로젝트>.supabase.co
--   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public 키>
--   SUPABASE_SERVICE_ROLE_KEY=<service_role 키>   ← 빌드에서만 씁니다
--
-- ── 이 스키마가 지키려는 것 ─────────────────────────────────
--  1. 하객은 절대 로그인하지 않습니다. 그런데도 남의 청첩장을 «목록으로»
--     훑을 수는 없어야 합니다. 그래서 발행된 문서 읽기는 테이블 권한이
--     아니라 슬러그를 인자로 받는 함수(rpc)로만 열어 둡니다.
--     테이블에 직접 걸린 anon 읽기 정책은 하나도 없습니다.
--  2. 요금·기한·발행 여부는 브라우저가 정하지 못합니다. 사용자는 내용만
--     고칠 수 있고, plan·expires_at·status·slug 는 서버 함수와
--     service_role 만 건드립니다(guard_doc_columns 트리거).
--  3. 결제는 서버에서만 확정됩니다. orders 는 사용자가 만들 수 있지만
--     status 를 paid 로 바꾸는 것은 service_role(엣지 함수)뿐입니다.
-- ============================================================

create extension if not exists pgcrypto with schema extensions;

-- ------------------------------------------------------------
-- 0. 공통
-- ------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

/**
 * 주소에 쓰는 짧은 무작위 문자열.
 *
 * 헷갈리는 글자(l·1·i·o·0)를 뺀 31 글자에서 10 자리를 뽑습니다. 경우의 수가
 * 8×10^14 이라 «옆집 청첩장 주소» 를 찍어서 맞힐 수 없습니다. 링크를 아는
 * 사람만 본다는 약속이 이 무작위성 하나에 걸려 있으므로 random() 이 아니라
 * 암호학적 난수(gen_random_bytes)를 씁니다.
 */
create or replace function public.random_slug(len int default 10)
returns text
language plpgsql
set search_path = public, extensions
as $$
declare
  alphabet text := 'abcdefghjkmnpqrstuvwxyz23456789';
  bytes bytea := gen_random_bytes(len);
  out text := '';
  i int;
begin
  for i in 0..len - 1 loop
    out := out || substr(alphabet, 1 + (get_byte(bytes, i) % length(alphabet)), 1);
  end loop;
  return out;
end $$;

-- ------------------------------------------------------------
-- 1. 템플릿 (관리자가 만드는 디자인 프리셋 — 기존 표를 그대로 둡니다)
-- ------------------------------------------------------------

create table if not exists public.templates (
  id          text primary key,
  name        text not null,
  payload     jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists templates_touch on public.templates;
create trigger templates_touch
  before update on public.templates
  for each row execute function public.touch_updated_at();

alter table public.templates enable row level security;

drop policy if exists "누구나 읽기" on public.templates;
create policy "누구나 읽기"
  on public.templates for select
  to anon, authenticated
  using (true);

-- ------------------------------------------------------------
-- 관리자
--
-- 예전에는 «로그인한 사용자» 면 누구나 템플릿을 고칠 수 있었습니다. 그때는
-- 계정을 관리자가 대시보드에서 직접 만들어 주는 구조라 그것으로 충분했지만,
-- 이제 누구나 카카오로 로그인할 수 있으므로 그대로 두면 방문자 전원이
-- 템플릿을 고칠 수 있게 됩니다. 그래서 관리자를 표로 못박습니다.
--
-- 등록: Authentication > Users 에서 내 계정 UUID 를 복사해
--   insert into public.admins (id) values ('<uuid>');
-- ------------------------------------------------------------

create table if not exists public.admins (
  id uuid primary key references auth.users on delete cascade,
  note text not null default '',
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

drop policy if exists "본인 확인만" on public.admins;
create policy "본인 확인만"
  on public.admins for select
  to authenticated
  using (id = (select auth.uid()));

create or replace function public.is_admin()
returns boolean language sql stable security definer
set search_path = public as 3733
  select exists (select 1 from public.admins a where a.id = auth.uid())
3733;

grant execute on function public.is_admin() to authenticated;

drop policy if exists "로그인한 사용자만 쓰기" on public.templates;
drop policy if exists "관리자만 쓰기" on public.templates;
create policy "관리자만 쓰기"
  on public.templates for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- 2. 문서 — 사람이 만든 청첩장 한 장, 초대장 한 장
-- ------------------------------------------------------------

create table if not exists public.docs (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null references auth.users on delete cascade,

  -- 'wedding' 모바일 청첩장 · 'occasion' 접히는 초대장
  kind        text not null check (kind in ('wedding', 'occasion')),

  -- 목록에 보여 줄 한 줄 (신랑·신부 이름 등). 내용에서 뽑아 저장합니다.
  title       text not null default '',
  -- 청첩장은 템플릿 id, 초대장은 디자인 id
  design_id   text not null default '',

  -- 편집기가 다루는 값 전부. 필드가 늘어도 마이그레이션이 필요 없도록
  -- 통째로 담습니다.
  data        jsonb not null default '{}'::jsonb,

  -- 예식일 / 행사일. 결제한 링크의 기한을 여기서 잽니다.
  event_date  date,

  -- ── 아래 다섯 칸은 사용자가 직접 바꾸지 못합니다 ──
  slug        text unique,
  status      text not null default 'draft' check (status in ('draft', 'published', 'closed')),
  plan        text not null default 'free'  check (plan in ('free', 'premium')),
  published_at timestamptz,
  expires_at  timestamptz,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists docs_owner_idx on public.docs (owner, updated_at desc);
create index if not exists docs_slug_idx  on public.docs (slug) where slug is not null;

drop trigger if exists docs_touch on public.docs;
create trigger docs_touch
  before update on public.docs
  for each row execute function public.touch_updated_at();

/**
 * 발행 상태와 요금은 브라우저가 정하지 못합니다.
 *
 * anon 키는 누구나 읽을 수 있으므로, 사용자가 자기 문서를 update 하면서
 * plan 을 premium 으로, expires_at 을 십 년 뒤로 적어 보낼 수 있습니다.
 * 그래서 그 다섯 칸이 바뀌는 update 는 여기서 막습니다. 서버 함수와
 * service_role 은 role 을 바꿔 실행되므로 이 검사에 걸리지 않습니다.
 */
create or replace function public.guard_doc_columns()
returns trigger language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('role', true) = 'service_role'
     or coalesce(current_setting('request.jwt.claim.role', true),
                 (current_setting('request.jwt.claims', true)::jsonb ->> 'role')) = 'service_role' then
    return new;
  end if;

  if new.slug is distinct from old.slug
     or new.status is distinct from old.status
     or new.plan is distinct from old.plan
     or new.published_at is distinct from old.published_at
     or new.expires_at is distinct from old.expires_at
     or new.owner is distinct from old.owner then
    raise exception '발행 상태와 요금은 직접 바꿀 수 없습니다. publish_doc() 을 쓰세요.';
  end if;

  return new;
end $$;

drop trigger if exists docs_guard on public.docs;
create trigger docs_guard
  before update on public.docs
  for each row execute function public.guard_doc_columns();

alter table public.docs enable row level security;

-- 하객에게 여는 길은 rpc 뿐입니다. 표에는 «주인» 만 손댈 수 있습니다.
drop policy if exists "내 문서만 읽기" on public.docs;
create policy "내 문서만 읽기"
  on public.docs for select
  to authenticated
  using (owner = (select auth.uid()));

drop policy if exists "내 문서만 만들기" on public.docs;
create policy "내 문서만 만들기"
  on public.docs for insert
  to authenticated
  with check (owner = (select auth.uid()));

drop policy if exists "내 문서만 고치기" on public.docs;
create policy "내 문서만 고치기"
  on public.docs for update
  to authenticated
  using (owner = (select auth.uid()))
  with check (owner = (select auth.uid()));

drop policy if exists "내 문서만 지우기" on public.docs;
create policy "내 문서만 지우기"
  on public.docs for delete
  to authenticated
  using (owner = (select auth.uid()));

-- ------------------------------------------------------------
-- 3. 참석 여부 · 방명록 — 하객이 로그인 없이 남기는 것
-- ------------------------------------------------------------

create table if not exists public.rsvps (
  id         uuid primary key default gen_random_uuid(),
  doc_id     uuid not null references public.docs on delete cascade,
  name       text not null,
  -- true 참석 · false 불참
  attending  boolean not null,
  -- 본인 포함 인원
  party      int not null default 1 check (party between 1 and 20),
  -- 신랑측/신부측 같은 구분. 초대장은 비어 있습니다.
  side       text not null default '',
  message    text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists rsvps_doc_idx on public.rsvps (doc_id, created_at desc);

create table if not exists public.guestbook (
  id         uuid primary key default gen_random_uuid(),
  doc_id     uuid not null references public.docs on delete cascade,
  name       text not null,
  message    text not null,
  -- 남긴 사람이 스스로 지울 때 쓰는 네 자리. 해시로만 둡니다.
  pin_hash   text,
  hidden     boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists guestbook_doc_idx on public.guestbook (doc_id, created_at desc);

alter table public.rsvps     enable row level security;
alter table public.guestbook enable row level security;

-- 주인만 표를 직접 봅니다. 하객은 아래 rpc 로만 씁니다.
drop policy if exists "주인만 읽기" on public.rsvps;
create policy "주인만 읽기"
  on public.rsvps for select
  to authenticated
  using (exists (select 1 from public.docs d
                 where d.id = rsvps.doc_id and d.owner = (select auth.uid())));

drop policy if exists "주인만 지우기" on public.rsvps;
create policy "주인만 지우기"
  on public.rsvps for delete
  to authenticated
  using (exists (select 1 from public.docs d
                 where d.id = rsvps.doc_id and d.owner = (select auth.uid())));

drop policy if exists "주인만 읽기" on public.guestbook;
create policy "주인만 읽기"
  on public.guestbook for select
  to authenticated
  using (exists (select 1 from public.docs d
                 where d.id = guestbook.doc_id and d.owner = (select auth.uid())));

drop policy if exists "주인만 지우기" on public.guestbook;
create policy "주인만 지우기"
  on public.guestbook for delete
  to authenticated
  using (exists (select 1 from public.docs d
                 where d.id = guestbook.doc_id and d.owner = (select auth.uid())));

drop policy if exists "주인만 감추기" on public.guestbook;
create policy "주인만 감추기"
  on public.guestbook for update
  to authenticated
  using (exists (select 1 from public.docs d
                 where d.id = guestbook.doc_id and d.owner = (select auth.uid())))
  with check (true);

-- ------------------------------------------------------------
-- 4. 주문 — 토스페이먼츠 단건 결제
-- ------------------------------------------------------------

create table if not exists public.orders (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null references auth.users on delete cascade,
  doc_id      uuid not null references public.docs on delete cascade,

  -- 토스에 넘기는 주문번호. 사람이 읽을 수 있고 유일해야 합니다.
  order_code  text not null unique,
  order_name  text not null,
  amount      int  not null check (amount > 0),

  status      text not null default 'ready'
              check (status in ('ready', 'paid', 'failed', 'canceled')),

  -- 승인 뒤 토스가 돌려주는 값들
  payment_key text,
  method      text,
  receipt_url text,
  fail_reason text,

  created_at  timestamptz not null default now(),
  paid_at     timestamptz,
  updated_at  timestamptz not null default now()
);

create index if not exists orders_owner_idx on public.orders (owner, created_at desc);

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch
  before update on public.orders
  for each row execute function public.touch_updated_at();

alter table public.orders enable row level security;

drop policy if exists "내 주문만 읽기" on public.orders;
create policy "내 주문만 읽기"
  on public.orders for select
  to authenticated
  using (owner = (select auth.uid()));

-- 결제창을 열기 전 «준비» 상태의 주문은 사용자가 만듭니다.
-- 금액이 맞는지는 아래 트리거가 봅니다.
drop policy if exists "내 주문만 만들기" on public.orders;
create policy "내 주문만 만들기"
  on public.orders for insert
  to authenticated
  with check (owner = (select auth.uid()) and status = 'ready');

/**
 * 금액을 브라우저가 정하지 못하게 합니다.
 *
 * 결제창에 5,900 원을 띄우고 서버에는 14,900 원짜리 주문을 만들어 두는
 * 식의 장난을 막습니다. 값은 이 표 하나에만 적혀 있고, 엣지 함수는
 * 승인 직전에 토스가 알려 준 금액과 이 값을 다시 맞춰 봅니다.
 */
create or replace function public.order_price(p_kind text)
returns int language sql immutable as $$
  select case p_kind when 'wedding' then 14900 when 'occasion' then 5900 end
$$;

create or replace function public.guard_order()
returns trigger language plpgsql
security definer
set search_path = public
as $$
declare
  k text;
begin
  select kind into k from public.docs where id = new.doc_id;
  if k is null then
    raise exception '없는 문서입니다.';
  end if;
  if new.amount is distinct from public.order_price(k) then
    raise exception '금액이 요금표와 다릅니다.';
  end if;
  return new;
end $$;

drop trigger if exists orders_guard on public.orders;
create trigger orders_guard
  before insert on public.orders
  for each row execute function public.guard_order();

-- ------------------------------------------------------------
-- 5. 하객이 쓰는 함수들 (로그인 없이 부르는 유일한 통로)
--
-- security definer 라 RLS 를 지나쳐 실행됩니다. 그래서 인자로 받은
-- 슬러그 한 건 외에는 아무것도 돌려주지 않도록 좁게 적었습니다.
-- ------------------------------------------------------------

/** 지금 열려 있는 문서인지 — 발행됐고, 기한이 남았는지 */
create or replace function public.doc_is_open(d public.docs)
returns boolean language sql immutable as $$
  select d.status = 'published'
     and (d.expires_at is null or d.expires_at > now())
$$;

/**
 * 하객이 여는 문서 한 건.
 *
 * 돌려주는 것은 화면을 그리는 데 필요한 값뿐입니다 — 주인이 누구인지,
 * 언제 결제했는지 같은 것은 나가지 않습니다. 기한이 지났으면 내용을 빼고
 * closed 만 알려 줍니다. 그래야 «지난 청첩장» 안내를 띄울 수 있습니다.
 */
create or replace function public.published_doc(p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  d public.docs;
begin
  select * into d from public.docs where slug = p_slug;

  if not found or d.status = 'draft' then
    return null;
  end if;

  if not public.doc_is_open(d) then
    return jsonb_build_object(
      'state', 'closed',
      'kind', d.kind,
      'expired_at', d.expires_at
    );
  end if;

  return jsonb_build_object(
    'state', 'open',
    'id', d.id,
    'kind', d.kind,
    'design_id', d.design_id,
    'title', d.title,
    'data', d.data,
    'plan', d.plan,
    'event_date', d.event_date,
    'expires_at', d.expires_at
  );
end $$;

/** 하객이 남기는 참석 여부. 프리미엄 문서에서만 받습니다. */
create or replace function public.submit_rsvp(
  p_slug text,
  p_name text,
  p_attending boolean,
  p_party int default 1,
  p_side text default '',
  p_message text default ''
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  d public.docs;
begin
  select * into d from public.docs where slug = p_slug;
  if not found or not public.doc_is_open(d) then
    raise exception '닫힌 초대장입니다.';
  end if;
  if d.plan <> 'premium' then
    raise exception '참석 여부는 프리미엄에서 받습니다.';
  end if;
  if length(coalesce(p_name, '')) = 0 then
    raise exception '이름을 적어 주세요.';
  end if;

  insert into public.rsvps (doc_id, name, attending, party, side, message)
  values (d.id, left(p_name, 40), p_attending,
          greatest(1, least(20, coalesce(p_party, 1))),
          left(coalesce(p_side, ''), 20), left(coalesce(p_message, ''), 300));

  return jsonb_build_object('ok', true);
end $$;

/** 방명록 읽기 — 하객도 서로의 글을 봅니다 */
create or replace function public.list_guestbook(p_slug text, p_limit int default 100)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  d public.docs;
  rows jsonb;
begin
  select * into d from public.docs where slug = p_slug;
  if not found or not public.doc_is_open(d) then
    return '[]'::jsonb;
  end if;

  select coalesce(jsonb_agg(x order by x->>'created_at' desc), '[]'::jsonb)
  into rows
  from (
    select jsonb_build_object(
             'id', g.id,
             'name', g.name,
             'message', g.message,
             'created_at', g.created_at
           ) as x
    from public.guestbook g
    where g.doc_id = d.id and not g.hidden
    order by g.created_at desc
    limit greatest(1, least(300, coalesce(p_limit, 100)))
  ) s;

  return rows;
end $$;

/** 방명록 남기기 */
create or replace function public.submit_guestbook(
  p_slug text,
  p_name text,
  p_message text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  d public.docs;
  recent int;
begin
  select * into d from public.docs where slug = p_slug;
  if not found or not public.doc_is_open(d) then
    raise exception '닫힌 청첩장입니다.';
  end if;
  if d.plan <> 'premium' then
    raise exception '방명록은 프리미엄에서 열립니다.';
  end if;
  if length(coalesce(p_name, '')) = 0 or length(coalesce(p_message, '')) = 0 then
    raise exception '이름과 글을 모두 적어 주세요.';
  end if;

  -- 한 문서에 1 분 안에 스무 개가 넘게 들어오면 사람이 아닙니다.
  select count(*) into recent
  from public.guestbook
  where doc_id = d.id and created_at > now() - interval '1 minute';
  if recent > 20 then
    raise exception '잠시 뒤에 다시 시도해 주세요.';
  end if;

  insert into public.guestbook (doc_id, name, message)
  values (d.id, left(p_name, 20), left(p_message, 500));

  return jsonb_build_object('ok', true);
end $$;

-- ------------------------------------------------------------
-- 6. 주인이 쓰는 함수들 — 발행과 기한
-- ------------------------------------------------------------

/** 무료 링크가 살아 있는 기간 · 결제한 링크의 행사 뒤 유예 기간 */
create or replace function public.free_link_days()  returns int language sql immutable as $$ select 7 $$;
create or replace function public.paid_grace_days() returns int language sql immutable as $$ select 30 $$;

/**
 * 기한 계산 — 한 곳에서만 합니다.
 *
 * 무료는 «발행한 때» 부터 7 일입니다. 예식일 기준으로 재면 일 년 전에
 * 만들어 두는 사람에게는 사실상 기한이 없는 것이 됩니다.
 * 결제한 링크는 «행사일 +30 일» 입니다. 행사가 끝난 뒤에도 하객이 사진과
 * 방명록을 한동안 볼 수 있어야 합니다. 행사일을 안 적었으면 결제한 날부터
 * 1 년으로 둡니다.
 */
create or replace function public.compute_expiry(p_plan text, p_event date, p_from timestamptz)
returns timestamptz language sql stable as $$
  select case
    when p_plan = 'premium' then
      /* 이미 지난 날짜로 잡히지 않게 바닥을 둡니다. 예식이 끝난 뒤에
         결제하는 사람이 있습니다 — 사진과 방명록을 남겨 두려고요. 그때
         계산대로 하면 결제하자마자 닫힌 링크가 됩니다. */
      greatest(
        case when p_event is null then p_from + interval '365 days'
             else (p_event + (public.paid_grace_days() || ' days')::interval)::timestamptz
        end,
        now() + (public.paid_grace_days() || ' days')::interval
      )
    else p_from + (public.free_link_days() || ' days')::interval
  end
$$;

/**
 * 발행 — 주소를 내주고 기한을 겁니다.
 *
 * 이미 발행한 문서를 다시 부르면 주소는 그대로 두고 기한만 다시 잽니다.
 * 하객이 이미 받은 링크가 바뀌면 안 됩니다.
 */
create or replace function public.publish_doc(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  d public.docs;
  s text;
  tries int := 0;
begin
  select * into d from public.docs where id = p_id and owner = auth.uid();
  if not found then
    raise exception '내 문서가 아닙니다.';
  end if;

  s := d.slug;
  while s is null loop
    tries := tries + 1;
    if tries > 10 then
      raise exception '주소를 만들지 못했습니다. 다시 시도해 주세요.';
    end if;
    s := public.random_slug(10);
    if exists (select 1 from public.docs where slug = s) then
      s := null;
    end if;
  end loop;

  update public.docs
     set slug = s,
         status = 'published',
         published_at = coalesce(published_at, now()),
         expires_at = public.compute_expiry(plan, event_date, coalesce(published_at, now()))
   where id = d.id;

  select * into d from public.docs where id = p_id;

  return jsonb_build_object(
    'slug', d.slug,
    'plan', d.plan,
    'status', d.status,
    'expires_at', d.expires_at
  );
end $$;

/** 발행 거두기 — 링크를 닫습니다. 주소는 남겨 두어 다시 열 수 있습니다. */
create or replace function public.close_doc(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.docs set status = 'closed'
   where id = p_id and owner = auth.uid();
  if not found then
    raise exception '내 문서가 아닙니다.';
  end if;
  return jsonb_build_object('ok', true);
end $$;

/**
 * 빌드가 부르는 함수 — 카카오톡 미리보기용 HTML 을 미리 만들 목록.
 *
 * service_role 로만 부를 수 있습니다. anon 에게 열어 두면 «발행된 청첩장
 * 전부» 를 훑을 수 있게 되어, 링크를 아는 사람만 본다는 약속이 깨집니다.
 */
create or replace function public.published_index()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  role_name text := coalesce(current_setting('request.jwt.claim.role', true),
                             (current_setting('request.jwt.claims', true)::jsonb ->> 'role'),
                             current_setting('role', true));
begin
  if role_name is distinct from 'service_role' then
    raise exception '권한이 없습니다.';
  end if;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'slug', d.slug,
      'kind', d.kind,
      'design_id', d.design_id,
      'title', d.title,
      'data', d.data,
      'plan', d.plan,
      'event_date', d.event_date
    ))
    from public.docs d
    where d.status = 'published'
      and (d.expires_at is null or d.expires_at > now())
  ), '[]'::jsonb);
end $$;

-- 함수 실행 권한 — 필요한 것만 엽니다.
revoke all on function public.published_index() from anon, authenticated;
grant execute on function public.published_doc(text)          to anon, authenticated;
grant execute on function public.list_guestbook(text, int)     to anon, authenticated;
grant execute on function public.submit_guestbook(text, text, text) to anon, authenticated;
grant execute on function public.submit_rsvp(text, text, boolean, int, text, text) to anon, authenticated;
grant execute on function public.publish_doc(uuid) to authenticated;
grant execute on function public.close_doc(uuid)   to authenticated;

-- ------------------------------------------------------------
-- 7. 사진 저장소
-- ------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
  set public = true,
      file_size_limit = 10485760,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 사진은 링크를 아는 사람이 봐야 하므로 읽기는 공개입니다.
-- 올리고 지우는 것은 «자기 폴더» 안에서만 됩니다. 경로가 {uid}/… 입니다.
drop policy if exists "사진 공개 읽기" on storage.objects;
create policy "사진 공개 읽기"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'photos');

drop policy if exists "내 폴더에만 올리기" on storage.objects;
create policy "내 폴더에만 올리기"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid()::text));

drop policy if exists "내 폴더만 지우기" on storage.objects;
create policy "내 폴더만 지우기"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid()::text));

drop policy if exists "내 폴더만 덮어쓰기" on storage.objects;
create policy "내 폴더만 덮어쓰기"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid()::text));

-- ------------------------------------------------------------
-- 8. 기한이 지난 문서 치우기
--
-- Supabase 대시보드 > Database > Cron 에서 하루 한 번 부르도록 걸어 두면
-- 저장 비용이 무한정 쌓이지 않습니다. (선택)
--   select cron.schedule('cardly-sweep', '0 4 * * *', $$select public.sweep_expired()$$);
-- ------------------------------------------------------------

create or replace function public.sweep_expired()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  update public.docs
     set status = 'closed'
   where status = 'published'
     and expires_at is not null
     and expires_at < now();
  get diagnostics n = row_count;
  return n;
end $$;

revoke all on function public.sweep_expired() from anon, authenticated;

-- ------------------------------------------------------------
-- 9. 결제 확정 — 엣지 함수(service_role)만 부릅니다
--
-- 돈이 걸린 판정은 브라우저가 아니라 여기서 합니다. 엣지 함수는
-- 토스에 «이 결제 맞느냐» 를 물어 확인한 뒤 이 함수를 부르고,
-- 이 함수는 주문 상태와 문서의 요금제·기한을 한 트랜잭션에서 바꿉니다.
-- ------------------------------------------------------------

create or replace function public.assert_service_role()
returns void language plpgsql as $$
declare
  role_name text := coalesce(current_setting('request.jwt.claim.role', true),
                             (current_setting('request.jwt.claims', true)::jsonb ->> 'role'),
                             current_setting('role', true));
begin
  if role_name is distinct from 'service_role' then
    raise exception '권한이 없습니다.';
  end if;
end $$;

create or replace function public.mark_order_paid(
  p_order_code  text,
  p_payment_key text,
  p_amount      int,
  p_method      text default '',
  p_receipt_url text default ''
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.orders;
  d public.docs;
begin
  perform public.assert_service_role();

  select * into o from public.orders where order_code = p_order_code;
  if not found then
    raise exception '없는 주문입니다.';
  end if;

  -- 같은 승인이 두 번 들어와도(콜백 + 웹훅) 한 번만 처리합니다.
  if o.status = 'paid' then
    return jsonb_build_object('ok', true, 'already', true);
  end if;

  if o.amount is distinct from p_amount then
    raise exception '결제 금액이 주문과 다릅니다.';
  end if;

  update public.orders
     set status = 'paid',
         payment_key = p_payment_key,
         method = coalesce(p_method, ''),
         receipt_url = coalesce(p_receipt_url, ''),
         paid_at = now()
   where id = o.id;

  select * into d from public.docs where id = o.doc_id;

  update public.docs
     set plan = 'premium',
         expires_at = public.compute_expiry('premium', d.event_date,
                                            coalesce(d.published_at, now()))
   where id = d.id;

  return jsonb_build_object('ok', true, 'doc_id', d.id);
end $$;

create or replace function public.mark_order_failed(p_order_code text, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_service_role();
  update public.orders
     set status = case when status = 'paid' then status else 'failed' end,
         fail_reason = left(coalesce(p_reason, ''), 300)
   where order_code = p_order_code;
  return jsonb_build_object('ok', true);
end $$;

revoke all on function public.mark_order_paid(text, text, int, text, text) from anon, authenticated;
revoke all on function public.mark_order_failed(text, text) from anon, authenticated;

/**
 * 결제한 뒤 기한을 다시 재야 할 때 — 예식일을 옮겼을 때 씁니다.
 * 사용자가 직접 부를 수 있지만, 늘려 주는 것은 요금제가 정한 규칙뿐입니다.
 */
create or replace function public.refresh_expiry(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  d public.docs;
begin
  select * into d from public.docs where id = p_id and owner = auth.uid();
  if not found then
    raise exception '내 문서가 아닙니다.';
  end if;
  if d.status = 'draft' then
    return jsonb_build_object('ok', true);
  end if;

  update public.docs
     set expires_at = public.compute_expiry(plan, event_date,
                                            coalesce(published_at, now()))
   where id = d.id;

  select * into d from public.docs where id = p_id;
  return jsonb_build_object('ok', true, 'expires_at', d.expires_at);
end $$;

grant execute on function public.refresh_expiry(uuid) to authenticated;

-- ------------------------------------------------------------
-- 9. AI 크레딧 — 인쇄물 편집기
--
-- Gemini 호출은 우리 돈입니다. 그래서 «누가 몇 번 불렀는가» 를 세는 자리가
-- 반드시 서버에 있어야 합니다. 브라우저에서 세면 개발자 도구를 여는 것으로
-- 무한이 됩니다.
--
-- 세 겹으로 막습니다.
--   ① 잔액   — 가입하면 체험분을 한 번 주고, 부르면 줄어듭니다
--   ② 하루 한도 — 잔액이 남아 있어도 하루에 이만큼만
--   ③ 기록   — 언제 무엇을 불렀는지 한 줄씩. 이상한 사용을 나중에 봅니다
-- ------------------------------------------------------------

/** 처음 로그인한 사람에게 주는 체험분 */
create or replace function public.ai_free_grant()
returns int language sql immutable as $$ select 20 $$;

/** 잔액이 남아 있어도 하루에 넘길 수 없는 호출 수 */
create or replace function public.ai_daily_limit()
returns int language sql immutable as $$ select 40 $$;

create table if not exists public.ai_credits (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  balance    int not null default 0,
  granted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_usage (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  action     text not null check (action in ('text', 'image', 'edit')),
  cost       int  not null default 0,
  -- 무엇을 시켰는지 앞부분만. 전문을 남기면 개인정보가 쌓입니다
  prompt     text,
  ok         boolean,
  message    text,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_user_day on public.ai_usage (user_id, created_at desc);

alter table public.ai_credits enable row level security;
alter table public.ai_usage  enable row level security;

-- 자기 것만 읽습니다. 쓰기는 아래 함수(service_role)만 합니다.
drop policy if exists ai_credits_read on public.ai_credits;
create policy ai_credits_read on public.ai_credits
  for select to authenticated using (user_id = auth.uid());

drop policy if exists ai_usage_read on public.ai_usage;
create policy ai_usage_read on public.ai_usage
  for select to authenticated using (user_id = auth.uid());

/**
 * 남은 크레딧. 처음 묻는 사람에게는 이 자리에서 체험분을 만들어 줍니다.
 * 회원가입 트리거에 얹지 않는 이유는, 이미 가입해 둔 사람에게도 똑같이
 * 돌아가야 하기 때문입니다.
 */
create or replace function public.ai_balance(p_user uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v int;
begin
  perform public.assert_service_role();

  insert into public.ai_credits (user_id, balance)
       values (p_user, public.ai_free_grant())
  on conflict (user_id) do nothing;

  select balance into v from public.ai_credits where user_id = p_user;
  return coalesce(v, 0);
end $$;

/**
 * 부르기 «전» 에 차감하고 기록을 한 줄 엽니다.
 *
 * 나중에 차감하면 실패한 호출을 반복해 공짜로 쓰는 길이 열립니다.
 * 대신 우리 잘못으로 실패했을 때 ai_refund 가 되돌려 줍니다.
 *
 * 돌려주는 모양은 늘 같습니다:
 *   { ok, message, balance, log_id }
 * ok 가 false 면 message 를 사용자에게 그대로 보여 줍니다.
 */
create or replace function public.ai_spend(
  p_user   uuid,
  p_action text,
  p_cost   int,
  p_prompt text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance int;
  v_today   int;
  v_id      uuid;
begin
  perform public.assert_service_role();

  v_balance := public.ai_balance(p_user);

  select count(*) into v_today
    from public.ai_usage
   where user_id = p_user
     and created_at > now() - interval '1 day'
     and coalesce(ok, true);

  if v_today >= public.ai_daily_limit() then
    return jsonb_build_object(
      'ok', false, 'balance', v_balance, 'log_id', null,
      'message', format('하루에 %s번까지 쓸 수 있습니다. 내일 다시 시도해 주세요.',
                        public.ai_daily_limit()));
  end if;

  if v_balance < p_cost then
    return jsonb_build_object(
      'ok', false, 'balance', v_balance, 'log_id', null,
      'message', format('크레딧이 모자랍니다. (남은 크레딧 %s, 필요한 크레딧 %s)',
                        v_balance, p_cost));
  end if;

  update public.ai_credits
     set balance = balance - p_cost, updated_at = now()
   where user_id = p_user
  returning balance into v_balance;

  insert into public.ai_usage (user_id, action, cost, prompt)
       values (p_user, p_action, p_cost, left(coalesce(p_prompt, ''), 400))
    returning id into v_id;

  return jsonb_build_object('ok', true, 'message', null,
                            'balance', v_balance, 'log_id', v_id);
end $$;

/** 끝났다고 표시만 합니다 */
create or replace function public.ai_finish(p_id uuid, p_ok boolean, p_message text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_service_role();
  update public.ai_usage
     set ok = p_ok, message = left(coalesce(p_message, ''), 300)
   where id = p_id;
end $$;

/** 우리 쪽 사정으로 실패했을 때 — 크레딧을 되돌리고 실패로 적습니다 */
create or replace function public.ai_refund(p_id uuid, p_message text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  u public.ai_usage;
begin
  perform public.assert_service_role();

  select * into u from public.ai_usage where id = p_id;
  if not found or u.ok is not null then
    return;  -- 이미 마무리된 기록은 건드리지 않습니다
  end if;

  update public.ai_credits
     set balance = balance + u.cost, updated_at = now()
   where user_id = u.user_id;

  update public.ai_usage
     set ok = false, message = left(coalesce(p_message, ''), 300)
   where id = p_id;
end $$;

revoke all on function public.ai_balance(uuid) from anon, authenticated;
revoke all on function public.ai_spend(uuid, text, int, text) from anon, authenticated;
revoke all on function public.ai_finish(uuid, boolean, text) from anon, authenticated;
revoke all on function public.ai_refund(uuid, text) from anon, authenticated;
