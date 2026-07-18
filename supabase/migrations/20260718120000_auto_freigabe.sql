-- AD-11: Naechtlicher Aufbau mit automatischer Freigabe, aber nur mit bestandenem Gate.
--
-- ---------------------------------------------------------------------------
-- WARUM EIN EIGENER STATUS UND NICHT EINFACH 'geprueft':
--
-- Der bequeme Weg waere, den naechtlichen Lauf 'geprueft' schreiben zu lassen. Dann
-- greift der bestehende Trigger nicht mehr und die Seite geht live. Nur bedeutet
-- 'geprueft' woertlich: ein Mensch hat das gelesen. Das waere dann nicht wahr, und
-- zwar dauerhaft und unauffindbar: hinterher liesse sich nicht mehr unterscheiden,
-- welche der 1.400 Seiten jemand gelesen hat und welche eine Maschine durchgewunken hat.
--
-- Genau diese Unterscheidung braucht man aber, sobald etwas schiefgeht. Deshalb ein
-- eigener Wert. Die Datenbank sagt damit die Wahrheit ueber ihre eigene Herkunft.
-- ---------------------------------------------------------------------------

alter table public.dir_collection drop constraint if exists dir_collection_content_status_check;
alter table public.dir_collection
  add constraint dir_collection_content_status_check
  check (content_status in ('fehlt', 'ki_ungeprueft', 'geprueft', 'auto_freigegeben'));

alter table public.dir_cluster drop constraint if exists dir_cluster_content_status_check;
alter table public.dir_cluster
  add constraint dir_cluster_content_status_check
  check (content_status in ('fehlt', 'ki_ungeprueft', 'geprueft', 'auto_freigegeben'));

-- Der Trigger bleibt unveraendert: er sperrt weiterhin genau 'ki_ungeprueft'. Was das
-- Gate nicht besteht, behaelt diesen Status und kommt damit gar nicht erst live.

alter table public.dir_collection
  -- Das Pruefprotokoll des Gates: welche Bedingung mit welchem Wert bestanden oder
  -- durchgefallen ist. Ohne das waere "durchgefallen" eine Aussage ohne Begruendung,
  -- und niemand koennte entscheiden, ob die Seite nachgebessert oder verworfen gehoert.
  add column if not exists gate_bericht jsonb,
  add column if not exists auto_gebaut_am timestamptz;

comment on column public.dir_collection.gate_bericht is
  'Ergebnis der automatischen Qualitaetspruefung: je Bedingung Sollwert, Istwert, bestanden.';

/*
 * Warteschlange des naechtlichen Laufs.
 *
 * Ohne sie muesste der Cron jede Nacht selbst entscheiden, welche zehn Kategorien
 * drankommen, und das ginge bei 1.400 Kategorien und wechselnden Fehlern schief:
 * gescheiterte Laeufe wuerden entweder ewig wiederholt oder still vergessen.
 *
 * Mit ihr ist der Zustand jeder Kategorie jederzeit ablesbar, und ein Fehlschlag ist
 * ein Zustand, kein Loch.
 */
create table if not exists public.dir_warteschlange (
  collection_id uuid primary key references public.dir_collection(id) on delete cascade,

  -- offen -> laeuft -> fertig | durchgefallen | fehler
  zustand text not null default 'offen'
    check (zustand in ('offen', 'laeuft', 'fertig', 'durchgefallen', 'fehler')),

  -- Kleinere Zahl kommt frueher dran. Damit lassen sich Kategorien vorziehen, ohne
  -- an der Reihenfolge aller anderen zu ruetteln.
  rang int not null default 100,

  versuche int not null default 0,
  letzter_fehler text,
  zuletzt_am timestamptz,
  erstellt_am timestamptz not null default now()
);

create index if not exists idx_warteschlange_naechste
  on public.dir_warteschlange (zustand, rang, erstellt_am);

alter table public.dir_warteschlange enable row level security;

create policy "Warteschlange lesen" on public.dir_warteschlange
  for select using (public.is_staff());

comment on table public.dir_warteschlange is
  'Welche Kategorie der naechtliche Lauf als naechstes baut. Geschrieben nur serverseitig.';
