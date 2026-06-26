# B-22: Team / Wer-nutzt-was (Offboarding)

## Status: In Review
**Projekt:** PRJ (Tracker) · **Bereich:** B · **Created:** 2026-06-27 · **Prio:** P2 · **Abhaengig von:** B-30

## User Stories
- Als Agentur sehe ich, wer welche Tools nutzt und wer fuer ein Tool verantwortlich ist (Owner).
- Beim Austritt einer Person habe ich eine Offboarding-Checkliste der zu entziehenden Zugaenge.

## Acceptance Criteria
- [x] /app/zugaenge: KPIs (Personen, Tools mit/ohne Owner, Zugaenge gesamt, in Offboarding), Pivot "nach Person" / "nach Tool".
- [x] Personen anlegen (Name, Rolle, E-Mail), Status aktiv/scheidet_aus/ausgeschieden mit Austrittsdatum, loeschen.
- [x] Tools je Person zuordnen (mit Platz-Kosten, Default aus Abo-Monatskosten), entfernen; Kostenfussabdruck je Person.
- [x] Owner (verantwortliche Person) je Tool setzen; "nach Tool" zeigt Nutzer + Owner.
- [x] Offboarding: bei scheidet_aus/ausgeschieden Checkliste + Risiko-Hinweis bei verbleibenden Zugaengen.
- [x] RLS: Konto-Lese (has_account_access), Schreiben eigentuemergebunden.

## Out of Scope (-> B-24 / B-21)
- Echte Nutzungs-Aktivitaet (letzte Nutzung) braucht Integrationen/SSO (B-24). Seat-/Lizenz-Bilanz (gebucht vs. genutzt) = B-21.

## Tech Design
- Tabellen personen + tool_zugang (person_id, abo_id, platz_kosten, ist_owner; unique person+abo), RLS.
- Server-Actions addPerson/removePerson/setPersonStatus/assignTool/unassignTool/setOwner.
- UI faithful aus Lovable team.tsx portiert (KPIs, Pivot, Personen-/Tool-Karten, Personen-Dialog mit Zuordnung + Status + Offboarding).

## QA (2026-06-27)
- Build gruen (tsc/ESLint/next build). Umlaut-Gegenprobe ok. Route /app/zugaenge gated.
