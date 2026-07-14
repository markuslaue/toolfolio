-- AD-05: KI-erzeugte Hero-Bilder je Collection.
--
-- WARUM KI STATT STOCKFOTO: Ein Foto von Pexels auf 1300 oeffentlichen Seiten ist ein
-- Lizenz- und Abmahnrisiko, und die Nachweispflicht liegt bei uns. Ein selbst erzeugtes
-- Bild hat keinen fremden Urheber. Das Problem verschwindet, statt verwaltet zu werden.
--
-- Deshalb bekommt hero_quelle den neuen Wert 'ki'. Die Spalten hero_autor und
-- hero_autor_url bleiben leer: es gibt keinen fremden Autor, dem etwas zusteht.
-- Wir setzen stattdessen fest, WELCHES Modell und WELCHER Prompt das Bild erzeugt hat.
-- Das ist kein Beiwerk: wenn spaeter jemand fragt, woher das Bild kommt, muessen wir
-- es beantworten koennen, und "irgendeine KI" ist keine Antwort.

alter table public.dir_collection
  add column if not exists hero_prompt text,
  add column if not exists hero_modell text,
  add column if not exists hero_erzeugt_am timestamptz;

comment on column public.dir_collection.hero_prompt is
  'Der Prompt, aus dem das Bild entstand. Nachweis der Herkunft, nicht Deko.';
comment on column public.dir_collection.hero_modell is
  'Das Bildmodell, z. B. gpt-image-1. Gehoert zum Herkunftsnachweis.';

/* --------------------------------------------------------------------------
 * Der Speicher.
 *
 * Oeffentlich LESBAR (die Bilder stehen auf oeffentlichen Seiten), aber nur die
 * Service-Role darf schreiben. Ein Bucket, in den jeder hochladen kann, ist ein
 * offener Dateiserver, und den betreibt man nicht aus Versehen.
 * ----------------------------------------------------------------------- */

insert into storage.buckets (id, name, public)
values ('verzeichnis-hero', 'verzeichnis-hero', true)
on conflict (id) do nothing;

drop policy if exists "Hero-Bilder oeffentlich lesen" on storage.objects;
create policy "Hero-Bilder oeffentlich lesen" on storage.objects
  for select using (bucket_id = 'verzeichnis-hero');

-- KEINE insert/update/delete-Policy. Damit kann ausschliesslich die Service-Role
-- schreiben, also nur unser Server. Das ist Absicht und kein vergessener Fall.
