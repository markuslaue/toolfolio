# B-31: Einstellungen - Daten & Datenschutz

## Status: Approved & Deployed
**Projekt:** PRJ-06 (Einstellungen) · **Created:** 2026-06-26

## Dependencies
- Requires: B-26 (Huelle), S-01. Lovable nur Platzhalter -> Neuentwicklung.

## Acceptance Criteria
- [x] /app/einstellungen/daten: Datenexport als JSON (Auskunft + Portabilitaet, DSGVO).
- [x] Export enthaelt Profil, Unternehmen, Abos, Kunden, Zahlungskanaele, Frist-Quittungen, Benachrichtigungs-Log (nur eigene Daten, RLS).
- [x] Konto-Loeschung mit Tippbestaetigung ("LOESCHEN"); loescht Auth-Nutzer -> alle Tabellen via FK on delete cascade; danach Logout + Redirect /.
- [x] Sicherheitshinweis (keine vollstaendigen Kartennummern/Passwoerter).

## Tech Design
Actions: exportData (nutzergebundener Client, RLS -> JSON), deleteAccount (Service-Role admin.deleteUser der eigenen id; signOut). Loesch-Cascade ueber bestehende FKs auf auth.users.

## QA (2026-06-26)
- Build gruen (tsc/ESLint/next build), Route /app/einstellungen/daten.
- Security: Export nur eigene Zeilen (RLS); Loeschung nur der eigenen Session-id; Tippbestaetigung gegen Versehen. PASS. **APPROVED**.
