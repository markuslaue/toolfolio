# B-10: Sparvorschlaege

## Status: In Review
**Projekt:** PRJ (Tracker) · **Created:** 2026-06-26 · **Prio:** P0

## User Stories
- Als Nutzer sehe ich konkrete Vorschlaege, wie ich bei meinen Tools sparen kann, mit Euro-Betrag pro Jahr.
- Ich kann Vorschlaege als umgesetzt oder ignoriert markieren; realisierte Ersparnis wird im Ring sichtbar.

## Acceptance Criteria
- [x] /app/sparen: Hero-Ring (realisiert vs. Gesamtpotenzial, Count-up), KPIs, Tabs Offen/Umgesetzt/Ignoriert, Typ-Filter, Sortierung.
- [x] Vorschlags-Karten mit Typ-Badge, Spar-Betrag (geschaetzt-Kennzeichnung), Begruendung, Tools, Aktionen (umsetzen/ignorieren/erinnern), Konfetti bei Umsetzung.
- [x] Status wird serverseitig persistiert (umgesetzt/ignoriert, mit Snapshot), bleibt erhalten auch wenn die Engine den Vorschlag nicht mehr berechnet.
- [x] Vorschlaege EHRLICH aus eigenen Abodaten berechnet: Intervall (monatlich/quartalsweise -> jaehrlich, geschaetzt mit Jahresrabatt), Redundanz (mehrere aktive Tools je Kategorie), Zombie (pausierte Abos, die weiterlaufen).
- [x] RLS owner-only auf sparvorschlag_status.

## Out of Scope (folgt mit Daten)
- Marktpreis-Vergleich (braucht Benchmark/Aggregat F-G2), Gutscheine/Partner-Deals, Retention-Rabatte, Alternativen, Guthaben. UI-Shell traegt diese Typen bereits (faithful Port), sie leuchten auf, sobald die Datengrundlage existiert. Keine Scheingenauigkeit (Leitplanke Ehrlichkeit der Daten).

## Tech Design
- Engine src/lib/sparvorschlaege.ts (pure, unit-getestet) -> Vorschlag[] aus Abo[].
- Persistenz: Tabelle sparvorschlag_status (PK user_id+key, Snapshot), Server-Actions setVorschlagStatus/resetVorschlag.
- UI faithful aus Lovable sparvorschlaege.tsx portiert (Hero-Ring, Tabs, Filter, Karten, Confetti, Dialog), Mock-Daten ersetzt durch Props + Actions. Hook use-count-up neu.

## QA (2026-06-26)
- Unit-Tests Engine: Intervall (15->36 EUR), Redundanz (96 EUR, 2 Tools), Zombie (pausiert), kein Vorschlag bei einzelnem Jahres-Abo. 4/4 PASS.
- Build gruen (tsc/ESLint/next build). Route /app/sparen gated.
