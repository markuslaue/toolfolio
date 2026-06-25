# B-05: Abo anlegen/bearbeiten (Slide-over, Verzeichnis-Verknuepfung)

## Status: Architected
**Created:** 2026-06-25
**Last Updated:** 2026-06-25
**Projekt:** PRJ-07 (Tracker-Datenkern / Abos)

## Dependencies
- Requires: INFRA-1 (Supabase, profiles), S-01 (Session/Auth + App-Shell)
- Etabliert: Das `abos`-Schema, auf dem der ganze Tracker aufbaut (B-03 Liste, B-04 Detail, B-01 Dashboard, B-12 Fristen, B-17 Berichte ...).
- Spaeter verknuepft: B-07 (Zahlungskanaele), B-08 (Kunden), B-15 (Verzeichnis) - hier zunaechst als Text/Flag.

## User Stories
- Als Nutzer moechte ich ein Software-Abo mit Kosten, Intervall und naechster Abbuchung anlegen, damit meine Ausgaben erfasst sind.
- Als Nutzer moechte ich einem Abo Kategorie, Zahlungskanal, Kunde, Status und Tags geben, damit ich es einordnen kann.
- Als Nutzer moechte ich Kuendigungsfrist und Trial-Ende hinterlegen, damit der Fristen-Waechter spaeter greift.
- Als Nutzer moechte ich ein Abo bearbeiten und loeschen koennen.
- Als Agentur moechte ich ein Abo als weiterverrechenbar mit Aufschlag markieren.

## Out of Scope
- Reiche Listenansicht mit Filtern/Gruppierung/Bulk (B-03) - hier nur eine schlanke Karten-Liste als Einstieg.
- Echte Zahlungskanal-/Kunden-Verwaltung (B-07/B-08) - hier Freitext bzw. einfache Auswahl.
- Echtes Verzeichnis + Katalog-Suche (V-/B-15) - hier manuelle Toolanlage + Flag "mit Verzeichnis verknuepft".
- Kontoauszug-Import (B-06), Fristen-Benachrichtigungen (B-12, E-02/03).

## Acceptance Criteria
- [ ] Angenommen die Abo-Seite, wenn der Nutzer "Abo hinzufuegen" klickt, dann oeffnet sich ein Slide-over mit dem Formular.
- [ ] Angenommen das Formular, wenn Toolname, Betrag (> 0) und Intervall gesetzt sind und der Nutzer speichert, dann wird das Abo angelegt, das Slide-over schliesst und das Abo erscheint in der Liste.
- [ ] Angenommen fehlende Pflichtfelder, wenn der Nutzer speichert, dann erscheinen Feldfehler und es wird nichts gespeichert.
- [ ] Angenommen ein bestehendes Abo, wenn der Nutzer es oeffnet, aendert und speichert, dann sind die Aenderungen persistiert.
- [ ] Angenommen ein bestehendes Abo, wenn der Nutzer es loescht (mit Rueckfrage), dann ist es entfernt.
- [ ] Angenommen Trial/Frist-Felder, wenn gesetzt, dann werden sie gespeichert (Basis fuer B-12).
- [ ] Angenommen ein anderer Nutzer, dann sieht er die Abos nicht (RLS, Eigentuemer-getrennt).

## Edge Cases
- Betrag mit Komma/Punkt: deutsches Format akzeptieren, als Dezimalzahl speichern.
- Schliessen mit ungespeicherten Aenderungen: Rueckfrage.
- Waehrung USD: speichern, Umrechnung/Anzeige ist nicht Teil von B-05.
- Auto-Verlaengerung aus -> Frist-Felder optional.

## Technical Requirements
- Tabelle `abos` (Eigentuemer-gebunden, RLS owner-only) mit allen Formularfeldern.
- Server Actions: createAbo, updateAbo, deleteAbo - Zod-validiert, Session-gepflegt.
- Slide-over via shadcn `sheet`; zusaetzlich `textarea`, `alert-dialog`.
- Geschaeftskonstanten (Kategorien, Intervalle, Status, Frist-Einheiten, Waehrungen) zentral.

## Open Questions
- [x] Kunde/Zahlungskanal jetzt als FK? -> Nein, vorerst Text; FK mit B-07/B-08.
- [x] Katalog-Suche/Verzeichnis jetzt? -> Nein, manuelle Anlage + Flag; echtes Verzeichnis spaeter.
- [x] Eigene Liste in B-05? -> Schlanke Karten-Liste als Einstieg; reiche Liste ist B-03.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Volles abos-Schema sofort modellieren | Fundament fuer viele Folge-Features; spaeteres Nachruesten teurer | 2026-06-25 |
| Kunde/Zahlungskanal zunaechst Text | B-07/B-08 noch nicht gebaut; klarer Migrationspfad zu FKs | 2026-06-25 |
| Schlanke Liste statt voller B-03-Liste | B-05 soll end-to-end testbar sein, ohne B-03 vorzuziehen | 2026-06-25 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Ein abos-Datensatz pro Abo, tags als text[] | einfache, abfragbare Struktur; keine Tag-Tabelle noetig | 2026-06-25 |
| Betraege als numeric(12,2) | exakte Geldbetraege, keine Float-Fehler | 2026-06-25 |
| Server Actions statt REST-Route | Formular-naeher, konsistent mit Auth/Einstellungen | 2026-06-25 |

---

## Tech Design (Solution Architect)

### Komponentenstruktur
```
/app/abos (Seite)
+-- Kopf: Titel + "Abo hinzufuegen" (oeffnet Slide-over)
+-- Karten-Liste der eigenen Abos (Tool, Kategorie-Farbe, Kosten/Intervall, Status, naechste Abbuchung)
|   +-- Klick auf Karte -> Slide-over im Bearbeiten-Modus
+-- Leerzustand, wenn noch kein Abo

AboFormPanel (Slide-over, client)
+-- Tool & Kategorie (manuelle Anlage, Farbe/Initiale abgeleitet, Flag "mit Verzeichnis verknuepft")
+-- Kosten (Betrag, Waehrung, Intervall)
+-- Abbuchung (naechste Abbuchung, Zahlungskanal)
+-- Zuordnung (Kunde, Status, Tags)
+-- Weiterverrechnung (Schalter + Aufschlag %)
+-- Vertrag & Frist (Abo seit, Auto-Verlaengerung, Frist-Wert/-Einheit, Erinnerung, Trial-Ende)
+-- Notizen (Notiz, Konto-E-Mail, Login-Verweis)
+-- Aktionen: Speichern, (Bearbeiten:) Loeschen mit Rueckfrage, Schliessen mit Dirty-Rueckfrage
```

### Datenmodell (Klartext)
Tabelle `abos`, jede Zeile gehoert genau einem Nutzer (user_id):
- Tool: tool, anbieter, initial, farbe, kategorie, mit_verzeichnis (Flag)
- Kosten: kosten (numeric), waehrung (EUR/USD), intervall (monatlich/quartalsweise/jaehrlich)
- Abbuchung: naechste_abbuchung (Datum), zahlungskanal (Text)
- Zuordnung: kunde (Text), status (aktiv/Trial/pausiert/gekuendigt/archiviert), tags (Text-Liste)
- Agentur: weiterverrechnen (Flag), aufschlag_prozent (numeric)
- Vertrag/Frist: abo_seit, auto_verlaengerung, frist_wert, frist_einheit (Tage/Wochen/Monate), letzter_kuendigungstermin, erinnerung, trial_endet
- Notizen: notizen, konto_email, login_verweis
- Meta: created_at, updated_at

RLS: nur Eigentuemer darf select/insert/update/delete (auth.uid() = user_id).

### Tech-Entscheidungen (warum)
- Praeferenz Text statt FK fuer Kunde/Kanal: entkoppelt B-05 von B-07/B-08, Migration zu FKs spaeter trivial.
- Geld als numeric(12,2): exakte Betraege.
- tags als Array-Spalte: ausreichend, kein Mehrtabellen-Overhead.

### Abhaengigkeiten (Pakete)
- shadcn/ui: sheet, textarea, alert-dialog (Rest bereits vorhanden)

## QA Test Results (2026-06-25)

### Akzeptanzkriterien
| # | Kriterium | Ergebnis |
|---|-----------|----------|
| 1 | "Abo hinzufuegen" oeffnet Slide-over | PASS (AbosClient -> AboFormPanel/Sheet) |
| 2 | Pflichtfelder ok -> Abo angelegt, Panel schliesst, in Liste | PASS (createAbo -> Insert verifiziert, revalidate + router.refresh) |
| 3 | Fehlende Pflichtfelder -> Feldfehler, nichts gespeichert | PASS (Zod fieldErrors fuer tool/kategorie/kosten/intervall) |
| 4 | Bestehendes Abo bearbeiten -> persistiert | PASS (updateAbo -> Update verifiziert, updated_at-Trigger) |
| 5 | Loeschen mit Rueckfrage | PASS (AlertDialog -> deleteAbo, Delete 204 verifiziert) |
| 6 | Trial-/Frist-Felder gespeichert | PASS (Spalten verifiziert) |
| 7 | RLS: anderer Nutzer sieht Abos nicht | PASS (owner-only Policies fuer alle vier Operationen) |

### Security & Robustheit
- RLS auf abos: select/insert/update/delete nur fuer auth.uid() = user_id. PASS
- Server-Actions pruefen die Session und filtern zusaetzlich .eq("user_id"). PASS
- Zod-Validierung aller Felder; Enums zusaetzlich per DB-Check-Constraint erzwungen (ungueltiges Intervall -> 23514). PASS
- Betrag deutsches Format -> exakte numeric(12,2); kein Float-Fehler. PASS
- Dirty-Close-Schutz (Rueckfrage bei ungespeicherten Aenderungen). PASS
- Kein Secret im Client; nur eigene Daten ueber die authentifizierte Session.

### Build & Daten
- tsc/ESLint/next build gruen; Route /app/abos erzeugt.
- Schema gegen die Action-Payload getestet: Voll-Insert, Update (Trigger), Delete, Constraint-Verletzung - alle wie erwartet.

### Produktionsreife
**APPROVED** - keine Critical/High. Das abos-Fundament steht fuer B-03 (Liste), B-04 (Detail), B-01 (Dashboard), B-12 (Fristen).

## Deployment
_To be added by /deploy_
