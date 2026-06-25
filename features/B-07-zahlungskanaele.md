# B-07: Zahlungskanaele-Verwaltung (nur Referenzen, keine Secrets)

## Status: Approved & Deployed
**Created:** 2026-06-25
**Projekt:** PRJ-07 (Tracker-Datenkern)

## Dependencies
- Requires: S-01 (Session/App-Shell). Wird von Abos referenziert (Text -> spaeter Auswahl).

## User Stories
- Als Nutzer moechte ich meine Zahlungsmittel (Karte, SEPA, PayPal, Stripe, ...) als Referenz verwalten.
- Als Nutzer moechte ich sehen, welche Karte bald ablaeuft.

## Sicherheitsleitplanke (nicht verhandelbar)
- NIEMALS vollstaendige Kartennummern, Pruefziffern oder IBAN. Nur Typ, Anbieter, letzte vier Ziffern (last4/iban_last4), Ablauf, Inhaber. Per DB-Check-Constraint erzwungen (`^[0-9]{4}$`).

## Acceptance Criteria
- [x] Liste der eigenen Kanaele als Karten mit Typ-Icon, Label ("Visa •••• 4821"), Status.
- [x] Anlegen/Bearbeiten per Dialog, Felder je nach Typ (Karte: Anbieter/last4/Ablauf/Inhaber; SEPA: iban_last4/Inhaber).
- [x] Loeschen mit Rueckfrage.
- [x] Status aus Ablauf abgeleitet (aktiv / laeuft bald ab / abgelaufen / inaktiv).
- [x] Nur eigene Kanaele sichtbar/aenderbar (RLS owner-only).
- [x] Eingabe begrenzt auf vier Ziffern; ungueltige Werte serverseitig (Zod) und per DB-Constraint abgelehnt.

## Out of Scope
- Echte Bankanbindung/PSD2 (spaeter, DSE). Automatischer Abgleich mit Abbuchungen (B-06).
- FK-Verknuepfung abos.zahlungskanal -> hier noch Text; Auswahl-Integration in das Abo-Formular folgt gebuendelt mit B-08.

## Decision Log
### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Nur last4 + Constraint statt voller Nummern | Sicherheitsleitplanke; PCI-Risiko vermeiden | 2026-06-25 |
| Status aus Ablauf abgeleitet statt gespeichert | immer aktuell, keine Pflege noetig | 2026-06-25 |
| Verwaltung per Dialog (nicht Slide-over) | wenige Felder, schnelle Eingabe | 2026-06-25 |

---

## Tech Design
```
/app/zahlungskanaele (Server laedt eigene Kanaele) -> ZahlungskanaeleClient
+-- Kopf + "Kanal hinzufuegen" + Sicherheitshinweis-Banner
+-- Karten-Raster (Typ-Icon, Label, Status, Ablauf, Inhaber, Aktions-Menue)
+-- Anlegen/Bearbeiten-Dialog (typabhaengige Felder), Loesch-Dialog
```
Tabelle `zahlungskanaele` (owner, RLS owner-only, last4/iban_last4 Check `^[0-9]{4}$`). Actions: createKanal/updateKanal/deleteKanal (Zod).

## QA Test Results (2026-06-25)
- Akzeptanzkriterien per Code-Review + Build gruen (tsc/ESLint/next build, Route /app/zahlungskanaele).
- Schema verifiziert: gueltiger Insert ok; last4 mit 5 Ziffern -> 400 (Constraint). PASS
- Security: keine Secrets, nur Referenzen; RLS owner-only; Eingabe client- und serverseitig auf vier Ziffern begrenzt. PASS
- **APPROVED** - keine Critical/High.

## Deployment
Via rsync + docker compose Rebuild auf VPS B.
