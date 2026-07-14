-- A-06 (Launch-Service), Fundament: Anfragen speichern und Einwilligungen nachweisen.
--
-- ZWEI STRIKT GETRENNTE RECHTSGRUNDLAGEN. Sie duerfen nie vermischt werden:
--
--   1. Die ANFRAGE selbst (Demo, Beratung, Kontakt zu einem Anbieter)
--      = Vertragsanbahnung, Art. 6 I b DSGVO. Keine Einwilligung noetig.
--
--   2. Der LAUNCH-SERVICE (spaeterer Kontakt durch ANDERE Anbieter derselben
--      Kategorie) = Werbung. Braucht eine ausdrueckliche, gesonderte, FREIWILLIGE
--      Einwilligung nach Art. 6 I a DSGVO und § 7 UWG.
--
-- Warum das getrennt sein MUSS: Eine Einwilligung, die an die Datenschutzerklaerung
-- gekoppelt ist oder ohne die man die Anfrage nicht abschicken kann, ist nach
-- Art. 7 IV DSGVO nicht freiwillig und damit UNWIRKSAM. Rueckwirkend, fuer die
-- gesamte Liste. Deshalb liegt die Einwilligung in einer EIGENEN Tabelle mit
-- eigenem Nachweis, statt als Flag an der Anfrage.

/* ---------------------------------------------------------------------------
 * 1) Anfragen
 * ------------------------------------------------------------------------ */

create table if not exists public.dir_anfrage (
  id uuid primary key default gen_random_uuid(),

  -- Woher kam die Anfrage: konkretes Produkt ODER die Kategorie (generisch).
  produkt_id uuid references public.dir_produkt (id) on delete set null,
  collection_id uuid references public.dir_collection (id) on delete set null,

  art text not null check (art in ('demo', 'beratung', 'kontakt', 'angebot')),

  -- Kontaktdaten des Anfragenden.
  name text not null,
  email text not null,
  telefon text,
  firma text,
  nachricht text,

  -- Kontext, den der Anbieter fuer ein sinnvolles Angebot braucht.
  unternehmensgroesse text,
  zeitrahmen text,

  -- Zustellung an den Anbieter.
  status text not null default 'neu' check (status in ('neu', 'zugestellt', 'fehlgeschlagen', 'geschlossen')),
  zugestellt_am timestamptz,
  zustell_fehler text,

  -- Herkunft, fuer Attribution und Missbrauchsabwehr.
  quelle_url text,
  ip_hash text,          -- gehasht, nie die IP im Klartext
  user_agent text,

  created_at timestamptz not null default now()
);

create index if not exists idx_anfrage_produkt on public.dir_anfrage (produkt_id);
create index if not exists idx_anfrage_collection on public.dir_anfrage (collection_id);
create index if not exists idx_anfrage_status on public.dir_anfrage (status, created_at desc);
create index if not exists idx_anfrage_email on public.dir_anfrage (lower(email));

alter table public.dir_anfrage enable row level security;

-- Anonyme duerfen ANLEGEN (das Formular ist oeffentlich), aber niemals LESEN.
-- Kein select-Policy: eine Liste echter Kontaktdaten waere sonst abrufbar.
create policy "Anfrage anlegen" on public.dir_anfrage
  for insert to anon, authenticated
  with check (true);

create policy "Anfragen lesen nur Redaktion" on public.dir_anfrage
  for select using (public.is_staff());

/* ---------------------------------------------------------------------------
 * 2) Einwilligung in den Launch-Service
 * ------------------------------------------------------------------------ */

create table if not exists public.launch_einwilligung (
  id uuid primary key default gen_random_uuid(),

  email text not null,

  -- Wofuer genau. Ohne Kategorie keine Einwilligung: "Werbung allgemein" waere
  -- zu unbestimmt und damit unwirksam.
  collection_id uuid references public.dir_collection (id) on delete set null,
  cluster_id uuid references public.dir_cluster (id) on delete set null,

  /* Der NACHWEIS. Das ist der eigentliche Wert dieser Tabelle, nicht die Adresse.
     Im Streitfall muss Toolfolio zeigen koennen: wer, wann, wozu, mit welchem
     Wortlaut, von wo. Ohne das ist die Liste juristisch nichts wert. */
  text_version text not null,        -- z. B. 'launch-v1'
  text_wortlaut text not null,       -- der exakte Satz, dem zugestimmt wurde
  quelle_url text,
  ip_hash text,
  user_agent text,

  -- Double-Opt-in. Bis bestaetigt_am gesetzt ist, wird NICHT versendet.
  bestaetigungs_token text unique,
  bestaetigt_am timestamptz,

  -- Widerruf, jederzeit, ohne Begruendung.
  widerrufen_am timestamptz,
  widerruf_quelle text,              -- 'link', 'mail', 'support'

  created_at timestamptz not null default now(),

  -- Eine Person kann pro Kategorie nur einmal einwilligen.
  unique (email, collection_id)
);

create index if not exists idx_einwilligung_email on public.launch_einwilligung (lower(email));
create index if not exists idx_einwilligung_collection on public.launch_einwilligung (collection_id);

alter table public.launch_einwilligung enable row level security;

create policy "Einwilligung anlegen" on public.launch_einwilligung
  for insert to anon, authenticated
  with check (true);

create policy "Einwilligungen lesen nur Redaktion" on public.launch_einwilligung
  for select using (public.is_staff());

/* ---------------------------------------------------------------------------
 * 3) Wer darf ueberhaupt angeschrieben werden
 * ------------------------------------------------------------------------ */

/**
 * Die EINZIGE zulaessige Quelle fuer einen Launch-Versand.
 *
 * Nur bestaetigt (Double-Opt-in) UND nicht widerrufen. Wer diese Sicht umgeht und
 * direkt aus launch_einwilligung oder gar aus dir_anfrage versendet, verschickt
 * unerlaubte Werbung. Deshalb liegt die Regel hier und nicht im Anwendungscode.
 */
create or replace view public.launch_verteiler as
select
  e.id,
  e.email,
  e.collection_id,
  e.cluster_id,
  e.bestaetigt_am
from public.launch_einwilligung e
where e.bestaetigt_am is not null
  and e.widerrufen_am is null;

comment on view public.launch_verteiler is
  'Die einzige zulaessige Quelle fuer den Launch-Versand: bestaetigt und nicht widerrufen. Niemals direkt aus dir_anfrage versenden.';
