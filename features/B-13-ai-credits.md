# B-13: AI-Credits / variable Kosten

## Status: Approved & Deployed
**Projekt:** PRJ (Tracker) · **Created:** 2026-06-26 · **Prio:** P1

## User Stories
- Als Nutzer erfasse ich die monatlich schwankenden Kosten von KI-Diensten (OpenAI, Anthropic, ElevenLabs, ...) und sehe den Verlauf.
- Ich erkenne Spikes (Ausreisser ueber dem Schnitt) und setze Monatsbudgets.

## Acceptance Criteria
- [x] /app/ai-credits: KPIs (Gesamt diesen Monat + Trend, aktive Dienste, Spikes, ueber Budget), Gesamt-Verlaufschart, Dienst-Karten mit Monatswert/Trend/Spike/Budget-Bar, Zeitraum-Switch (6/3/12 Monate).
- [x] Dienst anlegen (Name, optional Budget), Drilldown mit 12-Monats-Historie (editierbar), Budget setzen, Dienst loeschen.
- [x] Spike-Erkennung: aktueller Monat >= 1,5x Schnitt der Vormonate -> Badge + Faktor.
- [x] Spike erzeugt eine Benachrichtigung (B-11, Typ "spike") -> /app/ai-credits.
- [x] RLS owner-only (+ Team-Lese via has_account_access). Sidebar-Eintrag.

## Out of Scope (-> B-24 Integrationen)
- Automatischer Abruf des Verbrauchs per API-Schluessel (verschluesselte Key-Ablage), tagesgenaue Daten, Auto-Recharge-Erkennung, Guthaben-Verfall. UI ist auf Monatsebene faithful; die Tagesgranularitaet der Lovable-Vorlage braucht die API-Anbindung.

## Tech Design
- Tabellen ai_services + ai_spend (Monat/Jahr/Betrag, unique je Dienst+Monat), RLS.
- Engine src/lib/ai-credits.ts (pure, unit-getestet): 12-Monats-Reihe, Trend, Schnitt, Spike, Budget-Prozent.
- Server-Actions createService/setBudget/deleteService/upsertSpend (Zod, Auth, owner-only).
- UI faithful aus Lovable ai-credits.tsx portiert (KPI-Karten, SVG-Charts Sparkline/BigChart, Dienst-Karten, Drilldown), auf Monatsebene + manuelle Erfassung.

## QA (2026-06-26)
- Unit-Tests Engine: Trend 200%, Schnitt 100, Spike 3x, Budget 60% / kein Spike bei gleichmaessig. PASS.
- Build gruen (tsc/ESLint/next build). Route /app/ai-credits gated.
