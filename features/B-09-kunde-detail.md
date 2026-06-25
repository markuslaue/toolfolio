# B-09: Kunde-Detailseite (Weiterverrechnung, Marge)

## Status: Approved & Deployed
**Created:** 2026-06-25
**Projekt:** PRJ-07 (Tracker-Datenkern)

## Dependencies
- Requires: B-08 (Kunden), B-05 (Abos), S-01.

## User Stories
- Als Agentur moechte ich pro Kunde alle zugeordneten Abos, die Gesamtkosten und meine Marge sehen.
- Als Agentur moechte ich Kundenstammdaten und Weiterverrechnung von hier aus bearbeiten/loeschen.

## Acceptance Criteria
- [x] Klick auf einen Kunden in der Liste oeffnet /app/kunden/[id].
- [x] Header: Avatar/Farbe, Name, Ansprechpartner, E-Mail (mailto), Status, Weiterverrechnungs-Badge.
- [x] KPIs: zugeordnete Abos, Kosten/Monat (ohne Aufschlag), Marge/Monat (+ weiterverrechneter Betrag) bzw. "Weiterverrechnung aus".
- [x] Liste der zugeordneten Abos (Match ueber Namen), je Eintrag Link zur Abo-Detailseite.
- [x] Bearbeiten (geteilter KundeDialog) und Loeschen (mit Rueckfrage, danach zurueck zur Liste).
- [x] Fremder/unbekannter Kunde -> 404 (RLS + .eq user_id).

## Out of Scope
- Pro-Abo-Override der Weiterverrechnung (spaeter). Weiterverrechnungs-Report/Export ist B-17.

## Decision Log
### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| KundeDialog in eigene Komponente extrahiert | Liste und Detail teilen dieselbe Bearbeiten-Maske, kein Duplikat | 2026-06-25 |
| Marge = Kosten x Aufschlag%, weiterverrechnet = Kosten x (1+Aufschlag%) | klare, nachvollziehbare Agentur-Kennzahlen | 2026-06-25 |

---

## Tech Design
```
/app/kunden/[id] (Server: kunde + abos per Namensmatch, 404 sonst) -> KundeDetail (client)
+-- Zurueck, Header (Bearbeiten/Loeschen)
+-- KPIs (Abos, Kosten/Monat, Marge/Monat)
+-- Liste zugeordneter Abos -> Abo-Detail
+-- KundeDialog (bearbeiten), Loesch-Dialog
```
Keine Schemaaenderung. KundenClient nutzt jetzt denselben KundeDialog; Karten navigieren zur Detailseite.

## QA Test Results (2026-06-25)
- Akzeptanzkriterien per Code-Review + Build gruen (tsc/ESLint/next build; Routen /app/kunden, /app/kunden/[id]).
- Security: kunde und abos owner-gebunden (RLS, .eq user_id); fremder Kunde -> notFound. PASS
- Marge-/Weiterverrechnungs-Rechnung deterministisch aus echten Abos. PASS
- **APPROVED** - keine Critical/High. Damit ist der Agentur-Layer (Kunden Liste + Detail) rund.

## Deployment
Via rsync + docker compose Rebuild auf VPS B.
