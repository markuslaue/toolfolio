-- AD-02: Die drei Seed-Cluster aufloesen.
--
-- Beim Taxonomie-Import (AD-02) sind 26 Cluster entstanden. Die drei Cluster aus
-- dem alten Fundament-Seed blieben daneben stehen und ueberschneiden sich
-- thematisch mit den neuen:
--   design-kreativ                -> design-und-kreativ
--   produktivitaet-kollaboration  -> projekte-und-zusammenarbeit
--   ki-automatisierung            -> ki-und-automatisierung   (leer)
--
-- Die beiden EINZIGEN veroeffentlichten Collections hingen an den alten Clustern.
-- Ohne diese Aufloesung haette das Verzeichnis dauerhaft zwei konkurrierende
-- Hubs fuer dasselbe Thema gehabt.
--
-- Reihenfolge ist wichtig: erst umhaengen, dann loeschen. dir_collection.cluster_id
-- haengt mit ON DELETE CASCADE am Cluster, ein Loeschen vorab wuerde die
-- Collections mitreissen.

-- 1) Collections in die neuen Cluster umhaengen.
update public.dir_collection c
set cluster_id = neu.id
from public.dir_cluster alt, public.dir_cluster neu
where c.cluster_id = alt.id
  and alt.slug = 'design-kreativ'
  and neu.slug = 'design-und-kreativ';

update public.dir_collection c
set cluster_id = neu.id
from public.dir_cluster alt, public.dir_cluster neu
where c.cluster_id = alt.id
  and alt.slug = 'produktivitaet-kollaboration'
  and neu.slug = 'projekte-und-zusammenarbeit';

update public.dir_collection c
set cluster_id = neu.id
from public.dir_cluster alt, public.dir_cluster neu
where c.cluster_id = alt.id
  and alt.slug = 'ki-automatisierung'
  and neu.slug = 'ki-und-automatisierung';

-- 2) Kategorien (L1/L2) des alten Seeds mit umhaengen, sonst reisst der Cascade
--    sie weg und die Collections verlieren ihre kategorie_id.
update public.dir_kategorie k
set cluster_id = neu.id
from public.dir_cluster alt, public.dir_cluster neu
where k.cluster_id = alt.id
  and alt.slug = 'design-kreativ'
  and neu.slug = 'design-und-kreativ';

update public.dir_kategorie k
set cluster_id = neu.id
from public.dir_cluster alt, public.dir_cluster neu
where k.cluster_id = alt.id
  and alt.slug = 'produktivitaet-kollaboration'
  and neu.slug = 'projekte-und-zusammenarbeit';

update public.dir_kategorie k
set cluster_id = neu.id
from public.dir_cluster alt, public.dir_cluster neu
where k.cluster_id = alt.id
  and alt.slug = 'ki-automatisierung'
  and neu.slug = 'ki-und-automatisierung';

-- 3) Erst jetzt die alten Cluster loeschen. Sie sind leer.
delete from public.dir_cluster
where slug in ('design-kreativ', 'produktivitaet-kollaboration', 'ki-automatisierung');

-- 4) Die neuen Cluster, die veroeffentlichte Collections tragen, muessen selbst
--    veroeffentlicht sein. Sonst zeigt der Hub auf einen Cluster, den die RLS
--    fuer anonyme Besucher wegblendet, und die Collection ist verwaist.
update public.dir_cluster
set status = 'veroeffentlicht'
where id in (
  select distinct cluster_id from public.dir_collection where status = 'veroeffentlicht'
);
