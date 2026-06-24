# Projekte (Bau-Roadmap) - Toolfolio

> **Jedes Template/Feature ist ein eigenes Projekt.** Diese Datei ist die **sequenzierte Bau-Reihenfolge** (Abhaengigkeiten beachtet). Die Projekt-ID ist die Template-ID. Feature-Referenz nach Bereichen: `features/INDEX.md`. Beschreibung je Template: `FEATURES.md` + `docs/blueprint/`.
>
> Jedes Projekt durchlaeuft: `/write-spec <ID>` -> `/architecture <ID>` -> `/frontend` -> `/backend` -> `/qa` -> Deploy.
> **Status:** Geplant -> In Spezifikation (Spec liegt vor) -> In Bau -> QA -> Deployed.
> **#** = empfohlene Bau-Reihenfolge ueber alle Phasen.

---

## Phase 1 - MVP (launch-faehiger Tracker + Marketing + Recht)

| # | ID | Projekt | Abhaengig von | Status |
|---|----|---------|---------------|--------|
| 1 | INFRA-1 | Fundament (Next.js + Supabase + Design-System + Shells) | - | **Deployed** |
| 2 | S-01 | Login (etabliert Auth-Huelle) | INFRA-1 | **In Spezifikation** |
| 3 | S-02 | Registrierung (14-Tage-Trial) | S-01 | **In Spezifikation** |
| 4 | S-03 | Passwort-Recovery | S-01 | **In Spezifikation** |
| 5 | S-04 | E-Mail-Verifizierung | S-02 | **In Spezifikation** |
| 6 | B-26 | Einstellungen - Profil (etabliert Settings-Huelle) | S-01 | Geplant |
| 7 | B-27 | Einstellungen - Unternehmen | B-26 | Geplant |
| 8 | B-05 | Abo anlegen/bearbeiten | S-01 | Geplant |
| 9 | B-03 | Abos-Liste | B-05 | Geplant |
| 10 | B-04 | Abo-Detail | B-03 | Geplant |
| 11 | B-07 | Zahlungskanaele | B-05 | Geplant |
| 12 | B-06 | Kontoauszug-Import | B-07 | Geplant |
| 13 | B-08 | Kunden-Liste | B-05 | Geplant |
| 14 | B-09 | Kunde-Detail | B-08 | Geplant |
| 15 | B-10 | Sparvorschlaege | B-04 | Geplant |
| 16 | B-11 | Benachrichtigungen | B-01 | Geplant |
| 17 | B-01 | Dashboard | B-03, B-08 | Geplant |
| 18 | B-02 | Onboarding-Wizard | B-05, B-06, B-08 | Geplant |
| 19 | B-28 | Einstellungen - Benachrichtigungen | B-26 | Geplant |
| 20 | B-29 | Einstellungen - Plan & Abrechnung (Stripe) | B-26 | Geplant |
| 21 | M-01 | Marketing-Startseite | INFRA-1 | Geplant |
| 22 | M-02 | Pricing | INFRA-1 | Geplant |
| 23 | M-03 | Features-Uebersicht | INFRA-1 | Geplant |
| 24 | M-16 | 404 / Fehlerseite | INFRA-1 | Geplant |
| 25 | M-07 | Ueber uns / E-E-A-T | M-01 | Geplant |
| 26 | M-08 | Sicherheit & Datenschutz | M-01 | Geplant |
| 27 | M-11 | Kontakt | M-01 | Geplant |
| 28 | R-01 | Impressum | INFRA-1 | Geplant |
| 29 | R-02 | Datenschutzerklaerung | INFRA-1 | Geplant |
| 30 | R-03 | AGB (Vermittler-Klarstellung) | INFRA-1 | Geplant |
| 31 | R-04 | Cookie-/Consent-Banner | INFRA-1 | Geplant |

## Phase 2 - Intelligenz, Verzeichnis, Wechsel-Content

| # | ID | Projekt | Abhaengig von | Status |
|---|----|---------|---------------|--------|
| 32 | F-G2 | Aggregat-Anonymisierung (hohe Mindestschwelle, serverseitig) | INFRA-1 | Geplant |
| 33 | F-G1 | Verifizierte Preise mit Datenzustaenden | F-G2 | Geplant |
| 34 | F-G3 | KI-Auswertung anonym (nur Aggregate an Claude-API) | F-G2 | Geplant |
| 35 | B-16 | Benchmark-Ansicht | F-G2 | Geplant |
| 36 | B-12 | Fristen- & Trial-Waechter (deutscher USP) | B-04 | Geplant |
| 37 | B-13 | AI-Credits / variable Kosten | B-04 | Geplant |
| 38 | B-14 | Beleg-Postfach | B-03 | Geplant |
| 39 | B-19 | Rechnungs- & Vertragsarchiv (AGB-Snapshot) | B-14 | Geplant |
| 40 | B-17 | Berichte / Weiterverrechnungs-Report | B-09 | Geplant |
| 41 | B-18 | DATEV- / Steuer-Export | B-03 | Geplant |
| 42 | V-01 | Verzeichnis-Startseite / Hub | M-01 | Geplant |
| 43 | V-02 | Cluster-Hub (Template) | V-01 | Geplant |
| 44 | V-03 | Kategorie / Collection (drei Zonen) | V-02 | Geplant |
| 45 | V-04 | Software-Detailseite (Herzstueck, v2 Attribution/Lead/Rabatt) | V-03, F-G1 | Geplant |
| 46 | V-11 | Verzeichnis-Suche | V-01 | Geplant |
| 47 | V-05 | Software-Preise (Long-Tail) | V-04 | Geplant |
| 48 | V-06 | Software-Erfahrungen / Test (Long-Tail) | V-04 | Geplant |
| 49 | V-07 | Software-Alternativen (Long-Tail) | V-04 | Geplant |
| 50 | V-13 | Software kuendigen (Long-Tail) | V-04 | Geplant |
| 51 | B-15 | Verzeichnis (App-Kontext, intern) | V-04, B-05 | Geplant |
| 52 | E-01 | E-Mail: Willkommen | S-02 | Geplant |
| 53 | E-02 | E-Mail: Fristen-Warnung | B-12 | Geplant |
| 54 | E-03 | E-Mail: Trial-Warnung | B-12 | Geplant |
| 55 | E-04 | E-Mail: Spike-Alarm | B-13 | Geplant |
| 56 | E-05 | E-Mail: Preiserhoehung | B-19 | Geplant |
| 57 | E-06 | E-Mail: Wochen-/Monatsreport | B-17 | Geplant |
| 58 | E-07 | E-Mail: Sparvorschlag | B-10 | Geplant |
| 59 | M-04 | Feature-Detailseite (Template) | M-03 | Geplant |
| 60 | M-05 | Zielgruppen-Seite (Template) | M-03 | Geplant |
| 61 | M-06 | Vergleichsseite (Template) | M-03 | Geplant |
| 62 | M-09 | Magazin / Blog - Hub | M-01 | Geplant |
| 63 | M-10 | Magazin / Blog - Artikel (Template) | M-09 | Geplant |

## Phase 3 - Marktplatz, Monetarisierung, Skalierung

| # | ID | Projekt | Abhaengig von | Status |
|---|----|---------|---------------|--------|
| 64 | A-01 | Anbieter-Dashboard (etabliert Portal-Huelle) | V-04 | Geplant |
| 65 | A-02 | Listing beanspruchen/bearbeiten | A-01 | Geplant |
| 66 | A-05 | Premium-Platzierung buchen | A-01 | Geplant |
| 67 | A-04 | Anbieter-Abrechnung | A-01 | Geplant |
| 68 | E-08 | E-Mail: Lead an Anbieter | A-02, V-04 | Geplant |
| 69 | A-06 | Indie-Einreichung / Vertrauens-Check | A-01, M-18 | Geplant |
| 70 | M-17 | Indie-SaaS listen (Sales) | M-18 | Geplant |
| 71 | M-18 | Vertrauens-Badge & Listing-Standard | INFRA-1 | Geplant |
| 72 | V-12 | Review abgeben (verifiziert durch Abrechnung) | V-04, F-G2 | Geplant |
| 73 | V-08 | Software-Vergleich (Long-Tail) | V-04 | Geplant |
| 74 | V-09 | Deals & Rabatte - Hub | V-04 | Geplant |
| 75 | V-10 | Software-Deal (Long-Tail) | V-09 | Geplant |
| 76 | V-14 | Software wechseln / Migration (Long-Tail) | V-04 | Geplant |
| 77 | V-15 | Lohnt sich [Tool] noch (Long-Tail) | V-04 | Geplant |
| 78 | B-20 | Budget & Forecast | B-03 | Geplant |
| 79 | B-21 | Seats- / Lizenzverwaltung | B-22 | Geplant |
| 80 | B-22 | Team / Wer-nutzt-was (Offboarding) | B-30 | Geplant |
| 81 | B-23 | Anschaffungs-Freigabe-Workflow | B-05 | Geplant |
| 82 | B-24 | Integrationen (Google Workspace, Bank, KI-APIs) | INFRA-1 | Geplant |
| 83 | B-25 | Mehrere Gesellschaften / Mandanten | INFRA-1 | Geplant |
| 84 | B-30 | Einstellungen - Team & Rollen | B-26 | Geplant |
| 85 | B-31 | Einstellungen - Daten & Datenschutz | B-26 | Geplant |
| 86 | M-12 | Demo buchen | M-01 | Geplant |
| 87 | M-13 | Fuer Anbieter (Sales) | M-01 | Geplant |
| 88 | M-14 | Affiliate / Partner | M-01 | Geplant |
| 89 | M-15 | Changelog | M-01 | Geplant |

## Phase 4/5 - Optional (geparkt)

| # | ID | Projekt | Abhaengig von | Status |
|---|----|---------|---------------|--------|
| 90 | A-07 | Builder-Dashboard | A-01 | Geparkt (P4) |
| 91 | Studio | Toolfolio Studio (ST-/MT-, rechtlich pruefen) | V-04 | Geparkt (P5) |

---

## Naechster Schritt
PRJ INFRA-1 ist deployt. **S-01..S-04 sind spezifiziert.** Als Naechstes `/architecture S-01`, dann `/frontend` + `/backend`, danach S-02..S-04. Anschliessend der Tracker-Kern ab B-26.
