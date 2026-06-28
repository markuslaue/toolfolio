-- E-04: Opt-out fuer AI-Spike-Alarm-Mails (Default an).
alter table public.profiles
  add column if not exists benachrichtigung_spike boolean not null default true;
