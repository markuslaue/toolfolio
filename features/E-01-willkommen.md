# E-01: Willkommens-Mail

## Status: In Review
**Projekt:** PRJ (E-Mail) · **Bereich:** E · **Created:** 2026-06-26 · **Prio:** P1 · **Abhaengig von:** S-02

## Acceptance Criteria
- [x] Einmalige Willkommens-Mail nach erster Anmeldung/Verifizierung (Auth-Callback), per `welcome_sent_at` entduppelt.
- [x] Bestehende Nutzer erhalten KEIN nachtraegliches Willkommen (Backfill welcome_sent_at = now()).
- [x] Best effort: Mailversand blockiert den Login nie (try/catch).
- [x] Layout im Toolfolio-Stil (table-basierter Header, Du-Form, Umlaute), CTA zum Dashboard, Startschritte.

## Tech Design
- `profiles.welcome_sent_at` (Migration). Trigger im `auth/callback` nach `exchangeCodeForSession`; Vorlage `willkommen()` in email-templates.ts; Versand via Resend.

## QA (2026-06-26)
- Build gruen. Versand best-effort, einmalig. Render-Test an markus.laue@ommm.de.
