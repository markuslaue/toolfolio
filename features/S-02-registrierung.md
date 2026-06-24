# S-02: Registrierung / Signup

## Status: Planned
**Created:** 2026-06-25
**Last Updated:** 2026-06-25
**Projekt:** PRJ-02 (Auth)

## Dependencies
- Requires: INFRA-1 (Supabase Auth, Auth-Huelle)
- Requires: S-01 (gemeinsame Auth-Huelle, Login-Verlinkung)
- Fuehrt zu: S-04 (E-Mail-Verifizierung), B-02 (Onboarding-Wizard, PRJ-06)

## User Stories
- Als neuer Nutzer moechte ich ein Konto mit Name, geschaeftlicher E-Mail und Passwort anlegen, damit ich Toolfolio nutzen kann.
- Als neuer Nutzer moechte ich mich per Google registrieren, damit es schneller geht.
- Als neuer Nutzer moechte ich ohne Kreditkarte starten, damit ich Toolfolio risikolos testen kann.
- Als neuer Nutzer moechte ich nach der Registrierung direkt ins Onboarding gefuehrt werden, damit ich sofort loslegen kann.

## Out of Scope
- Login (S-01), Recovery (S-03), E-Mail-Verifizierung-Zustaende (S-04).
- Plan-Auswahl/Zahlung (B-29, PRJ-10) - der Trial startet ohne Plan-Wahl.
- Der Onboarding-Wizard selbst (B-02, PRJ-06) - hier nur der Uebergang dorthin.

## Acceptance Criteria

- [ ] Angenommen das Formular, wenn der Nutzer Name, gueltige geschaeftliche E-Mail und ein ausreichend starkes Passwort eingibt und der Einwilligung zustimmt, dann wird ein Konto angelegt und der 14-Tage-Vollzugang (Agentur) startet ohne Kreditkarte.
- [ ] Angenommen die Pflicht-Einwilligung zu AGB und Datenschutz ist nicht gesetzt, wenn der Nutzer absendet, dann wird die Registrierung blockiert und der fehlende Haken markiert.
- [ ] Angenommen eine bereits registrierte E-Mail, wenn der Nutzer sie erneut nutzt, dann erscheint eine neutrale Meldung ohne preiszugeben, dass das Konto existiert (kein Konto-Enumeration), idealerweise mit Hinweis auf Login/Recovery.
- [ ] Angenommen ein zu schwaches Passwort, wenn der Nutzer tippt, dann zeigt eine Live-Staerkeanzeige den Status und die Registrierung wird erst ab Mindeststaerke erlaubt.
- [ ] Angenommen erfolgreiche Registrierung per E-Mail, wenn das Konto angelegt ist, dann wird eine Verifizierungsmail ausgeloest (S-04) und der Nutzer in den Onboarding-Wizard (B-02) gefuehrt.
- [ ] Angenommen der Nutzer waehlt "Mit Google registrieren", wenn der OAuth-Flow erfolgreich ist, dann wird das Konto angelegt und der Nutzer ins Onboarding gefuehrt.

## Edge Cases
- Ungueltiges E-Mail-Format oder freie Mailadresse (z. B. gmail) bei "geschaeftlicher E-Mail": freundliche Inline-Validierung (frei-Adressen erlauben, aber Feldlabel bleibt "geschaeftlich").
- Passwort und (falls vorhanden) Wiederholung stimmen nicht ueberein: Inline-Hinweis, kein Absenden.
- Netzwerk-/Serverfehler beim Anlegen: Fehlermeldung, Eingaben (ausser Passwort) bleiben erhalten.
- Doppel-Klick auf "Konto erstellen": kein doppeltes Konto (Button-Sperre/Ladezustand).
- OAuth bricht ab: Rueckkehr zur Registrierung mit neutralem Hinweis.

## Technical Requirements
- Supabase Auth Signup (E-Mail/Passwort + Google). Kein Auto-Wechsel in einen zahlpflichtigen Tarif.
- Trial-Logik: 14 Tage voller Agentur-Zugang; Trial-Ablauf ist nicht Teil dieser Spec (Plan/Abrechnung B-29).
- DSGVO-Einwilligung als Pflicht-Checkbox mit Verweis auf R-02/R-03 (Platzhalter-Links bis PRJ-13).
- Schlankes Formular (wenig Pflichtfelder), Rest folgt im Wizard.

## Open Questions
- [ ] Wird der Trial-Status (Start/Ablauf) schon hier in der DB gesetzt, oder erst mit PRJ-10 (Plan & Abrechnung)?
- [ ] Microsoft-SSO im MVP? (analog S-01)
- [ ] Mindest-Passwortstaerke (Laenge/Regeln) - an Supabase-Policy koppeln?

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| 14 Tage voller Agentur-Zugang ohne Kreditkarte, kein Auto-Wechsel | Niedrige Huerde, Vertrauen, zentrale Geschaeftsentscheidung | 2026-06-25 |
| Schlankes Formular (Name, E-Mail, Passwort) | Jede Pflichtangabe kostet Conversion; Rest im Wizard | 2026-06-25 |
| Keine Konto-Enumeration bei bestehender E-Mail | Sicherheit/Datensparsamkeit | 2026-06-25 |

### Technical Decisions
_To be added by /architecture_

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
