# B-08: Kunden-Listenansicht (Agentur-Layer)

## Status: Approved & Deployed
**Created:** 2026-06-25
**Projekt:** PRJ-07 (Tracker-Datenkern)

## Dependencies
- Requires: S-01. Verbindet sich mit Abos (abos.kunde per Name).

## User Stories
- Als Agentur moechte ich meine Kunden anlegen und sehen, wie viele Abos und welche Monatskosten ihnen zugeordnet sind.
- Als Agentur moechte ich pro Kunde Weiterverrechnung und Standard-Aufschlag hinterlegen.

## Acceptance Criteria
- [x] Liste der eigenen Kunden als Karten (Avatar/Farbe, Name, Kontakt, Status, Weiterverrechnung, Abo-Anzahl, Monatskosten).
- [x] Kennzahlen (Abo-Anzahl, Monatskosten) werden aus den Abos abgeleitet (Match ueber den Namen).
- [x] Anlegen/Bearbeiten per Dialog (Name, Ansprechpartner, E-Mail, Farbe, Status, Weiterverrechnung + Aufschlag, Notiz).
- [x] Loeschen mit Rueckfrage; zugeordnete Abos behalten ihren Text-Eintrag.
- [x] Nur eigene Kunden sichtbar/aenderbar (RLS owner-only).
- [x] Das Abo-Formular bietet die Kunden (und Zahlungskanaele aus B-07) als Auswahl an (Datalist, Freitext bleibt moeglich).

## Out of Scope
- Kunde-Detailseite mit Marge/Weiterverrechnungs-Report (B-09).
- Harte FK abos.kunde -> kunden.id (spaeter; aktuell Name-Match).

## Decision Log
### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Kennzahlen aus Abos per Name-Match statt FK | abos.kunde ist noch Text; FK-Migration spaeter | 2026-06-25 |
| Kanal-/Kunden-Auswahl im Abo-Formular via Datalist | gebuendelte Integration B-05/B-07/B-08 ohne harte FK, Freitext bleibt | 2026-06-25 |

---

## Tech Design
```
/app/kunden (Server laedt kunden + abos -> Kennzahlen) -> KundenClient
+-- Kopf + "Kunde hinzufuegen"
+-- Karten (Avatar/Farbe, Name, Kontakt, Status, Weiterverrechnung, Abos + Monatskosten)
+-- Anlegen/Bearbeiten-Dialog (mit Farbwahl), Loesch-Dialog
```
Tabelle `kunden` (owner, RLS owner-only). Actions create/update/deleteKunde (Zod).
Integration: src/lib/abo-optionen.ts laedt Kanal-Labels + Kundennamen; /app/abos und /app/abos/[id] reichen sie ans AboFormPanel.

## QA Test Results (2026-06-25)
- Akzeptanzkriterien per Code-Review + Build gruen (tsc/ESLint/next build; Routen /app/kunden, /app/abos*).
- Security: RLS owner-only; E-Mail Zod-validiert; nur eigene Daten. PASS
- Kennzahlen-Ableitung deterministisch aus den eigenen Abos. PASS
- **APPROVED** - keine Critical/High.

## Deployment
Via rsync + docker compose Rebuild auf VPS B.
