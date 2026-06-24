# Projekte (Epics) - Toolfolio

> Der grobe Schnitt aller Templates/Features in **einzeln deploybare Projekte**. Jedes Projekt wird Feature fuer Feature ueber die Skill-Pipeline gebaut (`/write-spec` -> `/architecture` -> `/frontend` -> `/backend` -> `/qa`), dann je Meilenstein deployt. Feature-Details: `FEATURES.md` + `features/INDEX.md`. Phasen: `PROJECT.md` §12.
>
> **Status je Projekt:** Geplant -> In Spezifikation -> In Bau -> QA -> Deployed -> Fertig.

## Reihenfolge (empfohlen)
Strikt entlang der Abhaengigkeiten. Phase 1 zuerst komplett (launch-faehiger Tracker + Marketing + Recht), dann Phase 2 (Intelligenz + Verzeichnis), dann Phase 3 (Marktplatz + Agentur-Vollausbau).

---

## Phase 1 - MVP (launch-faehiger Tracker)

| ID | Projekt | Ziel | Features | Abhaengig von | Status |
|----|---------|------|----------|---------------|--------|
| PRJ-01 | **Fundament** | Next.js + Supabase + Design-System + Shells der drei Welten | INFRA-1 | - | **Fertig** |
| PRJ-02 | **Auth** | Eigenes Konto: Login, Registrierung (14-Tage-Trial), Recovery, E-Mail-Verifizierung, Google-SSO | S-01, S-02, S-03, S-04 | PRJ-01 | In Spezifikation |
| PRJ-03 | **Einstellungen-Basis** | Settings-Huelle, Profil, Unternehmensdaten (fuer Reports/Steuer) | B-26, B-27 | PRJ-02 | Geplant |
| PRJ-04 | **Abo-Verwaltung** | Abos manuell anlegen, Liste, Detail (Kern des Trackers) | B-05, B-03, B-04 | PRJ-02 | Geplant |
| PRJ-05 | **Import & Zahlungskanaele** | Zahlungswege als Referenz, Kontoauszug-Import (findet Vergessenes) | B-07, B-06 | PRJ-04 | Geplant |
| PRJ-06 | **Onboarding** | Gefuehrte Ersteinrichtung, der Aha-Moment | B-02 | PRJ-04, PRJ-05 | Geplant |
| PRJ-07 | **Dashboard & Benachrichtigungen** | Ueberblick (KPIs, Aktions-Center) + In-App-Feed | B-01, B-11 | PRJ-04 | Geplant |
| PRJ-08 | **Sparvorschlaege** | Spar-Chancen sammeln, Spar-Fortschritt, Gutscheine | B-10 | PRJ-04 | Geplant |
| PRJ-09 | **Agentur-Basis (Kunden)** | Kunden, Kostenzuordnung, Weiterverrechnung, Marge | B-08, B-09 | PRJ-04 | Geplant |
| PRJ-10 | **Plan & Abrechnung** | Eigene Abrechnung ueber Stripe, Benachrichtigungs-Einstellungen | B-29, B-28 | PRJ-03 | Geplant |
| PRJ-11 | **Marketing-Kern** | Startseite, Pricing, Features-Uebersicht, 404 | M-01, M-02, M-03, M-16 | PRJ-01 | Geplant |
| PRJ-12 | **Vertrauen & Ueber uns** | E-E-A-T, Sicherheit/Datenschutz, Kontakt | M-07, M-08, M-11 | PRJ-11 | Geplant |
| PRJ-13 | **Recht & Consent** | Impressum, Datenschutz, AGB, Consent-Banner (privacy-first) | R-01, R-02, R-03, R-04 | PRJ-01 | Geplant |

## Phase 2 - Intelligenz, Verzeichnis, Wechsel-Content

| ID | Projekt | Ziel | Features | Abhaengig von | Status |
|----|---------|------|----------|---------------|--------|
| PRJ-14 | **Fristen- & Trial-Waechter** | Der deutsche USP: keine stille Verlaengerung | B-12 | PRJ-04 | Geplant |
| PRJ-15 | **AI-Credits** | Variable KI-Kosten, Spikes, Auto-Recharge, Budgets | B-13 | PRJ-04 | Geplant |
| PRJ-16 | **Beleg-Postfach & Archiv** | Eigene Inbox-Adresse, Parsing, Rechnungs-/Vertragsarchiv, AGB-Snapshot | B-14, B-19 | PRJ-04 | Geplant |
| PRJ-17 | **Aggregat-Ebene & Benchmark** | Anonymisierung (hohe Mindestschwelle), verifizierte Preise, KI-anonym, Benchmark-Ansicht. **Kritische Datenschutz-Schicht, serverseitig.** | F-G2, F-G1, F-G3, B-16 | PRJ-04 | Geplant |
| PRJ-18 | **Reports & Steuer** | Weiterverrechnungs-Report, DATEV/Reverse-Charge-Export | B-17, B-18 | PRJ-09 | Geplant |
| PRJ-19 | **Verzeichnis-Geruest** | Oeffentlicher SEO-Hub, Cluster, Kategorie (drei Zonen) | V-01, V-02, V-03 | PRJ-11 | Geplant |
| PRJ-20 | **Software-Detailseite & Suche** | Herzstueck (V-04 v2 mit Attribution/Lead/Rabatt), Verzeichnis-Suche | V-04, V-11 | PRJ-19, PRJ-17 | Geplant |
| PRJ-21 | **Verzeichnis Long-Tail** | Preise, Erfahrungen, Alternativen, Kuendigen je Tool | V-05, V-06, V-07, V-13 | PRJ-20 | Geplant |
| PRJ-22 | **In-App-Verzeichnis** | Verzeichnis im Tracker, Tool schnell als Abo hinzufuegen | B-15 | PRJ-20, PRJ-04 | Geplant |
| PRJ-23 | **Transaktionsmails** | Willkommen, Fristen, Trial, Spike, Preiserhoehung, Report, Sparvorschlag (Resend) | E-01..E-07 | PRJ-14, PRJ-15 | Geplant |
| PRJ-24 | **Marketing-SEO-Templates** | Feature-Detail, Zielgruppen, Vergleichsseiten | M-04, M-05, M-06 | PRJ-11 | Geplant |
| PRJ-25 | **Magazin / Blog** | Hub + Artikel-Template | M-09, M-10 | PRJ-11 | Geplant |

## Phase 3 - Marktplatz, Monetarisierung, Skalierung

| ID | Projekt | Ziel | Features | Abhaengig von | Status |
|----|---------|------|----------|---------------|--------|
| PRJ-26 | **Anbieter-Portal Basis** | Portal-Huelle, Dashboard, Listing beanspruchen/pflegen | A-01, A-02 | PRJ-20 | Geplant |
| PRJ-27 | **Anbieter-Monetarisierung & Attribution** | Premium-Platzierung, Abrechnung, Lead-Zustellung (getrackter Redirect) | A-05, A-04, E-08 | PRJ-26 | Geplant |
| PRJ-28 | **Indie & Vertrauens-Badge** | Indie-Einreichung, Sales-Seite, Badge-Standard | A-06, M-17, M-18 | PRJ-26 | Geplant |
| PRJ-29 | **Verifizierte Bewertungen** | Review-Flow mit Siegel "verifiziert durch Abrechnung" | V-12 | PRJ-20, PRJ-17 | Geplant |
| PRJ-30 | **Verzeichnis Long-Tail 2** | Vergleich, Deals-Hub, Deal, Wechseln, Lohnt-sich | V-08, V-09, V-10, V-14, V-15 | PRJ-20 | Geplant |
| PRJ-31 | **Agentur Vollausbau** | Budget/Forecast, Seats, Team/Wer-nutzt-was, Freigabe-Workflow | B-20, B-21, B-22, B-23 | PRJ-09 | Geplant |
| PRJ-32 | **Integrationen & Mandanten** | Google Workspace/Bank/KI-APIs, Mandanten, Team & Rollen, Daten & Datenschutz | B-24, B-25, B-30, B-31 | PRJ-03 | Geplant |
| PRJ-33 | **Sales-Ausbau** | Demo buchen, Fuer Anbieter, Affiliate, Changelog | M-12, M-13, M-14, M-15 | PRJ-11 | Geplant |

## Phase 4/5 - Optional (geparkt)

| ID | Projekt | Ziel | Features | Abhaengig von | Status |
|----|---------|------|----------|---------------|--------|
| PRJ-34 | **Builder-Dashboard** | Schlankes Cockpit fuer Indie-Builder | A-07 | PRJ-26 | Geparkt (P4) |
| PRJ-35 | **Toolfolio Studio** | Eigene Micro-Tools (beruehrt Vermittler-Prinzip, erst nach Launch, rechtlich pruefen) | ST-/MT- | PRJ-20 | Geparkt (P5) |

---

## Naechster Schritt
**PRJ-02 (Auth)** ist in Spezifikation. Specs: `features/S-01-login.md`, `S-02-registrierung.md`, `S-03-passwort-recovery.md`, `S-04-email-verifizierung.md`. Danach `/architecture S-01` starten.
