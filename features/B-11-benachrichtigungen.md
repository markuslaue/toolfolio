# B-11: Benachrichtigungen / Aktivitaets-Feed

## Status: In Review
**Projekt:** PRJ (Tracker) · **Created:** 2026-06-26 · **Prio:** P0

## User Stories
- Als Nutzer sehe ich an einer Stelle, was meine Aufmerksamkeit braucht (Fristen, Trials, Karten, neue Sparvorschlaege) und was schon passiert ist.
- Ich kann Benachrichtigungen als gelesen/erledigt/ignoriert markieren und alle auf einmal als gelesen setzen.

## Acceptance Criteria
- [x] /app/benachrichtigungen: Tabs Aktionen/Aktivitaet, Filter-Chips nach Typ, "Alle als gelesen", Zeitgruppen.
- [x] Aktionen LIVE abgeleitet: Fristen (kuendigung/trial/karte aus deriveFristen, Fenster -60..+45 Tage) + offene Sparvorschlaege (intervall/redundanz/zombie). Faelligkeitstext.
- [x] Status persistiert (gelesen/erledigt/ignoriert, stabiler key); erledigt/ignoriert entfernt, gelesen loescht den Punkt. Undo via Toast.
- [x] Aktivitaet aus ECHTEN Ereignissen: Abo angelegt, Kunde angelegt, Zahlungskanal angelegt, Sparvorschlag umgesetzt, nach Zeit gruppiert (Heute/Gestern/Diese Woche/Aelter).
- [x] Sidebar-Eintrag. RLS owner-only auf benachrichtigung_status.

## Out of Scope (folgt mit Daten)
- preiserhoehung/spike/gutschein/guthaben (brauchen Preis-Historie B-19, AI-Credits B-13, Partnerdaten). UI-Shell traegt die Typen bereits (faithful). Header-Glocke mit Badge = Folgeschritt.

## Tech Design
- lib/benachrichtigungen.ts: buildAktionen(fristen, vorschlaege, statusMap) + zeitgruppe() (pure, unit-getestet).
- Tabelle benachrichtigung_status (PK user_id+key), Server-Actions setBenachrichtigung/markAlleGelesen/resetBenachrichtigung.
- UI faithful aus Lovable benachrichtigungen.tsx portiert (Tabs, Filter-Chips, AktionRow, RowMenu, Aktivitaets-Timeline), Mock-Daten ersetzt.

## QA (2026-06-26)
- Unit-Tests: buildAktionen (Ableitung, gelesen/erledigt, Fenster), zeitgruppe (Heute/Diese Woche/Aelter). 5/5 PASS.
- Build gruen (tsc/ESLint/next build). Route /app/benachrichtigungen gated.
