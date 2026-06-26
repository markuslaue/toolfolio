-- B-30 Team & Rollen: Mitglieder eines Kontos (Mandant = Owner-user_id) mit Rollen.
-- Scope: Mitglieder-Verwaltung (einladen, Rolle, entfernen) + geteilter LESE-Zugriff
-- auf die Konto-Daten. Schreibendes Mitarbeiten von Mitgliedern = spaeter (B-25, tenant_id).

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  account_owner uuid not null references auth.users (id) on delete cascade,
  member uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  member_email text not null,
  member_name text,
  created_at timestamptz not null default now(),
  unique (account_owner, member)
);

create table if not exists public.team_invites (
  id uuid primary key default gen_random_uuid(),
  account_owner uuid not null references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  token text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  unique (account_owner, email)
);

create index if not exists idx_team_members_member on public.team_members (member);
create index if not exists idx_team_members_owner on public.team_members (account_owner);
create index if not exists idx_team_invites_token on public.team_invites (token);

-- Zugriffs-Helfer. SECURITY DEFINER -> umgeht RLS, verhindert Rekursion in Policies.
create or replace function public.has_account_access(owner uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select owner = (select auth.uid())
      or exists (
        select 1 from public.team_members tm
        where tm.account_owner = owner and tm.member = (select auth.uid())
      );
$$;

create or replace function public.has_admin_access(owner uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select owner = (select auth.uid())
      or exists (
        select 1 from public.team_members tm
        where tm.account_owner = owner and tm.member = (select auth.uid()) and tm.role = 'admin'
      );
$$;

-- RLS auf den Team-Tabellen
alter table public.team_members enable row level security;
create policy "team_members lesen" on public.team_members
  for select using (has_account_access(account_owner));
create policy "team_members verwalten (owner/admin)" on public.team_members
  for all using (has_admin_access(account_owner)) with check (has_admin_access(account_owner));

alter table public.team_invites enable row level security;
create policy "team_invites verwalten (owner/admin)" on public.team_invites
  for all using (has_admin_access(account_owner)) with check (has_admin_access(account_owner));

-- Geteilter LESE-Zugriff: SELECT-Policies der Konto-Daten auf Team-Mitglieder erweitern.
-- Schreib-Policies (insert/update/delete) bleiben unveraendert eigentuemergebunden.
drop policy if exists "Eigene Abos lesen" on public.abos;
create policy "Konto-Abos lesen" on public.abos for select using (has_account_access(user_id));

drop policy if exists "Eigene Kunden lesen" on public.kunden;
create policy "Konto-Kunden lesen" on public.kunden for select using (has_account_access(user_id));

drop policy if exists "Eigene Kanaele lesen" on public.zahlungskanaele;
create policy "Konto-Kanaele lesen" on public.zahlungskanaele for select using (has_account_access(user_id));

drop policy if exists "Eigene Quittungen lesen" on public.frist_quittungen;
create policy "Konto-Quittungen lesen" on public.frist_quittungen for select using (has_account_access(user_id));

drop policy if exists "Eigenes Unternehmen lesen" on public.unternehmen;
create policy "Konto-Unternehmen lesen" on public.unternehmen for select using (has_account_access(user_id));
