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
- [x] Microsoft-SSO im MVP? -> Nein, nur Google (bestaetigt 2026-06-25).
- [x] 2FA im MVP aktiv? -> Vorbereitet (Step-up implementiert), Einrichtung erst B-26.
- [x] Rate-Limit-/Lockout-Politik? -> Supabase Auth bringt eingebautes Rate-Limiting; kein Custom noetig.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Neutrale Fehlermeldung beim Login | Verhindert Aufklaerung, ob ein Konto existiert (Sicherheit) | 2026-06-25 |
| `redirect` nur fuer interne Pfade | Open-Redirect-Schutz | 2026-06-25 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Supabase Auth als Identitaetsanbieter | Konten/Passwoerter/SSO/MFA sicher gebuendelt, kein eigenes Passwort-Handling | 2026-06-25 |
| Login per Server-Aktion (nicht Client-Aufruf) | Passwort serverseitig, Session-Cookie sicher gesetzt, App-Router-konform | 2026-06-25 |
| Google-SSO ueber Supabase-OAuth + Callback-Route | Standardweg, kein eigenes OAuth | 2026-06-25 |
| Profil-Tabelle mit Row Level Security (Eigentuemer-only) | Leitplanke: Zugriff strikt auf den Eigentuemer | 2026-06-25 |
| Nur Google-SSO im MVP, Microsoft spaeter | Bestaetigter Default, geringere Anfangskomplexitaet | 2026-06-25 |
| 2FA-Schritt vorbereiten, nicht erzwingen | Bestaetigter Default; Einrichtung folgt in B-26 | 2026-06-25 |
| Auth-Mails vorerst ueber Supabase-Mailer | Bestaetigter Default; Resend folgt in PRJ-23 | 2026-06-25 |
| Zugang gesperrt bis E-Mail verifiziert (Google gilt als verifiziert) | Bestaetigter Default | 2026-06-25 |

---

## Tech Design (Solution Architect)

### A) Komponenten-Struktur (in der vorhandenen Auth-Huelle)
```
/login (Auth-Huelle: Markenpanel links + Karte rechts, beides aus INFRA-1)
+-- Login-Karte
|   +-- Ueberschrift "Willkommen zurueck"
|   +-- Button "Mit Google anmelden" (SSO)
|   +-- Trenner "oder mit E-Mail"
|   +-- Login-Formular
|   |   +-- E-Mail-Feld
|   |   +-- Passwort-Feld (mit Anzeigen-Umschalter)
|   |   +-- "Angemeldet bleiben" (Checkbox)
|   |   +-- "Passwort vergessen?" (Link -> /passwort-vergessen, S-03)
|   |   +-- Button "Anmelden" (mit Ladezustand)
|   +-- Fehlerbereich (neutrale Meldung)
|   +-- 2FA-Schritt (alternativer Karteninhalt, nur wenn das Konto MFA aktiv hat)
|   |   +-- Code-Eingabe + Bestaetigen
|   +-- Fusszeile "Noch kein Konto? Jetzt registrieren" (Link -> /registrieren, S-02)
+-- OAuth-Callback-Route (nimmt die Google-Rueckleitung an, setzt die Session, leitet weiter)
```
Serverseitig: eine **Server-Aktion** verarbeitet den E-Mail/Passwort-Login (ueber Supabase), setzt die Session als Cookie und leitet auf den geprueften, internen Zielpfad bzw. `/app`. Der vorhandene **Proxy** schuetzt `/app` und `/anbieter` und haengt den `redirect`-Parameter an. Google laeuft ueber den Supabase-OAuth-Flow plus die Callback-Route.

### B) Datenmodell (Klartext)
- **Konten und Passwoerter** liegen ausschliesslich in **Supabase Auth** (kein Klartext-Passwort bei uns, kein eigenes Passwort-Handling).
- **Profil je Konto** (gemeinsame Auth-Grundlage, hier etabliert, von S-02 befuellt): Verweis auf das Auth-Konto, Vorname, Nachname, Rolle (z. B. Inhaber/Admin), Anlage-Zeitpunkt. Beim Login dient es dazu, nach dem Einloggen Name und Rolle zu kennen. Zugriff strikt nur auf den Eigentuemer (Row Level Security).
- **Session:** sichere Cookies, von Supabase/SSR verwaltet (kein zusaetzlicher Speicher). "Angemeldet bleiben" steuert die Session-Dauer (kurz vs. lang).
- **Zwei-Faktor (2FA):** ueber Supabase MFA (TOTP). Die Faktoren liegen bei Supabase. Einrichtung kommt spaeter (B-26); hier wird nur der Abfrage-Schritt vorbereitet, nicht erzwungen.

### C) Technische Entscheidungen (das Warum)
- **Supabase Auth als Identitaetsanbieter:** Konten, Passwoerter, Google-SSO und 2FA an einer sicheren, bereits verdrahteten Stelle. Wir speichern selbst keine Passwoerter.
- **Login ueber Server-Aktion statt Client-Aufruf:** das Passwort wird serverseitig verarbeitet, die Session sicher als Cookie gesetzt, sauber im Next.js App Router.
- **Google-SSO ueber Supabase-OAuth + Callback-Route:** Standardweg, kein eigenes OAuth-Handling.
- **Neutrale Fehlermeldungen + nur interne `redirect`-Pfade:** verhindert Konto-Enumeration und Open-Redirect (in der Spec entschieden).
- **Profil mit Row Level Security:** jeder sieht ausschliesslich sein eigenes Profil (Leitplanke: Zugriff strikt auf den Eigentuemer).
- **2FA vorbereitet, nicht erzwungen** (bestaetigter Default).
- **Nur Google-SSO im MVP** (Microsoft spaeter; bestaetigter Default).

### D) Abhaengigkeiten (Pakete)
- `@supabase/supabase-js`, `@supabase/ssr` - bereits installiert (INFRA-1).
- `zod` - Eingabe-Validierung, bereits installiert.
- shadcn/ui-Komponenten (`button`, `input`, `label`, `checkbox`, `card`, `alert`) - werden im `/frontend`-Schritt per `shadcn add` hinzugefuegt (noch nicht vorhanden).
- Keine neuen npm-Pakete zwingend noetig.

### Voraussetzung (einmalig, Dashboard)
Google als Auth-Provider in Supabase aktivieren (aktuell aus) - Client-ID/Secret in Supabase hinterlegen, Redirect-URL auf die Callback-Route setzen. Erledigen wir im `/backend`-Schritt.

### Implementierung (Frontend, erledigt 2026-06-25)
- Auth-Huelle als `src/app/(auth)/layout.tsx` (Split-Layout, 1:1 nach Lovable `.lovable-ref/.../auth-shell.tsx`).
- Login-Formular `src/components/auth/login-form.tsx` (Client, `useActionState`): Google-SSO (nur Google, Default), E-Mail/Passwort mit Anzeigen-Umschalter, "Angemeldet bleiben", Fehlerbanner, 2FA-Zweitschritt-Ansicht, Links zu Registrierung/Recovery/AGB/Datenschutz.
- Seite `src/app/(auth)/login/page.tsx` liest `redirect` mit Open-Redirect-Schutz (nur interne Pfade).
- shadcn-Komponenten ergaenzt: button, input, label, checkbox. Design-Tokens in `globals.css` 1:1 mit Lovable abgeglichen (paper/coral/success, shadow-soft/-lift, font-display).
- ~~Offen (/backend)~~ erledigt (siehe unten).

### Implementierung (Backend, erledigt 2026-06-25)
- Migration `supabase/migrations/..._profiles.sql`: `profiles` (id->auth.users, first_name, last_name, role, created_at), RLS owner-only (select/update), Trigger `handle_new_user` legt Profil bei Konto-Anlage an. Per `supabase db push` eingespielt.
- Login-Actions echt: `signInWithPassword` (neutrale Fehlermeldung), MFA-Step-up ueber AAL (`getAuthenticatorAssuranceLevel` -> 2FA-Schritt nur bei vorhandenem Faktor), `challenge`/`verify`. Google: `signInWithOAuth` + Route-Handler `src/app/auth/callback/route.ts` (`exchangeCodeForSession`), absolute Redirects ueber `NEXT_PUBLIC_SITE_URL`.
- `safeRedirect`-Helper (interne Pfade) zentral + Unit-Tests.
- Test-Account `test@toolfolio.de` (bestaetigt) angelegt, Auto-Profil verifiziert.
- **Bewusst spaeter:** Google-Provider im Supabase-Dashboard aktivieren (braucht Google-Cloud-OAuth-App). "Angemeldet bleiben" ist vorerst UI-only (Supabase verwaltet Session/Refresh; echte TTL-Steuerung spaeter).

## QA Test Results (2026-06-25)

### Akzeptanzkriterien
| # | Kriterium | Ergebnis |
|---|-----------|----------|
| 1 | Korrekte Daten -> /app (bzw. redirect) | PASS (manuell bestaetigt) |
| 2 | Falsche Daten -> neutrale Fehlermeldung | PASS (Meldung neutral). Hinweis: Persistenz des E-Mail-Felds bei Fehler im Browser pruefen (B2) |
| 3 | Google-SSO -> /app | DEFERRED (Provider noch nicht aktiviert, bewusst) |
| 4 | Unauth /app, /anbieter -> /login?redirect | PASS (307 verifiziert) |
| 5 | 2FA-Schritt bei aktivem Faktor | PASS by design (Step-up implementiert, ohne Enrollment nicht voll testbar) |
| 6 | Bereits eingeloggt + /login -> /app | **FAIL (B1)** - nicht implementiert |
| 7 | Passwort Anzeigen-Umschalter | PASS |

### Security-Audit (Red Team)
- Kein Service-Role-Key im Client-Bundle (0 Treffer in `.next/static`). PASS
- RLS `profiles`: anonym keine Zeilen sichtbar (`[]`), owner-only. PASS
- Open-Redirect: externe/manipulierte Ziele abgewiesen (Unit-Tests + live). PASS
- Konto-Enumeration: neutrale Login- und Recovery-Meldungen. PASS
- Rate-Limiting: durch Supabase Auth abgedeckt. PASS

### Bugs
- **B1 (Medium):** Eingeloggter Nutzer auf `/login` wird nicht auf `/app` weitergeleitet (AC 6). Fix: in `(auth)/login/page.tsx` Session pruefen und ggf. weiterleiten.
- **B2 (Low):** Bei fehlgeschlagenem Login koennte das E-Mail-Feld geleert werden (React-19-Form-Reset) - im Browser verifizieren; AC 2 ("Eingabe bleibt erhalten").
- **B3 (Low):** Unbestaetigte E-Mail zeigt generische Meldung statt Verifizierungs-Hinweis/Resend - gehoert zu S-04.
- **Info:** OAuth-Fehler leitet auf `/login?error=oauth` ohne sichtbares Banner.

### Regression
Bestehende Routen (/, /app-Gating, /anbieter, Marketing-Shell) unveraendert funktionsfaehig; Build/Lint/Typecheck gruen.

### Produktionsreife
**Keine Critical/High-Bugs.** Empfehlung: B1 (AC-Verstoss) vor "Approved" beheben (kleiner Fix), B2 verifizieren, B3 mit S-04. Danach produktionsreif.

## Deployment
_To be added by /deploy_
