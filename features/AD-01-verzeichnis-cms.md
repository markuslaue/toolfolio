# AD-01: Verzeichnis-Redaktion (Admin-CMS)

## Status: Roadmap (Planung abgeschlossen, Bau mit Verzeichnis-Phase)
**Projekt:** PRJ-Verzeichnis-CMS · **Bereich:** AD (Admin/Redaktion) · **Created:** 2026-06-26 · **Prio:** P1 (mit V)

> Architektur: `docs/verzeichnis/ARCHITECTURE-verzeichnis-cms.md`. Design-/Funktions-Vertrag: `docs/blueprint/lovable-prompts/AD-01-verzeichnis-redaktion.md`. Taxonomie: `docs/verzeichnis/software-kategorien.md` (Import = AD-02).

## Zusammenfassung
Internes Redaktions-CMS, mit dem ausschliesslich der Admin das oeffentliche, SEO-getriebene Verzeichnis pflegt: Struktur (Cluster -> L1 -> L2 -> Collection -> Produkt), Produkt-Stammdaten nach drei Datenherkuenften (A KI/redaktionell, B Anbieter, C verifizierte Bewertung), KI-Workflows (Recherche, faktenbeschraenkte Produktanalyse, SEO-Content) und Claim/Outreach. Speist die oeffentlichen V-Features.

## User Stories
- Als Admin strukturiere ich das Verzeichnis ueber vier Ebenen und pflege SEO-Meta + Content je Knoten.
- Als Admin kuratiere ich je Collection Produkte in drei Zonen (gesponsert/organisch/community) unter Wahrung der goldenen Regel.
- Als Admin lasse ich KI faktische Produktfelder + SEO-Entwuerfe vorbereiten, gebe sie aber erst nach Review frei.
- Als Admin sehe ich Claim-Status je Produkt und betreibe schlanken Outreach an Anbieter.

## Acceptance Criteria (Gesamt)
- [ ] Admin-only Shell, serverseitiges Rollen-Gate (Supabase-Rolle + RLS), nie nur Frontend.
- [ ] Struktur-Baum ueber 4 Ebenen: Status (Veroeffentlicht/Entwurf/Kein Content), Prio-Tag + Produktanzahl bei Collections, Suche/Filter, CRUD, Sortierung, Kennzahlenleiste.
- [ ] Editoren Cluster/L1/L2: Name, Slug (vorbefuellt, ae/oe/ue/ss), Meta-Title/-Description, Content-Piece (Markdown), Cluster-Farbe, Status.
- [ ] Collection-Editor: SEO-Meta (Zeichenzaehler, Snippet-Vorschau), Produkt-Kuratierung (3 Zonen + goldene Regel sichtbar, DnD), KI-Recherche, faktenbeschraenkte KI-Produktanalyse (ohne Screenshots/Team), SEO-Content-Editor (Briefing, Score), Vorschau.
- [ ] Produkt-Datenbank: Detail-Editor klar nach Herkunft A/B/C gegliedert, Herkunfts-Badges, Preis-Stand/Quelle/Link (UWG), Status + Claim-Status, Mehrfachzuordnung.
- [ ] KI-Workflows als server-side Jobs (queued/laeuft/fertig/fehlgeschlagen), Ergebnis immer Vorschlag, Review + Diff vor Uebernahme, nie automatisch live; `dir_ki_job` als Audit-Trail; Anthropic-Key serverseitig.
- [ ] Claim & Outreach: Claim-Status (unclaimed/eingeladen/angefragt/claimed), Kontaktpflege, Einladungstext-Generator (nur Erzeugung), Verlauf, Kennzahlen/Claim-Quote.

## Bau-Phasen (Decomposition fuer den Build)
1. **Fundament:** dir_*-Datenmodell + RLS + Admin-Rollen-Gate. (Architektur §3, §6)
2. **Struktur-Baum + Cluster/L1/L2-Editoren.**
3. **Produkt-Datenbank** inkl. Herkunfts-Modell A/B/C.
4. **Collection-Editor** (SEO-Meta, Kuratierung 3 Zonen, SEO-Content).
5. **KI-Workflows** (server-side, Anthropic) — Recherche/Analyse/Content.
6. **Claim & Outreach.**
(Reihenfolge entspricht Architektur §10. Bei Bedarf in Unter-IDs AD-03..AD-06 splitten.)

## Out of Scope (-> andere Module/spaeter)
- Anbieter-Upload fuer Herkunft B (Screenshots/Team/Medien): Anbieter-Modul **A-02** (Listing beanspruchen/bearbeiten).
- Echte Claim-Verifizierung (Domain/E-Mail/DNS).
- Realer Outreach-Versand (spaeter ueber Resend, mit Einwilligung/B2B-Rahmen, vgl. E-Mails).
- Oeffentliche Ausspielung der Inhalte: **V-01..V-15**.
- Bewertungs-Erfassung (Herkunft C, zweistufig verifiziert/nicht verifiziert): **V-12** (Review abgeben) + Verifizierungs-Check gegen anonymisierte Aggregat-/Tracker-Ebene **F-G2/B-16**.

## Tech Design (Kurz, Details in Architektur)
- Tabellen `dir_cluster`, `dir_kategorie`, `dir_collection`, `dir_produkt`, `dir_collection_produkt` (Zone+Position), `dir_produkt_medien`, `dir_produkt_team`, `dir_review`, `dir_claim`, `dir_outreach`, `dir_ki_job`. RLS pro Tabelle (anon liest nur veroeffentlicht; Admin global; Anbieter nur eigenes Produkt + Herkunft B).
- Strikte Trennung vom Tracker (kein FK auf B-Tabellen; nur anonyme Aggregate fuer verifizierte Preise).
- Goldene Regel serverseitig: organisches Ranking unabhaengig von bezahlter Sichtbarkeit; gesponserte Zone gekennzeichnet + befristet.
- KI: Backend-Worker, neuestes Claude-Modell, Key verschluesselt in der Umgebung, Job-Audit.
- SEO: SSG/ISR, Meta/Slug serverseitig (RSC-Gotcha beachten), strukturierte Daten.

## Decision Log
| Decision | Rationale | Date |
| Eigenes Bereichskuerzel **AD** (Admin/Redaktion) | CMS ist weder oeffentliches Verzeichnis (V) noch Anbieter-Portal (A); klare Trennung | 2026-06-26 |
| `dir_`-Praefix + keine FK auf Tracker | Erzwingt Datentrennung Tracker/Verzeichnis auf Schema-Ebene | 2026-06-26 |
| KI nur Herkunft A, Screenshots/Team nur Anbieter | Urheber-/Datenbankrecht; Fakten paraphrasiert, Medien mit Schoepfungshoehe nicht generieren | 2026-06-26 |
| Bau erst mit Verzeichnis-Phase | Nutzerentscheidung: Verzeichnis kommt ganz am Ende; Tracker-Funktionalitaet zuerst abschliessen | 2026-06-26 |

## Entscheidungen (2026-06-26, von Markus)
- **Redaktionsrolle = kleines festes Team (Allowlist).** Globale Redaktionsrolle getrennt von der Konto-Rolle `profiles.role`; Umsetzung als `profiles.is_staff` bzw. Allowlist. Ein Konto-Admin ist NICHT automatisch Redakteur. Konkrete E-Mail-Adressen liefert Markus beim Bau.
- **Bewertungen zweistufig:** *verifiziert* (eingeloggter Nutzer + Tool im anonymisierten Tracker, serverseitig Ja/Nein) und *nicht verifiziert* (offen, auch ohne Toolfolio-Account, ohne Nachweis). Im Frontend klar getrennt gekennzeichnet. First-Party (keine gecrawlten/Drittbewertungen). Erfordert Moderation/Anti-Abuse + UWG-Transparenz (Verifizierungsstatus ausweisen, Aggregat nicht irrefuehrend).

## Status Fundament (2026-06-27)
- **`profiles.is_staff` existiert** (globale Superadmin-/Redaktionsrolle, getrennt von role), **per Trigger geschuetzt** (kein Selbst-Setzen, 42501 verifiziert).
- **Markus' Konto ist `is_staff = true` UND `role = owner`** -> nutzt Toolfolio normal (eigener Toolstack) und ist zugleich Superadmin/Redakteur. Ueberlebt den ausstehenden E-Mail-Wechsel (per Profil-ID geflaggt).
- AD-01-Bau: Admin-Shell + AD-Routen + dir_*-Schreib-RLS gaten auf `is_staff`.

## Offene Punkte fuer den Bau (kein Blocker)
- [ ] Weitere Redakteure: deren Profil per Service-Role auf is_staff=true setzen (kein UI noetig fuers MVP).
- [ ] Moderations-Workflow + Anti-Abuse fuer offene Bewertungen final ausgestalten (Status, Rate-Limit, Captcha/Mail-Bestaetigung).

---

## Entscheidungen (2026-07-13, von Markus)

### Roll-out: Cluster fuer Cluster, nicht nach Prio
Die Struktur wird **einmal komplett** angelegt (alle 25 Cluster, alle 1292 Software-Collections,
Status `entwurf`). Oeffentlich sichtbar wird nur, was auf `veroeffentlicht` steht. Ein Cluster
geht dann **vollstaendig** live (alle Prios darin), danach der naechste.

**Warum nicht nach Prio 1/2/3 ausrollen:** Sonst waere jeder Bereich ueberall halbfertig.
PRIO 2 enthaelt starke Rubriken ohne "Software" im Namen (`crm-systeme`, `seo-tools`,
`kassensysteme`, `ki-bild-generatoren`), die man nicht ein Jahr liegen lassen will.

**Pilot-Cluster: "Design & Kreativ" (45 Collections).** Klein genug, um die Pipeline einmal
end-to-end zu erproben, und OMMM kennt die Tools aus dem Alltag, erkennt KI-Unsinn also sofort.

### Produkt-Discovery: vier Quellen, in dieser Reihenfolge

1. **Eigene Tracker-Daten (der unfaire Vorteil).** Der Kontoauszug-Import (B-06) mit
   Software-Klassifikator zeigt echte Tools, fuer die echtes Geld fliesst. Anonymisiert
   aggregierbar. Ein Tool in vielen Kontoauszuegen gehoert ins Verzeichnis; ein Tool, das
   Capterra listet, aber nie jemand bezahlt, eher nicht. Das hat kein Wettbewerber.
2. **DataForSEO SERP-API (B-24, Credentials liegen bereits verschluesselt).** Je Collection
   `"beste [Rubrik]"` / `"[Rubrik] Vergleich"` abfragen und sehen, welche Anbieter im
   deutschen Markt tatsaechlich ranken. Lizenzierte, bezahlte Quelle. Liefert nebenbei das
   Suchvolumen je Rubrik = Priorisierung, welcher Cluster sich lohnt. **Freigegeben 2026-07-13.**
3. **Die Anbieter selbst (Primaerquelle).** Fakten von der Herstellerseite: Preisseite,
   Features, Impressum. Immer mit `preis_quelle_url` + `preis_stand`.
4. **Erst am Ende: Luecken-Abgleich** gegen OMR/Capterra. Faellt ein relevantes Tool auf,
   wird **das Tool** geprueft und ein **eigener** Eintrag geschrieben.

### Kein Scraping von OMR oder Capterra
Deren Produktdatenbanken werden **nicht** uebernommen. Gruende, beide bindend:
- **Recht:** Datenbankherstellerrecht (§ 87b UrhG) schuetzt die systematische Uebernahme
  wesentlicher Teile. Genau das waere "alle Tools aus Kategorie X". Beschreibungen und
  Bewertungen sind zusaetzlich urheberrechtlich geschuetzt; die AGB beider Seiten verbieten
  Scraping ohnehin.
- **Strategie:** Eine schlechtere Kopie von Capterra hat keinen Grund zu ranken.

Einzelne **Tatsachen** ("es gibt ein Tool namens Ahrefs, das ist ein SEO-Tool") sind frei.
Der Unterschied ist: **Abgleich am Ende, nicht Quelle am Anfang.**

### Content-Pipeline (nutzt die vorhandenen Status-Felder)

| Stufe | Was passiert | Wer |
|---|---|---|
| `entwurf` | Collection existiert, Produkt-Kandidat erfasst (Name, URL) | Import + DataForSEO |
| `ki_ungeprueft` | KI schreibt aus den **Primaerquellen**: Kurzbeschreibung, Features, Pro/Contra. Deutsch, Du-Form. | KI |
| `redaktionell_geprueft` | Mensch liest gegen, korrigiert, ergaenzt Einschaetzung | Redaktion |
| `veroeffentlicht` | geht live | Redaktion |

**Hart:** `ki_ungeprueft` ist NIEMALS oeffentlich. Sonst stehen tausende halluzinierte
Feature-Listen im Index und die Marke ist verbrannt. Serverseitig durchsetzen (RLS), nicht im UI.

### Preis-Zustaende (Leitplanke 5)
- Listenpreis vom Anbieter = `preis_hinweis` + Quelle + Datum, **immer als unverifiziert gekennzeichnet**.
- **Verifizierter** Preis kommt ausschliesslich aus den anonymisierten Abrechnungsdaten mit
  Mindestschwelle (B-16). Das ist das Alleinstellungsmerkmal: "Der Anbieter sagt 99 EUR.
  Agenturen wie du zahlen im Median 118 EUR." Nicht verwaessern.

### Mengengeruest (realistisch)
1292 Collections x 10-20 Produkte = **13.000 bis 26.000 Produkteintraege**. Deshalb ist
"Cluster fuer Cluster" nicht nur SEO-Hygiene, sondern die einzige machbare Reihenfolge.
