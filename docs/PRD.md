# PRD - Toolfolio

> Einstiegspunkt fuer die Skills (`/write-spec`, `/architecture` lesen diese Datei). Die ausfuehrliche Quelle ist `PROJECT.md` im Repo-Root, die Architektur `ARCHITECTURE.md`, die granularen Features `FEATURES.md` und die Feature-Map `features/INDEX.md`. Der PRD ist damit bereits vollstaendig, `/init` muss nicht erneut laufen.

## Vision
Toolfolio macht Software-Kosten fuer kleine DACH-Teams transparent und beherrschbar, damit sie bei gleicher Leistung weniger zahlen. Es besteht aus einem **Tracker** (verwaltet alle Software-Abos und KI-Kosten, warnt vor Fristen und Kosten, deckt Sparpotenzial auf, ordnet Agentur-Kosten den Kunden zu) und einem **oeffentlichen Verzeichnis** (neutraler Vergleich, dessen Preise durch echte, anonymisierte Abrechnungsdaten verifiziert sind). Beide bilden ein Schwungrad: Mehr Tracker-Nutzer ergeben bessere verifizierte Daten, die das Verzeichnis wertvoller machen, was wiederum Nutzer zieht. Das ist der Burggraben.

## Zielgruppe
DACH, B2B: Agenturen, Freelancer, Solopreneure mit 30 bis 60 Tools. Datenschutzbewusst, reagiert stark auf konkrete Ersparnis in Euro und auf Neutralitaet. Drei Nutzerrollen plus oeffentlicher Besucher: Tracker-Nutzer (ggf. mit Team/Mandanten), Anbieter (etabliert), Indie-Builder, anonymer Besucher.

## Kernprobleme
- Ueberblick verloren: welche Tools laufen, was kosten sie, in welchem Abrechnungszeitraum.
- Vergessene Trials kippen still in zahlende Abos.
- Jahres-Abos verlaengern sich still ueber verpasste Kuendigungsfristen.
- KI-Kosten (Token/Credits/APIs) explodieren unbemerkt.
- Bei Agenturen verteilen sich Toolkosten ungeordnet auf Kunden, ohne saubere Weiterverrechnung.

## Roadmap (Prioritaet) - Detail in `features/INDEX.md`
- **P0 (Phase 1, MVP):** Fundament (Auth, Konto, Mandanten-Grundgeruest, Design-System, Navigation der drei Welten) + Tracker-Kern (Erfassung manuell/Import, Abo-Verwaltung, Dashboard, Zahlungskanaele, eigene Abrechnung ueber Stripe).
- **P1 (Phase 2):** Intelligenz (Fristen-/Trial-Waechter, AI-Credit-Tracker, Spike-/Preiserhoehungs-Erkennung, Sparvorschlaege, Benchmark + Aggregat-Ebene, Reports, Archiv), oeffentliches Verzeichnis (Hub, Cluster, Kategorie, Detailseite, Suche), Transaktionsmails.
- **P2 (Phase 3):** Marktplatz (Anbieter-Portal, Platzierung, Abrechnung, Indie-Einreichung, Bewertungen, Attribution/Lead-Fluss), Agentur-Layer-Vollausbau.
- **P3 (Phase 4/5):** Builder-Dashboard, spaeter Toolfolio Studio (geparkt).

## Erfolgsmetriken (Hypothesen)
Aktivierte Tracker-Konten, erfasste Abos pro Konto, realisiertes Sparpotenzial in Euro, Anzahl verifizierter Preisdatenpunkte (Tiefe des Burggrabens), organischer Verzeichnis-Traffic.

## Constraints
- Stack fix: Next.js + Supabase (EU) + Stripe/PayPal + Resend + Plausible, Hosting Hostinger (EU). Siehe CLAUDE.md.
- Backend: **Supabase erforderlich** (Konten, mandantenfaehige Daten, RLS). Infrastruktur als erstes Fundament-Feature.
- Design-System fix: `docs/design-system.md`.
- Trennung personenbezogen vs. anonym serverseitig erzwingen (siehe CLAUDE.md, Leitplanke 3).
- Finanzdaten kommen vorerst nur manuell rein (Upload, Beleg-Postfach), keine PSD2-Bankanbindung im aktuellen DSE-Stand.

## Non-Goals (diese Version)
Kein Hosting fremder Software, keine Drittzahlungsabwicklung, kein Backend-Lead-Posteingang. Keine Speicherung roher Karten-/Bankdaten. Keine kaeufliche Beeinflussung von Rang/Bewertungen/verifizierten Daten. Keine personenbezogenen Daten in der Aggregat- oder KI-Ebene. Toolfolio Studio (eigene Micro-Tools) ist bewusst geparkt (Phase 5).
