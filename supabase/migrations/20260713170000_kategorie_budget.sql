-- B-15: Budget je Kategorie, zusaetzlich zum Jahresbudget am Profil.

create table if not exists public.kategorie_budget (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kategorie text not null,
  betrag_jahr numeric(12, 2) not null check (betrag_jahr >= 0),
  updated_at timestamptz not null default now(),
  unique (user_id, kategorie)
);

create index if not exists idx_kategorie_budget_user on public.kategorie_budget (user_id);

alter table public.kategorie_budget enable row level security;

create policy "Kategoriebudget lesen" on public.kategorie_budget
  for select using (public.has_account_access(user_id));

create policy "Kategoriebudget setzen" on public.kategorie_budget
  for insert with check (public.has_admin_access(user_id));

create policy "Kategoriebudget aendern" on public.kategorie_budget
  for update using (public.has_admin_access(user_id)) with check (public.has_admin_access(user_id));

create policy "Kategoriebudget loeschen" on public.kategorie_budget
  for delete using (public.has_admin_access(user_id));
