-- AD-01: SEO-Content je Collection.
--
-- `intro_md` ist der kurze Anreisser ueber den Produkten.
-- `content_md` ist das grosse SEO-Content-Piece UNTER den Produkten (>= 1000 Woerter).
--
-- `content_status` erzwingt, dass KI-Text nie ungeprueft oeffentlich wird:
-- die Collection kann nur veroeffentlicht werden, wenn ein Mensch den Text
-- freigegeben hat. Durchgesetzt per Trigger, nicht nur im UI.

alter table public.dir_collection
  add column if not exists content_md text,
  add column if not exists content_status text not null default 'fehlt'
    check (content_status in ('fehlt', 'ki_ungeprueft', 'geprueft')),
  add column if not exists content_woerter int,
  add column if not exists content_erzeugt_am timestamptz;

alter table public.dir_cluster
  add column if not exists content_status text not null default 'fehlt'
    check (content_status in ('fehlt', 'ki_ungeprueft', 'geprueft')),
  add column if not exists content_woerter int,
  add column if not exists content_erzeugt_am timestamptz;

/*
 * Harte Sperre: eine Collection mit ungepruefte KI-Text darf nicht live gehen.
 * Das ist der teuerste Fehler in einem Verzeichnis (tausende halluzinierte Seiten
 * im Index), deshalb liegt die Regel in der Datenbank und nicht im Frontend.
 */
create or replace function public.dir_content_gate()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'veroeffentlicht' and new.content_status = 'ki_ungeprueft' then
    raise exception 'Diese Collection hat einen ungeprueften KI-Text. Erst pruefen, dann veroeffentlichen.';
  end if;
  return new;
end;
$$;

drop trigger if exists dir_collection_content_gate on public.dir_collection;
create trigger dir_collection_content_gate
  before insert or update on public.dir_collection
  for each row execute function public.dir_content_gate();

drop trigger if exists dir_cluster_content_gate on public.dir_cluster;
create trigger dir_cluster_content_gate
  before insert or update on public.dir_cluster
  for each row execute function public.dir_content_gate();
