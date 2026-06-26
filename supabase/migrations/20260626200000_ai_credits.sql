-- B-13 AI-Credits / variable Kosten: Dienste + monatliche Verbrauchswerte.
-- Manuelle Monatserfassung (ehrlich, ohne API-Anbindung). Tagesgenaue Daten +
-- Live-Abruf via API-Key folgen mit den Integrationen (B-24).
create table if not exists public.ai_services (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  farbe text not null default '#6C5CE7',
  budget_monat numeric(12, 2) check (budget_monat is null or budget_monat >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.ai_spend (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  service_id uuid not null references public.ai_services (id) on delete cascade,
  jahr integer not null check (jahr between 2000 and 2100),
  monat integer not null check (monat between 1 and 12),
  betrag numeric(12, 2) not null check (betrag >= 0),
  created_at timestamptz not null default now(),
  unique (service_id, jahr, monat)
);

create index if not exists idx_ai_spend_service on public.ai_spend (service_id);

alter table public.ai_services enable row level security;
alter table public.ai_spend enable row level security;

-- Konto-Zugriff: eigene Daten + Team-Lese (has_account_access aus B-30).
create policy "AI-Dienste lesen" on public.ai_services for select using (has_account_access(user_id));
create policy "AI-Dienste anlegen" on public.ai_services for insert with check ((select auth.uid()) = user_id);
create policy "AI-Dienste aendern" on public.ai_services for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "AI-Dienste loeschen" on public.ai_services for delete using ((select auth.uid()) = user_id);

create policy "AI-Spend lesen" on public.ai_spend for select using (has_account_access(user_id));
create policy "AI-Spend anlegen" on public.ai_spend for insert with check ((select auth.uid()) = user_id);
create policy "AI-Spend aendern" on public.ai_spend for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "AI-Spend loeschen" on public.ai_spend for delete using ((select auth.uid()) = user_id);
