-- Add parent links to relatives (run if table already exists)
alter table public.relatives
  add column if not exists father_id uuid references public.relatives(id) on delete set null;

alter table public.relatives
  add column if not exists mother_id uuid references public.relatives(id) on delete set null;

create index if not exists relatives_father_id_idx on public.relatives (father_id);
create index if not exists relatives_mother_id_idx on public.relatives (mother_id);
