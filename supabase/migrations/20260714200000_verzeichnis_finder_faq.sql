-- AD-04: Anfrage-Finder und FAQ pro Collection.
--
-- ZWEI NEUE DATENFELDER, beide bewusst als jsonb an der Collection:
--
-- 1) finder_config: der KATEGORIESPEZIFISCHE Fragensatz. Die Finder-Engine selbst
--    ist generisch und wird EINMAL gebaut. Was sich pro Kategorie unterscheidet,
--    sind nur die Fragen, die Antwort-Tags und die Tool-Tags fuer das Matching.
--    Deshalb liegen die als Daten hier und nicht als Code pro Kategorie: der
--    Rollout auf ~1300 Kategorien muss reine Datenpflege sein, kein Neubau.
--
-- 2) faq: Frage-Antwort-Paare. Sie sind SICHTBARER Text UND die Quelle des
--    FAQPage-Markups. Beides aus derselben Zeile zu speisen ist keine Bequemlichkeit,
--    sondern Pflicht: Google verlangt, dass markierter Inhalt sichtbar ist. Zwei
--    getrennte Quellen wuerden frueher oder spaeter auseinanderlaufen und das
--    Markup waere ein Richtlinienverstoss.
--
-- finder_status ist eine EIGENE Spalte, nicht nur ein Feld im jsonb, weil die
-- Uebersicht danach filtert und zaehlt. Ein Filter auf ein jsonb-Feld waere ohne
-- Index langsam und ohne Check-Constraint schutzlos gegen Tippfehler.

alter table public.dir_collection
  add column if not exists finder_config jsonb,
  add column if not exists finder_status text not null default 'todo'
    check (finder_status in ('todo', 'in_review', 'live')),
  add column if not exists faq jsonb not null default '[]'::jsonb,
  add column if not exists aktualisiert_am timestamptz not null default now();

comment on column public.dir_collection.finder_config is
  'Kategoriespezifischer Fragensatz fuer den Anfrage-Finder. Die Engine ist generisch, nur die Daten variieren.';
comment on column public.dir_collection.finder_status is
  'todo = kein eigener Fragensatz (Seite faellt auf den generischen Basis-Finder zurueck), in_review = entworfen, live = freigegeben.';
comment on column public.dir_collection.faq is
  'Sichtbare FAQ UND Quelle des FAQPage-Markups. Muss dieselbe Quelle sein, sonst ist das Markup ein Richtlinienverstoss.';
comment on column public.dir_collection.aktualisiert_am is
  'Echtes Aktualisierungsdatum. Speist dateModified im JSON-LD und das "zuletzt aktualisiert" auf der Seite. Wird bei jeder inhaltlichen Aenderung gesetzt, NICHT bei jedem Deploy.';

create index if not exists idx_collection_finder_status
  on public.dir_collection (cluster_id, finder_status);

/* --------------------------------------------------------------------------
 * Tool-Tags fuer das Matching
 *
 * Sie haengen an der ZUORDNUNG, nicht am Produkt: dasselbe Tool kann in zwei
 * Kategorien fuer voellig verschiedene Dinge stehen. Eine Software, die auf einem
 * Campingplatz "Dauercamper-Verwaltung" kann, hat dieses Tag in der Kategorie
 * Hotelsoftware nicht.
 * ----------------------------------------------------------------------- */

alter table public.dir_collection_produkt
  add column if not exists tags text[] not null default '{}';

comment on column public.dir_collection_produkt.tags is
  'Matching-Tags des Produkts IN DIESER Kategorie. Bewusst an der Zuordnung, nicht am Produkt: dasselbe Tool bedeutet in zwei Kategorien Verschiedenes.';

/* --------------------------------------------------------------------------
 * Governance: das Finder-Ergebnis darf niemals von bezahlter Sichtbarkeit
 * abhaengen (Goldene Regel). Das ist im Code so gebaut. Hier steht es als
 * Kommentar, damit niemand spaeter auf die Idee kommt, die Zone einfliessen
 * zu lassen.
 * ----------------------------------------------------------------------- */

comment on table public.dir_collection_produkt is
  'Zuordnung Produkt zu Collection. zone steuert die SICHTBARKEIT (gesponsert/organisch/community), niemals das Finder-Ergebnis und niemals die organische Reihenfolge.';
