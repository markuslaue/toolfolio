# B-25: Mehrere Gesellschaften / Mandanten (Multi-Mandant)

## Status: In Bau (Inkrement 2 deployed)
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

## Inkrement 2 (deployed 2026-06-27)
Alle verbleibenden Konto-Strecken aufs aktive Konto umgestellt, sodass ein Mitglied beim Kontowechsel strikt nur die Daten des aktiven Kontos sieht und (je Rolle) bearbeitet, statt einer zusammengefuehrten Sicht.
- [x] Actions: kunden, zahlungskanaele, fristen, ai-credits, zugaenge, freigaben, archiv, seats, einstellungen/saveUnternehmen schreiben/scopen jetzt mit `user_id = aktivesKonto` (Helper liefert zusaetzlich `account`, Guard `!user || !account`).
- [x] Seiten: dashboard (app/page), kunden (+ kunde-detail [id]), zahlungskanaele, fristen, ai-credits, seats, zugaenge, steuer, freigaben, berichte, budget, sparen, benachrichtigungen, archiv, abo-detail [id], abos/import, einstellungen/unternehmen filtern aufs aktive Konto.
- [x] Bisher rein per RLS gefilterte Reads (ungefilterte `select` auf Konto-Tabellen) explizit auf `user_id = aktivesKonto` gezogen, damit Mitglieder mit Zugriff auf mehrere Konten keine zusammengefuehrte Sicht mehr bekommen (dashboard, kunden, fristen, berichte, abos/import, abo-optionen, ladeAboOptionen).
- [x] DSGVO-Export (`einstellungen/daten`) bleibt bewusst aufs **eigene** Konto (`user.id`) gescoped, nicht aufs aktive: ein Mitglied darf keine fremden Kontodaten exportieren.
- [x] Build gruen (tsc 0 Fehler, next build, 17 Vitest-Tests). Keine neue Migration noetig (reine App-Layer-Arbeit).

## Offen (Folge-Inkremente)
- [ ] Per-Nutzer-Status (sparvorschlag_status, benachrichtigung_status) bleibt user-scoped (`user.id`): bewusst persoenliche Markierungen, nicht kontoweit geteilt. Bei Bedarf spaeter pruefen.
- [ ] Onboarding ist nutzer-eigen (profiles.onboarded_at, `user.id`) und bewusst nicht umgestellt.
- [ ] Rolle/aktives Konto im UI deutlicher kennzeichnen (z. B. „Nur-Ansicht"-Hinweis fuer Member), Edit-Controls fuer Member ausblenden statt nur serverseitig zu blocken.

## QA
- 2026-06-27 (Inkr. 1): Build gruen. Multi-Mandant-RLS empirisch (6 Faelle) korrekt.
- 2026-06-27 (Inkr. 2): Build gruen (tsc/next build/17 Tests). Statischer Scan: 0 ungefilterte Konto-Reads verbleibend. Owner-Verhalten unveraendert (aktivesKonto=self).
