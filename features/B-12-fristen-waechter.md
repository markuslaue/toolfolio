# B-12: Fristen- & Trial-Waechter (deutscher USP)

## Status: Approved & Deployed (In-App). E-Mail-Warnungen (E-02/E-03) offen bis Resend (E-01).
**Created:** 2026-06-25
**Projekt:** PRJ-08 (Fristen & Benachrichtigung)

## Dependencies
- Requires: B-05/B-04 (abos mit Frist-/Trial-Feldern), B-07 (Kartenablauf), S-01.
- Folge: E-02 (Fristen-Mail), E-03 (Trial-Mail) - brauchen Resend (E-01, externer API-Key).

## User Stories
- Als Nutzer moechte ich an einem Ort alle Kuendigungsfristen, Trial-Enden und ablaufenden Karten sehen, nach Dringlichkeit sortiert.
- Als Nutzer moechte ich eine Frist als erledigt markieren, damit der Waechter sie nicht erneut zeigt.
- Als Nutzer moechte ich von einer Frist direkt zum betroffenen Abo/Kanal springen.

## Acceptance Criteria
- [x] Fristen werden aus echten Daten abgeleitet: Trial-Ende und letzter Kuendigungstermin (Abos), Kartenablauf (Kanaele).
- [x] Gruppierung nach Dringlichkeit: ueberfaellig / naechste 7 Tage / naechste 30 Tage / spaeter.
- [x] KPI: offene Fristen gesamt + davon dringend (ueberfaellig oder <=7 Tage).
- [x] Je Frist: Titel, Art-Label, Datum + "in X Tagen", Konsequenz-Text, "Erledigt" + "Oeffnen".
- [x] "Erledigt" persistiert (frist_quittungen, idempotenter Upsert) und blendet die Frist aus.
- [x] Leerzustand "alles im gruenen Bereich".
- [x] Sidebar-Eintrag "Fristen". Dashboard-Aktions-Center und Listen-Hinweis bleiben konsistent.
- [x] Nur eigene Daten (RLS owner-only auf abos/kanaele/quittungen).

## Out of Scope (bis Resend)
- E-Mail-Warnungen vor Fristen (E-02) und Trial-Ende (E-03): brauchen Resend-API-Key (E-01). In-App-Waechter ist unabhaengig davon vollstaendig.
- Kalenderansicht/ICS-Export (spaeter).

## Decision Log
### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Fristen ableiten statt materialisieren | abos/kanaele sind die einzige Wahrheit; keine Sync-Probleme | 2026-06-25 |
| frist_quittungen mit Unique (user,quelle_id,art,datum) + Upsert | "erledigt" idempotent, kein Doppel; Frist bleibt ableitbar | 2026-06-25 |
| Kartenablauf = letzter Tag des Ablaufmonats | korrekte Faelligkeit | 2026-06-25 |

---

## Tech Design
```
/app/fristen (Server: abos + kanaele + quittungen -> deriveFristen, quittierte raus) -> FristenWaechter (client)
+-- KPI (offen, dringend)
+-- Gruppen nach Dringlichkeit -> Frist-Karten (Art-Icon, Konsequenz, Erledigt, Oeffnen)
+-- Leerzustand
```
src/lib/fristen.ts: deriveFristen + dringlichkeit/tageBis. Tabelle frist_quittungen (RLS owner-only). Actions: quittiereFrist (Upsert), widerrufeFrist.

## QA Test Results (2026-06-25)
- Akzeptanzkriterien per Code-Review + Build gruen (tsc/ESLint/next build; /app/fristen).
- Schema: Quittung-Insert 201, Upsert-Merge 200 (Status aktualisiert, ein Datensatz), Unique haelt. PASS
- Security: alle Quellen RLS owner-only; Quittung an user_id gebunden. PASS
- Ableitung deterministisch; ueberfaellige bis -7 Tage bleiben sichtbar (nicht sofort weg). PASS
- **APPROVED (In-App)** - keine Critical/High. E-Mail-Teil bewusst offen bis Resend.

## Deployment
Via rsync + docker compose Rebuild auf VPS B.
