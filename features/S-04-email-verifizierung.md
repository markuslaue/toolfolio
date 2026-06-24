# S-04: E-Mail-Verifizierung

## Status: Planned
**Created:** 2026-06-25
**Last Updated:** 2026-06-25
**Projekt:** PRJ-02 (Auth)

## Dependencies
- Requires: INFRA-1 (Supabase Auth), S-02 (Registrierung loest die Verifizierung aus), S-01 (Auth-Huelle)

## User Stories
- Als neuer Nutzer moechte ich nach der Registrierung meine E-Mail per Link bestaetigen, damit mein Konto startklar ist.
- Als Nutzer moechte ich die Bestaetigungsmail erneut anfordern koennen, falls sie nicht ankommt.
- Als Nutzer moechte ich eine falsch eingegebene E-Mail noch aendern koennen, damit ich die Bestaetigung erhalte.

## Out of Scope
- Registrierung selbst (S-02), Login (S-01), Recovery (S-03).
- Inhaltliche Gestaltung der Willkommens-/Verifizierungsmail (E-01, PRJ-23) - hier nur Ausloesung und Zustaende.

## Acceptance Criteria

- [ ] Angenommen ein frisch registriertes, unbestaetigtes Konto, wenn der Nutzer die Seite sieht, dann erscheint der Zustand "Bestaetigung ausstehend" mit der Ziel-E-Mail, einem "erneut senden"-Button und einem "E-Mail aendern"-Verweis, plus Hinweis auf eingeschraenkten Zugang bis zur Bestaetigung.
- [ ] Angenommen ein gueltiger Bestaetigungslink, wenn der Nutzer ihn oeffnet, dann erscheint "E-Mail bestaetigt" und ein Button fuehrt in den Onboarding-Wizard (B-02) bzw. zum Dashboard.
- [ ] Angenommen ein abgelaufener oder ungueltiger Link, wenn der Nutzer ihn oeffnet, dann erscheint "Link abgelaufen" mit Button "Neuen Bestaetigungslink anfordern".
- [ ] Angenommen eine bereits bestaetigte E-Mail, wenn der Nutzer den Link erneut oeffnet, dann erscheint "Bereits bestaetigt" mit Weg zur Anmeldung bzw. zum Dashboard.
- [ ] Angenommen der "erneut senden"-Button, wenn der Nutzer ihn klickt, dann wird die Mail erneut ausgeloest und der Button ist kurz gesperrt.

## Edge Cases
- "E-Mail aendern" vor Bestaetigung: neue Adresse setzen, neue Bestaetigungsmail ausloesen, alter Link wird ungueltig.
- Nutzer versucht geschuetzte Bereiche vor Bestaetigung: eingeschraenkter Zugang/Hinweis (Politik abstimmen, siehe Open Questions).
- Link mehrfach geklickt: idempotent (zweiter Klick zeigt "bereits bestaetigt").
- Mail landet im Spam / kommt nicht an: "erneut senden" + Hinweis, Spam zu pruefen.

## Technical Requirements
- Supabase Auth E-Mail-Bestaetigung (Token, Zustaende). Vier Zustaende: ausstehend, erfolgreich, abgelaufen, bereits bestaetigt.
- Auth-Huelle (Split-Layout) mit passendem Icon je Zustand.
- Verifizierungsmail vorerst ueber Supabase-Mailer; spaeter Willkommensmail E-01 (Resend, PRJ-23).

## Open Questions
- [ ] Wie streng ist der Zugang vor Bestaetigung? (Komplett gesperrt bis verifiziert, oder eingeschraenkt nutzbar mit Banner?)
- [ ] Verifizierungsmail ueber Supabase-Mailer oder direkt Resend (E-01) ab Start?
- [ ] Bei Google-SSO entfaellt die Verifizierung (E-Mail gilt als bestaetigt) - bestaetigen.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Vier Zustaende abbilden (ausstehend/erfolgreich/abgelaufen/bereits bestaetigt) | Bestaetigung verlaeuft selten geradlinig | 2026-06-25 |
| Idempotenter Bestaetigungslink | Mehrfach-Klicks duerfen nicht fehlschlagen | 2026-06-25 |

### Technical Decisions
_To be added by /architecture_

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
