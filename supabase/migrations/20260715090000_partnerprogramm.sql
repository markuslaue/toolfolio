-- A-07: Affiliate / Partnerprogramme.
--
-- DREI ZUSTAENDE, streng getrennt, weil sie drei verschiedene Dinge bedeuten:
--
--   partnerprogramm       Hat der Anbieter ueberhaupt eins? Research-Befund.
--                         'unbekannt' (noch nicht geprueft) | 'ja' | 'nein'.
--   partnerprogramm_url   Wo man sich anmeldet. Nur ein Hinweis fuer die Redaktion.
--   affiliate_url         UNSER getrackter Link. Erst gesetzt, wenn wir wirklich
--                         beigetreten sind.
--
-- DER UNTERSCHIED ZWISCHEN "hat ein Programm" UND "wir haben einen Affiliate-Link" IST
-- ENTSCHEIDEND und darf nie verwischt werden:
--
--   Solange nur `partnerprogramm = 'ja'` gilt, aendert sich fuer den Besucher NICHTS.
--   Der Link zeigt weiter direkt zum Anbieter, ohne Tracking, ohne Provision, ohne
--   Kennzeichnung. Ein Anbieter mit Programm ist noch kein Affiliate-Verhaeltnis.
--
--   Erst wenn `affiliate_url` gesetzt ist, verdienen wir an einem Klick, und GENAU DANN
--   muss der Link im Frontend als Affiliate-Link gekennzeichnet und mit rel="sponsored"
--   ausgezeichnet werden. Beides ist Pflicht:
--     - § 5a UWG: kommerzielle Verlinkung muss als solche erkennbar sein. Ein nicht
--       gekennzeichneter Affiliate-Link ist Schleichwerbung, abmahnfaehig.
--     - Google verlangt rel="sponsored" (oder nofollow) fuer bezahlte Links. Ohne das
--       riskiert die ganze Domain eine manuelle Massnahme.
--
-- Das Partnerprogramm aendert NICHTS an Rang oder Empfehlung (Goldene Regel). Ein
-- organisch platziertes Tool bleibt organisch platziert, auch wenn wir an ihm verdienen.
-- Was sich aendert, ist einzig die Kennzeichnung des Auswaerts-Links.

alter table public.dir_produkt
  add column if not exists partnerprogramm text not null default 'unbekannt'
    check (partnerprogramm in ('unbekannt', 'ja', 'nein')),
  add column if not exists partnerprogramm_url text,
  add column if not exists affiliate_url text,
  add column if not exists affiliate_seit timestamptz;

comment on column public.dir_produkt.partnerprogramm is
  'Research-Befund: hat der Anbieter ein Partner-/Affiliate-Programm? unbekannt/ja/nein. Aendert NICHTS am Rang.';
comment on column public.dir_produkt.affiliate_url is
  'Unser getrackter Link. NUR gesetzt, wenn wir beigetreten sind. Ist er gesetzt, MUSS der Link im Frontend als Affiliate gekennzeichnet und mit rel=sponsored ausgezeichnet werden.';
