-- B-10 Sparvorschlaege: Status je Vorschlag (umgesetzt/ignoriert) + Snapshot,
-- damit umgesetzte/ignorierte Vorschlaege erhalten bleiben, auch wenn die Engine
-- sie nicht mehr berechnet (z. B. nach Intervall-Wechsel). 'offen' = kein Eintrag.
create table if not exists public.sparvorschlag_status (
  user_id uuid not null references auth.users (id) on delete cascade,
  vorschlag_key text not null,
  status text not null check (status in ('umgesetzt', 'ignoriert')),
  typ text not null,
  titel text not null,
  ersparnis_jahr numeric(12, 2) not null default 0,
  begruendung text,
  tools jsonb not null default '[]',
  geschaetzt boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, vorschlag_key)
);

alter table public.sparvorschlag_status enable row level security;

create policy "Eigene Spar-Status lesen" on public.sparvorschlag_status
  for select using ((select auth.uid()) = user_id);
create policy "Eigene Spar-Status anlegen" on public.sparvorschlag_status
  for insert with check ((select auth.uid()) = user_id);
create policy "Eigene Spar-Status aendern" on public.sparvorschlag_status
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Eigene Spar-Status loeschen" on public.sparvorschlag_status
  for delete using ((select auth.uid()) = user_id);
