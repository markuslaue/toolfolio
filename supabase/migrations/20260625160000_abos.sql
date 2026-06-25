-- B-05: Abos. Fundament des Tracker-Datenkerns. Jede Zeile gehoert genau einem
-- Nutzer (user_id). Kunde/Zahlungskanal vorerst als Text (FK mit B-07/B-08).

create table if not exists public.abos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  -- Tool
  tool text not null,
  anbieter text,
  initial text,
  farbe text,
  kategorie text not null,
  mit_verzeichnis boolean not null default false,

  -- Kosten
  kosten numeric(12, 2) not null check (kosten >= 0),
  waehrung text not null default 'EUR' check (waehrung in ('EUR', 'USD')),
  intervall text not null default 'monatlich'
    check (intervall in ('monatlich', 'quartalsweise', 'jaehrlich')),

  -- Abbuchung
  naechste_abbuchung date,
  zahlungskanal text,

  -- Zuordnung
  kunde text,
  status text not null default 'aktiv'
    check (status in ('aktiv', 'Trial', 'pausiert', 'gekuendigt', 'archiviert')),
  tags text[] not null default '{}',

  -- Agentur / Weiterverrechnung
  weiterverrechnen boolean not null default false,
  aufschlag_prozent numeric(6, 2),

  -- Vertrag / Frist
  abo_seit date,
  auto_verlaengerung boolean not null default true,
  frist_wert integer check (frist_wert is null or frist_wert >= 0),
  frist_einheit text check (frist_einheit in ('Tage', 'Wochen', 'Monate')),
  letzter_kuendigungstermin date,
  erinnerung boolean not null default false,
  trial_endet date,

  -- Notizen
  notizen text,
  konto_email text,
  login_verweis text,

  -- Meta
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.abos enable row level security;

create policy "Eigene Abos lesen" on public.abos
  for select using (auth.uid() = user_id);
create policy "Eigene Abos anlegen" on public.abos
  for insert with check (auth.uid() = user_id);
create policy "Eigene Abos aendern" on public.abos
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Eigene Abos loeschen" on public.abos
  for delete using (auth.uid() = user_id);

create index if not exists idx_abos_user_id on public.abos (user_id);
create index if not exists idx_abos_status on public.abos (user_id, status);
create index if not exists idx_abos_naechste_abbuchung on public.abos (user_id, naechste_abbuchung);

-- updated_at automatisch pflegen
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger abos_touch_updated_at
  before update on public.abos
  for each row execute function public.touch_updated_at();
