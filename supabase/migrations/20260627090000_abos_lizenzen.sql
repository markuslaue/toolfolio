-- B-21 Seats-/Lizenzverwaltung: gebuchte Plaetze (Lizenzen) je Abo.
-- "genutzt" = zugewiesene Zugaenge (B-22, tool_zugang). "ungenutzt" = gebucht - zugewiesen.
alter table public.abos
  add column if not exists lizenzen integer check (lizenzen is null or (lizenzen >= 0 and lizenzen <= 100000));
