# B-04: Abo-Detailseite

## Status: Approved & Deployed
**Created:** 2026-06-25
**Last Updated:** 2026-06-25
**Projekt:** PRJ-07 (Tracker-Datenkern / Abos)

## Dependencies
- Requires: B-03 (Liste verlinkt auf Detail), B-05 (abos + Formular-Panel), S-01

## User Stories
- Als Nutzer moechte ich alle Details eines Abos auf einer Seite sehen (Kosten, Frist, Zuordnung, Notizen).
- Als Nutzer moechte ich von hier aus bearbeiten, pausieren, archivieren oder loeschen.
- Als Nutzer moechte ich die Frist-Erinnerung direkt umschalten.

## Out of Scope
- Sparpotenzial/Tarif-Alternativen (B-10), Rechnungen & Belege (B-14), Aktivitaetslog. Werden nicht als Mock gezeigt (Ehrlichkeit der Daten).

## Acceptance Criteria
- [x] Klick auf ein Abo in der Liste oeffnet `/app/abos/[id]` mit allen Detaildaten.
- [x] Kosten & Abrechnung: Betrag/Intervall, Monats- und Jahreshochrechnung, naechste Abbuchung, Kanal, Abo seit, Auto-Verlaengerung.
- [x] Kuendigung & Frist: Frist, letzter Termin, Trial-Ende, Erinnerungs-Schalter (persistiert).
- [x] Zuordnung: Kategorie, Kunde, Weiterverrechnung (+Aufschlag), Tags.
- [x] Bearbeiten oeffnet das Formular-Panel; Aenderungen erscheinen nach dem Speichern.
- [x] Pausieren/Archivieren (Statuswechsel) und Loeschen (mit Rueckfrage, danach zurueck zur Liste).
- [x] Fremdes/unbekanntes Abo -> 404 (RLS + .eq user_id, notFound).

## Edge Cases
- Frist nah (<=30 Tage): Warnbanner. PASS
- Keine Notizen/Zugang: Karte wird ausgeblendet. PASS
- Loeschen aus Panel oder Dropdown fuehrt beide zur Liste zurueck (onDeleted). PASS

## Decision Log
### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Detail als eigene Route /app/abos/[id], Liste navigiert dorthin | Klare Trennung Lesen/Bearbeiten; tiefe Verlinkung moeglich | 2026-06-25 |
| AboFormPanel um onDeleted erweitert | Detailseite navigiert nach Loeschen zur Liste statt zu refreshen (sonst 404) | 2026-06-25 |
| Mock-Sektionen (Sparen/Belege/Aktivitaet) weggelassen | Gehoeren zu B-10/B-14; keine Schein-Daten | 2026-06-25 |

---

## Tech Design (Solution Architect)
```
/app/abos/[id] (Server: laedt Abo per RLS, 404 sonst) -> AboDetail (client)
+-- Zurueck-Link, Header (Avatar, Tool, Anbieter, Kategorie+Status, Bearbeiten, Dropdown)
+-- Frist-Banner (wenn nah)
+-- Hauptspalte: Kosten & Abrechnung, Kuendigung & Frist (Erinnerung-Switch), Notizen & Zugang
+-- Seitenspalte: Zuordnung (Kategorie, Kunde, Weiterverrechnung, Tags)
+-- AboFormPanel (bearbeiten, onDeleted -> Liste), Loesch-Dialog
```
Keine Schemaaenderung. Aktionen: bulkSetStatus([id]), setErinnerung, deleteAbo.

## QA Test Results (2026-06-25)
- Alle Akzeptanzkriterien per Code-Review + Build gruen (tsc/ESLint/next build, Route /app/abos/[id]).
- Security: Laden und alle Aktionen owner-gebunden (.eq user_id, RLS); fremdes Abo -> notFound. PASS
- Erinnerung-Schalter optimistisch mit Rollback bei Fehler. PASS
- **APPROVED** - keine Critical/High.

## Deployment
Via rsync + docker compose Rebuild auf VPS B (toolfolio.de).
