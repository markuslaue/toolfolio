-- B-08: Kunden (Agentur-Layer). Eigentuemer-gebunden, RLS owner-only.
-- abos.kunde referenziert vorerst per Text-Label (Name); FK folgt spaeter.

create table if not exists public.kunden (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  name text not null,
  ansprechpartner text,
  email text,
  farbe text not null default '#6C5CE7',
  status text not null default 'aktiv' check (status in ('aktiv', 'inaktiv', 'archiviert')),
  weiterverrechnet boolean not null default false,
  aufschlag_prozent numeric(6, 2),
  notizen text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.kunden enable row level security;

create policy "Eigene Kunden lesen" on public.kunden
  for select using (auth.uid() = user_id);
create policy "Eigene Kunden anlegen" on public.kunden
  for insert with check (auth.uid() = user_id);
create policy "Eigene Kunden aendern" on public.kunden
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Eigene Kunden loeschen" on public.kunden
  for delete using (auth.uid() = user_id);

create index if not exists idx_kunden_user on public.kunden (user_id);

create trigger kunden_touch_updated_at
  before update on public.kunden
  for each row execute function public.touch_updated_at();
