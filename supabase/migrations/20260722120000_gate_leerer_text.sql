-- AD-18: Eine Kollektion ohne Text darf nicht live gehen.
--
-- Der Trigger blockte bisher nur content_status='ki_ungeprueft'. Damit konnte eine
-- Kollektion mit content_status='fehlt' (also GAR KEIN Text) von Hand veroeffentlicht
-- werden, und genau das ist zweimal passiert (Grafik-Design-Software,
-- Projektmanagement-Software): live, aber leer.
--
-- Jetzt gilt fuer KOLLEKTIONEN: veroeffentlichbar nur mit geprueftem oder automatisch
-- freigegebenem Text. Fuer HUBS bleibt es beim alten Verhalten: ein Hub hat keinen
-- eigenen Ratgebertext (content_status='fehlt' ist dort der Normalfall), und die
-- automatische Veroeffentlichung setzt den Hub live, wenn eine seiner Kollektionen
-- live geht. Diesen Weg darf die Sperre nicht brechen.

create or replace function public.dir_content_gate()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'veroeffentlicht' then
    if new.content_status = 'ki_ungeprueft' then
      raise exception 'Diese Kollektion hat einen ungepruefte KI-Text. Erst pruefen, dann veroeffentlichen.';
    end if;
    -- Nur fuer Kollektionen, nicht fuer Hubs:
    if TG_TABLE_NAME = 'dir_collection' and new.content_status = 'fehlt' then
      raise exception 'Diese Kollektion hat keinen Text. Erst Text erzeugen, dann veroeffentlichen.';
    end if;
  end if;
  return new;
end;
$$;
