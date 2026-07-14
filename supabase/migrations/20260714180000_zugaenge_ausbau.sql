-- B-13 (Team & Zugaenge): der Screen war eine vereinfachte Eigenkonstruktion.
-- Diese Migration zieht das Datenmodell auf die Vorlage nach. Vier Luecken:
--
-- 1) OWNER HING AM ZUGANG (tool_zugang.ist_owner). Owner konnte also nur werden,
--    wer das Tool selbst benutzt. Das ist fachlich falsch: der Owner ist der,
--    der fuer Verlaengerung, Nutzer und Kosten geradesteht, und der muss das
--    Tool nicht selbst bedienen (die Buchhaltung besitzt Adobe, malt aber nicht).
--    Owner wandert deshalb ans Abo.
--
-- 2) KEINE AKTIVITAETSDATEN. Ohne sie kann der Screen nicht sagen, ob ein Zugang
--    noch benutzt wird. Wir raten NICHT: ist das Feld leer, sagt die Oberflaeche
--    "Nutzungsdaten noetig".
--
-- 3) KEINE PERSONENFARBE. Rein visuell, aber die Vorlage lebt davon.
--
-- 4) KEIN OFFBOARDING-NACHWEIS. Der eigentliche Wert des Offboardings ist der
--    Beleg, dass ein Zugang entzogen wurde. Der gehoert in die Datenbank, nicht
--    in einen Toast.

/* --------------------------------------------------------------------------
 * 1) Owner ans Abo
 * ----------------------------------------------------------------------- */

alter table public.abos
  add column if not exists owner_person_id uuid references public.personen (id) on delete set null;

create index if not exists idx_abos_owner on public.abos (owner_person_id);

-- Bestehende Owner mitnehmen, bevor die alte Spalte faellt.
update public.abos a
set owner_person_id = z.person_id
from public.tool_zugang z
where z.abo_id = a.id
  and z.ist_owner
  and a.owner_person_id is null;

alter table public.tool_zugang drop column if exists ist_owner;

/* --------------------------------------------------------------------------
 * 2) Aktivitaet und Farbe
 * ----------------------------------------------------------------------- */

alter table public.tool_zugang
  add column if not exists letzte_aktivitaet date;

comment on column public.tool_zugang.letzte_aktivitaet is
  'Leer bedeutet: wir wissen es nicht. Die Oberflaeche sagt dann "Nutzungsdaten noetig" und raet NICHT.';

alter table public.personen
  add column if not exists farbe text;

/* --------------------------------------------------------------------------
 * 3) Offboarding-Protokoll
 * ----------------------------------------------------------------------- */

create table if not exists public.offboarding (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  -- Die Person bleibt referenziert, aber ein Loeschen der Person darf den
  -- Nachweis nicht mitreissen: deshalb set null plus Name als Kopie.
  person_id uuid references public.personen (id) on delete set null,
  person_name text not null,

  -- Was tatsaechlich passiert ist. Die Zahlen sind eine Momentaufnahme und
  -- werden bewusst kopiert, nicht nachtraeglich neu berechnet.
  zugaenge_entzogen int not null default 0,
  plaetze_zurueck int not null default 0,
  ersparnis_monatlich numeric(12, 2) not null default 0,
  tools text[] not null default '{}',

  erledigt_am timestamptz not null default now()
);

create index if not exists idx_offboarding_user on public.offboarding (user_id, erledigt_am desc);

alter table public.offboarding enable row level security;

create policy "Offboarding lesen" on public.offboarding
  for select using (public.has_account_access(user_id));

create policy "Offboarding anlegen" on public.offboarding
  for insert with check (public.has_admin_access(user_id));

create policy "Offboarding loeschen" on public.offboarding
  for delete using (public.has_admin_access(user_id));
