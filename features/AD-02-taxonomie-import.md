# AD-02: Taxonomie-Import & Strukturierung

## Status: Roadmap (Planung abgeschlossen, Bau mit Verzeichnis-Phase)
**Projekt:** PRJ-Verzeichnis-CMS · **Bereich:** AD · **Created:** 2026-06-26 · **Prio:** P1 (mit V) · **Abhaengig von:** AD-01 (Fundament: dir_*-Tabellen)

> Quelle/Regeln: `docs/verzeichnis/software-kategorien.md`. Architektur §8.

## Zusammenfassung
Einmaliger/wiederholbarer Import der 1315 Software-Kategorien (OMR + Capterra, entdoppelt) als Collections (L3) ins Verzeichnis, plus Aufbau des fehlenden Ebenen-Geruests (Cluster/L1/L2) und Zuordnung der Collections.

## User Stories
- Als Admin importiere ich die kuratierte Kategorienliste, sodass alle 1315 Collections als Entwurf vorliegen (Slug, Anzeigename, Prio, Quelle).
- Als Admin ordne ich Collections schrittweise einem L2/L1/Cluster zu und veroeffentliche sie nach Bearbeitung.

## Acceptance Criteria
- [ ] Quelle als bereinigte Daten (CSV/Seed) im Repo committet; Mojibake der Rubrik-Spalte korrigiert (echte Umlaute), Slug massgeblich.
- [ ] Import erzeugt `dir_collection`-Zeilen (Slug eindeutig, Name, prio[1|2|3], quelle[omr|capterra|beide], status=entwurf). Idempotent (kein Duplikat bei erneutem Lauf, Upsert per Slug).
- [ ] Slug-Kollisionspruefung (erwartet 0), Report ueber Anzahl je Prio (724/352/239 = 1315).
- [ ] Cluster/L1/L2-Geruest anlegbar; Collections zuordenbar (redaktionell), "unkategorisiert" als Parkzustand.
- [ ] Optionaler Heuristik-Vorschlag fuer Cluster-/Kategorie-Zuordnung (Keyword-Cluster), final redaktionell bestaetigt.
- [ ] Roll-out-Reihenfolge respektiert: PRIO 1 zuerst.

## Out of Scope
- Inhaltliche Befuellung der Collections (SEO-Content) = AD-01 Collection-Editor / KI-Workflows.
- Produktzuordnung = AD-01 (KI-Recherche + Kuratierung).

## Tech Design
- Seed-Skript (server-side, Service-Role) liest die bereinigte CSV -> Upsert in `dir_collection` per Slug.
- Mojibake-Mapping-Tabelle (Ã¼->ue etc.) + Umlaut-Wiederherstellung fuer Anzeigenamen; Slug unveraendert aus Quelle.
- Cluster/L1/L2 als leere Struktur vorab anlegbar; Zuordnung via `dir_collection.kategorie_id`.

## Decision Log
| Decision | Rationale | Date |
| Slug ist massgeblich, Anzeigename regeneriert | Quelle hat Mojibake; Slug ist sauber und stabil (URL) | 2026-06-26 |
| Collections zuerst, Ebenen nachgelagert | Die 1315 Eintraege sind L3; Cluster/L1/L2 fehlen in der Quelle und sind redaktionell | 2026-06-26 |
