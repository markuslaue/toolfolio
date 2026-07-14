-- AD-06: Kategorie-Lauf aus dem Backend anstossen.
--
-- Bisher liefen Discovery, Content und Bild als Skripte auf MEINEM Rechner. Das
-- skaliert nicht auf 1300 Kategorien und macht die Redaktion von mir abhaengig.
-- Jetzt startet ein Knopf im Admin-Backend den Lauf.
--
-- WARUM EINE TABELLE UND NICHT EINFACH EIN SERVER-ACTION:
-- Ein Lauf dauert Minuten (24 SERP-Abfragen, dutzende Herstellerseiten laden, zwei
-- KI-Durchgaenge, ein Bild). Jede synchrone Antwort waere laengst im Timeout. Der Lauf
-- laeuft deshalb im Hintergrund und schreibt seinen Fortschritt hierhin, die Oberflaeche
-- liest mit. So sieht die Redaktion, WAS passiert, statt auf einen Spinner zu starren,
-- und ein abgebrochener Lauf hinterlaesst ein lesbares Protokoll statt Schweigen.

create table if not exists public.dir_lauf (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.dir_collection (id) on delete cascade,

  status text not null default 'laeuft' check (status in ('laeuft', 'fertig', 'fehler', 'abgebrochen')),

  -- Woran der Lauf gerade ist. Fuer die Fortschrittsanzeige.
  phase text,

  /* Das Protokoll. Jede Zeile: { zeit, art: 'info'|'ok'|'warnung'|'fehler', text }.
     Es ist das eigentliche Produkt dieses Laufs: eine Discovery, die 300 Kandidaten auf
     8 eindampft, muss BEGRUENDEN koennen, was sie weggeworfen hat. Sonst ist sie eine
     Blackbox, und einer Blackbox darf man ein Verzeichnis nicht anvertrauen. */
  protokoll jsonb not null default '[]'::jsonb,

  -- Zusammenfassung nach dem Lauf: gefunden, verworfen, angelegt, Woerter, Kosten.
  ergebnis jsonb,

  gestartet_von uuid references auth.users (id) on delete set null,
  gestartet_am timestamptz not null default now(),
  beendet_am timestamptz
);

create index if not exists idx_lauf_collection on public.dir_lauf (collection_id, gestartet_am desc);
create index if not exists idx_lauf_status on public.dir_lauf (status) where status = 'laeuft';

alter table public.dir_lauf enable row level security;

-- Nur die Redaktion sieht Laeufe. Sie enthalten verworfene Kandidaten und Begruendungen,
-- also redaktionelle Interna, die oeffentlich nichts zu suchen haben.
create policy "Laeufe lesen nur Redaktion" on public.dir_lauf
  for select using (public.is_staff());

-- Geschrieben wird ausschliesslich von der Service-Role (der Hintergrundlauf).
-- Keine insert/update-Policy: kein Nutzer kann einen Lauf faelschen.
