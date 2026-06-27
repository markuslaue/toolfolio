# Feature-Map (INDEX) - Toolfolio

> Die Feature-Map, die die Skills lesen. Detaillierte Beschreibung jedes Templates: `FEATURES.md` und `docs/blueprint/`. Phasen-Definition: `PROJECT.md` §12.
> **ID-Schema:** B (Tracker), M (Marketing), V (Verzeichnis), AD (Admin/Redaktion-CMS), A (Anbieter/Marktplatz), S (Auth), E (E-Mail), R (Recht), F (uebergreifend/Datenwert), INFRA (Fundament). Spec-Dateien: `features/<ID>-kurzname.md`.
> **Prioritaet:** P0 = MVP (Phase 1), P1 = Phase 2, P2 = Phase 3, P3 = Phase 4/5.
> **Status:** Roadmap -> Planned (nach /write-spec) -> in Bau -> QA -> Deployed.

## Projekt-Schnitt
Alle Features sind in einzeln deploybare Projekte (Epics) gebuendelt: siehe **`features/PROJECTS.md`**.

## Naechster Schritt
INFRA-1 und S-01 sind deployt. S-01 und S-02 sind deployt. S-01, S-02, S-03 deployt. Auth-Projekt (PRJ-02) komplett. B-26 (Einstellungen-Huelle + Profil) deployt. Naechstes: **B-27 (Einstellungen - Unternehmen)** oder Tracker-Datenkern **B-05 (Abo anlegen)** -> `/architecture`.

---

## Fundament (INFRA)

| ID | Feature | Prio | Abhaengig von | Status |
|----|---------|------|---------------|--------|
| INFRA-1 | Projekt-Fundament: Next.js + Supabase (EU) + Tailwind/shadcn, Env-Setup, Auth-Konfiguration, DB-Grundschema, Navigation/Shells der drei Welten, Design-System-Tokens, Geschaeftskonstanten (Preise) | P0 | - | Deployed (PRJ-01, toolfolio.de live) |

Alle Features, die Auth, Datenhaltung, RLS oder Mandanten brauchen, haengen von INFRA-1 ab.

---

## Auth (S)

| ID | Feature | Prio | Abhaengig von | Status |
|----|---------|------|---------------|--------|
| S-01 | Login (E-Mail/Passwort + Google-SSO, optional 2FA), etabliert die Auth-Huelle | P0 | INFRA-1 | Approved & Deployed (PRJ-02) |
| S-02 | Registrierung (14-Tage-Vollzugang ohne Kreditkarte, DSGVO-Einwilligung, Uebergang in Wizard) | P0 | S-01 | Approved & Deployed (PRJ-02) |
| S-03 | Passwort vergessen/zuruecksetzen (neutrale Bestaetigung) | P0 | S-01 | Approved & Deployed (PRJ-02) |
| S-04 | E-Mail-Verifizierung (vier Zustaende) | P0 | S-01 | Approved & Deployed (PRJ-02) |

## Tracker (B)

| ID | Feature | Prio | Abhaengig von | Status |
|----|---------|------|---------------|--------|
| B-01 | Dashboard (KPIs, Aktions-Center, Spar-Fortschritt), etabliert App-Shell + Design | P0 | INFRA-1, S-01 | Approved & Deployed (PRJ-07) |
| B-02 | Onboarding-Wizard (Zahlungskanaele, Import, Beleg-Postfach, erste Abos, Kunden) | P0 | B-01, S-02 | Approved & Deployed (PRJ-07) |
| B-03 | Abos-Listenansicht (Filter, Sortierung, Gruppierung, Bulk) | P0 | B-01 | Approved & Deployed (PRJ-07) |
| B-04 | Abo-Detailseite | P0 | B-03 | Approved & Deployed (PRJ-07) |
| B-05 | Abo anlegen/bearbeiten (Slide-over, Verzeichnis-Verknuepfung) | P0 | B-03 | Approved & Deployed (PRJ-07) |
| B-06 | Kontoauszug-Import (CSV/CAMT/MT940, Erkennung, Review) | P0 | B-03 | Approved & Deployed (PRJ-07; CSV) |
| B-07 | Zahlungskanaele-Verwaltung (nur Referenzen, keine Secrets) | P0 | B-01 | Approved & Deployed (PRJ-07) |
| B-08 | Kunden-Listenansicht (Agentur-Layer) | P0 | B-01 | Approved & Deployed (PRJ-07) |
| B-09 | Kunde-Detailseite (Weiterverrechnung, Marge) | P0 | B-08 | Approved & Deployed (PRJ-07) |
| B-10 | Sparvorschlaege (+ Gutscheine/Retention-Ergaenzung) | P0 | B-01 | Approved & Deployed |
| B-11 | Benachrichtigungen / Aktivitaets-Feed | P0 | B-01 | Approved & Deployed |
| B-12 | Fristen-Waechter / Kalender (deutscher USP) | P1 | B-04 | Approved & Deployed In-App (PRJ-08); E-Mail offen |
| B-13 | AI-Credits / variable Kosten - Detail | P1 | B-04 | Approved & Deployed |
| B-14 | Beleg-Postfach (eigene Inbox-Adresse, Parsing, Review) | P1 | B-03 | Roadmap |
| B-15 | Verzeichnis (App-Kontext, intern) | P1 | B-05, V-01 | Roadmap |
| B-16 | Benchmark-Ansicht (aus Aggregat-Ebene) | P1 | F-G2 (Aggregat) | Roadmap |
| B-17 | Berichte / Weiterverrechnungs-Report | P1 | B-09 | Approved & Deployed |
| B-18 | DATEV- / Steuer-Export (Reverse-Charge) | P1 | B-03 | Approved & Deployed |
| B-19 | Rechnungs- und Vertragsarchiv (AGB-Snapshot) | P1 | B-14 | Approved & Deployed |
| B-20 | Budget & Forecast | P2 | B-03 | Approved & Deployed |
| B-21 | Seats- / Lizenzverwaltung | P2 | B-22 | Approved & Deployed |
| B-22 | Team / Wer-nutzt-was (Offboarding) | P2 | B-30 | Approved & Deployed |
| B-23 | Anschaffungs-Freigabe-Workflow | P2 | B-05 | Approved & Deployed |
| B-24 | Integrationen (Google Workspace, Bank, KI-APIs) | P2 | INFRA-1 | Roadmap |
| B-25 | Mehrere Gesellschaften / Mandanten | P2 | INFRA-1 | In Bau (Inkr. 1) |
| B-26 | Einstellungen - Profil (etabliert Settings-Huelle) | P0 | S-01 | Approved & Deployed (PRJ-06) |
| B-27 | Einstellungen - Unternehmen | P0 | B-26 | Approved & Deployed (PRJ-06) |
| B-28 | Einstellungen - Benachrichtigungen | P0 | B-26 | Approved & Deployed (PRJ-06) |
| B-29 | Einstellungen - Plan & Abrechnung (Stripe) | P0 | B-26 | Approved & Deployed |
| B-30 | Einstellungen - Team & Rollen | P1 | B-26 | Approved & Deployed |
| B-31 | Einstellungen - Daten & Datenschutz | P1 | B-26 | Approved & Deployed (PRJ-06) |

## Marketing (M)

| ID | Feature | Prio | Abhaengig von | Status |
|----|---------|------|---------------|--------|
| M-01 | Startseite (v2) | P0 | INFRA-1 | Approved & Deployed |
| M-02 | Pricing | P0 | INFRA-1 | Approved & Deployed |
| M-03 | Features-Uebersicht (v2) | P0 | INFRA-1 | Approved & Deployed |
| M-07 | Ueber uns / E-E-A-T | P0 | INFRA-1 | Approved & Deployed |
| M-08 | Sicherheit & Datenschutz | P0 | INFRA-1 | Approved & Deployed |
| M-11 | Kontakt | P0 | INFRA-1 | Approved & Deployed |
| M-16 | 404 / Fehlerseite | P0 | INFRA-1 | Approved & Deployed |
| M-04 | Feature-Detailseite (Template) | P1 | M-03 | Roadmap |
| M-05 | Zielgruppen-Seite (Template) | P1 | M-03 | Approved & Deployed |
| M-06 | Vergleichsseite (Template) + Content-Pack | P1 | M-03 | Approved & Deployed |
| M-09 | Magazin/Blog - Hub | P1 | INFRA-1 | Roadmap |
| M-10 | Magazin/Blog - Artikel (Template) | P1 | M-09 | Roadmap |
| M-12 | Demo buchen | P2 | INFRA-1 | Approved & Deployed |
| M-13 | Fuer Anbieter (Sales) | P2 | INFRA-1 | Approved & Deployed |
| M-14 | Affiliate / Partner | P2 | INFRA-1 | Approved & Deployed |
| M-15 | Changelog | P2 | INFRA-1 | Approved & Deployed |
| M-17 | Indie-SaaS listen | P2 | M-18 | Roadmap |
| M-18 | Vertrauens-Badge & Listing-Standard | P2 | INFRA-1 | Approved & Deployed |

## Verzeichnis (V)

| ID | Feature | Prio | Abhaengig von | Status |
|----|---------|------|---------------|--------|
| V-01 | Verzeichnis-Startseite / Hub | P1 | INFRA-1 | Roadmap |
| V-02 | Cluster-Hub (Template) | P1 | V-01 | Roadmap |
| V-03 | Kategorie/Collection (Template, drei Zonen) | P1 | V-02 | Roadmap |
| V-04 | Software-Detailseite (Template, v2: Attribution/Lead/Rabatt) | P1 | V-03 | Roadmap |
| V-11 | Verzeichnis-Suche / Ergebnisse | P1 | V-01 | Roadmap |
| V-05 | Software-Preise (Long-Tail) | P1 | V-04 | Roadmap |
| V-06 | Software-Erfahrungen/Test (Long-Tail) | P1 | V-04 | Roadmap |
| V-07 | Software-Alternativen (Long-Tail) | P1 | V-04 | Roadmap |
| V-13 | Software kuendigen (Long-Tail) | P1 | V-04 | Roadmap |
| V-08 | Software-Vergleich (Long-Tail) | P2 | V-04 | Roadmap |
| V-09 | Deals & Rabatte - Hub | P2 | V-04 | Roadmap |
| V-10 | Software-Deal (Long-Tail) | P2 | V-09 | Roadmap |
| V-12 | Review abgeben (verifiziert durch Abrechnung) | P2 | V-04, B-16 | Roadmap |
| V-14 | Software wechseln/Migration (Long-Tail) | P2 | V-04 | Roadmap |
| V-15 | Lohnt sich [Tool] noch (Long-Tail) | P2 | V-04 | Roadmap |

## Anbieter & Marktplatz (A)

| ID | Feature | Prio | Abhaengig von | Status |
|----|---------|------|---------------|--------|
| A-01 | Anbieter-Dashboard (etabliert Portal-Huelle) | P2 | V-04 | Roadmap |
| A-02 | Listing beanspruchen/bearbeiten | P2 | A-01 | Roadmap |
| A-04 | Anbieter-Abrechnung | P2 | A-01 | Roadmap |
| A-05 | Premium-Platzierung buchen | P2 | A-01 | Roadmap |
| A-06 | Indie-Einreichung / Vertrauens-Check | P2 | A-01, M-18 | Roadmap |
| A-07 | Builder-Dashboard | P3 | A-01 | Roadmap |
| ~~A-03~~ | Leads (gestrichen, kein Backend-Posteingang, siehe E-08) | - | - | Cancelled |

## Admin / Redaktion - Verzeichnis-CMS (AD)

> Internes Redaktions-Backend fuer das Verzeichnis (nur Admin). Speist die oeffentlichen V-Features. Architektur: `docs/verzeichnis/ARCHITECTURE-verzeichnis-cms.md`. Planung abgeschlossen, **Bau mit der Verzeichnis-Phase** (Nutzerentscheidung: Verzeichnis kommt ganz am Ende).

| ID | Feature | Prio | Abhaengig von | Status |
|----|---------|------|---------------|--------|
| AD-01 | Verzeichnis-Redaktion (Admin-CMS): Struktur-Baum, Editoren, Produkt-DB (Herkuenfte A/B/C), KI-Workflows, Claim/Outreach | P1 | INFRA-1, F-G2 | Planned |
| AD-02 | Taxonomie-Import & Strukturierung (1315 Kategorien -> Collections) | P1 | AD-01 | Planned |

## Uebergreifend - Datenwert (F)

| ID | Feature | Prio | Abhaengig von | Status |
|----|---------|------|---------------|--------|
| F-G2 | Aggregat-Anonymisierung (hohe Mindestschwelle, serverseitig) | P1 | INFRA-1 | Roadmap |
| F-G1 | Verifizierte Preise mit Datenzustaenden | P1 | F-G2 | Roadmap |
| F-G3 | KI-Auswertung anonym (nur Aggregate an Claude-API) | P1 | F-G2 | Roadmap |

## Transaktionsmails (E) - Resend

| ID | Feature | Prio | Abhaengig von | Status |
|----|---------|------|---------------|--------|
| E-01 | Willkommen | P1 | S-02 | Approved & Deployed |
| E-02 | Fristen-Warnung | P1 | B-12 | Roadmap |
| E-03 | Trial-Warnung | P1 | B-12 | Roadmap |
| E-04 | Spike-Alarm | P1 | B-13 | Roadmap |
| E-05 | Preiserhoehung erkannt | P1 | B-19 | Roadmap |
| E-06 | Wochen-/Monatsreport | P1 | B-17 | Approved & Deployed |
| E-07 | Sparvorschlag | P1 | B-10 | Roadmap |
| E-08 | Lead an Anbieter | P2 | V-04 | Roadmap |

## Recht (R)

| ID | Feature | Prio | Abhaengig von | Status |
|----|---------|------|---------------|--------|
| R-01 | Impressum | P0 | INFRA-1 | Approved & Deployed |
| R-02 | Datenschutzerklaerung | P0 | INFRA-1 | Approved & Deployed |
| R-03 | AGB (inkl. Vermittler-Klarstellung) | P0 | INFRA-1 | Approved & Deployed |
| R-04 | Cookie-/Consent-Banner (privacy-first) | P0 | INFRA-1 | Approved & Deployed |

---

### Naechste freie IDs
B-32, M-19, V-16, A-08, INFRA-2. (E, S, R sind abgeschlossen.)
