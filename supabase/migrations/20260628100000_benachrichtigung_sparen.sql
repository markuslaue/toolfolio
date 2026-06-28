-- E-07: Opt-out fuer Sparvorschlag-Mails (Default an), analog zu benachrichtigung_report.
alter table public.profiles
  add column if not exists benachrichtigung_sparen boolean not null default true;
