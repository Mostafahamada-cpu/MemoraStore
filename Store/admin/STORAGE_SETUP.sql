-- ============================================================
-- Memora storage bucket for admin image uploads
-- Run in the Supabase SQL editor (safe to run multiple times).
-- Required for "Upload Thumbnail" / "Upload Logo" in the Admin.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('memora-assets', 'memora-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "Authenticated admins can upload assets" on storage.objects;
drop policy if exists "Authenticated admins can update assets" on storage.objects;
drop policy if exists "Authenticated admins can delete assets" on storage.objects;
drop policy if exists "Public can read memora assets" on storage.objects;

create policy "Authenticated admins can upload assets" on storage.objects
for insert to authenticated with check (bucket_id = 'memora-assets');

create policy "Authenticated admins can update assets" on storage.objects
for update to authenticated using (bucket_id = 'memora-assets') with check (bucket_id = 'memora-assets');

create policy "Authenticated admins can delete assets" on storage.objects
for delete to authenticated using (bucket_id = 'memora-assets');

create policy "Public can read memora assets" on storage.objects
for select to anon, authenticated using (bucket_id = 'memora-assets');
