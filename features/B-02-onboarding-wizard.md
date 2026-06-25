# B-02: Onboarding-Wizard (Erststart)

## Status: Approved & Deployed
**Created:** 2026-06-25
**Projekt:** PRJ-07 (Tracker-Datenkern)

## Dependencies
- Requires: S-02 (Registrierung), B-01 (Dashboard), B-05 (Abos), B-06 (Import), B-07 (Kanaele), B-08 (Kunden).

## User Stories
- Als neuer Nutzer moechte ich nach der Registrierung in wenigen Schritten startklar sein: Profil, Zahlungskanaele, Abos, ggf. Kunden.
- Als Agentur moechte ich direkt ein paar Kunden anlegen.
- Ich moechte das Onboarding jederzeit ueberspringen koennen.

## Acceptance Criteria
- [x] Schritte: Profil (Segment) -> Zahlungskanaele -> Bestand (Import/manuell) -> Kunden (nur Agentur/Unternehmen) -> Fertig. Fortschrittsbalken + "Schritt X von N".
- [x] Segment-Auswahl (solo/freelancer/agentur/unternehmen) steuert, ob der Kunden-Schritt erscheint.
- [x] Zahlungskanaele werden echt angelegt (createKanal, nur Referenzen).
- [x] Bestand: Karte "Kontoauszug importieren" fuehrt in den Import (B-06), Alternative "spaeter manuell".
- [x] Kunden werden echt angelegt (createKunde).
- [x] "Fertig"/"Ueberspringen"/Import-Wahl setzen onboarded_at (+ segment) und navigieren weiter.
- [x] Gating: das Dashboard leitet Nutzer ohne onboarded_at einmalig nach /app/onboarding (kein globaler Redirect, keine Loops); andere /app-Seiten bleiben erreichbar.
- [x] Bereits abgeschlossenes Onboarding -> /app (kein erneuter Durchlauf).

## Out of Scope
- Beleg-Postfach / AI-Provider-Connect aus der Lovable-Vorlage (eigene Features, spaeter). Auto-Redirect aus der Registrierung (Dashboard-Gate genuegt).

## Decision Log
### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Gate nur im Dashboard, nicht global in der Middleware | kein DB-Call pro Request, keine Redirect-Loops, Nutzer nie eingesperrt | 2026-06-25 |
| Wizard legt echt an (Kanaele/Kunden) statt Mock | direkter Nutzen, kein Wegwerf-State | 2026-06-25 |
| segment + onboarded_at in profiles | minimal, RLS bereits vorhanden | 2026-06-25 |

---

## Tech Design
```
/app/onboarding (Server: laedt first_name, redirect wenn schon onboarded) -> OnboardingWizard (client)
+-- 1 Profil/Segment -> 2 Zahlungskanaele (createKanal) -> 3 Bestand (Import-Link/weiter)
    -> 4 Kunden (createKunde, nur Agentur/Unternehmen) -> Fertig (finishOnboarding)
Dashboard /app: if !onboarded_at -> redirect /app/onboarding
```
Migration: profiles.segment + onboarded_at. Action: finishOnboarding(segment).

## QA Test Results (2026-06-25)
- Akzeptanzkriterien per Code-Review + Build gruen (tsc/ESLint/next build; /app/onboarding).
- Migration angewandt (segment/onboarded_at vorhanden).
- Gating verifiziert per Code: Dashboard redirectet nur bei fehlendem onboarded_at; Onboarding-Seite redirectet abgeschlossene Nutzer zurueck -> kein Loop. PASS
- Security: alle Schreibvorgaenge ueber bestehende owner-only Actions (RLS). PASS
- **APPROVED** - keine Critical/High.

## Deployment
Via rsync + docker compose Rebuild auf VPS B.
