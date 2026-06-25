-- DSGVO-Einwilligung als Nachweis (Zeitstempel) auf profiles (S-02)
alter table public.profiles add column if not exists consent_accepted_at timestamptz;

-- Trigger erweitern: consent_accepted_at aus den Signup-Metadaten setzen.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, consent_accepted_at)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    case when (new.raw_user_meta_data ->> 'consent') = 'true' then now() else null end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
