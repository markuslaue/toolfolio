# E-06: Monats-Report (buendelt E-04 Spike + E-07 Sparvorschlag)

## Status: Approved & Deployed
**Projekt:** PRJ (E-Mail) · **Bereich:** E · **Created:** 2026-06-26 · **Prio:** P1 · **Abhaengig von:** B-17, B-10, B-13

## Acceptance Criteria
- [x] Monatlicher Cron (`/api/cron/report`, 1. des Monats) berichtet den eben beendeten Monat; CRON_SECRET-geschuetzt.
- [x] Inhalt: Gesamtkosten (fix + variabel), Top-Kategorien, offene Sparvorschlaege + Potenzial (E-07), AI-Spend-Spikes (E-04), anstehende Fristen.
- [x] Opt-out `benachrichtigung_report` (Einstellungen), Dedup pro Monat via notification_log (`report:YYYY-MM`).
- [x] Versand nur, wenn etwas Relevantes vorliegt (Kosten > 0 oder Vorschlaege/Spikes/Fristen).

## Out of Scope (bewusst)
- Echtzeit-Spike-Alarm (E-04 separat, braucht Spike-Event-Tracking) und Preiserhoehungs-Mail (E-05, braucht Preis-Historie) folgen spaeter. E-02/E-03 (Frist/Trial) sind bereits live (Frist-Cron).

## Tech Design
- Cron nutzt die reinen Engines berechneBudget/berechneVorschlaege/berechneAiCredits/deriveFristen; Vorlage `monatsReport()`; Versand via Resend; Dedup notification_log.
- profiles.benachrichtigung_report (Migration) + Toggle im Benachrichtigungs-Formular.

## QA (2026-06-26)
- Build gruen. Auth-Gate (401 ohne Secret). Render-Test an markus.laue@ommm.de.
