-- B-24: API-Integrationen fuer verbrauchsbasierte Dienste (z. B. DataForSEO).
-- Sicherheitsprinzip: Metadaten sind fuer den Eigentuemer lesbar, das GEHEIMNIS
-- liegt in einer eigenen Tabelle OHNE jede RLS-Policy -> nur die Service-Role
-- (serverseitiger Sync/Test) kommt heran. Ein spaltenweises REVOKE waere in
-- Supabase wirkungslos, deshalb bewusst zwei Tabellen.

create table if not exists public.integration (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null,                       -- z. B. 'dataforseo'
  label text,                                   -- Anzeigename, z. B. Login (maskiert)
  ai_service_id uuid references public.ai_services (id) on delete set null,
  guthaben numeric,                             -- Restguthaben laut Anbieter
  kumuliert_ausgegeben numeric not null default 0, -- letzter bekannter Gesamtverbrauch
  last_sync_at timestamptz,
  last_status text,                             -- 'ok' | Fehlertext
  created_at timestamptz not null default now(),
  unique (user_id, provider)
);

create index if not exists idx_integration_user on public.integration (user_id);

alter table public.integration enable row level security;

-- Metadaten: Konto-Mitglieder lesen, nur Owner/Admin schreiben (B-25-Modell).
drop policy if exists "Integration lesen" on public.integration;
create policy "Integration lesen" on public.integration
  for select using (has_account_access(user_id));
drop policy if exists "Integration anlegen" on public.integration;
create policy "Integration anlegen" on public.integration
  for insert with check (has_admin_access(user_id));
drop policy if exists "Integration aendern" on public.integration;
create policy "Integration aendern" on public.integration
  for update using (has_admin_access(user_id)) with check (has_admin_access(user_id));
drop policy if exists "Integration loeschen" on public.integration;
create policy "Integration loeschen" on public.integration
  for delete using (has_admin_access(user_id));

-- Das Geheimnis: verschluesselt, KEINE Policy -> kein Nutzer kann es lesen.
create table if not exists public.integration_secret (
  integration_id uuid primary key references public.integration (id) on delete cascade,
  ciphertext text not null,
  iv text not null,
  tag text not null,
  created_at timestamptz not null default now()
);

alter table public.integration_secret enable row level security;
-- Bewusst KEINE Policies: weder select noch insert/update/delete fuer
-- authenticated/anon. Nur die Service-Role (umgeht RLS) darf hier arbeiten.
