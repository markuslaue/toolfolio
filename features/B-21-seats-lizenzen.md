# B-21: Seats- / Lizenzverwaltung

## Status: In Review
**Projekt:** PRJ (Tracker) · **Bereich:** B · **Created:** 2026-06-27 · **Prio:** P2 · **Abhaengig von:** B-22

## User Stories
- Als Agentur sehe ich je Tool die gebuchten Plaetze gegen die tatsaechlich zugewiesenen und erkenne ungenutzte Lizenzen.
- Ich passe die gebuchten Plaetze an und hole mir Verschwendung als Ersparnis zurueck.

## Acceptance Criteria
- [x] /app/seats: KPIs (Gebucht, Zugewiesen, Ungenutzt, Verschwendung Monat + Jahr), Empfehlungs-Banner bei ungenutzten Plaetzen.
- [x] Tool-Karten: Seat-Balken (zugewiesen / gebucht), Ungenutzt-Pill, Verschwendung (= ungenutzt x Preis pro Platz), Drilldown der Nutzer.
- [x] Gebuchte Plaetze (Lizenzen) je Abo inline setzen/anpassen.
- [x] "Zugewiesen" kommt aus den Zugaengen (B-22, tool_zugang). RLS owner-only auf abos.lizenzen.

## Out of Scope (-> B-24)
- Echte Nutzungs-Aktivitaet (genutzt vs. nur zugewiesen) braucht Integrationen/SSO. Hier zaehlt "zugewiesen"; letzte Nutzung als "Nutzungsdaten noetig" gekennzeichnet.

## Tech Design
- abos.lizenzen (Migration). Server-Action setLizenzen. Page berechnet je Tool: gebucht, zugewiesen (tool_zugang-Count), Preis pro Platz (Monatskosten/gebucht), ungenutzt, Verschwendung.
- UI faithful aus Lovable seats.tsx portiert (KPIs, Seat-Balken, Verschwendung, Drilldown).

## QA (2026-06-27)
- Build gruen (tsc/ESLint/next build). Umlaut-Gegenprobe ok. Route /app/seats gated.
