# R-04: Cookie-/Consent-Banner (privacy-first)

## Status: Approved & Deployed
**Projekt:** PRJ (Recht) · **Bereich:** R · **Created:** 2026-06-26 · **Prio:** P0

## Leitidee
Privacy-first: Toolfolio setzt nur technisch notwendige Cookies und misst die Reichweite **cookielos** mit Plausible (keine personenbezogenen Profile). Daher ist eine Einwilligung nur fuer **externe Medien** (z. B. YouTube) noetig, die per **Click-to-load** erst nach Zustimmung geladen werden.

## Acceptance Criteria
- [x] Banner auf der oeffentlichen Welt (Erstbesuch), erklaert cookielose Statistik + Click-to-load, Buttons "Alle akzeptieren" / "Nur notwendige" / "Einstellungen", Link zur Datenschutzerklaerung.
- [x] Einstellungen-Dialog: Notwendig (immer), Statistik cookielos (immer, transparent), Externe Medien (Toggle). Auswahl in localStorage.
- [x] Footer-Eintrag "Cookie-Einstellungen" oeffnet den Dialog erneut (jederzeit widerruf-/aenderbar).
- [x] Click-to-load-Komponente (MediaEmbed) fuer externe Einbettungen: laedt iframe erst nach Zustimmung (einmal oder dauerhaft).
- [x] Plausible-Loader (cookielos) laedt nur, wenn Domain gesetzt; kein Consent-Gate.
- [x] Kein Hydration-Flash: Banner via useSyncExternalStore (SSR rendert kein Banner).

## Out of Scope
- Echtes TCF/IAB-Framework (nicht noetig ohne Werbe-Cookies). Server-seitige Consent-Protokollierung (clientseitige Praeferenz genuegt bei rein technisch notwendigen Cookies + cookieloser Statistik).

## Tech Design
- src/components/consent/: consent.tsx (Store via localStorage + useSyncExternalStore, Banner, Einstellungen-Dialog), media-embed.tsx (Click-to-load), consent-settings-button.tsx (Footer), plausible.tsx (cookieloser Loader). Eingehaengt in (site)/layout.tsx.

## QA (2026-06-26)
- Build gruen (tsc/ESLint/next build). Oeffentliche Seiten laden (200). Banner clientseitig nach Hydration, keine SSR-Diskrepanz.
- Rechtlicher Hinweis: vor Live-Gang anwaltlich pruefen (TTDSG/DSGVO, YouTube-Consent), siehe CLAUDE.md.
