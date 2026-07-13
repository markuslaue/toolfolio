-- B-12 Ausbau: eigene Fristart "Vertragsverlaengerung" und der Quittungs-Status
-- "behalten" (bewusst behalten, nicht dasselbe wie erledigt).

alter table public.frist_quittungen drop constraint if exists frist_quittungen_art_check;
alter table public.frist_quittungen
  add constraint frist_quittungen_art_check
  check (art in ('trial', 'kuendigung', 'karte', 'verlaengerung'));

alter table public.frist_quittungen drop constraint if exists frist_quittungen_status_check;
alter table public.frist_quittungen
  add constraint frist_quittungen_status_check
  check (status in ('erledigt', 'ignoriert', 'behalten'));
