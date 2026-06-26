# B-17: Berichte - Weiterverrechnungs-Report

## Status: Approved & Deployed
**Projekt:** PRJ (Berichte) · **Created:** 2026-06-26

## Dependencies
- Requires: B-09 (Kunden + Marge), B-05 (Abos, weiterverrechnen/Aufschlag), B-27 (Firmendaten fuer Kopf).

## Acceptance Criteria
- [x] /app/berichte: Weiterverrechnungs-Report pro Kunde (weiterverrechenbare Abos: Kosten/Monat, Aufschlag %, Weiterverrechnet/Monat, Marge/Monat) mit Zwischensumme je Kunde und Gesamtsumme.
- [x] Firmenkopf aus B-27 (Name, Anschrift, USt-IdNr.) + Stand-Datum.
- [x] CSV-Export (pro Position) und Drucken (print-optimiert, Buttons print:hidden).
- [x] Nur eigene Daten (RLS). Leerzustand, wenn nichts weiterzuverrechnen.
- [x] Aufschlag: pro Abo, sonst Kunden-Standard; Betraege monatlich normalisiert.

## Out of Scope
- Transaktionsbasierte Monatsabrechnung (hier monatlich-wiederkehrende Snapshot-Werte). PDF-Direktexport (Druck-Dialog genuegt). DATEV-Export = B-18.

## Tech Design
/app/berichte (Server: unternehmen + kunden + abos -> pro Kunde aggregiert) -> BerichteClient (Tabelle, CSV, window.print). monatlich-Normalisierung; Aufschlag abo.aufschlag_prozent ?? kunde.aufschlag_prozent.

## QA (2026-06-26)
- Build gruen (tsc/ESLint/next build); Route /app/berichte.
- Security: nur eigene Abos/Kunden/Unternehmen (RLS). Rechnung deterministisch. PASS. **APPROVED**.
