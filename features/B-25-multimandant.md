# B-25: Mehrere Gesellschaften / Mandanten (Multi-Mandant)

## Status: In Bau (Inkrement 1 deployed)
**Projekt:** PRJ (Tracker) · **Bereich:** B · **Created:** 2026-06-27 · **Prio:** P2 · **Abhaengig von:** B-30

## Ziel
Team-Mitglieder koennen Konto-Daten nicht nur sehen (B-30), sondern je Rolle auch bearbeiten. Nutzer koennen zwischen ihrem eigenen Konto und Konten, in denen sie Mitglied sind, wechseln.

## Design (minimal-invasiv)
- **Kein neuer tenant_id auf jeder Tabelle**: `user_id` = Konto-/Mandanten-ID (= Owner). Keine Backfills.
- **Lesen** = `has_account_access(user_id)` (jedes Mitglied). **Schreiben** = `has_admin_access(user_id)` (Owner ODER Admin; Member = Nur-Ansicht).
- **Aktives Konto** per Cookie (`tf_account`), serverseitig validiert; Default eigenes Konto. Inserts setzen `user_id = aktivesKonto`, Seiten filtern darauf.
- **Rueckwaertskompatibel**: fuer Solo-Owner ist aktivesKonto = self -> keine Verhaltensaenderung.

## Inkrement 1 (deployed 2026-06-27)
- [x] Schreib-RLS aller Konto-Tabellen auf `has_admin_access` (abos, kunden, zahlungskanaele, unternehmen, frist_quittungen, personen, tool_zugang, freigabe_antrag, ai_services, ai_spend, dokumente). Dokumente-Lesen auf Konto erweitert.
- [x] `lib/active-account.ts` (getActiveAccount + listAccounts), `switchAccount`-Action (Cookie), Konto-Umschalter im App-Header (nur sichtbar bei >1 Konto).
- [x] Abos-Strecke vollstaendig: Seite filtert aufs aktive Konto, Actions schreiben mit `user_id = aktivesKonto`.
- [x] Empirisch verifiziert: Owner schreibt, Admin-Mitglied schreibt im Konto, Member nur lesen (blockiert 42501), Fremde komplett blockiert/leer.

## Offen (Folge-Inkremente)
- [ ] Restliche Seiten + Actions aufs aktive Konto umstellen (kunden, zahlungskanaele, kunde-detail, unternehmen, fristen, sparen, ai-credits, budget, berichte, steuer, archiv, benachrichtigungen, zugaenge, seats, freigaben, dashboard, onboarding, abo-detail/[id]). Aktuell laufen diese fuer den Owner unveraendert (aktivesKonto=self); fuer Mitglieder zeigen sie noch die zusammengefuehrte Sicht statt strikt das aktive Konto.
- [ ] abo-optionen (Kanal-/Kunden-Dropdowns) aufs aktive Konto.
- [ ] Per-Nutzer-Status (sparvorschlag_status, benachrichtigung_status) bleibt vorerst kontoscoped (owner).

## QA (2026-06-27)
- Build gruen (tsc/ESLint/next build). Multi-Mandant-RLS empirisch (6 Faelle) korrekt.
