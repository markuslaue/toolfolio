-- B-24: Anbieter rechnen teils in Fremdwaehrung (DataForSEO in USD), unser
-- Kostenmodell (ai_spend, Budget) ist EUR. Statt still gleichzusetzen, wird ein
-- expliziter Umrechnungskurs gepflegt (1 Anbieterwaehrung = kurs EUR).
alter table public.integration
  add column if not exists kurs numeric not null default 1
    check (kurs > 0 and kurs <= 100);
