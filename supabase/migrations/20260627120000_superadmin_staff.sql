-- Superadmin / globale Redaktionsrolle (fuer das spaetere Verzeichnis-CMS, AD-01).
-- is_staff ist GETRENNT von der Mandanten-Rolle profiles.role: ein Konto kann
-- normaler Tracker-Nutzer UND globaler Redakteur/Superadmin sein.
alter table public.profiles
  add column if not exists is_staff boolean not null default false;

-- Schutz: is_staff (wie plan/role) darf NICHT vom Nutzer selbst gesetzt werden,
-- sonst Privilege Escalation. Nur Service-Role/Migration (postgres) darf es aendern.
create or replace function public.protect_billing_columns()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('authenticated', 'anon') then
    if new.plan is distinct from old.plan
       or new.stripe_customer_id is distinct from old.stripe_customer_id
       or new.stripe_subscription_id is distinct from old.stripe_subscription_id
       or new.subscription_status is distinct from old.subscription_status
       or new.plan_intervall is distinct from old.plan_intervall
       or new.current_period_end is distinct from old.current_period_end
       or new.cancel_at_period_end is distinct from old.cancel_at_period_end
       or new.role is distinct from old.role
       or new.is_staff is distinct from old.is_staff then
      raise exception 'Plan-, Abrechnungs-, Rollen- und Staff-Felder koennen nicht direkt geaendert werden.'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

-- Superadmin-Konto (Markus) als globalen Redakteur/Superadmin flaggen.
update public.profiles
set is_staff = true
where id = (select id from auth.users where lower(email) = 'markus.laue@ommm.de');
