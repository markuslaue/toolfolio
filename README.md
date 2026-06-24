# Toolfolio

Software-Kostenmanagement fuer DACH-Agenturen, Freelancer und Solopreneure: ein eingeloggter **Tracker** plus ein oeffentliches, SEO-getriebenes **Verzeichnis** mit durch echte, anonymisierte Abrechnungsdaten verifizierten Preisen. Betreiber: OMMM GmbH, Leipzig.

Diese Codebasis ist der saubere Neuaufbau (Claude Code) und ersetzt den Lovable-Prototyp.

## Stack
Next.js (App Router, TS) · Tailwind CSS · shadcn/ui · Recharts · lucide-react · Supabase (EU) · Stripe + PayPal · Resend · Plausible · Google-SSO · Hosting: Hostinger (EU).

## Zuerst lesen
1. `CLAUDE.md` - Leitplanken, Stack, Workflow, Code-Konventionen (gilt fuer jede Session).
2. `PROJECT.md` / `FEATURES.md` / `ARCHITECTURE.md` - der fachliche Bauplan.
3. `docs/PRD.md`, `features/INDEX.md`, `docs/design-system.md` - Einstiegspunkte fuer die Skills.

## Arbeits-Workflow (Skills unter `.claude/skills/`)
Pro Feature: `/write-spec` -> `/architecture` -> `/frontend` -> `/backend` -> `/qa` -> `/deploy`.
Dazu `/help` (Standortbestimmung), `/refine <ID>` (Spec ueberarbeiten). `/init` ist bereits erledigt.

Feature-IDs folgen dem etablierten Schema (B-, M-, V-, A-, S-, E-, R-, INFRA-), siehe `features/INDEX.md`.

## Verzeichnisstruktur
- `src/app/` - Next.js Routen (Tracker / Verzeichnis / Anbieter-Portal / Marketing / Auth)
- `src/components/` (`ui/` = shadcn) · `src/lib/` · `src/hooks/`
- `features/` - Feature-Map (`INDEX.md`) und Feature-Specs (`<ID>-name.md`)
- `docs/` - PRD, Design-System, Production-Guides, `blueprint/` (Original-Referenz)
- `.claude/skills/` - die Flow-ee Skills (deploy auf Hostinger angepasst)

## Setup (folgt mit INFRA-1)
Wird beim Bau des Fundament-Features (`INFRA-1`) angelegt: Next.js-Projekt, Supabase-Anbindung, Env-Beispieldatei, Navigation der drei Welten.
