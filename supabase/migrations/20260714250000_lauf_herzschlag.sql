-- AD-06: Herzschlag, damit tote Laeufe erkennbar sind.
--
-- DAS PROBLEM, an dem es genau einmal geknallt hat: Ein Lauf laeuft als
-- Hintergrundprozess im Container. Wird der Container neu gestartet (jeder Deploy tut
-- das) oder stuerzt er ab, ist der Prozess weg. Der Lauf steht dann fuer immer auf
-- 'laeuft', und weil ein zweiter Lauf pro Kategorie gesperrt ist, ist die Kategorie
-- damit dauerhaft blockiert. Eine Leiche, die die Tuer versperrt.
--
-- Loesung: Jeder Schreibvorgang setzt einen Zeitstempel. Wer sich laenger als ein paar
-- Minuten nicht gemeldet hat, ist tot, egal was in `status` steht. Ein Prozess kann
-- luegen, ein fehlender Herzschlag nicht.

alter table public.dir_lauf
  add column if not exists zuletzt_aktiv timestamptz not null default now();

comment on column public.dir_lauf.zuletzt_aktiv is
  'Herzschlag. Wird bei jedem Protokoll- oder Fortschritts-Schreiben gesetzt. Ein Lauf ohne Herzschlag ist tot, auch wenn status noch laeuft sagt.';

-- Bestehende Leichen aufraeumen: was laenger als 15 Minuten "laeuft", laeuft nicht mehr.
update public.dir_lauf
set status = 'abgebrochen',
    beendet_am = coalesce(beendet_am, now())
where status = 'laeuft'
  and gestartet_am < now() - interval '15 minutes';
