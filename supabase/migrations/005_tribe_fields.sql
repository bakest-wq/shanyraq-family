-- Shezhire · zhuz, ru, ata line, tribe branch

alter table public.relatives
  add column if not exists zhuz text;

alter table public.relatives
  add column if not exists ru text;

alter table public.relatives
  add column if not exists ata_line text;

alter table public.relatives
  add column if not exists tribe_branch text;
