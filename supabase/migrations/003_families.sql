-- Families · multi-tenant structure for Shanyraq Family

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  display_name text not null,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now()
);

create index if not exists family_members_family_id_idx on public.family_members (family_id);

alter table public.relatives
  add column if not exists family_id uuid references public.families(id) on delete cascade;

create index if not exists relatives_family_id_idx on public.relatives (family_id);

alter table public.families enable row level security;
alter table public.family_members enable row level security;

create policy "families_select_public"
  on public.families for select
  using (true);

create policy "families_insert_public"
  on public.families for insert
  with check (true);

create policy "family_members_select_public"
  on public.family_members for select
  using (true);

create policy "family_members_insert_public"
  on public.family_members for insert
  with check (true);
