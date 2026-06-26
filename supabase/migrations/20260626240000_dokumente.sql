-- B-19 Rechnungs- & Vertragsarchiv: privater Storage-Bucket + Metadaten je Dokument.
-- Belege sind personenbezogen -> strikt eigentuemergebunden (kein Team-Sharing).

-- Privater Bucket
insert into storage.buckets (id, name, public)
values ('dokumente', 'dokumente', false)
on conflict (id) do nothing;

-- Storage-RLS: Zugriff nur auf eigene Dateien (Pfad-Praefix = user_id).
create policy "Eigene Dokumente lesen" on storage.objects
  for select to authenticated
  using (bucket_id = 'dokumente' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Eigene Dokumente anlegen" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'dokumente' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Eigene Dokumente loeschen" on storage.objects
  for delete to authenticated
  using (bucket_id = 'dokumente' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Metadaten
create table if not exists public.dokumente (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  abo_id uuid references public.abos (id) on delete set null,
  typ text not null check (typ in ('rechnung', 'vertrag', 'agb', 'sonstiges')),
  titel text not null,
  datum date,
  jahr integer,
  betrag numeric(12, 2),
  storage_path text,
  mime text,
  groesse bigint,
  created_at timestamptz not null default now()
);

create index if not exists idx_dokumente_user on public.dokumente (user_id);
create index if not exists idx_dokumente_abo on public.dokumente (abo_id);

alter table public.dokumente enable row level security;
create policy "Eigene Dok-Meta lesen" on public.dokumente for select using ((select auth.uid()) = user_id);
create policy "Eigene Dok-Meta anlegen" on public.dokumente for insert with check ((select auth.uid()) = user_id);
create policy "Eigene Dok-Meta aendern" on public.dokumente for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Eigene Dok-Meta loeschen" on public.dokumente for delete using ((select auth.uid()) = user_id);
