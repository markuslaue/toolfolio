# V-Fundament: Oeffentliches Verzeichnis (V-01/02/03/04/11/12)

## Status: Fundament deployed 2026-06-28 (Seed-Daten; CMS/Taxonomie/KI offen)

## Was live ist
Datenmodell + RLS + Seed + oeffentliche Templates, alles SSG/ISR aus der DB.

- **Datenmodell (`dir_*`)**: `dir_cluster`, `dir_kategorie` (L1/L2), `dir_collection` (Ranking-Knoten), `dir_produkt`, `dir_collection_produkt` (Zone), `dir_review` (zweistufig). Strikt vom Tracker getrennt (kein FK). RLS: anon liest nur `status='veroeffentlicht'`, Schreiben nur Redaktion via `is_staff()`-Helfer (SECURITY DEFINER). Migrationen 20260628140000/141000.
- **Seed**: 3 Cluster (Design, Produktivitaet, KI), je Collection, 8 bekannte Tools (Figma, Canva, Adobe, Notion, Asana, Slack, ChatGPT, Claude) mit Preis (Stand+Quelle), Pro/Contra, Features; einige freigegebene Bewertungen.
- **Zugriff**: `src/lib/supabase/public.ts` (anon, ohne Cookies, SSG-faehig) + `src/lib/verzeichnis.ts` (Typen + Queries + serverseitiger `organischerScore`).
- **Seiten** (alle unter `(site)`, Nav-Link „Verzeichnis"):
  - `/verzeichnis` (V-01 Hub + Suchfeld + Cluster/Collections)
  - `/verzeichnis/[cluster]` (V-02 Cluster-Hub)
  - `/verzeichnis/[cluster]/[collection]` (V-03 Collection, **drei Zonen**: gesponsert gekennzeichnet, organisch serverseitig nach Score sortiert, community; Goldene-Regel-Hinweis)
  - `/software/[slug]` (V-04 Detail: Preis-Sorgfalt Stand+Quelle+Link, Pro/Contra, Features/Plattformen, **getrennte verifizierte/offene Bewertungen**, „gelistet in")
  - `/verzeichnis/suche` (V-11, noindex)
  - `/verzeichnis/bewerten` (V-12 minimal: First-Party-Einreichung -> Status „neu", Moderation; noindex)

## Leitplanken eingehalten
- Goldene Regel: nur gesponserte Sichtbarkeit (gekennzeichnet, `gesponsert_bis`); organisches Ranking serverseitig (`organischerScore`: verifizierte Reviews > Schnitt > Vollstaendigkeit), unabhaengig von Bezahlung.
- Preis-Sorgfalt (UWG): jeder Preis mit Stand, „Listenpreis" und Quelle-Link (nofollow).
- Bewertungen First-Party, zweistufig getrennt dargestellt; Einreichung moderiert.
- Datentrennung: Verzeichnis liest NIE Tracker-Tabellen.

## Offen (grosse Folge-Bloecke)
- **AD-01/AD-02 Redaktions-CMS**: Struktur-/Produkt-/Collection-Editoren, Taxonomie-Import (1315 Kategorien), KI-Workflows, Claim/Outreach. Aktuell wird Inhalt per Seed/Migration gepflegt.
- **V-04 v2**: Attribution/Lead an Anbieter (E-08), Rabatt-/Deal-Anzeige.
- **V-05..V-10, V-13..V-15**: Long-Tail-Templates (Preise, Erfahrungen, Alternativen, Vergleich, Deals, kuendigen, wechseln, lohnt-sich).
- **V-12 Verifizierung**: „verifizierte Bewertung" via anonymem Tracker-Abgleich (haengt an Aggregat-Ebene B-16/F-G2).
- **Anbieter-Portal A-01..A-07** (Claim, Herkunft-B-Pflege, Premium-Platzierung).
- Strukturierte Daten (ItemList/Product/AggregateRating/BreadcrumbList) als SEO-Ausbau.

## QA
- 2026-06-28: tsc 0, `next build` (86 Seiten, V-Seiten SSG aus DB), 27 Tests gruen. Live verifiziert: Hub/Cluster/Collection/Detail/Suche/Bewerten = 200; drei Zonen + Preis-Quelle sichtbar.
