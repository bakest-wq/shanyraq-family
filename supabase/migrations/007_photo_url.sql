-- Profile photos for relatives
alter table public.relatives
  add column if not exists photo_url text;

-- Optional: public bucket for relative profile photos (apply if using Supabase Storage)
insert into storage.buckets (id, name, public)
values ('relative-photos', 'relative-photos', true)
on conflict (id) do nothing;

create policy "relative_photos_public_read"
  on storage.objects for select
  using (bucket_id = 'relative-photos');

create policy "relative_photos_public_upload"
  on storage.objects for insert
  with check (bucket_id = 'relative-photos');

create policy "relative_photos_public_update"
  on storage.objects for update
  using (bucket_id = 'relative-photos');

create policy "relative_photos_public_delete"
  on storage.objects for delete
  using (bucket_id = 'relative-photos');
