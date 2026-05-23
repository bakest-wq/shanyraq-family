-- Phase 3: Family space, invite codes, member identity links

alter table public.families
  add column if not exists owner_name text;

update public.families
set owner_name = coalesce(owner_name, name)
where owner_name is null;

alter table public.family_members
  add column if not exists relative_id uuid references public.relatives(id) on delete set null;

alter table public.family_members
  add column if not exists joined_at timestamptz;

update public.family_members
set joined_at = coalesce(joined_at, created_at)
where joined_at is null;

alter table public.family_members
  alter column joined_at set default now();

create table if not exists public.invite_codes (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now(),
  is_active boolean not null default true
);

create index if not exists invite_codes_family_id_idx on public.invite_codes (family_id);
create index if not exists invite_codes_code_idx on public.invite_codes (code);
create index if not exists family_members_relative_id_idx on public.family_members (relative_id);

-- Backfill invite_codes from existing families
insert into public.invite_codes (family_id, code)
select f.id, f.invite_code
from public.families f
where not exists (
  select 1 from public.invite_codes ic where ic.family_id = f.id and ic.code = f.invite_code
);

-- Development: keep tables open. Production policies live in supabase/rls-future.sql
alter table public.invite_codes enable row level security;

create policy "invite_codes_select_public"
  on public.invite_codes for select
  using (true);

create policy "invite_codes_insert_public"
  on public.invite_codes for insert
  with check (true);

create policy "invite_codes_update_public"
  on public.invite_codes for update
  using (true);

create policy "invite_codes_delete_public"
  on public.invite_codes for delete
  using (true);

alter table public.family_members enable row level security;

create policy "family_members_update_public"
  on public.family_members for update
  using (true);

create policy "family_members_delete_public"
  on public.family_members for delete
  using (true);
