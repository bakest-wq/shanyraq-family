-- Birthday parts · day/month/year for elder-friendly picker

alter table public.relatives
  add column if not exists birthday_day integer check (birthday_day between 1 and 31);

alter table public.relatives
  add column if not exists birthday_month integer check (birthday_month between 1 and 12);

alter table public.relatives
  add column if not exists birthday_year integer check (birthday_year >= 1900);

update public.relatives
set
  birthday_day = extract(day from birthday)::integer,
  birthday_month = extract(month from birthday)::integer,
  birthday_year = extract(year from birthday)::integer
where
  birthday is not null
  and birthday_day is null
  and birthday_month is null;
