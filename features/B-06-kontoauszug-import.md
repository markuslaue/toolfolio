# B-06: Kontoauszug-Import (CSV, Erkennung, Review)

## Status: Approved & Deployed
**Created:** 2026-06-25
**Projekt:** PRJ-07 (Tracker-Datenkern)

## Dependencies
- Requires: B-05/B-03 (abos), B-07 (Zahlungskanaele fuer Zuordnung), S-01.

## User Stories
- Als Nutzer moechte ich meinen Kontoauszug als CSV hochladen und Toolfolio erkennt meine wiederkehrenden Abos.
- Als Nutzer moechte ich die Treffer pruefen, korrigieren und mit einem Klick als Abos uebernehmen.

## Out of Scope (spaeter)
- CAMT.053 (XML) und MT940 Parser, Mail-Forward-Import (braucht Inbound-Mail). Hier nur CSV.
- KI-Kategorisierung. Hier regelbasiertes Merchant-Woerterbuch + Heuristik.

## Acceptance Criteria
- [x] 4-Schritt-Flow: Hochladen, Analyse, Pruefen, Fertig (Stepper).
- [x] CSV wird im Browser geparst (Trennzeichen-Erkennung ; , Tab; deutsche Betraege und Datumsformate; Spalten Datum/Verwendungszweck/Betrag heuristisch).
- [x] Nur Belastungen (negative Betraege) werden als Abo-Kandidaten betrachtet; Einnahmen ignoriert.
- [x] Wiederkehrende Zahlungen werden gruppiert (Merchant-Woerterbuch + Namens-Bereinigung); Intervall aus Datumsabstaenden (monatlich/quartalsweise/jaehrlich).
- [x] Konfidenz: hoch (bekannt oder >=2 Vorkommen), mittel (einmalig/unbekannt), dublette (Tool bereits als Abo vorhanden).
- [x] Review nach Konfidenz gruppiert; je Zeile Auswahl + editierbar (Tool, Kategorie, Intervall, Betrag); Dubletten standardmaessig abgewaehlt.
- [x] Optionale Zuordnung eines Zahlungskanals (aus B-07).
- [x] "Uebernehmen" legt die ausgewaehlten Treffer als Abos an (bulkCreateAbos, RLS owner-only), naechste Abbuchung wird aus letzter Buchung + Intervall berechnet.
- [x] Erfolgsschritt mit Anzahl + Link zur Liste/Dashboard.
- [x] Einstieg "Importieren" in der Abo-Liste.

## Edge Cases
- Unlesbares Format / keine Spalten -> Fehlermeldung, kein Schritt 2.
- Keine wiederkehrenden Belastungen -> Hinweis.
- Ungueltige Zeilen beim Anlegen werden uebersprungen (Zod), Rest wird angelegt.

## Decision Log
### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| CSV-Parsing rein im Client | Datensparsamkeit: Rohdaten verlassen den Browser nicht, nur bestaetigte Abos gehen an die DB | 2026-06-25 |
| Regelbasiertes Merchant-Woerterbuch statt KI | deterministisch, ohne externe API; KI spaeter optional | 2026-06-25 |
| Nur Belastungen als Kandidaten | Abos sind Ausgaben; Einnahmen/Gutschriften raus | 2026-06-25 |

---

## Tech Design
```
/app/abos/import (Server: laedt Kanal-Optionen + vorhandene Tool-Namen) -> ImportFlow (client)
+-- Schritt 1 Upload: Drag-and-drop CSV (parseCsv im Browser) + Kanal-Auswahl
+-- Schritt 2 Analyse: kurze Animation, erkenneAbos()
+-- Schritt 3 Review: Gruppen hoch/mittel/dublette, editierbare Zeilen, Auswahl
+-- Schritt 4 Fertig: Anzahl + Links
```
src/lib/import.ts: parseCsv (Trennzeichen/Betrag/Datum/Spalten) + erkenneAbos (Gruppierung, Intervall, Konfidenz, Merchant-Dict). Action: bulkCreateAbos (Zod je Zeile, Insert, RLS).

## QA Test Results (2026-06-25)
- Akzeptanzkriterien per Code-Review + Build gruen (tsc/ESLint/next build; /app/abos/import).
- Parser an realistischem deutschen Bank-CSV verifiziert: Trennzeichen ; erkannt, Spalten Datum/Verwendungszweck/Betrag gefunden, Gehalt (Einnahme) korrekt ignoriert, Notion als wiederkehrend (x2) gruppiert.
- Security: Rohdaten nur im Browser; bulkCreateAbos pruefT Session + schreibt nur eigene Zeilen (user_id), Zod je Zeile. PASS
- **APPROVED** - keine Critical/High. CAMT/MT940 und Mail-Forward bewusst spaeter.

## Deployment
Via rsync + docker compose Rebuild auf VPS B.
