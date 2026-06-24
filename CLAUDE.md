# CLAUDE.md - Toolfolio

Dies ist die zentrale Anweisungsdatei fuer die Arbeit am Code. Sie gilt fuer jede Session.
Vollstaendiger Fachkontext: `PROJECT.md` (Vision), `FEATURES.md` (Features mit IDs), `ARCHITECTURE.md` (Systemsicht). Die Original-Lovable-Prompts liegen unter `docs/blueprint/` und sind **visuelle Referenz pro Screen, nicht der Bauplan fuers Backend**.

---

## 1. Was Toolfolio ist (eine Zeile)

Software-Kostenmanagement fuer DACH-Agenturen, Freelancer und Solopreneure: ein eingeloggter **Tracker** plus ein oeffentliches, SEO-getriebenes **Verzeichnis**, dessen Preise durch echte, anonymisierte Abrechnungsdaten verifiziert sind. Betreiber: OMMM GmbH, Leipzig.

---

## 2. Nicht verhandelbare Leitplanken (gelten ueberall im Code)

1. **Goldene Regel.** Kaeuflich ist nur Sichtbarkeit, immer als "gesponsert" gekennzeichnet. Organischer Rang, Bewertungen und verifizierte Daten sind **niemals** kaeuflich. Sortierung/Ranking sind serverseitig unabhaengig von bezahlter Sichtbarkeit. Die drei Zonen (gesponsert, organisch, Community) bleiben sichtbar getrennt.
2. **Vermittler-Prinzip.** Kein Hosting fremder Software, keine Drittzahlungsabwicklung, kein Backend-Lead-Posteingang. Leads gehen direkt an den Anbieter (E-Mail/Webhook), Toolfolio speichert nur ein anonymes Attributions-Ereignis (Tool, Datum, Code).
3. **Trennung personenbezogen vs. anonym (kritischste Leitplanke).** Personenbezogene Abo-/Kosten-/Beleg-/Kundendaten sind strikt getrennt von der anonymen Aggregat-Ebene. Nur Aggregate mit **hoher Mindestschwelle** speisen Benchmark, verifizierte Preise und KI-Auswertung. **Serverseitig erzwingen, nie nur im UI.** Niemals personenbezogene Inhalte an die Aggregat- oder KI-Ebene (Claude-API).
4. **Sicherheit.** Niemals vollstaendige Kartennummern, PruefZiffern oder IBAN speichern, nur Referenzen (z. B. letzte vier Ziffern). Niemals Passwortfelder fuer fremde Tools. Hinterlegte KI-API-Keys verschluesselt ablegen, nie ausgeben, nur serverseitig verwenden.
5. **Ehrlichkeit der Daten.** Verifizierte Preise haben Zustaende: verifiziert, zu wenig Daten, oder Listenpreis (unverifiziert). Niemals Scheingenauigkeit. Fristen und Schaetzungen als solche kennzeichnen.

Bei jeder Datenbank- und API-Arbeit: **Row Level Security auf jeder Tabelle**, Zugriff strikt auf Eigentuemer bzw. dessen Mandant.

---

## 3. Sprache & Ton (verbindlich fuer ALLE nutzersichtbaren Texte und Mails)

- **Deutsch, Du-Form.**
- **Korrekte Umlaute** im UI-Text (ae/oe/ue/ss nur in Code-Identifiern, Dateinamen und dieser internen Doku, niemals in Texten fuer Nutzer).
- **Keine Gedankenstriche.** Stattdessen Komma, Doppelpunkt oder Klammern.
- Betraege im Format `1.249,00 EUR`, tabular-nums.

---

## 4. Tech-Stack

**Produktion (verarbeitet Nutzerdaten, gehoert in die DSE):**
- **Next.js** (App Router, TypeScript) - SSR/SSG, kritisch fuer das SEO-Verzeichnis
- **Tailwind CSS + shadcn/ui** - UI, **Recharts** - Diagramme, **lucide-react** - Icons
- **Supabase** (PostgreSQL, Auth, Storage; EU-Region) - kompletter App-Datenbestand
- **Stripe (+ PayPal)** - Zahlung/Billing/Invoicing/Tax/Webhooks; Toolfolio speichert nur Referenzen
- **Resend** - Transaktionsmails | **Plausible** - cookielose Statistik (EU) | **Google** - SSO
- **Anthropic/Claude-API** - nur auf anonymen Aggregaten
- **Hosting: Hostinger (EU).** Deploy-Ziel ist Hostinger, **nicht Vercel** (Skill `deploy` ist entsprechend angepasst).

**Bauwerkzeuge (kein Nutzerdaten-Bezug):** Claude Code in VS Code, Git, Lovable (nur Prototyp-Referenz).

---

## 5. Die drei UI-Welten + Bereiche

Getrennte UI-Welten, gemeinsames Konto und Design-System:
- **Tracker (B-IDs)** - privat, eingeloggt, mandantenfaehig. `src/app/(app)/...`
- **Verzeichnis (V-IDs)** - oeffentlich, ohne Login, SSR/SSG. `src/app/(public)/...`
- **Anbieter-Portal (A-IDs)** - eingeloggt, eigene Nutzerrolle. `src/app/(provider)/...`

Weitere Bereiche: **M** Marketing (oeffentlich), **S** Auth, **E** Transaktionsmails (Resend), **R** Rechtsseiten. (Genaue Routen-Struktur entsteht beim Aufsetzen des Fundaments / der jeweiligen Architektur.)

---

## 6. Arbeits-Workflow (Flow-ee Skills)

Pipeline pro Feature, jeweils als Slash-Command:
`/write-spec` -> `/architecture` -> `/frontend` -> `/backend` -> `/qa` -> `/deploy`
Dazu: `/help` (wo stehe ich), `/refine <ID>` (Spec ueberarbeiten), `/init` (nur fuer ganz neue Projekte - hier bereits erledigt, siehe unten).

**Status-Lebenszyklus eines Features:** Roadmap -> Planned (nach `/write-spec`) -> in Bau (architecture/frontend/backend) -> QA -> Deployed.

### Doku-Mapping (wichtig, weicht vom Skill-Default ab)
- Skills erwarten `docs/PRD.md`, `features/INDEX.md`, `docs/design-system.md` - alle vorhanden.
- **`/init` ist faktisch erledigt:** PROJECT.md = PRD-Quelle, FEATURES.md + Template-Bibliothek = Feature-Map, ARCHITECTURE.md = Tech-Design-Grundlage. Nicht erneut `/init` laufen lassen.
- **Feature-IDs:** Wir nutzen das etablierte Schema **B- / M- / V- / A- / S- / E- / R-** (nicht "PROJ-X"). Wo ein Skill "PROJ-X" sagt, ist unsere jeweilige Template-ID gemeint. Spec-Dateien liegen unter `features/<ID>-kurzname.md` (z. B. `features/B-12-fristen-waechter.md`).
- Beim Bauen eines Screens: zugehoerige Original-Lovable-Prompt unter `docs/blueprint/lovable-prompts/` als visuelle Referenz lesen, aber Datenmodell/Backend nach FEATURES.md + ARCHITECTURE.md + Spec bauen.

---

## 7. Code-Konventionen

- TypeScript strikt. Komponenten in `src/components/`, shadcn-Primitives in `src/components/ui/`.
- Standard-UI immer ueber shadcn/ui (erst `src/components/ui/` pruefen, fehlende mit `npx shadcn@latest add <name> --yes` nachziehen). Eigene Komponenten nur als Komposition daraus.
- Preise, Plan-Grenzen und aehnliche Geschaeftskonstanten als **zentrale, kommentierte Konstante** an einer Stelle (Platzhalter klar markiert).
- API-Routen unter `src/app/api/`, Zod-Validierung auf jedem POST/PUT, Auth-Pruefung immer, sinnvolle Fehlermeldungen.
- Tests mit Vitest neben der Route (`*.test.ts`): Happy Path, Validierungsfehler (400), unauth (401), falscher Nutzer (403).
- Betraege/Daten immer im deutschen Format, `font-variant-numeric: tabular-nums`.

---

## 8. Sicherheits- und Compliance-Notizen

- Drittland-Dienste (Resend, Google, Stripe, PayPal) brauchen geeignete Garantien (SCC/DPF).
- Consent vor dem Laden nicht notwendiger Einbettungen (YouTube), Click-to-load. Plausible cookielos.
- Rechtsseiten (R-01 bis R-04) sind Entwuerfe, vor Livegang anwaltlich pruefen (Max). Besonders: Benchmark-Anonymisierung und YouTube-Consent.
- Geplante Bankanbindung (PSD2) und API-Key-Verwaltung vor Live-Betrieb in die DSE aufnehmen.
