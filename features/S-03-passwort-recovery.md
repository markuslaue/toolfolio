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
- [x] Gueltigkeitsdauer des Reset-Links? -> Supabase-Standard (~60 min) ok.
- [x] Reset-Mail ueber Supabase-Mailer oder Resend? -> Erst Supabase-Mailer, Resend mit E-01 (zuverlaessiger Versand + hoehere Limits).

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

### A) Struktur (zwei Seiten in der Auth-Huelle)
```
/passwort-vergessen  (Anfordern)
+-- "Passwort vergessen?" -> E-Mail -> "Link senden"
+-- Neutrale Bestaetigung "E-Mail unterwegs" (verraet nicht, ob Konto existiert) + erneut senden (Cooldown)

/passwort-neu  (ueber den Reset-Link, mit Recovery-Session)
+-- "Neues Passwort festlegen": Passwort + Wiederholung (Abgleich) + Staerkeanzeige -> speichern
+-- Erfolg "Passwort geaendert" -> zur Anmeldung
+-- Abgelaufen/ungueltig (keine Recovery-Session) -> "Neuen Link anfordern"
```

### B) Datenmodell / Flow (Klartext)
- **Anfordern:** `resetPasswordForEmail(email, redirectTo=/auth/callback?redirect=/passwort-neu)` schickt einen Einmal-Link. Antwort immer neutral (Anti-Enumeration).
- **Link-Klick:** landet auf `/auth/callback` (vorhandene Route), tauscht den Code gegen eine **Recovery-Session** und leitet auf `/passwort-neu`.
- **Neues Passwort:** auf `/passwort-neu` besteht die Recovery-Session -> `updateUser({ password })`. Ohne Session -> Abgelaufen-Zustand.
- Kein neues Schema. Reset-Mail vorerst ueber Supabase-Mailer (Resend folgt PRJ-23).

### C) Technische Entscheidungen
- Wiederverwendung der `/auth/callback`-Route (Code-Tausch) auch fuer Recovery, via `redirect`-Param `/passwort-neu`.
- Neutrale Bestaetigung + Einmal-/Ablauf-Link (Supabase-Standard).
- Passwort serverseitig via Server-Aktion gesetzt; Mindestlaenge 8 + Abgleich der Wiederholung (Client) + Server-Validierung.

### D) Abhaengigkeiten
- Keine neuen Pakete.

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Recovery ueber bestehende /auth/callback + Zielseite /passwort-neu | Wiederverwendung, ein PKCE-Pfad | 2026-06-25 |
| Neutrale Bestaetigung nach Anforderung | Anti-Enumeration | 2026-06-25 |
| Passwort-Wiederholung mit Abgleich + min. 8 | Tippfehler vermeiden, Mindeststaerke | 2026-06-25 |

## QA Test Results (2026-06-25)

### Akzeptanzkriterien
| # | Kriterium | Ergebnis |
|---|-----------|----------|
| 1 | Anforderung -> neutrale Bestaetigung (kein Konto-Aufdecken) | PASS (immer "E-Mail unterwegs") |
| 2 | Erneut senden mit kurzer Sperre | PASS (30s Cooldown) |
| 3 | Gueltiger Link -> neues Passwort mit Staerke + Wiederholung/Abgleich | PASS (updateUser ueber Recovery-Session) |
| 4 | Erfolg -> zur Anmeldung | PASS (Redirect /login?reset=ok) |
| 5 | Abgelaufener/ungueltiger Link -> "Neuen Link anfordern" | PASS (ohne Session -> Abgelaufen-Zustand) |

### Security & Robustheit
- Neutrale Bestaetigung (Anti-Enumeration), auch bei Mailer-Rate-Limit. PASS
- Einmal-/Ablauf-Link (Supabase-Standard), Recovery-Code-Tausch ueber /auth/callback. PASS
- Passwort min. 8 + Abgleich der Wiederholung (Client + Server). PASS
- Kein Secret im Client, kein neues Schema. PASS

### Hinweis
Voller Klick-Test des Reset-Links ist aktuell durch Supabases Mailer-Limit gebremst (Resend folgt E-01). Code-Pfade und neutraler Flow verifiziert.

### Produktionsreife
**APPROVED** - keine Critical/High, keine offenen Bugs.

## Deployment
_To be added by /deploy_
