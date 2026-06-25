# B-01: Dashboard (KPIs, Aktions-Center, Kategorien)

## Status: Approved & Deployed
**Created:** 2026-06-25
**Projekt:** PRJ-07 (Tracker-Datenkern)

## Dependencies
- Requires: B-05/B-03 (Abos), S-01. Nutzt Daten aus Abos.

## User Stories
- Als Nutzer moechte ich beim Login sofort meine Monats-/Jahreskosten und die Zahl aktiver Abos sehen.
- Als Nutzer moechte ich sehen, welche Fristen/Trials bald auslaufen, und direkt zum Abo springen.
- Als Nutzer moechte ich die Kostenverteilung nach Kategorie und die naechsten Abbuchungen sehen.

## Out of Scope (ehrlich, kein Mock)
- Spar-Fortschritt / identifiziertes Sparpotenzial (B-10), KI-Kosten-Spikes (B-13), Verlaufs-Charts ueber Zeit (brauchen Historie). Werden nicht als Schein-Zahlen gezeigt.

## Acceptance Criteria
- [x] KPI-Zeile: Kosten/Monat (Summe monatlich, lebende Abos), Hochrechnung/Jahr (x12), Aktive Abos (+Trials/pausiert), Fristen & Trials bald (<=30 Tage).
- [x] Kosten nach Kategorie als Balkendiagramm (Recharts), monatlich, ohne archivierte/gekuendigte.
- [x] Aktions-Center: Liste der Abos mit Frist/Trial-Ende <=30 Tage, je Eintrag Link zur Detailseite; Leerzustand "alles im gruenen Bereich".
- [x] Naechste Abbuchungen (Top 6 ab heute) mit Link zum Abo.
- [x] Leerzustand ohne Abos -> Willkommen + "Erstes Abo anlegen".

## Decision Log
### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| KPIs/Aggregation serverseitig, Charts clientseitig (Recharts) | SSR-Daten + interaktive Visualisierung | 2026-06-25 |
| Nur echte, ableitbare Kennzahlen | Ehrlichkeit der Daten; Mock-Sektionen weggelassen | 2026-06-25 |
| monatlich-Normalisierung fuer alle Summen | vergleichbare Werte ueber Intervalle | 2026-06-25 |

---

## Tech Design
```
/app (Server: laedt Abos, berechnet KPIs/Kategorien/naechste/Aktionen) -> Dashboard (client)
+-- KPI-Zeile (4 Karten)
+-- Kosten nach Kategorie (Recharts BarChart) + Aktions-Center (Fristen/Trials -> Detail)
+-- Naechste Abbuchungen (Top 6 -> Detail)
+-- Leerzustand (Willkommen)
```
Keine Schemaaenderung. Recharts ergaenzt.

## QA Test Results (2026-06-25)
- Akzeptanzkriterien per Code-Review + Build gruen (tsc/ESLint/next build; /app dynamisch).
- Security: nur eigene Abos (RLS); reine Lese-/Aggregat-Ansicht. PASS
- Aggregation deterministisch (monatlich-Normalisierung, lebende Abos). PASS
- Charts ohne Daten -> sauberer Hinweis; ohne Abos -> Willkommen-Leerzustand. PASS
- **APPROVED** - keine Critical/High. Damit ist der Tracker-Datenkern (Abos, Detail, Liste, Kanaele, Kunden, Dashboard) rund.

## Deployment
Via rsync + docker compose Rebuild auf VPS B.
