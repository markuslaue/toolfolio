-- INFRA-3, zweite Stufe: die Kopie an einem zweiten Ort (Google Drive, verschluesselt).
--
-- WARUM DAS UEBERHAUPT PROTOKOLLIERT WIRD: Eine Zweitkopie ist genau dann wertvoll, wenn
-- der VPS nicht mehr da ist. Wenn der Upload seit Wochen still scheitert, merkt man das
-- ohne Protokoll erst in dem Moment, in dem man ihn braucht, und dann ist es zu spaet.
-- Deshalb bekommt der Upload einen eigenen Status: die lokale Sicherung kann gelingen,
-- waehrend die Zweitkopie fehlschlaegt, und dieser Fall muss sichtbar sein.

alter table public.system_backup
  add column if not exists offsite_ok boolean,          -- null = nicht eingerichtet
  add column if not exists offsite_ziel text,           -- z. B. "gdrive:Toolfolio-Sicherungen"
  add column if not exists offsite_bytes bigint,        -- Groesse der verschluesselten Datei
  add column if not exists offsite_fehler text;

comment on column public.system_backup.offsite_ok is
  'true = verschluesselte Zweitkopie hochgeladen, false = fehlgeschlagen, null = keine Zweitablage eingerichtet.';
