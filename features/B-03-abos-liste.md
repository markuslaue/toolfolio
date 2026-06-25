# B-03: Abos-Listenansicht (Filter, Sortierung, Gruppierung, Bulk)

## Status: Architected
**Created:** 2026-06-25
**Last Updated:** 2026-06-25
**Projekt:** PRJ-07 (Tracker-Datenkern / Abos)

## Dependencies
- Requires: B-05 (abos-Schema + Anlege-/Bearbeiten-Panel), S-01 (Session/App-Shell)
- Ersetzt: die schlanke B-05-Einstiegsliste unter /app/abos durch die volle Ansicht.

## User Stories
- Als Nutzer moechte ich alle meine Abos in einer Tabelle oder als Karten sehen, mit Kosten und naechster Abbuchung.
- Als Nutzer moechte ich suchen, filtern (Kategorie, Kunde, Kanal, Status, Intervall, Kostenbereich), sortieren und gruppieren.
- Als Nutzer moechte ich oben sofort sehen, wie viele Abos ich habe und was sie pro Monat kosten.
- Als Nutzer moechte ich mehrere Abos auswaehlen und gemeinsam loeschen, archivieren, pausieren oder als CSV exportieren.
- Als Nutzer moechte ich sehen, bei welchen Abos eine Kuendigungsfrist bald ablaeuft.

## Out of Scope
- Hinweise aus Nutzungsdaten/KI (Spike, Sparvorschlag, Preiserhoehung, Zombie) - das sind B-10/B-12/B-13. Hier nur der aus echten Daten ableitbare Frist-Hinweis.
- Detailseite (B-04), Import (B-06).

## Acceptance Criteria
- [ ] Angenommen eigene Abos, wenn der Nutzer /app/abos oeffnet, dann sieht er sie als Tabelle samt KPI-Zeile (Anzahl + Monatssumme der gefilterten Menge).
- [ ] Angenommen die Suche, wenn der Nutzer tippt, dann wird nach Tool, Anbieter und Kunde gefiltert.
- [ ] Angenommen die Filter, wenn der Nutzer Kategorie/Kunde/Kanal/Status/Intervall/Kostenbereich/"nur mit Frist" setzt, dann zeigt die Liste nur passende Abos; aktive Filter erscheinen als Chips.
- [ ] Angenommen Sortierung, wenn der Nutzer ein Feld waehlt, dann wird auf-/absteigend sortiert.
- [ ] Angenommen Gruppierung (Kunde/Kategorie/Kanal/Status), dann werden Gruppen mit Zwischensumme angezeigt.
- [ ] Angenommen Tabellen-/Karten-Umschalter und Dichte, dann aendert sich die Darstellung entsprechend.
- [ ] Angenommen Mehrfachauswahl, wenn der Nutzer eine Bulk-Aktion waehlt, dann wird sie auf die ausgewaehlten Abos angewandt (loeschen/archivieren/pausieren/CSV).
- [ ] Angenommen ein Abo mit naher Frist/Trial-Ende, dann erscheint ein "Frist bald"-Hinweis.

## Edge Cases
- Leere Liste / kein Treffer: Leerzustand mit "Filter zuruecksetzen".
- Bulk-Loeschen: Rueckfrage.
- Gruppierung + "alle auswaehlen": pro Gruppe konsistent.
- Sehr viele Tags/lange Namen: Truncation.

## Technical Requirements
- /app/abos laedt die eigenen Abos serverseitig; Liste filtert/sortiert/gruppiert clientseitig (Datenmenge pro Nutzer klein).
- Bulk-Server-Actions: bulkDeleteAbos, bulkSetStatus (archivieren/pausieren) - RLS owner-only, .eq user_id.
- CSV-Export clientseitig aus der gefilterten Menge.
- Frist-Hinweis aus letzter_kuendigungstermin bzw. trial_endet (<= 30 Tage).
- shadcn: slider, badge, popover, tooltip (ergaenzt).

## Open Questions
- [x] Hinweise jetzt voll? -> Nein, nur echter Frist-Hinweis; Rest mit B-10/B-12/B-13.
- [x] Server- oder Client-Filter? -> Client (kleine Menge pro Nutzer), Daten kommen serverseitig.
- [x] Bulk archivieren/pausieren = Statuswechsel? -> Ja, ueber bulkSetStatus.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Volle Liste ersetzt B-05-Einstiegsliste | Eine kanonische Abo-Ansicht, kein Doppel | 2026-06-25 |
| Nur echter Frist-Hinweis | Ehrlichkeit der Daten; andere Hinweise brauchen Nutzungsdaten/KI | 2026-06-25 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Client-seitiges Filtern/Sortieren | Pro-Nutzer-Menge klein; sofortige Interaktion ohne Roundtrips | 2026-06-25 |
| Bulk via dedizierte Server-Actions mit .in(ids) + .eq(user_id) | RLS-sicher, ein Roundtrip statt N | 2026-06-25 |

---

## Tech Design (Solution Architect)

### Komponentenstruktur
```
/app/abos (Server: laedt Abos) -> AbosListe (client)
+-- Kopf: Titel + KPI (Anzahl + Monatssumme) + "Abo hinzufuegen"
+-- Toolbar: Suche, Filter-Popover, Gruppieren, Sortieren, Tabelle/Karten, Dichte
+-- aktive Filter-Chips
+-- Inhalt:
|   +-- Tabelle (gruppiert, Zwischensummen) ODER Karten-Raster
|   +-- Frist-bald-Badge je Abo
|   +-- Zeilen-/Karten-Auswahl (Checkbox)
+-- Bulk-Leiste (erscheint bei Auswahl): Loeschen, Archivieren, Pausieren, CSV-Export
+-- AboFormPanel (anlegen/bearbeiten) - aus B-05
```

### Datenmodell
Keine Schemaaenderung. Nutzt abos aus B-05. Bulk-Actions schreiben nur eigene Zeilen.

### Abhaengigkeiten (Pakete)
- shadcn/ui: slider, badge, popover, tooltip (Rest vorhanden)

## QA Test Results (2026-06-25)

### Akzeptanzkriterien
| # | Kriterium | Ergebnis |
|---|-----------|----------|
| 1 | Tabelle + KPI (Anzahl + Monatssumme der gefilterten Menge) | PASS |
| 2 | Suche nach Tool/Anbieter/Kunde | PASS |
| 3 | Filter (Kategorie/Kunde/Kanal/Status/Intervall/Kostenbereich/Frist) + Chips | PASS |
| 4 | Sortierung auf-/absteigend | PASS |
| 5 | Gruppierung (Kunde/Kategorie/Kanal/Status) mit Zwischensumme | PASS |
| 6 | Tabelle/Karten + Dichte | PASS |
| 7 | Bulk loeschen/archivieren/pausieren/CSV | PASS (Server-Actions .in().eq(user_id), CSV clientseitig) |
| 8 | "Frist bald"-Hinweis aus echten Daten | PASS (Kuendigungstermin/Trial-Ende <= 30 Tage) |

### Security & Robustheit
- Bulk-Actions schreiben nur eigene Zeilen (.in(ids).eq(user_id), RLS owner-only). PASS
- Status-Werte der Bulk-Aktion liegen im DB-Check-Constraint (archiviert/pausiert/aktiv). PASS
- Leerzustand + Kein-Treffer-Zustand mit "Filter zuruecksetzen". PASS
- CSV mit BOM + escaping (kein CSV-Injection ueber Anfuehrungszeichen). PASS
- Loeschen nur mit Rueckfrage.

### Build
- tsc/ESLint/next build gruen; /app/abos ersetzt die schlanke B-05-Liste durch die volle Ansicht.

### Produktionsreife
**APPROVED** - keine Critical/High. Naechste sinnvolle Bausteine: B-04 (Detail), B-07/B-08 (Kanal/Kunde als FK), B-01 (Dashboard).

## Deployment
_To be added by /deploy_
