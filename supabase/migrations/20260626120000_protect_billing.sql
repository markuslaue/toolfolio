-- B-29 Sicherheitsfix: Plan-/Billing-Spalten und role gegen Selbst-Setzen schuetzen.
-- Hintergrund: Supabase gewaehrt 'authenticated' ein TABELLENWEITES UPDATE-Recht,
-- das ein spaltenbezogenes REVOKE aushebelt. Ein eingeloggter Nutzer konnte so
-- seinen plan auf 'agentur' setzen, subscription_status faelschen und eine fremde
-- stripe_customer_id eintragen. Ein BEFORE-UPDATE-Trigger blockt das verlaesslich.
-- Nur die Service-Role (Webhook) bzw. der DB-Owner duerfen diese Spalten aendern.

create or replace function public.protect_billing_columns()
returns trigger
language plpgsql
as $$
begin
  -- Nur Web-Rollen einschraenken; service_role und postgres (Migrationen/Webhook) duerfen alles.
  if current_user in ('authenticated', 'anon') then
    if new.plan is distinct from old.plan
       or new.stripe_customer_id is distinct from old.stripe_customer_id
       or new.stripe_subscription_id is distinct from old.stripe_subscription_id
       or new.subscription_status is distinct from old.subscription_status
       or new.plan_intervall is distinct from old.plan_intervall
       or new.current_period_end is distinct from old.current_period_end
       or new.cancel_at_period_end is distinct from old.cancel_at_period_end
       or new.role is distinct from old.role then
      raise exception 'Plan-, Abrechnungs- und Rollen-Felder koennen nicht direkt geaendert werden.'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_billing on public.profiles;
create trigger trg_protect_billing
  before update on public.profiles
  for each row execute function public.protect_billing_columns();
