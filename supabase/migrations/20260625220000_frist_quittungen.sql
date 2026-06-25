-- B-12: Fristen-Waechter. Fristen werden aus Abos/Kanaelen abgeleitet (kein
-- Materialisieren). Diese Tabelle merkt sich nur, dass eine konkrete Frist
-- erledigt/ignoriert wurde, damit der Waechter sie nicht erneut anzeigt.

create table if not exists public.frist_quittungen (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  quelle text not null check (quelle in ('abo', 'kanal')),
  quelle_id uuid not null,
  art text not null check (art in ('trial', 'kuendigung', 'karte')),
  datum date not null,
  status text not null default 'erledigt' check (status in ('erledigt', 'ignoriert')),

  created_at timestamptz not null default now(),

  unique (user_id, quelle_id, art, datum)
);

alter table public.frist_quittungen enable row level security;

create policy "Eigene Quittungen lesen" on public.frist_quittungen
  for select using (auth.uid() = user_id);
create policy "Eigene Quittungen anlegen" on public.frist_quittungen
  for insert with check (auth.uid() = user_id);
create policy "Eigene Quittungen aendern" on public.frist_quittungen
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Eigene Quittungen loeschen" on public.frist_quittungen
  for delete using (auth.uid() = user_id);

create index if not exists idx_frist_quittungen_user on public.frist_quittungen (user_id);
