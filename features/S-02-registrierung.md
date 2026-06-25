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
- [x] Trial-Status in DB jetzt oder PRJ-10? -> Implizit aus Anlage-Zeitpunkt, explizit mit B-29.
- [x] Microsoft-SSO im MVP? -> Nein, nur Google.
- [x] Mindest-Passwortstaerke? -> Min. 8 + clientseitige Staerkeanzeige, plus Supabase-Policy.
- [x] Persistentes Einwilligungs-Protokoll? -> Ja, Zeitstempel `consent_accepted_at` in `profiles` speichern (rechtlich sauber). Versionsbezug zu R-02/R-03 spaeter verfeinern.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| 14 Tage voller Agentur-Zugang ohne Kreditkarte, kein Auto-Wechsel | Niedrige Huerde, Vertrauen, zentrale Geschaeftsentscheidung | 2026-06-25 |
| Schlankes Formular (Name, E-Mail, Passwort) | Jede Pflichtangabe kostet Conversion; Rest im Wizard | 2026-06-25 |
| Keine Konto-Enumeration bei bestehender E-Mail | Sicherheit/Datensparsamkeit | 2026-06-25 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Supabase `signUp` + Name als Metadaten, Profil via Trigger | Wiederverwendung der S-01-Grundlage, kein eigenes Konto-Handling | 2026-06-25 |
| Trial implizit aus Anlage-Zeitpunkt, explizite Felder erst B-29 | Kein vorzeitiger Schema-Eingriff | 2026-06-25 |
| E-Mail-Bestaetigung an, danach Pending-Zustand | Sicherheits-Default "gesperrt bis verifiziert" | 2026-06-25 |
| Generische Erfolgsmeldung bei bestehender E-Mail | Anti-Enumeration | 2026-06-25 |
| Einzelnes Name-Feld -> Vor-/Nachname (Split am ersten Leerzeichen) | Matcht Lovable-UI, fuellt profiles | 2026-06-25 |
| Nur Google-SSO im MVP | Konsistent zu S-01 | 2026-06-25 |
| Einwilligung mit Zeitstempel (`consent_accepted_at`) speichern | Rechtlich sauberer DSGVO-Nachweis, datensparsam | 2026-06-25 |

---

## Tech Design (Solution Architect)

### A) Komponenten-Struktur (in der vorhandenen Auth-Huelle)
```
/registrieren (Auth-Huelle aus S-01)
+-- Registrierungs-Karte
|   +-- Ueberschrift "Kostenlos starten"
|   +-- Trial-Hinweis (14 Tage voller Agentur-Zugang, keine Kreditkarte)
|   +-- Button "Mit Google registrieren" (SSO)
|   +-- Trenner "oder mit E-Mail"
|   +-- Formular
|   |   +-- Name
|   |   +-- Geschaeftliche E-Mail
|   |   +-- Passwort (Staerkeanzeige + Anzeigen-Umschalter, min. 8)
|   |   +-- Pflicht-Checkbox: AGB + Datenschutz akzeptieren
|   |   +-- Fehlerbanner
|   |   +-- Button "Konto erstellen" (Ladezustand)
|   +-- Fusszeile "Schon ein Konto? Anmelden" (-> /login)
+-- Erfolgs-/Pending-Zustand: "Bitte bestaetige deine E-Mail" (S-04 formalisiert /verifizieren)
```
Wiederverwendet aus S-01: Auth-Huelle, Google-OAuth-Start + `/auth/callback`, `safeRedirect`.

### B) Datenmodell (Klartext)
- **Konto + Passwort** ueber Supabase Auth `signUp`. Der **Name** wird als Konto-Metadaten mitgegeben; der bereits gebaute Trigger (`handle_new_user`, S-01) legt damit automatisch den `profiles`-Eintrag an. Einzelnes Name-Feld wird in Vor-/Nachname aufgeteilt (erstes Wort / Rest).
- **E-Mail-Bestaetigung ist an** (Default-Entscheidung "gesperrt bis verifiziert"): nach der Registrierung erhaelt der Nutzer eine Bestaetigungsmail (vorerst Supabase-Mailer); Zugang zu /app erst nach Bestaetigung (S-04).
- **Trial:** 14 Tage voller Agentur-Zugang, **implizit** abgeleitet aus dem Anlage-Zeitpunkt. Explizite Plan-/Trial-Felder kommen mit B-29 (Plan & Abrechnung). Kein Schema-Eingriff in S-02.
- **DSGVO-Einwilligung:** Pflicht-Checkbox, server- und clientseitig erzwungen. Der Zeitpunkt der Einwilligung wird als Nachweis in `profiles` (`consent_accepted_at`) gespeichert. Der Bezug auf konkrete AGB-/Datenschutz-Versionen wird verfeinert, sobald R-02/R-03 final sind.

### C) Technische Entscheidungen (das Warum)
- **Supabase `signUp` + Metadaten -> Trigger:** kein eigenes Konto-Handling, Profil entsteht automatisch (Wiederverwendung der S-01-Grundlage).
- **Registrierung ueber Server-Aktion:** Passwort serverseitig, sauber im App Router (wie S-01).
- **Anti-Enumeration:** Bei bereits registrierter E-Mail zeigt Supabase keinen klaren "existiert"-Hinweis; wir zeigen generisch "Bitte bestaetige deine E-Mail" - kein Aufdecken bestehender Konten.
- **E-Mail-Bestaetigung an, danach Pending-Zustand:** entspricht dem Sicherheits-Default; der Uebergang ins Onboarding (B-02) erfolgt nach der Bestaetigung.
- **Nur Google-SSO** (Microsoft spaeter), 2FA hier nicht relevant (erst nach Login).
- **Passwortstaerke** clientseitig visuell (Mindestlaenge 8), zusaetzlich Supabase-Policy.

### D) Abhaengigkeiten (Pakete)
- Keine neuen Pakete (`@supabase/ssr`, `zod`, shadcn-Komponenten bereits vorhanden). Staerkeanzeige als kleine eigene Logik, keine Library.

### Voraussetzung
- E-Mail-Bestaetigung in Supabase aktiviert lassen (Default). Google-Provider wie bei S-01 spaeter aktivieren.

## QA Test Results (2026-06-25)

### Akzeptanzkriterien
| # | Kriterium | Ergebnis |
|---|-----------|----------|
| 1 | Gueltige Registrierung -> Konto + 14-Tage-Trial ohne Kreditkarte | PASS (signUp + impliziter Trial, keine CC) |
| 2 | Fehlende Einwilligung -> blockiert | PASS (serverseitig erzwungen, Checkbox-Pflicht) |
| 3 | Bestehende E-Mail -> neutrale Meldung (Anti-Enumeration) | PASS (immer Pending-Zustand) |
| 4 | Schwaches Passwort -> Staerkeanzeige + blockiert (min. 8) | PASS (Client-Meter + Server-min-8) |
| 5 | Erfolg -> Verifizierungsmail + Pending-Zustand | PASS (signUp loest Mail aus, "Bitte E-Mail bestaetigen") |
| 6 | Google-Registrierung -> OAuth | DEFERRED (Provider noch nicht aktiviert) |

### Security & Robustheit
- Einwilligung serverseitig erzwungen, **deterministisch** uebertragen (verstecktes Feld spiegelt Checkbox) - vermeidet potenziellen Blocker. PASS
- Anti-Enumeration (gleiche Meldung bei bestehender E-Mail). PASS
- E-Mail-Bestaetigung aktiv (Session erst nach Bestaetigung). PASS
- Kein Secret im Client, RLS unveraendert, eingeloggter Aufruf -> Redirect. PASS
- Eingabefelder kontrolliert -> bleiben bei Fehler erhalten (Lehre aus S-01/B2). PASS
- Konto + Profil + `consent_accepted_at` per Trigger verifiziert (SDK-Test). PASS

### Produktionsreife
**APPROVED** - keine Critical/High, keine offenen Bugs. Browser-Absende-Test (Formular -> Pending) zur finalen Bestaetigung durch den Nutzer.

## Deployment
_To be added by /deploy_
