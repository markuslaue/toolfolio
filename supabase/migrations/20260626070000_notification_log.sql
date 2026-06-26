-- E-02/E-03: Protokoll versendeter Frist-Mails, damit dieselbe Frist nicht
-- doppelt gemailt wird. Schreibzugriff nur ueber den Service-Role-Job.

create table if not exists public.notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  ref text not null, -- z. B. "abo-<id>:kuendigung:2026-07-01"
  kanal text not null default 'email',
  sent_at timestamptz not null default now(),
  unique (user_id, ref, kanal)
);

alter table public.notification_log enable row level security;

-- Nutzer duerfen ihr eigenes Protokoll lesen; Schreiben macht der Service-Role-Job (umgeht RLS).
create policy "Eigenes Log lesen" on public.notification_log
  for select using (auth.uid() = user_id);

create index if not exists idx_notification_log_user on public.notification_log (user_id);
