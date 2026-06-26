# B-18: Steuer- / DATEV-Export (Reverse-Charge)

## Status: In Review
**Projekt:** PRJ (Tracker) · **Created:** 2026-06-26 · **Prio:** P1

## User Stories
- Als Nutzer exportiere ich meine Softwarekosten kategorisiert fuer den Steuerberater, inkl. Reverse-Charge-Kennzeichnung.
- Ich waehle Zeitraum (Jahr/Quartal/Monat), Kontenrahmen (SKR04/03) und Format und lade eine CSV.

## Acceptance Criteria
- [x] /app/steuer: Zeitraum-Auswahl, Format (DATEV-kompatible / einfache CSV), Kontenrahmen, "nur Reverse-Charge".
- [x] Posten aus echten Daten: wiederkehrende Abos auf den Zeitraum hochgerechnet + AI-Spend-Istwerte des Zeitraums.
- [x] Konten-Mapping je Kategorie (SKR-Default + USt-Satz waehlbar), Reverse-Charge je Anbieter umschaltbar.
- [x] Bilanz: Netto, USt (inlaendisch), Reverse-Charge (netto), Posten-Anzahl. Posten-Tabelle mit Netto/USt/Brutto/Konto/RC.
- [x] CSV-Export (BOM, dt. Format) mit Belegzeitraum/Konto/Netto/USt/Brutto/Reverse-Charge/Kanal/Kunde.
- [x] Deutlicher Entwurf-Disclaimer (keine Steuerberatung; RC nutzergesetzt).

## Out of Scope (bewusst)
- Echtes DATEV-Buchungsstapel-Format (EXTF-Header, Soll/Haben-Logik) und PDF: spaeter, braucht SKR-Konten-Feinmapping + steuerliche Pruefung. Persistente Steuer-Klassifizierung je Abo (ust_satz/reverse am Abo): Folgeschritt. Anbietersitz-Erkennung (Land) automatisch: spaeter.

## Tech Design
- /app/steuer Server laedt Abos (aktiv) + AI-Spend; Client stellt Posten zusammen und klassifiziert (USt je Kategorie, Reverse-Charge je Anbieter) im UI.
- Netto/USt/Brutto-Ableitung: inlaendisch -> Brutto = gezahlter Betrag, Netto = Brutto/(1+Satz); Reverse-Charge -> Netto = Betrag, USt informativ.
- CSV clientseitig (kein Schema-/Formular-Eingriff).

## QA (2026-06-26)
- Build gruen (tsc/ESLint/next build). Route /app/steuer gated.
- Rechnerisch geprueft: inlaendisch 19% (Brutto 119 -> Netto 100, USt 19), Reverse-Charge Netto = Betrag, USt informativ; Summen konsistent.
