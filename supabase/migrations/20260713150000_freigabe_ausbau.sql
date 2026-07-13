-- B-23 Ausbau: Zuordnung ("fuer wen"), Antragsteller als echter Nutzer, Rueckfragen.

-- Fuer wen wird das Tool beantragt: intern oder ein konkreter Kunde.
alter table public.freigabe_antrag add column if not exists fuer text;

-- Wer den Antrag gestellt hat (fuer "Meine Antraege"). Bewusst nullable:
-- Altbestand hat nur den freien Textnamen in `antragsteller`.
alter table public.freigabe_antrag add column if not exists erstellt_von uuid references auth.users (id) on delete set null;

-- Rueckfragen und Kommentare zu einem Antrag.
create table if not exists public.freigabe_kommentar (
  id uuid primary key default gen_random_uuid(),
  antrag_id uuid not null references public.freigabe_antrag (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,   -- Mandant (Konto)
  autor uuid references auth.users (id) on delete set null,
  autor_name text not null,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_freigabe_kommentar_antrag on public.freigabe_kommentar (antrag_id, created_at);

alter table public.freigabe_kommentar enable row level security;

-- Lesen darf jeder mit Kontozugriff, schreiben ebenfalls (eine Rueckfrage ist
-- keine Aenderung am Antrag). Loeschen nur Owner/Admin.
create policy "Kommentare lesen" on public.freigabe_kommentar
  for select using (public.has_account_access(user_id));

create policy "Kommentare schreiben" on public.freigabe_kommentar
  for insert with check (public.has_account_access(user_id) and autor = (select auth.uid()));

create policy "Kommentare loeschen" on public.freigabe_kommentar
  for delete using (public.has_admin_access(user_id));

-- Korrektur der Antrags-Policies (B-25):
-- Der Sinn der Freigabe ist, dass MITGLIEDER beantragen und Owner/Admin entscheiden.
-- Bisher war das Anlegen an `auth.uid() = user_id` gebunden, also nur dem Kontoinhaber
-- erlaubt. Damit konnte genau die Zielgruppe keinen Antrag stellen.
drop policy if exists "Antraege anlegen" on public.freigabe_antrag;
drop policy if exists "Antraege aendern" on public.freigabe_antrag;
drop policy if exists "Antraege loeschen" on public.freigabe_antrag;

create policy "Antraege anlegen" on public.freigabe_antrag
  for insert with check (public.has_account_access(user_id));

create policy "Antraege entscheiden" on public.freigabe_antrag
  for update using (public.has_admin_access(user_id)) with check (public.has_admin_access(user_id));

create policy "Antraege loeschen" on public.freigabe_antrag
  for delete using (public.has_admin_access(user_id));
