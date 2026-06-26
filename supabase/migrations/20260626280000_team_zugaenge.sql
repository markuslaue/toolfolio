-- B-22 Team / Wer-nutzt-was (Offboarding): Personen + Tool-Zugaenge.
-- Personen koennen Toolfolio-Mitglieder oder extern genannte Personen sein.
-- Nutzungs-Aktivitaet (letzte Nutzung) braucht Integrationen (B-24) -> hier manuell.
create table if not exists public.personen (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  rolle text,
  email text,
  status text not null default 'aktiv' check (status in ('aktiv', 'scheidet_aus', 'ausgeschieden')),
  austritt date,
  created_at timestamptz not null default now()
);

create table if not exists public.tool_zugang (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  person_id uuid not null references public.personen (id) on delete cascade,
  abo_id uuid not null references public.abos (id) on delete cascade,
  platz_kosten numeric(12, 2),
  ist_owner boolean not null default false,
  created_at timestamptz not null default now(),
  unique (person_id, abo_id)
);

create index if not exists idx_personen_user on public.personen (user_id);
create index if not exists idx_tool_zugang_user on public.tool_zugang (user_id);
create index if not exists idx_tool_zugang_abo on public.tool_zugang (abo_id);

alter table public.personen enable row level security;
alter table public.tool_zugang enable row level security;

-- Lesen: Konto + Team (has_account_access aus B-30). Schreiben: Eigentuemer.
create policy "Personen lesen" on public.personen for select using (has_account_access(user_id));
create policy "Personen anlegen" on public.personen for insert with check ((select auth.uid()) = user_id);
create policy "Personen aendern" on public.personen for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Personen loeschen" on public.personen for delete using ((select auth.uid()) = user_id);

create policy "Zugaenge lesen" on public.tool_zugang for select using (has_account_access(user_id));
create policy "Zugaenge anlegen" on public.tool_zugang for insert with check ((select auth.uid()) = user_id);
create policy "Zugaenge aendern" on public.tool_zugang for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Zugaenge loeschen" on public.tool_zugang for delete using ((select auth.uid()) = user_id);
