-- AD-09: Detailseiten der Anbieter, Veroeffentlichung zentral gesteuert.
--
-- ZIEHEN UND VEROEFFENTLICHEN SIND ZWEI DINGE (Entscheidung mit Markus):
-- Der Anbieterdaten-Lauf zieht ALLE Fakten in einem Durchgang (wir sind ohnehin auf der
-- Seite). Ob daraus eine oeffentliche, indexierbare Detailseite wird, entscheidet ein
-- Mensch spaeter per Knopf. Grund: Google bestraft "thin content" und Masse. Tausende
-- halbfertige Anbieterseiten auf einmal in den Index zu kippen, schadet der ganzen Domain.
--
-- Deshalb ein STATUS pro Produkt. Solange er nicht 'veroeffentlicht' ist:
--   - kein "Details"-Link auf der Collection-Seite (nur der Link zur Anbieter-Website)
--   - /software/<slug> ist ein echter 404 (die Seite "gibt es noch nicht")
--   - nicht in der Sitemap, kein Schema-Verweis
-- Erst 'veroeffentlicht' schaltet die Seite scharf.

alter table public.dir_produkt
  add column if not exists detailseite_status text not null default 'keine'
    check (detailseite_status in ('keine', 'entwurf', 'veroeffentlicht')),
  add column if not exists detail_md text,
  add column if not exists detail_meta_title text,
  add column if not exists detail_meta_description text,
  add column if not exists detail_erzeugt_am timestamptz,
  add column if not exists detail_freigegeben_am timestamptz,
  -- Review-Themen: bewusst JETZT angelegt, aber leer. Sie werden gefuellt, sobald es
  -- echte Bewertungen gibt. "Kunden loben X" ohne echte Reviews waere erfundener
  -- Inhalt, und den schreiben wir nicht. Ein Capterra/OMR-Abschreiben ist doppelt
  -- verboten (fremde Datenbank + nie ablesbar in oeffentlichen Daten).
  add column if not exists review_themen jsonb;

comment on column public.dir_produkt.detailseite_status is
  'keine = noch nichts, entwurf = Text erzeugt/in Pruefung, veroeffentlicht = oeffentlich und indexierbar. Steuert Sichtbarkeit, Sitemap und Schema.';
comment on column public.dir_produkt.detail_md is
  'Redaktioneller Detailtext, erzeugt aus den gezogenen Herstellerdaten. Kein erneutes Crawlen noetig.';
comment on column public.dir_produkt.review_themen is
  'Erst gefuellt, wenn echte Bewertungen vorliegen. NIE erfunden, NIE von Capterra/OMR.';

create index if not exists idx_produkt_detailseite on public.dir_produkt (detailseite_status) where detailseite_status = 'veroeffentlicht';
