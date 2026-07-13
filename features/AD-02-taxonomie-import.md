# AD-02: Taxonomie-Import und Strukturierung

## Status: Planned (Datenasset liegt, Bau startet)
**Projekt:** PRJ-Verzeichnis-CMS · **Bereich:** AD · **Created:** 2026-06-26 · **Aktualisiert:** 2026-07-13 · **Prio:** P1 · **Abhaengig von:** AD-01 (dir_*-Fundament, ist deployed)

> Quelle und Regeln: `docs/verzeichnis/software-kategorien.md`.
> Datenassets: `docs/verzeichnis/software-kategorien.csv` (bereinigt) und
> `software-kategorien-1315-quelle.md` (Rohquelle, unveraendert).

## Zusammenfassung
Idempotenter Import der **1315 Software-Kategorien** (OMR + Capterra, entdoppelt) als
Collections (L3) plus Aufbau der fehlenden Ebene darueber (Cluster). Alles als **Entwurf**;
oeffentlich sichtbar wird spaeter Cluster fuer Cluster.

## Datenlage (verifiziert 2026-07-13)
- 1315 Zeilen, **0 Slug-Kollisionen**.
- Prio: 724 / 352 / 239 (exakt wie erwartet).
- Quelle: capterra 879, omr 309, beide 127. **Gegenprobe:** omr + beide = 436, deckt sich
  exakt mit der separat gelieferten OMR-Liste. Die Quellen sind konsistent.
- **Kein Mojibake.** Die Doppelkodierung existierte nur in der Chat-Darstellung, nicht in der
  Datei. 171 Rubriken tragen echte Umlaute. Die urspruengliche Annahme in
  `software-kategorien.md` §4 ist damit hinfaellig.

## User Stories
- Als Admin importiere ich die kuratierte Liste, sodass alle Collections als Entwurf vorliegen.
- Als Admin sehe ich einen Cluster-Vorschlag und korrigiere ihn, statt bei null anzufangen.
- Als Admin veroeffentliche ich einen Cluster erst, wenn er vollstaendig ist.

## Acceptance Criteria
- [ ] Angenommen die CSV liegt im Repo, wenn der Import laeuft, dann existieren **25 Cluster**
      und **1292 Collections** mit Status `entwurf`.
- [ ] Angenommen der Import lief bereits, wenn er erneut laeuft, dann entstehen **keine
      Dubletten** (Upsert per Slug) und der Bestand bleibt unveraendert.
- [ ] Angenommen eine Rubrik hat `typ = dienstleister`, wenn der Import laeuft, dann wird sie
      **nicht** importiert (Agenturen, Beratungen, Steuerberater sind keine Software mit Abo).
- [ ] Angenommen der Import ist durch, wenn der Report erscheint, dann nennt er Anzahl je
      Cluster, Anzahl unkategorisiert und Slug-Kollisionen (erwartet 0).
- [ ] Angenommen eine Collection wurde importiert, wenn ein anonymer Nutzer sie aufruft, dann
      ist sie **nicht sichtbar**, solange sie auf `entwurf` steht (serverseitig, RLS).

## Nicht verhandelbar
- **Die Spalte `quelle` (omr/capterra/beide) kommt NICHT in die Datenbank.** Sie ist ein
  reines Import-Artefakt und bleibt in der CSV im Repo. Damit kann sie nicht versehentlich in
  einer API-Antwort, einem JSON-LD oder einer Sitemap landen. Die urspruengliche Spec sah
  `dir_collection.quelle` vor. **Gestrichen.**
- **Kein Fremdverzeichnis in unseren URLs.** Siehe naechster Abschnitt.

## Offener Punkt: 277 Rubriken tragen noch OMRs Namen und Slugs
`ai-agent-builders`, `ad-network`, `affiliate-platform`, `applicant-tracking`: das sind
woertlich OMRs kanonische Bezeichner, und der Slug ist bei uns der URL-Pfad. Unsere URLs
wuerden also OMRs Kategoriestruktur spiegeln, erkennbar fuer OMR und fuer Google.

- **Keine davon ist PRIO 1** (die deutschen Capterra-Namen sind unauffaellig).
- **Nichts davon ist live.** Die Slugs sind noch frei.

**Beschluss (Markus, 2026-07-13):** Alle 277 werden eingedeutscht, **Name UND Slug neu
vergeben**. Beispiele: `ai-agent-builders` -> `ki-agenten-baukaesten`,
`ad-network` -> `werbenetzwerke`, `applicant-tracking` -> `bewerbermanagement`.
Loest zwei Probleme auf einmal: deutsche Anzeigenamen (Leitplanke 3) und keine fremde
Taxonomie in unseren URLs. Nach Livegang waere das nicht mehr moeglich (Slugs sind stabil).
**Jetzt ist es kostenlos.**

## Out of Scope
- Inhaltliche Befuellung der Collections (SEO-Content) -> AD-01 Collection-Editor.
- Produkt-Discovery und Produktzuordnung -> AD-01, Abschnitt "Entscheidungen 2026-07-13".
- Ebenen L1/L2 zwischen Cluster und Collection: vorerst **nicht** noetig. Cluster -> Collection
  reicht, solange kein Cluster unuebersichtlich wird. Nachtraeglich einziehbar.

## Tech Design
- Seed-Skript unter `scripts/`, serverseitig mit Service-Role, liest die CSV und upserted per Slug.
- Cluster aus der Spalte `cluster_vorschlag`, Collections mit `prio` und `status = entwurf`.
- Kein FK auf Tracker-Tabellen (Datentrennung auf Schema-Ebene).

## Decision Log
| Decision | Rationale | Date |
|---|---|---|
| Slug ist massgeblich, Anzeigename regeneriert | Slug ist stabil (URL), Anzeigename kann korrigiert werden | 2026-06-26 |
| Collections zuerst, Ebenen nachgelagert | Die 1315 Eintraege sind L3; die Ebene darueber fehlt in der Quelle | 2026-06-26 |
| `quelle` nicht in die DB | Kann sonst versehentlich oeffentlich werden; ist ein Import-Artefakt | 2026-07-13 |
| 23 Dienstleister-Rubriken raus | Agenturen und Beratungen sind keine Software mit Abo-Kosten | 2026-07-13 |
| 277 OMR-Slugs eindeutschen | Fremde Taxonomie in eigenen URLs; nach Livegang irreversibel | 2026-07-13 |
| 25 Cluster statt 15 | "Branchenloesungen" (225) waere ein unbrauchbarer Sammel-Cluster | 2026-07-13 |
| L1/L2 vorerst weglassen | Cluster -> Collection reicht; Ebenen nachtraeglich einziehbar | 2026-07-13 |
| Kein Scraping von OMR/Capterra | § 87b UrhG (Datenbankherstellerrecht) plus Strategie | 2026-07-13 |

## Open Questions
- [ ] Die 133 unkategorisierten Collections: redaktionell zuordnen oder in einem Sammel-Cluster
      "Weitere Software" belassen?
- [ ] Uebersetzung der 277 OMR-Rubriken: KI-Vorschlag, den Markus abnimmt.
