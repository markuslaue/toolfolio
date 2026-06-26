-- B-27: Unternehmensdaten (fuer spaetere Rechnungen/Reports). Eine Zeile je Nutzer.
create table if not exists public.unternehmen (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  name text,
  strasse text,
  plz text,
  ort text,
  land text not null default 'Deutschland',
  ust_id text,
  steuernummer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.unternehmen enable row level security;
create policy "Eigenes Unternehmen lesen" on public.unternehmen for select using (auth.uid() = user_id);
create policy "Eigenes Unternehmen anlegen" on public.unternehmen for insert with check (auth.uid() = user_id);
create policy "Eigenes Unternehmen aendern" on public.unternehmen for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger unternehmen_touch_updated_at
  before update on public.unternehmen
  for each row execute function public.touch_updated_at();

-- B-28: Benachrichtigungs-Praeferenzen am Profil. Der Frist-Mail-Cron respektiert diese.
alter table public.profiles
  add column if not exists benachrichtigung_frist   boolean not null default true,
  add column if not exists benachrichtigung_trial   boolean not null default true,
  add column if not exists benachrichtigung_produkt boolean not null default true,
  add column if not exists benachrichtigung_vorlauf  integer not null default 14
    check (benachrichtigung_vorlauf between 1 and 60);
