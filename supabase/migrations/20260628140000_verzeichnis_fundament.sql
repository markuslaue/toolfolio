-- V-Fundament: oeffentliches Verzeichnis (dir_*). Strikt getrennt vom Tracker
-- (kein FK auf abos/kunden/...). RLS auf jeder Tabelle: anon liest nur
-- veroeffentlichte Inhalte, Schreiben nur Redaktion (profiles.is_staff).

-- Redaktions-Gate: ist der aktuelle Nutzer Staff/Redakteur?
create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select is_staff from public.profiles where id = auth.uid()), false);
$$;

-- 1) Cluster (Oberkategorie, reine Strukturierung)
create table if not exists public.dir_cluster (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  farbe text not null default '#6C5CE7',
  meta_title text,
  meta_description text,
  content_md text,
  status text not null default 'entwurf' check (status in ('entwurf','veroeffentlicht')),
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- 2) Kategorie (L1/L2, selbstreferenziell)
create table if not exists public.dir_kategorie (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.dir_kategorie (id) on delete cascade,
  ebene int not null check (ebene in (1,2)),
  cluster_id uuid not null references public.dir_cluster (id) on delete cascade,
  name text not null,
  slug text not null,
  meta_title text,
  meta_description text,
  content_md text,
  status text not null default 'entwurf' check (status in ('entwurf','veroeffentlicht')),
  position int not null default 0,
  unique (cluster_id, slug)
);

-- 3) Collection (der rankende Knoten, enthaelt Produkte)
create table if not exists public.dir_collection (
  id uuid primary key default gen_random_uuid(),
  kategorie_id uuid references public.dir_kategorie (id) on delete set null,
  cluster_id uuid not null references public.dir_cluster (id) on delete cascade,
  name text not null,
  slug text not null unique,
  h1 text,
  meta_title text,
  meta_description text,
  prio int not null default 2 check (prio in (1,2,3)),
  fokus_keyword text,
  intro_md text,
  status text not null default 'entwurf' check (status in ('entwurf','veroeffentlicht')),
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- 4) Produkt (Software-Eintrag)
create table if not exists public.dir_produkt (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  anbieter text,
  website_url text,
  logo_url text,
  farbe text not null default '#6C5CE7',
  kurzbeschreibung text,
  langbeschreibung text,
  features text[] not null default '{}',
  plattformen text[] not null default '{}',
  einsatzgebiet text,
  pro text[] not null default '{}',
  contra text[] not null default '{}',
  preis_hinweis text,
  preis_stand date,
  preis_quelle_url text,
  status text not null default 'entwurf' check (status in ('entwurf','ki_ungeprueft','redaktionell_geprueft','veroeffentlicht')),
  claim_status text not null default 'unclaimed' check (claim_status in ('unclaimed','eingeladen','claim_angefragt','claimed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5) Produkt <-> Collection mit Zone (Goldene Regel: 3 Zonen)
create table if not exists public.dir_collection_produkt (
  collection_id uuid not null references public.dir_collection (id) on delete cascade,
  produkt_id uuid not null references public.dir_produkt (id) on delete cascade,
  zone text not null check (zone in ('gesponsert','organisch','community')),
  position int not null default 0,
  gesponsert_bis date,
  primary key (collection_id, produkt_id)
);

-- 6) Bewertungen (zweistufig, First-Party)
create table if not exists public.dir_review (
  id uuid primary key default gen_random_uuid(),
  produkt_id uuid not null references public.dir_produkt (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  sterne int not null check (sterne between 1 and 5),
  titel text,
  text text,
  verifiziert boolean not null default false,
  verifiziert_methode text check (verifiziert_methode in ('tracker')),
  status text not null default 'neu' check (status in ('neu','freigegeben','abgelehnt')),
  autor_name text,
  autor_email text,
  created_at timestamptz not null default now()
);

create index if not exists idx_dir_kategorie_cluster on public.dir_kategorie (cluster_id);
create index if not exists idx_dir_collection_cluster on public.dir_collection (cluster_id);
create index if not exists idx_dir_collection_kategorie on public.dir_collection (kategorie_id);
create index if not exists idx_dir_cp_collection on public.dir_collection_produkt (collection_id);
create index if not exists idx_dir_cp_produkt on public.dir_collection_produkt (produkt_id);
create index if not exists idx_dir_review_produkt on public.dir_review (produkt_id);

-- RLS
alter table public.dir_cluster enable row level security;
alter table public.dir_kategorie enable row level security;
alter table public.dir_collection enable row level security;
alter table public.dir_produkt enable row level security;
alter table public.dir_collection_produkt enable row level security;
alter table public.dir_review enable row level security;

-- Oeffentlich lesen: nur veroeffentlichte Struktur/Produkte
create policy "dir_cluster public read" on public.dir_cluster for select using (status = 'veroeffentlicht' or is_staff());
create policy "dir_kategorie public read" on public.dir_kategorie for select using (status = 'veroeffentlicht' or is_staff());
create policy "dir_collection public read" on public.dir_collection for select using (status = 'veroeffentlicht' or is_staff());
create policy "dir_produkt public read" on public.dir_produkt for select using (status = 'veroeffentlicht' or is_staff());
create policy "dir_cp public read" on public.dir_collection_produkt for select using (true);
-- Reviews: freigegebene sind oeffentlich; eigene sieht der Autor
create policy "dir_review public read" on public.dir_review for select using (status = 'freigegeben' or is_staff() or (user_id is not null and user_id = auth.uid()));

-- Schreiben nur Redaktion (Reviews-Einreichung kommt als eigenes Feature V-12)
create policy "dir_cluster staff write" on public.dir_cluster for all using (is_staff()) with check (is_staff());
create policy "dir_kategorie staff write" on public.dir_kategorie for all using (is_staff()) with check (is_staff());
create policy "dir_collection staff write" on public.dir_collection for all using (is_staff()) with check (is_staff());
create policy "dir_produkt staff write" on public.dir_produkt for all using (is_staff()) with check (is_staff());
create policy "dir_cp staff write" on public.dir_collection_produkt for all using (is_staff()) with check (is_staff());
create policy "dir_review staff write" on public.dir_review for all using (is_staff()) with check (is_staff());
