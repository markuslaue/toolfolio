-- Die Redaktions-Uebersicht war langsam, und zwar aus einem hausgemachten Grund:
-- sie stellte 183 Abfragen fuer eine einzige Seite. Je Cluster fuenf Zaehlungen, dann
-- ALLE Collection-IDs geladen und die Produkte mit einem .in(...) ueber bis zu 1000
-- UUIDs gezaehlt. Ein Filter mit 1000 UUIDs ist ein Query-String von 36 Kilobyte.
--
-- Das ist keine Frage der Datenmenge (1300 Zeilen sind fuer Postgres nichts), sondern
-- eine Frage der Anzahl der Runden. Gruppieren kann die Datenbank selbst, viel besser
-- als wir es mit 183 Netzwerkrunden nachbauen.
--
-- Diese Sicht macht aus 183 Abfragen EINE.

create or replace view public.dir_cluster_stats as
select
  c.id,
  c.name,
  c.slug,
  c.farbe,
  c.status,
  count(col.id)                                                          as collections,
  count(col.id) filter (where col.status = 'veroeffentlicht')            as live,
  count(col.id) filter (where col.content_status <> 'fehlt')             as mit_text,
  count(col.id) filter (where col.content_status = 'ki_ungeprueft')      as text_ungeprueft,
  count(col.id) filter (where col.finder_status = 'live')                as finder_live,
  count(col.id) filter (where col.finder_status = 'in_review')           as finder_pruef,
  coalesce(sum(p.anzahl), 0)                                             as produkte
from public.dir_cluster c
left join public.dir_collection col
  on col.cluster_id = c.id
left join lateral (
  select count(*) as anzahl
  from public.dir_collection_produkt cp
  where cp.collection_id = col.id
) p on true
group by c.id, c.name, c.slug, c.farbe, c.status;

comment on view public.dir_cluster_stats is
  'Kennzahlen je Cluster fuer die Redaktions-Uebersicht. Ersetzt 183 Einzelabfragen durch eine.';

-- Die Sicht wird ausschliesslich vom Admin-Backend mit der Service-Role gelesen.
-- Die zugrundeliegenden Tabellen haben ihre eigene RLS, an der aendert sich nichts.
