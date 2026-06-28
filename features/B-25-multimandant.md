# B-25: Mehrere Gesellschaften / Mandanten (Multi-Mandant)

## Status: Approved & Deployed (Inkrement 1-3)
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

## Inkrement 3 (deployed 2026-06-27)
- [x] Read-Only-Klarheit fuer Mitglieder: Layout leitet `readOnly = aktiveRolle === "member"` ab (Owner/Admin duerfen schreiben). App-weiter `ReadOnlyProvider` + `useReadOnly()`-Hook (`components/app/read-only-context.tsx`).
- [x] Deutlicher „Nur-Ansicht"-Banner unter dem Header (`components/app/read-only-banner.tsx`), nur fuer reine Mitglieder, setzt die Erwartung bevor serverseitig blockiert wird.
- [x] Konto-Umschalter zeigt je Konto bereits die Rolle (Admin/Mitglied) als Badge.
- [x] Build gruen (tsc/next build/17 Tests).

## Inkrement 4 (deployed 2026-06-28): Member-CTAs ausgeblendet
- [x] Zentraler Helfer `WennSchreibbar` (`read-only-context.tsx`) rendert Kinder nur bei Schreibrecht. Die primaeren „Hinzufuegen/Anlegen"-CTAs der Hauptlisten (Abos inkl. Import, Kunden, Zahlungskanaele, Zugaenge/Personen, AI-Dienste, Archiv-Dokumente, Freigabe-Antrag) sind fuer reine Mitglieder ausgeblendet. Zusammen mit dem Nur-Ansicht-Banner (Inkr. 3) ist die Member-UX damit klar.
- Bewusst NICHT gegated: einzelne Zeilen-Edit/-Loesch-Controls und Detail-Formulare — die bleiben serverseitig (RLS + Action-Guards) sicher geblockt; das flaechige Ausblenden waere reine Kosmetik ohne Sicherheitsgewinn.
- Per-Nutzer-Status (sparvorschlag_status, benachrichtigung_status) und Onboarding (profiles.onboarded_at) bleiben bewusst user-scoped (`user.id`), kontoweit nicht geteilt.

## Status: B-25 vollstaendig (Inkr. 1-4). Keine offenen Punkte.

## QA
- 2026-06-27 (Inkr. 1): Build gruen. Multi-Mandant-RLS empirisch (6 Faelle) korrekt.
- 2026-06-27 (Inkr. 2): Build gruen (tsc/next build/17 Tests). Statischer Scan: 0 ungefilterte Konto-Reads verbleibend. Owner-Verhalten unveraendert (aktivesKonto=self).
- 2026-06-27 (Inkr. 3): Build gruen (tsc/next build/17 Tests). Nur-Ansicht-Banner erscheint fuer Member, nicht fuer Owner/Admin.
