# Design-System - Toolfolio

Diese Datei ist die verbindliche Design-Referenz fuer die `/frontend`-Skill. Quelle: PROJECT.md §9, plus der etablierte Stand aus dem Dashboard-Redesign. Charakter: warm, lebendig, freundlich, aber glaubwuerdig fuers Geld-Thema. Keine Kindergarten-Optik. Lesbarkeit schlaegt Deko.

## Farben

| Rolle | Hex |
|-------|-----|
| Hintergrund (Creme) | `#FBF7F1` |
| Text (Anthrazit) | `#1F1D2B` |
| Sekundaertext | `#6B7280` |
| Cards | `#FFFFFF` (weicher Schatten statt harter Border) |
| Primary (Violett) | `#6C5CE7` |
| Akzent (Koralle) | `#FF7A66` |
| Positiv / Ersparnis / verifiziert (Emerald) | `#12B76A` |
| Warnung / Fristen / Trials (Amber) | `#F5A623` |
| Risiko / Preiserhoehung (warmes Rot) | `#F0533D` |

### Kategorie-Farben
| Kategorie | Hex |
|-----------|-----|
| Design (Magenta) | `#E84393` |
| SEO (Gruen) | `#12B76A` |
| KI / API (Violett) | `#6C5CE7` |
| Kommunikation (Blau) | `#3B82F6` |
| Entwicklung (Tuerkis) | `#0FB5BA` |
| Produktivitaet (Amber) | `#F5A623` |
| eCommerce (Orange) | `#FB923C` |

## Typografie
- **Headlines & alle grossen Zahlen:** Bricolage Grotesque (SemiBold bis Bold).
- **Fliesstext, UI, Tabellen:** Plus Jakarta Sans.
- **Kein Monospace.** Betraege/Zahlen mit `font-variant-numeric: tabular-nums`.
- Betragsformat: `1.249,00 EUR`. Datum: `14.08.2026`.
- Fuer E-Mails: sichere Fallback-Kette (system-ui, Arial), Marke ueber Farbe und Logo, da Bricolage/Plus Jakarta in Mail-Clients meist nicht laden.

## Form & Tiefe
- Grosse Rundungen: Cards ~20px, Buttons ~14px, Pills/Badges voll rund.
- Weiche, leicht eingefaerbte Schatten statt duenner grauer Borders. Cards duerfen sanft "schweben".
- Grosszuegiger Innenabstand, viel Luft zwischen Modulen. Trennlinien dezent oder durch Abstand/Hover ersetzen.
- Statusfarben immer auch ueber Icon + Text transportieren, nie nur ueber Farbe (Barrierefreiheit, WCAG 2.1 AA).

## Bewegung & Microinteractions (dezent, nie nervig)
- Count-up auf grossen KPI-Zahlen beim Laden.
- Hover-Lift auf Cards und Tabellenzeilen.
- Charts zeichnen sich animiert ein (Recharts).
- Sanfte Transitions auf Hover/Toggle. Kein Dauer-Geblinke.
- Spielerischer Kern: Spar-Fortschritt als Ring/Leiste (Koralle + Emerald), dezenter kurzer Konfetti-Effekt beim Umsetzen eines Sparvorschlags.

## Logo
Wortmarke "Toolfolio" plus Stapel-Icon (drei versetzte gerundete Quadrate in Violett `#6C5CE7`, Koralle `#FF7A66`, Emerald `#12B76A`). SVG-Varianten liegen unter `docs/blueprint/` (horizontal, horizontal-akzent, stacked, icon). Fuer Produktion Schrift in Pfade umwandeln.

## Sprache (gilt auch hier)
Deutsch, Du-Form, korrekte Umlaute, keine Gedankenstriche. Ton kompetent, klar, freundlich, leicht entlastend.
