# B-27: Einstellungen - Unternehmen

## Status: Approved & Deployed
**Projekt:** PRJ-06 (Einstellungen) · **Created:** 2026-06-26

## Dependencies
- Requires: B-26 (Einstellungen-Huelle), S-01. Lovable hatte hier nur Platzhalter -> echte Neuentwicklung.

## Acceptance Criteria
- [x] /app/einstellungen/unternehmen: Formular (Firmenname, Strasse, PLZ, Ort, Land, USt-IdNr., Steuernummer).
- [x] Daten werden gespeichert (Upsert je Nutzer, Tabelle unternehmen, RLS owner-only) und nach Reload vorbefuellt.
- [x] Nur eigene Daten (RLS).

## Out of Scope
- Logo-Upload (Storage), mehrere Gesellschaften/Mandanten (eigenes Feature).

## Tech Design
Tabelle `unternehmen` (user_id unique, RLS owner-only, touch-Trigger). Action saveUnternehmen (Zod, Upsert onConflict user_id). Seite laedt Zeile serverseitig.

## QA (2026-06-26)
- Build gruen (tsc/ESLint/next build), Route /app/einstellungen/unternehmen. Migration angewandt.
- Security: Upsert nur eigene Zeile (RLS + user_id). PASS. **APPROVED**.
