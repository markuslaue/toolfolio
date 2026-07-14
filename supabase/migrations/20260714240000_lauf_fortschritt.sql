-- AD-06: Fortschritt eines Laufs, strukturiert.
--
-- Das Protokoll sagt, WAS passiert ist. Es sagt nicht, WIE WEIT wir sind. Wer 161
-- Domains pruefen laesst, will nicht Zeile 47 zaehlen, sondern "47 von 161" lesen.
--
-- Deshalb eine eigene Spalte statt eines weiteren Protokolleintrags: der Fortschritt
-- wird staendig ueberschrieben, das Protokoll waechst nur. Zwei verschiedene Dinge,
-- zwei verschiedene Felder.

alter table public.dir_lauf
  add column if not exists fortschritt jsonb;

comment on column public.dir_lauf.fortschritt is
  'Aktueller Stand: { phase, label, aktuell, gesamt }. Wird laufend ueberschrieben, im Gegensatz zum Protokoll, das nur waechst.';
