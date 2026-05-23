-- Shezhire · extended relative identity and links

alter table public.relatives
  add column if not exists first_name text;

alter table public.relatives
  add column if not exists middle_name text;

alter table public.relatives
  add column if not exists birth_surname text;

alter table public.relatives
  add column if not exists current_surname text;

alter table public.relatives
  add column if not exists display_name text;

alter table public.relatives
  add column if not exists spouse_id uuid references public.relatives(id) on delete set null;

alter table public.relatives
  add column if not exists gender text check (gender in ('male', 'female'));

alter table public.relatives
  add column if not exists marital_status text check (
    marital_status in ('single', 'married', 'widowed', 'divorced')
  );

create index if not exists relatives_spouse_id_idx on public.relatives (spouse_id);

-- Backfill first_name from legacy full_name where possible
update public.relatives
set first_name = split_part(full_name, ' ', 1)
where first_name is null and full_name is not null and full_name <> '';

update public.relatives
set display_name = full_name
where display_name is null and full_name is not null and full_name <> '';
