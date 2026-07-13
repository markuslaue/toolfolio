-- B-13: Verlauf erstellter Berichte.
-- Speichert nur die Metadaten eines erzeugten Berichts (Typ, Zeitraum, Summe),
-- nicht das Dokument selbst. Das Dokument wird bei Bedarf neu aus den Livedaten
-- erzeugt, damit nichts doppelt und nichts veraltet gehalten wird.

create table if not exists public.bericht_verlauf (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  erstellt_von uuid references auth.users (id) on delete set null,
  typ text not null check (typ in ('weiterverrechnung', 'ausgaben', 'verteilung', 'datev')),
  titel text not null,
  kunde text,
  zeitraum text not null,
  betrag numeric,
  created_at timestamptz not null default now()
);

create index if not exists idx_bericht_verlauf_user on public.bericht_verlauf (user_id, created_at desc);

alter table public.bericht_verlauf enable row level security;

-- Lesen: jeder mit Zugriff auf das Konto (B-25).
create policy "bericht_verlauf lesen" on public.bericht_verlauf
  for select using (public.has_account_access(user_id));

-- Schreiben und loeschen: nur Owner/Admin des Kontos.
create policy "bericht_verlauf anlegen" on public.bericht_verlauf
  for insert with check (public.has_admin_access(user_id));

create policy "bericht_verlauf loeschen" on public.bericht_verlauf
  for delete using (public.has_admin_access(user_id));
