-- B-26: Profil-Praeferenzen. Erweitert profiles um Darstellungs-/Format-Einstellungen
-- und ein optionales Avatar-Feld (Upload folgt spaeter). RLS-Policies aus der
-- Basis-Migration (Owner-only select/update) decken die neuen Spalten ab.

alter table public.profiles
  add column if not exists avatar_url     text,
  add column if not exists locale         text not null default 'de',
  add column if not exists timezone       text not null default 'Europe/Berlin',
  add column if not exists theme          text not null default 'hell'
    check (theme in ('hell', 'dunkel', 'system')),
  add column if not exists number_format  text not null default 'de'
    check (number_format in ('de', 'int')),
  add column if not exists currency       text not null default 'EUR'
    check (currency in ('EUR', 'USD', 'CHF', 'GBP'));
