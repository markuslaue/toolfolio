# S-03: Passwort vergessen / zuruecksetzen

## Status: Planned
**Created:** 2026-06-25
**Last Updated:** 2026-06-25
**Projekt:** PRJ-02 (Auth)

## Dependencies
- Requires: INFRA-1 (Supabase Auth), S-01 (Auth-Huelle, Verlinkung "Passwort vergessen?")

## User Stories
- Als Nutzer moechte ich bei vergessenem Passwort einen Reset-Link per E-Mail anfordern, damit ich wieder Zugang bekomme.
- Als Nutzer moechte ich ueber den Link ein neues Passwort setzen, damit ich mich wieder anmelden kann.
- Als Nutzer moechte ich bei abgelaufenem Link einen neuen anfordern koennen, damit ich nicht festhaenge.

## Out of Scope
- Login (S-01), Registrierung (S-02), E-Mail-Verifizierung (S-04).
- Aenderung des Passworts im eingeloggten Zustand (Einstellungen B-26, PRJ-03).

## Acceptance Criteria

- [ ] Angenommen die Anforderungs-Seite, wenn der Nutzer eine E-Mail eingibt und absendet, dann erscheint eine **neutrale** Bestaetigung ("Falls ein Konto existiert, haben wir einen Link geschickt"), unabhaengig davon, ob das Konto existiert.
- [ ] Angenommen die Bestaetigung wurde gezeigt, wenn der Nutzer "erneut senden" klickt, dann ist die Aktion kurz gesperrt (Anti-Spam) und wird danach wieder moeglich.
- [ ] Angenommen ein gueltiger Reset-Link, wenn der Nutzer ihn oeffnet, dann kann er ein neues Passwort mit Live-Staerkeanzeige und Wiederholung (mit Abgleich) setzen.
- [ ] Angenommen ein neues, ausreichend starkes und uebereinstimmendes Passwort, wenn der Nutzer speichert, dann wird es gesetzt und ein Erfolgs-Zustand mit Weg zur Anmeldung gezeigt.
- [ ] Angenommen ein abgelaufener oder ungueltiger Link, wenn der Nutzer ihn oeffnet, dann erscheint ein eigener Zustand mit Button "Neuen Link anfordern".

## Edge Cases
- Mehrfaches Anfordern in kurzer Zeit: Rate-Limit, neutrale Bestaetigung bleibt gleich.
- Reset-Link bereits benutzt: als ungueltig behandeln (Einmal-Verwendung).
- Neues Passwort gleich dem alten / zu schwach: Inline-Hinweis, kein Speichern.
- Passwort und Wiederholung verschieden: Inline-Abgleich, kein Speichern.
- Link auf einem anderen Geraet geoeffnet als angefordert: muss funktionieren (token-basiert, nicht sessiongebunden).

## Technical Requirements
- Supabase Auth Password Recovery (Reset-Mail, Token, neues Passwort).
- Reset-Mail-Versand: vorerst ueber Supabase-Auth-Mailer; spaeter ggf. Resend (PRJ-23).
- Neutrale Bestaetigung (keine Konto-Enumeration). Token sind einmalig und zeitlich begrenzt.

## Open Questions
- [ ] Gueltigkeitsdauer des Reset-Links (Standard Supabase ~60 min ok)?
- [ ] Reset-Mail ueber Supabase-Mailer oder direkt Resend ab Start?

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Neutrale Bestaetigung nach Anforderung | Verhindert Konto-Enumeration | 2026-06-25 |
| Einmal-Verwendung + Ablauf des Links | Sicherheit | 2026-06-25 |

### Technical Decisions
_To be added by /architecture_

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
