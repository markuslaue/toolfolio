-- Avatar-Storage-Policies sauber neu setzen (vorheriger Lauf hatte sie evtl. nicht angelegt).
drop policy if exists "Eigenen Avatar anlegen" on storage.objects;
drop policy if exists "Eigenen Avatar aktualisieren" on storage.objects;
drop policy if exists "Eigenen Avatar loeschen" on storage.objects;

create policy "Eigenen Avatar anlegen" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Eigenen Avatar aktualisieren" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Eigenen Avatar loeschen" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
