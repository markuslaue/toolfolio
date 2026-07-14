-- V-03: Hintergrundbild im Kopf einer Collection.
--
-- Die Herkunft wird MITGESPEICHERT, nicht nur die URL. Ein Bild ohne Nachweis
-- ist auf 1292 oeffentlichen Seiten ein Abmahnrisiko, kein Designdetail.
-- Ohne `hero_quelle` und `hero_autor` gibt es keine Ausspielung.

alter table public.dir_collection
  add column if not exists hero_url text,
  add column if not exists hero_autor text,
  add column if not exists hero_autor_url text,
  add column if not exists hero_quelle text,        -- z. B. 'pexels', 'unsplash', 'eigen'
  add column if not exists hero_quelle_url text,
  add column if not exists hero_blurhash text;

alter table public.dir_cluster
  add column if not exists hero_url text,
  add column if not exists hero_autor text,
  add column if not exists hero_autor_url text,
  add column if not exists hero_quelle text,
  add column if not exists hero_quelle_url text;

comment on column public.dir_collection.hero_url is
  'Hintergrundbild im Seitenkopf. Wird nur ausgespielt, wenn hero_quelle gesetzt ist (Lizenznachweis).';
