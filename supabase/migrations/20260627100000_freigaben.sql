-- B-23 Anschaffungs-Freigabe-Workflow: Antraege fuer neue Tools/Abos.
create table if not exists public.freigabe_antrag (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tool text not null,
  kategorie text not null,
  kosten numeric(12, 2) not null check (kosten >= 0),
  intervall text not null default 'monatlich' check (intervall in ('monatlich', 'quartalsweise', 'jaehrlich')),
  antragsteller text,
  begruendung text,
  status text not null default 'ausstehend' check (status in ('ausstehend', 'genehmigt', 'abgelehnt')),
  grund_ablehnung text,
  created_at timestamptz not null default now(),
  entschieden_at timestamptz
);

create index if not exists idx_freigabe_user on public.freigabe_antrag (user_id);

alter table public.freigabe_antrag enable row level security;
create policy "Antraege lesen" on public.freigabe_antrag for select using (has_account_access(user_id));
create policy "Antraege anlegen" on public.freigabe_antrag for insert with check ((select auth.uid()) = user_id);
create policy "Antraege aendern" on public.freigabe_antrag for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Antraege loeschen" on public.freigabe_antrag for delete using ((select auth.uid()) = user_id);
