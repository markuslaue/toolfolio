-- AD-08: Vermittlungsprovision, geteilt mit dem Nutzer.
--
-- DIE IDEE: Toolfolio bekommt vom Anbieter eine Provision und gibt die HAELFTE davon als
-- Rabatt an den Nutzer weiter. Das ist der Unterschied zu jedem anderen Vergleichsportal:
-- dort verschwindet die Provision still in der Tasche des Portals, und der Nutzer zahlt
-- den vollen Preis, waehrend er glaubt, neutral beraten worden zu sein.
--
-- DER RABATT IST EIN VERSPRECHEN, KEIN TEXT.
-- Wer "inklusive 5 % Toolfolio-Rabatt" liest, erwartet 5 % weniger auf der Rechnung.
-- Steht das da, ohne dass eine Vereinbarung existiert, ist es eine Falschangabe (§ 5 UWG)
-- und im Zweifel sogar eine zugesagte Leistung, die wir selbst bezahlen muessten.
--
-- Deshalb ist der Rabatt DATENGETRIEBEN und steht NUR dort, wo er wirklich vereinbart ist.
-- Kein Standardwert, keine Anzeige ohne Eintrag. Wer nichts eingetragen hat, zeigt nichts.
--
-- Er haengt an der ZUORDNUNG, nicht am Produkt: derselbe Anbieter kann in einer Kategorie
-- eine Vereinbarung haben und in einer anderen nicht.

alter table public.dir_collection_produkt
  add column if not exists rabatt_prozent numeric(5, 2) check (rabatt_prozent is null or (rabatt_prozent > 0 and rabatt_prozent <= 50)),
  add column if not exists provision_prozent numeric(5, 2),
  add column if not exists rabatt_bestaetigt_am timestamptz;

comment on column public.dir_collection_produkt.rabatt_prozent is
  'Was der NUTZER bekommt. Erscheint als Versprechen auf der Seite. Nur eintragen, wenn es wirklich vereinbart ist: der Nutzer erwartet es auf seiner Rechnung.';
comment on column public.dir_collection_produkt.provision_prozent is
  'Was TOOLFOLIO bekommt. Interne Zahl, erscheint nie oeffentlich. Dient dem Nachweis, dass wir die Haelfte weitergeben.';
comment on column public.dir_collection_produkt.rabatt_bestaetigt_am is
  'Wann die Vereinbarung bestaetigt wurde. Ohne Datum kein Rabatt: ein Versprechen ohne Vereinbarung ist eine Falschangabe.';
