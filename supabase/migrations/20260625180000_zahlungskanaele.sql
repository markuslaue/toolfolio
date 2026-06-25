-- B-07: Zahlungskanaele. SICHERHEITSLEITPLANKE: niemals vollstaendige Karten-
-- nummern, Pruefziffern oder IBAN speichern. Nur Referenzen: Typ, Anbieter,
-- letzte vier Ziffern (last4 / iban_last4), Ablauf, Inhaber.

create table if not exists public.zahlungskanaele (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  typ text not null check (typ in ('kreditkarte', 'sepa', 'paypal', 'stripe', 'paysafe', 'anderes')),
  bezeichnung text not null,
  anbieter text,                       -- z. B. Visa, Mastercard
  last4 text check (last4 is null or last4 ~ '^[0-9]{4}$'),
  iban_last4 text check (iban_last4 is null or iban_last4 ~ '^[0-9]{4}$'),
  ablauf_monat integer check (ablauf_monat is null or ablauf_monat between 1 and 12),
  ablauf_jahr integer check (ablauf_jahr is null or ablauf_jahr between 2000 and 2100),
  inhaber text,
  aktiv boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.zahlungskanaele enable row level security;

create policy "Eigene Kanaele lesen" on public.zahlungskanaele
  for select using (auth.uid() = user_id);
create policy "Eigene Kanaele anlegen" on public.zahlungskanaele
  for insert with check (auth.uid() = user_id);
create policy "Eigene Kanaele aendern" on public.zahlungskanaele
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Eigene Kanaele loeschen" on public.zahlungskanaele
  for delete using (auth.uid() = user_id);

create index if not exists idx_zahlungskanaele_user on public.zahlungskanaele (user_id);

create trigger zahlungskanaele_touch_updated_at
  before update on public.zahlungskanaele
  for each row execute function public.touch_updated_at();
