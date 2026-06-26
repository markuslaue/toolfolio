# B-23: Anschaffungs-Freigabe-Workflow

## Status: In Review
**Projekt:** PRJ (Tracker) · **Bereich:** B · **Created:** 2026-06-27 · **Prio:** P2 · **Abhaengig von:** B-05

## User Stories
- Als Agentur stelle ich Antraege fuer neue Tools und entscheide bewusst (genehmigen/ablehnen), statt nebenbei.
- Bei der Entscheidung sehe ich Kontext: Redundanz (gleiche Kategorie) und Budgetwirkung.

## Acceptance Criteria
- [x] /app/freigaben: KPIs (Zu genehmigen, Genehmigt + neue Monatskosten, Abgelehnt + vermiedene Jahreskosten), Tabs Ausstehend/Genehmigt/Abgelehnt.
- [x] Antrag stellen (Tool, Kategorie, Kosten, Intervall, Antragsteller, Begruendung).
- [x] Genehmigen (optional direkt als Abo anlegen) / Ablehnen (mit Begruendung); Antrag loeschen.
- [x] Ehrliche Kontext-Hinweise: Redundanz (aktive Abos gleicher Kategorie) und Budget (ueberschreitet Jahresbudget B-20).
- [x] RLS: Konto-Lese (has_account_access), Schreiben eigentuemergebunden.

## Out of Scope (bewusst)
- Benchmark-Kontext (Marktpreis-Vergleich) braucht Aggregat-Ebene (F-G2). Mehrstufige Genehmigungsketten / Antraege durch Mitglieder (brauchen tenant_id-Schreibrechte, B-25).

## Tech Design
- Tabelle freigabe_antrag (Status, Kosten, Intervall, Begruendung, Ablehnungsgrund), RLS.
- Server-Actions createAntrag/entscheiden(genehmigt|abgelehnt, optional alsAbo)/deleteAntrag. Genehmigung kann direkt ein Abo anlegen.
- Page berechnet Kontext (Redundanz via Kategorie-Count, Budget via B-20-Jahresbudget). UI faithful aus Lovable freigaben.tsx.

## QA (2026-06-27)
- Build gruen (tsc/ESLint/next build). Umlaut-Gegenprobe ok. Route /app/freigaben gated.
