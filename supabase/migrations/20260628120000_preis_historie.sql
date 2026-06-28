-- E-05: Preis-Historie der Abos + Opt-out fuer Preiserhoehungs-Mails.

create table if not exists public.abo_preis_historie (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  abo_id uuid not null references public.abos (id) on delete cascade,
  alt_kosten numeric not null,
  neu_kosten numeric not null,
  alt_intervall text not null,
  neu_intervall text not null,
  erfasst_am timestamptz not null default now()
);

create index if not exists idx_preis_historie_user on public.abo_preis_historie (user_id);
create index if not exists idx_preis_historie_abo on public.abo_preis_historie (abo_id);

alter table public.abo_preis_historie enable row level security;

-- Lesen nur fuer Konto-Mitglieder (analog zu den anderen Konto-Tabellen, B-30/B-25).
-- has_account_access existiert bereits als SECURITY-DEFINER-Helfer.
drop policy if exists "Konto-Preishistorie lesen" on public.abo_preis_historie;
create policy "Konto-Preishistorie lesen" on public.abo_preis_historie
  for select using (has_account_access(user_id));
-- Kein INSERT/UPDATE/DELETE per RLS: schreibt nur der Trigger (SECURITY DEFINER) bzw. Service-Role.

-- Trigger: bei jeder Aenderung von Kosten oder Intervall eine Historienzeile schreiben.
create or replace function public.log_abo_preisaenderung()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.kosten is distinct from old.kosten) or (new.intervall is distinct from old.intervall) then
    insert into public.abo_preis_historie (user_id, abo_id, alt_kosten, neu_kosten, alt_intervall, neu_intervall)
    values (old.user_id, old.id, old.kosten, new.kosten, old.intervall, new.intervall);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_abo_preisaenderung on public.abos;
create trigger trg_abo_preisaenderung
  after update on public.abos
  for each row
  execute function public.log_abo_preisaenderung();

-- Opt-out fuer Preiserhoehungs-Mails (Default an).
alter table public.profiles
  add column if not exists benachrichtigung_preis boolean not null default true;
