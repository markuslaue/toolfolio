-- B-11 Benachrichtigungen: Lese-/Erledigt-Status je abgeleiteter Benachrichtigung.
-- Benachrichtigungen werden live aus Fristen + Sparvorschlaegen abgeleitet (stabiler key).
-- Kein Eintrag = offen & ungelesen. 'gelesen' loescht nur den Punkt, 'erledigt'/'ignoriert' entfernt.
create table if not exists public.benachrichtigung_status (
  user_id uuid not null references auth.users (id) on delete cascade,
  key text not null,
  status text not null check (status in ('gelesen', 'erledigt', 'ignoriert')),
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.benachrichtigung_status enable row level security;

create policy "Eigene Benachr-Status lesen" on public.benachrichtigung_status
  for select using ((select auth.uid()) = user_id);
create policy "Eigene Benachr-Status anlegen" on public.benachrichtigung_status
  for insert with check ((select auth.uid()) = user_id);
create policy "Eigene Benachr-Status aendern" on public.benachrichtigung_status
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Eigene Benachr-Status loeschen" on public.benachrichtigung_status
  for delete using ((select auth.uid()) = user_id);
