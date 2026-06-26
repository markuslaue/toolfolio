# B-20: Budget & Forecast

## Status: Approved & Deployed
**Projekt:** PRJ (Tracker) · **Created:** 2026-06-26 · **Prio:** P2

## User Stories
- Als Nutzer sehe ich, was in den naechsten 12 Monaten an Softwarekosten auf mich zukommt, und vergleiche es mit meinem Budget.
- Ich setze ein Jahresbudget und sehe Abweichung sowie ein Was-waere-wenn mit umgesetzten Sparvorschlaegen.

## Acceptance Criteria
- [x] /app/budget: KPIs (aktueller Monat, Forecast 12 Monate, Jahresbudget, Abweichung), 12-Monats-Forecast-Chart mit Budget-Linie.
- [x] Views Gesamt / Fix-Variabel / Kategorie (gestapelte Balken). Was-waere-wenn-Schalter (Sparpotenzial abgezogen).
- [x] Jahresbudget am Profil persistiert (bearbeitbar). Ehrlicher Projektions-Disclaimer.
- [x] Datenbasis: fixe Abokosten (normalisiert) + variable AI-Kosten (Istwerte vergangener Monate, Projektion fuer die Zukunft).

## Out of Scope
- Per-Kategorie-Budgets, Kunde-Ansicht, angekuendigte Preiserhoehungen (B-19) im Forecast. Live-API-Verbrauch (B-24) praezisiert die Variable-Projektion spaeter.

## Tech Design
- Engine src/lib/budget.ts (pure, unit-getestet): 12-Monats-Fenster (5 zurueck, aktuell, 6 voraus), fixMonat je Kategorie, varProjektion (Schnitt AI-Istwerte), forecastJahr.
- profiles.budget_jahr (Migration), Server-Action saveBudget. UI faithful aus Lovable budget-forecast.tsx portiert (HTML-BarStacks, Views, KPIs, Budget-Dialog).

## QA (2026-06-26)
- Unit-Test: fixMonat 150, varProjektion 50, forecastJahr 2400, 12 Monate, Ist/Forecast-Grenze korrekt. PASS.
- Build gruen (tsc/ESLint/next build). Route /app/budget gated.
