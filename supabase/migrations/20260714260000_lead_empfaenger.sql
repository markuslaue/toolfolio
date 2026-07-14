-- AD-07: Wer bekommt einen Lead?
--
-- Bisher speicherte dir_anfrage nur, WORAUS die Anfrage kam (Collection, Produkt).
-- Nicht aber, an WEN sie geht. Das ist die eigentliche Ware: Toolfolio verkauft dem
-- Anbieter einen qualifizierten Lead, und im Streitfall muss belegbar sein, wer ihn
-- wann bekommen hat.
--
-- DIE REGEL, wer Empfaenger ist:
--   1. IMMER der gesponserte Anbieter der Kategorie (er zahlt fuer genau das).
--   2. ZUSAETZLICH die Anbieter, die laut den Antworten des Nutzers passen.
--
-- Das ist KEIN Verstoss gegen die Goldene Regel, und der Unterschied ist wichtig:
-- Der gesponserte Anbieter bekommt SICHTBARKEIT und den Lead, weil er dafuer bezahlt.
-- Er bekommt aber KEINEN besseren Rang und keine bessere Empfehlung: im Finder-Ergebnis
-- steht er nur, wenn er fachlich passt, und die Rangliste kennt ihn ohnehin nicht.
-- Gekauft ist die Zustellung, nicht die Bewertung.
--
-- Der Nutzer erfaehrt das. Im Formular steht, an wen seine Anfrage geht, und der
-- gesponserte Anbieter ist dort als Anzeige gekennzeichnet. Einen Lead still an einen
-- Zahler weiterzureichen, ohne es zu sagen, waere genau der Vertrauensbruch, den wir
-- dem Rest der Branche vorwerfen.

alter table public.dir_anfrage
  add column if not exists empfaenger uuid[] not null default '{}',
  add column if not exists empfaenger_gesponsert uuid,
  add column if not exists antworten jsonb;

comment on column public.dir_anfrage.empfaenger is
  'Alle Anbieter, die diesen Lead bekommen. Nachweis, nicht Beiwerk.';
comment on column public.dir_anfrage.empfaenger_gesponsert is
  'Der gesponserte Anbieter der Kategorie, falls es einen gibt. Er bekommt jeden Lead, weil er dafuer bezahlt. Getrennt gefuehrt, damit man die bezahlte Zustellung jederzeit von der fachlichen trennen kann.';
comment on column public.dir_anfrage.antworten is
  'Die Antworten aus dem Finder, strukturiert. Ohne sie kann der Anbieter kein sinnvolles Angebot machen und der Nutzer muesste alles zweimal erzaehlen.';

/* --------------------------------------------------------------------------
 * Der Fragensatz braucht eine Begruendung je Feld.
 *
 * Markus will im Backend sehen, WARUM ein Feld abgefragt wird, bevor er freigibt.
 * Das steckt bereits in finder_config.categoryQuestions[].warum (jsonb), es braucht
 * also keine neue Spalte. Was fehlt, ist der Nachweis, WER wann freigegeben hat:
 * ein Formular, das Leads an zahlende Kunden verteilt, darf nicht anonym entstehen.
 * ----------------------------------------------------------------------- */

alter table public.dir_collection
  add column if not exists finder_freigegeben_von uuid references auth.users (id) on delete set null,
  add column if not exists finder_freigegeben_am timestamptz,
  add column if not exists finder_erzeugt_am timestamptz;
