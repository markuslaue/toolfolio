-- Avatar-Upload: oeffentlicher Bucket + Spalte am Profil.
alter table public.profiles add column if not exists avatar_url text;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Schreiben nur auf eigene Datei (Pfad-Praefix = user_id). Lesen ist oeffentlich (public bucket).
create policy "Eigenen Avatar anlegen" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Eigenen Avatar aktualisieren" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Eigenen Avatar loeschen" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
