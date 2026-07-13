-- Nutzer, die ausschliesslich in einem geteilten Konto arbeiten sollen (z. B. ein
-- Inhaber, der kein eigenes Mandanten-Konto braucht). Technisch ist die user_id
-- immer auch eine Mandanten-ID; mit diesem Flag wird das eigene Konto aber weder
-- angeboten noch als Heimatkonto verwendet.
alter table public.profiles
  add column if not exists eigenes_konto boolean not null default true;
