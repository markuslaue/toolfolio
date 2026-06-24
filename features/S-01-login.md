# S-01: Login / Anmeldung

## Status: Planned
**Created:** 2026-06-25
**Last Updated:** 2026-06-25
**Projekt:** PRJ-02 (Auth)

## Dependencies
- Requires: INFRA-1 (Supabase Auth, @supabase/ssr, Auth-Huelle, Proxy-Gating)

## User Stories
- Als Tracker-Nutzer moechte ich mich mit E-Mail und Passwort anmelden, damit ich in meinen Tracker komme.
- Als Tracker-Nutzer moechte ich mich per Google anmelden (SSO), damit ich kein weiteres Passwort brauche.
- Als Tracker-Nutzer moechte ich "Angemeldet bleiben" waehlen, damit ich nicht bei jedem Besuch neu einloggen muss.
- Als Tracker-Nutzer moechte ich bei aktivem Zwei-Faktor einen zweiten Schritt durchlaufen, damit mein Konto zusaetzlich geschuetzt ist.
- Als Tracker-Nutzer moechte ich bei vergessenem Passwort direkt zur Recovery kommen, damit ich wieder Zugang bekomme.

## Out of Scope
- Registrierung (S-02), Passwort-Recovery (S-03), E-Mail-Verifizierung (S-04).
- 2FA-Einrichtung (nur der Login-Schritt hier; Einrichtung in den Einstellungen B-26, PRJ-03).
- Fremde Tool-Logins (Toolfolio speichert nie Passwoerter fuer Dritt-Tools).
- Microsoft-SSO (siehe Open Questions).

## Acceptance Criteria

- [ ] Angenommen ein verifiziertes Konto existiert, wenn der Nutzer korrekte E-Mail und Passwort eingibt, dann wird er angemeldet und auf `/app` (bzw. den `redirect`-Zielpfad) weitergeleitet.
- [ ] Angenommen falsche Zugangsdaten, wenn der Nutzer absendet, dann erscheint eine freundliche, neutrale Fehlermeldung, die nicht verraet, ob die E-Mail existiert, und die Eingabe (ausser Passwort) bleibt erhalten.
- [ ] Angenommen der Nutzer waehlt "Mit Google anmelden", wenn er den OAuth-Flow erfolgreich abschliesst, dann ist er angemeldet und landet auf `/app`.
- [ ] Angenommen der Nutzer ist nicht angemeldet, wenn er `/app` oder `/anbieter` aufruft, dann wird er auf `/login?redirect=<zielpfad>` umgeleitet und nach erfolgreichem Login dorthin zurueckgefuehrt.
- [ ] Angenommen Zwei-Faktor ist fuer das Konto aktiv, wenn Passwort und E-Mail stimmen, dann erscheint ein zweiter Schritt zur Code-Eingabe, bevor der Zugang gewaehrt wird.
- [ ] Angenommen der Nutzer ist bereits angemeldet, wenn er `/login` aufruft, dann wird er direkt auf `/app` weitergeleitet.
- [ ] Angenommen das Passwortfeld, wenn der Nutzer auf das Anzeigen-Symbol klickt, dann wird das Passwort sichtbar/verborgen umgeschaltet.

## Edge Cases
- Konto existiert, aber E-Mail ist noch nicht verifiziert: Login wird abgelehnt mit Hinweis und Link, die Bestaetigung erneut zu senden (Uebergang zu S-04).
- OAuth wird vom Nutzer abgebrochen oder schlaegt fehl: Rueckkehr zur Login-Seite mit neutraler Fehlermeldung.
- Wiederholte Fehlversuche: Schutz vor Brute-Force (Rate-Limit/Verzoegerung) ohne preiszugeben, ob die E-Mail existiert.
- Abgelaufene Session beim Aufruf eines geschuetzten Pfads: stiller Redirect auf `/login` mit `redirect`-Parameter.
- `redirect`-Parameter zeigt auf eine externe URL: nur interne, relative Pfade zulassen (Open-Redirect verhindern).

## Technical Requirements
- Auth ueber Supabase Auth, Session via `@supabase/ssr` (Cookies), Refresh ueber den Proxy (`src/proxy.ts`).
- Sprache Deutsch, Du-Form, korrekte Umlaute, keine Gedankenstriche. Design nach `docs/design-system.md` (Auth-Huelle Split-Layout).
- Keine Speicherung von Passwoertern im App-Datenbestand (uebernimmt Supabase Auth).
- Google-Provider in Supabase Auth konfigurieren (Dashboard) - aktuell noch deaktiviert.

## Open Questions
- [ ] Microsoft-SSO im MVP, oder vorerst nur Google? (FEATURES nennt Google; Lovable-Login zeigt Google + Microsoft.)
- [ ] 2FA bereits im MVP aktiv, oder Schritt nur vorbereiten und spaeter scharf schalten?
- [ ] Konkrete Rate-Limit-/Lockout-Politik (Anzahl Versuche, Sperrdauer)?

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Neutrale Fehlermeldung beim Login | Verhindert Aufklaerung, ob ein Konto existiert (Sicherheit) | 2026-06-25 |
| `redirect` nur fuer interne Pfade | Open-Redirect-Schutz | 2026-06-25 |

### Technical Decisions
_To be added by /architecture_

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
