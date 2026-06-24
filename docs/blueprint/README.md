# Blueprint (Original-Referenzen)

Hier liegen die urspruenglichen Toolfolio-Dokumente und die Lovable-Prompt-Dateien pro Screen.

**Wichtig:** Die `toolfolio-lovable-prompt-*.md` sind **visuelle Dummy-Vorlagen pro Screen** (Layout/UX), **nicht** der Bauplan fuers echte Backend. Der Bauplan ist `PROJECT.md` / `FEATURES.md` / `ARCHITECTURE.md` im Repo-Root sowie die jeweilige Feature-Spec.

## Ablage
- `lovable-prompts/` - die `toolfolio-lovable-prompt-*.md` (eine pro Screen, plus die SVG-Logos)
- `emails/` - die `toolfolio-email-*.md` (acht Transaktionsmail-Vorlagen)
- direkt hier: Uebersichts- und Bibliotheks-Dokumente (gesamtuebersicht, template-bibliothek-v2, template-spezifikation, featureliste, pitch)

## Status
Die Original-Dateien werden hier abgelegt (byte-exakt aus dem Uebergabepaket). Beim Bau eines Screens liest die `/frontend`-Skill die zugehoerige Prompt-Datei als visuelle Referenz, setzt Datenmodell/Backend aber nach FEATURES.md + ARCHITECTURE.md + Spec um.
