-- E-01 Willkommen + E-06 Monatsreport:
-- welcome_sent_at: einmaliger Willkommens-Versand nach erster Anmeldung/Verifizierung.
-- benachrichtigung_report: Opt-out fuer den Monatsreport (Default an).
alter table public.profiles
  add column if not exists welcome_sent_at timestamptz,
  add column if not exists benachrichtigung_report boolean not null default true;

-- Bestehende Nutzer als "bereits begruesst" markieren, damit sie kein
-- nachtraegliches Willkommen erhalten. Nur neue Registrierungen bekommen E-01.
update public.profiles set welcome_sent_at = now() where welcome_sent_at is null;
