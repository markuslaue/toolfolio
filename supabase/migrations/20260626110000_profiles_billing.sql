-- B-29 Plan & Abrechnung: Stripe-Referenzen am Profil.
-- Leitplanke: nur Referenzen (Customer-/Subscription-ID, Status), NIE Kartendaten.
alter table public.profiles
  add column if not exists plan text not null default 'free'
    check (plan in ('free', 'pro', 'agentur')),
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text,
  add column if not exists plan_intervall text
    check (plan_intervall is null or plan_intervall in ('month', 'year')),
  add column if not exists current_period_end timestamptz,
  add column if not exists cancel_at_period_end boolean not null default false;

create index if not exists idx_profiles_stripe_customer
  on public.profiles (stripe_customer_id);

-- Goldene Regel + Sicherheit: der Plan ist NICHT vom Nutzer beschreibbar.
-- Nur der Webhook (Service-Role, umgeht RLS) darf diese Spalten setzen.
-- Spalten-Privilegien entziehen, restliche Profil-Spalten bleiben editierbar.
revoke update (
  plan,
  stripe_customer_id,
  stripe_subscription_id,
  subscription_status,
  plan_intervall,
  current_period_end,
  cancel_at_period_end
) on public.profiles from authenticated, anon;
