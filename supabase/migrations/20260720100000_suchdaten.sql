-- AD-14: Suchdaten aus der Google Search Console.
--
-- ZWECK: Die zweite Haelfte des Anbieterberichts. dir_klick sagt, wie viele Leute auf
-- einen Anbieter geklickt haben. Diese Tabelle sagt, MIT WELCHER SUCHANFRAGE sie
-- ueberhaupt auf die Seite gekommen sind. Zusammen ergibt das die Kette von der
-- Google-Suche bis zum Klick auf den Anbieter, ohne eine einzige personenbezogene
-- Angabe: Google liefert diese Zahlen bereits aggregiert und anonymisiert.
--
-- ---------------------------------------------------------------------------
-- WARUM DAS DATUM TEIL DES SCHLUESSELS IST:
--
-- Google korrigiert seine Zahlen bis zu drei Tage rueckwirkend nach. Wer nur den
-- Vortag abholt und wegschreibt, hat dauerhaft zu niedrige Werte und merkt es nie,
-- weil es plausibel aussieht. Deshalb wird ein Zeitfenster von mehreren Tagen
-- geholt und per upsert ueberschrieben: der letzte Abruf gewinnt.
-- ---------------------------------------------------------------------------

create table if not exists public.dir_suchdaten (
  datum date not null,
  -- Der Pfad, nicht die volle URL: kuerzer, und die Domain ist ohnehin immer dieselbe.
  seite text not null,
  suchanfrage text not null,

  -- Aufgeloest, sofern der Pfad zu einer Kategorie gehoert. Null bei Startseite,
  -- Magazin oder Hub. So laesst sich je Kategorie auswerten, ohne bei jeder Abfrage
  -- Pfade zerlegen zu muessen.
  collection_id uuid references public.dir_collection(id) on delete set null,

  impressionen int not null default 0,
  klicks int not null default 0,
  -- Durchschnittliche Position. Nachkommastellen sind hier nicht Zierde: der
  -- Unterschied zwischen 8,4 und 11,2 entscheidet ueber die erste Seite.
  position numeric(6,2),

  aktualisiert_am timestamptz not null default now(),

  primary key (datum, seite, suchanfrage)
);

create index if not exists idx_suchdaten_collection on public.dir_suchdaten (collection_id, datum desc);
create index if not exists idx_suchdaten_datum on public.dir_suchdaten (datum desc);

alter table public.dir_suchdaten enable row level security;

-- Nur die Redaktion liest, geschrieben wird ausschliesslich serverseitig.
create policy "Suchdaten lesen" on public.dir_suchdaten
  for select using (public.is_staff());

comment on table public.dir_suchdaten is
  'Impressionen und Klicks je Suchanfrage und Seite, taeglich aus der Search Console. Aggregiert, nicht personenbezogen.';

-- Protokoll der Abrufe. Ohne das weiss niemand, ob der naechtliche Job noch laeuft:
-- eine Tabelle, die nicht waechst, sieht genauso aus wie eine Domain ohne Traffic.
create table if not exists public.system_suchdaten_lauf (
  id bigserial primary key,
  von date not null,
  bis date not null,
  zeilen int not null default 0,
  ok boolean not null,
  fehler text,
  dauer_sekunden int,
  erstellt_am timestamptz not null default now()
);

alter table public.system_suchdaten_lauf enable row level security;
create policy "Suchdaten-Laeufe lesen" on public.system_suchdaten_lauf
  for select using (public.is_staff());
