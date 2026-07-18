-- AD-11, Nachtrag: Auch Anbieter und Finder muessen freigegeben werden, sonst ist die
-- Seite leer.
--
-- ---------------------------------------------------------------------------
-- WAS SCHIEFGING, und es ist lehrreich genug, um es hier festzuhalten:
--
-- Das naechtliche Gate hat gezaehlt, was in der DATENBANK steht: 34 Anbieter, Finder
-- mit 5 Fragen, alles da, bestanden, veroeffentlicht. Der Besucher sah eine Seite ohne
-- einen einzigen Anbieter und ohne Lead-Formular. Denn die Anbieter standen auf
-- 'ki_ungeprueft' und der Finder auf 'in_review', und beides blendet die RLS bzw. die
-- Seite selbst aus.
--
-- Ein Gate, das die Datenbank prueft statt der ausgelieferten Seite, prueft das
-- Falsche. Es misst jetzt den Zustand, den ein anonymer Besucher sieht.
-- ---------------------------------------------------------------------------

alter table public.dir_produkt
  -- Wie bei den Kategorien: freigegeben ist nicht gleich gelesen. Wer spaeter wissen
  -- will, welche Anbieterdatensaetze nie ein Mensch gesehen hat, liest es hier ab.
  add column if not exists auto_freigegeben_am timestamptz;

comment on column public.dir_produkt.auto_freigegeben_am is
  'Gesetzt, wenn der naechtliche Lauf diesen Anbieter freigegeben hat. Leer = von einem Menschen freigegeben.';

create index if not exists idx_produkt_auto_freigabe
  on public.dir_produkt (auto_freigegeben_am) where auto_freigegeben_am is not null;
