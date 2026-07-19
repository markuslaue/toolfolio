-- AD-13: Klickstatistik je Anbieter.
--
-- ZWECK: Einem Anbieter belegen koennen, wie viel Reichweite er ueber Toolfolio
-- bekommt. Das ist die Grundlage jedes Gespraechs ueber bezahlte Sichtbarkeit, und
-- ohne Zahlen ist es ein Versprechen.
--
-- ---------------------------------------------------------------------------
-- WAS HIER BEWUSST NICHT DRINSTEHT, und warum:
--
-- Keine IP-Adresse, kein User-Agent im Klartext, keine Sitzungskennung, kein Cookie,
-- nichts im Speicher des Endgeraets. Damit ist dieser Datenbestand nicht
-- personenbezogen und braucht keine Einwilligung (§ 25 TTDSG betrifft das Speichern
-- oder Auslesen auf dem Endgeraet, und beides findet nicht statt).
--
-- Der Preis dafuer ist ehrlich zu benennen: Ein Klickpfad ueber mehrere Seiten und
-- die urspruengliche Herkunft des Besuchers (Google, LinkedIn) sind damit NICHT
-- rekonstruierbar. Wer das wollte, brauchte eine Sitzungskennung und damit ein
-- Einwilligungsbanner. Die seitenbezogene Herkunft liefert Plausible aggregiert,
-- das reicht fuer den Anbieterbericht und kostet keine Einwilligung.
-- ---------------------------------------------------------------------------

create table if not exists public.dir_klick (
  id bigserial primary key,

  produkt_id uuid not null references public.dir_produkt(id) on delete cascade,

  -- Von welcher Kategorieseite aus geklickt wurde. Null bei Detailseiten oder Suche.
  collection_id uuid references public.dir_collection(id) on delete set null,

  -- Aus welcher Zone der Klick kam. Der entscheidende Wert fuer das Anbietergespraech:
  -- er zeigt, ob Reichweite organisch entstand oder aus bezahlter Sichtbarkeit.
  zone text check (zone in ('gesponsert', 'organisch', 'community')),

  -- Ging der Klick auf einen Affiliate-Link? Dann verdienen wir daran, und das
  -- gehoert getrennt ausgewiesen.
  ist_affiliate boolean not null default false,

  -- UTM-Parameter, MIT DENEN DER BESUCHER AUF UNSERER SEITE ANKAM, sofern welche in
  -- der Adresse standen. Keine Rekonstruktion, nur Weiterreichen dessen, was ohnehin
  -- offen in der URL stand.
  utm_source text,
  utm_medium text,
  utm_campaign text,

  -- Grob, aus dem User-Agent abgeleitet und dann verworfen: 'mobil' oder 'desktop'.
  -- Der User-Agent selbst wird NICHT gespeichert, er waere ein Fingerabdruck.
  geraet text check (geraet in ('mobil', 'desktop')),

  erstellt_am timestamptz not null default now()
);

-- Der Bericht fragt immer "dieser Anbieter, dieser Zeitraum". Genau darauf der Index.
create index if not exists idx_klick_produkt_zeit on public.dir_klick (produkt_id, erstellt_am desc);
create index if not exists idx_klick_zeit on public.dir_klick (erstellt_am desc);
create index if not exists idx_klick_collection on public.dir_klick (collection_id, erstellt_am desc);

alter table public.dir_klick enable row level security;

-- Nur die Redaktion liest. Geschrieben wird ausschliesslich serverseitig mit der
-- Service-Role, deshalb gibt es bewusst KEINE Insert-Policy: ohne sie kann niemand
-- von aussen Klicks erfinden und damit eine Statistik faelschen, auf die sich
-- Preisgespraeche stuetzen.
create policy "Klicks lesen" on public.dir_klick
  for select using (public.is_staff());

comment on table public.dir_klick is
  'Ausgehende Klicks auf Anbieter. Ohne IP, ohne Sitzung, ohne Cookie: nicht personenbezogen.';
