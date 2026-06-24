# Projekte (Bau-Roadmap) - Toolfolio

> **Jedes Template/Feature ist ein eigenes Projekt.** Eine durchgehende Liste in **Bau-Reihenfolge (# 1-91)**, Abhaengigkeiten beachtet. Die Projekt-ID ist die stabile, bedeutungstragende Template-ID (S-/B-/V-/A-/M-/E-/R-/F-/INFRA). Reihenfolge (`#`) ist flexibel und an Abhaengigkeiten ausgerichtet, die ID bleibt fest.
>
> Feature-Referenz nach Bereichen: `features/INDEX.md`. Beschreibung je Template: `FEATURES.md` + `docs/blueprint/`.
> Jedes Projekt durchlaeuft: `/write-spec <ID>` -> `/architecture <ID>` -> `/frontend` -> `/backend` -> `/qa` -> Deploy.
> **Status:** Geplant -> In Spezifikation -> In Bau -> QA -> Deployed. **Ph** = Phase (1 MVP, 2 Intelligenz/Verzeichnis, 3 Marktplatz, 4/5 optional/geparkt).

| # | ID | Projekt | Ph | Abhaengig von | Status |
|---|----|---------|----|---------------|--------|
| 1 | INFRA-1 | Fundament (Next.js + Supabase + Design-System + Shells) | 1 | - | **Deployed** |
| 2 | S-01 | Login (etabliert Auth-Huelle) | 1 | INFRA-1 | **In Spezifikation** |
| 3 | S-02 | Registrierung (14-Tage-Trial) | 1 | S-01 | **In Spezifikation** |
| 4 | S-03 | Passwort-Recovery | 1 | S-01 | **In Spezifikation** |
| 5 | S-04 | E-Mail-Verifizierung | 1 | S-02 | **In Spezifikation** |
| 6 | B-26 | Einstellungen - Profil (etabliert Settings-Huelle) | 1 | S-01 | Geplant |
| 7 | B-27 | Einstellungen - Unternehmen | 1 | B-26 | Geplant |
| 8 | B-05 | Abo anlegen/bearbeiten | 1 | S-01 | Geplant |
| 9 | B-03 | Abos-Liste | 1 | B-05 | Geplant |
| 10 | B-04 | Abo-Detail | 1 | B-03 | Geplant |
| 11 | B-07 | Zahlungskanaele | 1 | B-05 | Geplant |
| 12 | B-06 | Kontoauszug-Import | 1 | B-07 | Geplant |
| 13 | B-08 | Kunden-Liste | 1 | B-05 | Geplant |
| 14 | B-09 | Kunde-Detail | 1 | B-08 | Geplant |
| 15 | B-10 | Sparvorschlaege | 1 | B-04 | Geplant |
| 16 | B-01 | Dashboard | 1 | B-03, B-08 | Geplant |
| 17 | B-11 | Benachrichtigungen | 1 | B-01 | Geplant |
| 18 | B-02 | Onboarding-Wizard | 1 | B-05, B-06, B-08 | Geplant |
| 19 | B-28 | Einstellungen - Benachrichtigungen | 1 | B-26 | Geplant |
| 20 | B-29 | Einstellungen - Plan & Abrechnung (Stripe) | 1 | B-26 | Geplant |
| 21 | M-01 | Marketing-Startseite | 1 | INFRA-1 | Geplant |
| 22 | M-02 | Pricing | 1 | INFRA-1 | Geplant |
| 23 | M-03 | Features-Uebersicht | 1 | INFRA-1 | Geplant |
| 24 | M-16 | 404 / Fehlerseite | 1 | INFRA-1 | Geplant |
| 25 | M-07 | Ueber uns / E-E-A-T | 1 | M-01 | Geplant |
| 26 | M-08 | Sicherheit & Datenschutz | 1 | M-01 | Geplant |
| 27 | M-11 | Kontakt | 1 | M-01 | Geplant |
| 28 | R-01 | Impressum | 1 | INFRA-1 | Geplant |
| 29 | R-02 | Datenschutzerklaerung | 1 | INFRA-1 | Geplant |
| 30 | R-03 | AGB (Vermittler-Klarstellung) | 1 | INFRA-1 | Geplant |
| 31 | R-04 | Cookie-/Consent-Banner | 1 | INFRA-1 | Geplant |
| 32 | F-G2 | Aggregat-Anonymisierung (hohe Mindestschwelle, serverseitig) | 2 | INFRA-1 | Geplant |
| 33 | F-G1 | Verifizierte Preise mit Datenzustaenden | 2 | F-G2 | Geplant |
| 34 | F-G3 | KI-Auswertung anonym (nur Aggregate an Claude-API) | 2 | F-G2 | Geplant |
| 35 | B-16 | Benchmark-Ansicht | 2 | F-G2 | Geplant |
| 36 | B-12 | Fristen- & Trial-Waechter (deutscher USP) | 2 | B-04 | Geplant |
| 37 | B-13 | AI-Credits / variable Kosten | 2 | B-04 | Geplant |
| 38 | B-14 | Beleg-Postfach | 2 | B-03 | Geplant |
| 39 | B-19 | Rechnungs- & Vertragsarchiv (AGB-Snapshot) | 2 | B-14 | Geplant |
| 40 | B-17 | Berichte / Weiterverrechnungs-Report | 2 | B-09 | Geplant |
| 41 | B-18 | DATEV- / Steuer-Export | 2 | B-03 | Geplant |
| 42 | V-01 | Verzeichnis-Startseite / Hub | 2 | M-01 | Geplant |
| 43 | V-02 | Cluster-Hub (Template) | 2 | V-01 | Geplant |
| 44 | V-03 | Kategorie / Collection (drei Zonen) | 2 | V-02 | Geplant |
| 45 | V-04 | Software-Detailseite (Herzstueck, v2 Attribution/Lead/Rabatt) | 2 | V-03, F-G1 | Geplant |
| 46 | V-11 | Verzeichnis-Suche | 2 | V-01 | Geplant |
| 47 | V-05 | Software-Preise (Long-Tail) | 2 | V-04 | Geplant |
| 48 | V-06 | Software-Erfahrungen / Test (Long-Tail) | 2 | V-04 | Geplant |
| 49 | V-07 | Software-Alternativen (Long-Tail) | 2 | V-04 | Geplant |
| 50 | V-13 | Software kuendigen (Long-Tail) | 2 | V-04 | Geplant |
| 51 | B-15 | Verzeichnis (App-Kontext, intern) | 2 | V-04, B-05 | Geplant |
| 52 | E-01 | E-Mail: Willkommen | 2 | S-02 | Geplant |
| 53 | E-02 | E-Mail: Fristen-Warnung | 2 | B-12 | Geplant |
| 54 | E-03 | E-Mail: Trial-Warnung | 2 | B-12 | Geplant |
| 55 | E-04 | E-Mail: Spike-Alarm | 2 | B-13 | Geplant |
| 56 | E-05 | E-Mail: Preiserhoehung | 2 | B-19 | Geplant |
| 57 | E-06 | E-Mail: Wochen-/Monatsreport | 2 | B-17 | Geplant |
| 58 | E-07 | E-Mail: Sparvorschlag | 2 | B-10 | Geplant |
| 59 | M-04 | Feature-Detailseite (Template) | 2 | M-03 | Geplant |
| 60 | M-05 | Zielgruppen-Seite (Template) | 2 | M-03 | Geplant |
| 61 | M-06 | Vergleichsseite (Template) | 2 | M-03 | Geplant |
| 62 | M-09 | Magazin / Blog - Hub | 2 | M-01 | Geplant |
| 63 | M-10 | Magazin / Blog - Artikel (Template) | 2 | M-09 | Geplant |
| 64 | A-01 | Anbieter-Dashboard (etabliert Portal-Huelle) | 3 | V-04 | Geplant |
| 65 | A-02 | Listing beanspruchen/bearbeiten | 3 | A-01 | Geplant |
| 66 | M-18 | Vertrauens-Badge & Listing-Standard | 3 | INFRA-1 | Geplant |
| 67 | A-05 | Premium-Platzierung buchen | 3 | A-01 | Geplant |
| 68 | A-04 | Anbieter-Abrechnung | 3 | A-01 | Geplant |
| 69 | E-08 | E-Mail: Lead an Anbieter | 3 | A-02, V-04 | Geplant |
| 70 | A-06 | Indie-Einreichung / Vertrauens-Check | 3 | A-01, M-18 | Geplant |
| 71 | M-17 | Indie-SaaS listen (Sales) | 3 | M-18 | Geplant |
| 72 | V-12 | Review abgeben (verifiziert durch Abrechnung) | 3 | V-04, F-G2 | Geplant |
| 73 | V-08 | Software-Vergleich (Long-Tail) | 3 | V-04 | Geplant |
| 74 | V-09 | Deals & Rabatte - Hub | 3 | V-04 | Geplant |
| 75 | V-10 | Software-Deal (Long-Tail) | 3 | V-09 | Geplant |
| 76 | V-14 | Software wechseln / Migration (Long-Tail) | 3 | V-04 | Geplant |
| 77 | V-15 | Lohnt sich [Tool] noch (Long-Tail) | 3 | V-04 | Geplant |
| 78 | B-30 | Einstellungen - Team & Rollen | 3 | B-26 | Geplant |
| 79 | B-22 | Team / Wer-nutzt-was (Offboarding) | 3 | B-30 | Geplant |
| 80 | B-21 | Seats- / Lizenzverwaltung | 3 | B-22 | Geplant |
| 81 | B-23 | Anschaffungs-Freigabe-Workflow | 3 | B-05 | Geplant |
| 82 | B-20 | Budget & Forecast | 3 | B-03 | Geplant |
| 83 | B-24 | Integrationen (Google Workspace, Bank, KI-APIs) | 3 | INFRA-1 | Geplant |
| 84 | B-25 | Mehrere Gesellschaften / Mandanten | 3 | INFRA-1 | Geplant |
| 85 | B-31 | Einstellungen - Daten & Datenschutz | 3 | B-26 | Geplant |
| 86 | M-12 | Demo buchen | 3 | M-01 | Geplant |
| 87 | M-13 | Fuer Anbieter (Sales) | 3 | M-01 | Geplant |
| 88 | M-14 | Affiliate / Partner | 3 | M-01 | Geplant |
| 89 | M-15 | Changelog | 3 | M-01 | Geplant |
| 90 | A-07 | Builder-Dashboard | 4 | A-01 | Geparkt |
| 91 | Studio | Toolfolio Studio (ST-/MT-, rechtlich pruefen) | 5 | V-04 | Geparkt |

---

## Naechster Schritt
INFRA-1 ist deployt. **S-01..S-04 sind spezifiziert.** Als Naechstes `/architecture S-01`, dann `/frontend` + `/backend`, danach S-02..S-04. Anschliessend der Tracker-Kern ab B-26 (#6).
