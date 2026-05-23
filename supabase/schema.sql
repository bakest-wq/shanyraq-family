-- Shanyraq Family · database schema
-- Run in Supabase SQL Editor

create extension if not exists "pgcrypto";

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

create table if not exists public.relatives (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families(id) on delete cascade,
  full_name text not null,
  first_name text,
  middle_name text,
  birth_surname text,
  current_surname text,
  display_name text,
  relationship text not null,
  birthday date,
  birthday_day integer check (birthday_day between 1 and 31),
  birthday_month integer check (birthday_month between 1 and 12),
  birthday_year integer check (birthday_year >= 1900),
  phone text,
  avatar_color text not null default '#2D6A4F',
  photo_url text,
  is_deceased boolean not null default false,
  death_year integer,
  dua_text text,
  notes text,
  father_id uuid references public.relatives(id) on delete set null,
  mother_id uuid references public.relatives(id) on delete set null,
  spouse_id uuid references public.relatives(id) on delete set null,
  gender text check (gender in ('male', 'female')),
  marital_status text check (marital_status in ('single', 'married', 'widowed', 'divorced')),
  zhuz text,
  ru text,
  ata_line text,
  tribe_branch text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists relatives_family_id_idx on public.relatives (family_id);
create index if not exists relatives_birthday_idx on public.relatives (birthday);
create index if not exists relatives_father_id_idx on public.relatives (father_id);
create index if not exists relatives_mother_id_idx on public.relatives (mother_id);
create index if not exists relatives_spouse_id_idx on public.relatives (spouse_id);

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.relatives enable row level security;

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

create policy "relatives_select_public"
  on public.relatives for select
  using (true);

create policy "relatives_insert_public"
  on public.relatives for insert
  with check (true);

create policy "relatives_update_public"
  on public.relatives for update
  using (true);

create policy "relatives_delete_public"
  on public.relatives for delete
  using (true);
