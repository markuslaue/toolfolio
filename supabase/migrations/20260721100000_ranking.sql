-- AD-15: DataForSEO-Ranking je Collection.
--
-- ZWECK: Die Search Console sagt, fuer welche Suchanfragen wir schon Impressionen
-- bekommen. Sie schweigt aber zu Keywords, fuer die wir (noch) gar nicht ranken, und
-- sie sagt nie, WER ueber uns steht. Genau das liefert DataForSEO: die tatsaechliche
-- Position in der Google-Suche fuer ein Keyword, samt der Konkurrenz darueber.
--
-- Fuer eine junge Domain ist das die aussagekraeftigere Quelle, weil die Search
-- Console erst mit Wochen Verzoegerung Daten zeigt.
--
-- ---------------------------------------------------------------------------
-- WARUM DAS NICHT AUTOMATISCH TAEGLICH LAEUFT:
--
-- Jede Abfrage kostet Geld (DataForSEO rechnet pro SERP-Abruf ab). 1.271 Collections
-- taeglich abzufragen waere teuer und sinnlos: eine Position aendert sich nicht von
-- heute auf morgen. Das Ranking wird deshalb AUF ANFRAGE geholt (Knopf je Collection),
-- und der letzte Stand hier gespeichert. Ein automatischer woechentlicher Durchlauf
-- laesst sich spaeter ergaenzen, wenn der Bedarf da ist.
-- ---------------------------------------------------------------------------

create table if not exists public.dir_ranking (
  id bigserial primary key,

  collection_id uuid not null references public.dir_collection(id) on delete cascade,
  keyword text not null,
  -- DE / AT / CH: derselbe Begriff rankt je Land unterschiedlich.
  land text not null check (land in ('DE', 'AT', 'CH')),

  -- Unsere Position, 1 bis 100. Null bedeutet: unter den ersten 100 nicht gefunden,
  -- und das ist eine wichtige, ehrliche Aussage, kein fehlender Wert.
  position int,

  -- Wer bei diesem Keyword vor uns steht. Die Top-Domains als Beleg, nicht als Zierde:
  -- "Platz 14" allein sagt wenig, "Platz 14, ueber uns capterra und omr" sagt alles.
  top_domains jsonb,

  -- Wie viele organische Treffer die Suche insgesamt hatte, zur Einordnung der Position.
  treffer_gesamt int,

  erhoben_am timestamptz not null default now()
);

-- Der Bericht will je Collection den NEUESTEN Stand je Land. Genau darauf der Index.
create index if not exists idx_ranking_collection on public.dir_ranking (collection_id, land, erhoben_am desc);

alter table public.dir_ranking enable row level security;

create policy "Ranking lesen" on public.dir_ranking
  for select using (public.is_staff());

comment on table public.dir_ranking is
  'Position in der Google-Suche je Keyword und Land, aus DataForSEO. Auf Anfrage erhoben, nicht automatisch.';
