-- ─────────────────────────────────────────────────────────────
-- Supabase SQL Editor에 붙여넣고 실행하세요.
-- ─────────────────────────────────────────────────────────────

create table if not exists guestbook_entries (
  id         uuid        primary key default gen_random_uuid(),
  message    text        not null check (char_length(message) between 1 and 100),
  created_at timestamptz not null default now(),
  is_hidden  boolean     not null default false
);

-- 공개 피드 쿼리용 부분 인덱스
create index if not exists guestbook_entries_feed_idx
  on guestbook_entries (created_at desc)
  where is_hidden = false;

-- Row Level Security 활성화
alter table guestbook_entries enable row level security;

-- 비숨김 글 공개 읽기
create policy "Public read non-hidden"
  on guestbook_entries for select
  using (is_hidden = false);

-- insert / update 는 service_role (API Route) 만 가능
-- service_role 키는 RLS를 우회하므로 별도 policy 불필요
