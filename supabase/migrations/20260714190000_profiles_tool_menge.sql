-- Onboarding: die Frage "Wie viele Tools nutzt du ungefaehr?" aus der Vorlage.
--
-- Der Wert ist eine SELBSTEINSCHAETZUNG, kein gemessener Bestand. Er dient dazu,
-- den erfassten Bestand einordnen zu koennen: wer 40 Tools angibt und 6 erfasst
-- hat, hat offensichtlich noch Luecken, und genau darauf koennen wir hinweisen.
-- Deshalb wird er getrennt vom echten Bestand gefuehrt und nie mit ihm vermischt.

alter table public.profiles
  add column if not exists tool_menge text
    check (tool_menge is null or tool_menge in ('unter_10', '10_bis_30', '30_bis_60', 'ueber_60'));

comment on column public.profiles.tool_menge is
  'Selbsteinschaetzung aus dem Onboarding, KEIN gemessener Bestand. Nie mit der Zahl der erfassten Abos verwechseln.';
