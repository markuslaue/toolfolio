-- AD-01: Experten-Statement je Collection (E-E-A-T).
--
-- Ein kurzes Statement, das unter dem Namen und dem Gesicht eines echten Menschen
-- steht. Deshalb gilt hier dieselbe harte Regel wie fuer den Content: entworfen
-- werden darf es von der KI, veroeffentlicht erst nach menschlicher Freigabe.
-- Der bestehende Trigger dir_content_gate deckt das mit ab, weil das Zitat
-- gemeinsam mit dem Content erzeugt und freigegeben wird.

alter table public.dir_collection
  add column if not exists experten_zitat text,
  add column if not exists autor_slug text;

alter table public.dir_cluster
  add column if not exists experten_zitat text,
  add column if not exists autor_slug text;

comment on column public.dir_collection.experten_zitat is
  'Statement des Fachautors zur Kategorie. Steht unter seinem Namen und Bild, darf daher nie ungeprueft live gehen (siehe dir_content_gate).';
