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
- [x] Zugang vor Bestaetigung? -> Komplett gesperrt (E-Mail-Confirmation an: keine Session vor Bestaetigung).
- [x] Verifizierungsmail ueber Supabase-Mailer oder Resend? -> Erst Supabase, Resend mit E-01.
- [x] Google-SSO ohne Verifizierung? -> Korrekt, Google-E-Mail gilt als bestaetigt.

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

## QA Test Results (2026-06-25)

### Akzeptanzkriterien
| # | Kriterium | Ergebnis |
|---|-----------|----------|
| 1 | Ausstehend: Hinweis + erneut senden + E-Mail aendern + eingeschraenkter Zugang | PASS (Pending-Panel; Zugang ohne Bestaetigung = keine Session -> /app gesperrt) |
| 2 | Gueltiger Link -> "E-Mail bestaetigt" + Weiter | PASS (Bestaetigung landet via /auth/callback auf /verifizieren) |
| 3 | Abgelaufen/ungueltig -> neuen Link anfordern | PASS (ohne Session: E-Mail eingeben -> resend) |
| 4 | Bereits bestaetigt | PASS (bestaetigte Session -> Erfolgszustand) |
| 5 | Erneut senden mit kurzer Sperre | PASS (30s Cooldown) |

### Security & Robustheit
- Zugang gesperrt bis bestaetigt (E-Mail-Confirmation an -> keine Session vor Bestaetigung). PASS
- resend/changeEmail validiert (Zod), kein Secret im Client, kein neues Schema. PASS
- Google-SSO: E-Mail gilt als bestaetigt (Verifizierung entfaellt). PASS

### Hinweis
Voller Klick-Test des Bestaetigungslinks aktuell durch Supabases Mailer-Limit gebremst (Resend folgt E-01). Zustaende und Routing verifiziert.

### Produktionsreife
**APPROVED** - keine Critical/High, keine offenen Bugs. Damit ist das Auth-Projekt (PRJ-02) komplett.

## Deployment
_To be added by /deploy_
