-- INFRA-3: Naechtliche Datenbanksicherung, 7 Tage rollierend.
--
-- DIESE TABELLE IST DER EIGENTLICHE PUNKT. Eine Sicherung, von der niemand weiss, ob sie
-- laeuft, ist keine Sicherung, sondern ein Gefuehl. Jeder Lauf schreibt hier hinein, und
-- das Admin-Backend zeigt es an. Bleibt der Eintrag aus, sieht man das sofort am Alter
-- des letzten Eintrags: Schweigen ist hier ein Alarm, kein "alles gut".

create table if not exists public.system_backup (
  id uuid primary key default gen_random_uuid(),

  -- 1 = Montag ... 7 = Sonntag. Der Dateiname rotiert darueber: der Montag in einer
  -- Woche ueberschreibt den Montag der Vorwoche.
  wochentag int not null check (wochentag between 1 and 7),
  datei text not null,

  ok boolean not null,
  groesse_bytes bigint,
  dauer_sekunden int,
  tabellen int,
  fehler text,

  erstellt_am timestamptz not null default now()
);

create index if not exists idx_backup_zeit on public.system_backup (erstellt_am desc);

alter table public.system_backup enable row level security;

-- Nur die Redaktion/Inhaber sehen den Sicherungsstatus. Geschrieben wird ausschliesslich
-- vom Backup-Skript mit den Datenbank-Zugangsdaten (kein RLS-Weg noetig).
create policy "Backup-Status lesen" on public.system_backup
  for select using (public.is_staff());

comment on table public.system_backup is
  'Nachweis jeder naechtlichen Sicherung. Fehlt ein Eintrag, ist die Sicherung ausgefallen.';
