-- B-20 Budget & Forecast: Jahresbudget am Profil (vom Nutzer setzbar).
alter table public.profiles
  add column if not exists budget_jahr numeric(12, 2) check (budget_jahr is null or budget_jahr >= 0);
