## Ziel

Vierter Erfassungsweg fuer verbrauchsbasierte AI-Dienste: Nutzer hinterlegt API-Key, Toolfolio liest Verbrauch und Kosten live. UI ist ehrlich ueber `usageCapability` (full / partial / spend_only). Reines Frontend-Mock-Template im bestehenden Design-System, keine echten API-Calls.

## Neue Dateien

1. **`src/lib/ai-providers.ts`** — Typen (`UsageCapability`, `AiProvider`) und `aiProviders`-Array mit OpenAI, Anthropic, Gemini, Perplexity, xAI. Helfer `capabilityBadge(cap)` fuer Farbe/Label.
2. **`src/components/toolfolio/connect-ai-service-modal.tsx`** — wiederverwendbare Modal-Komponente (Dialog aus shadcn):
   - Header mit Logo-Initial-Tile, Name, Capability-Badge
   - Amber-Warnbox bei `keyTypeWarning`
   - Primaerbutton "Key bei {name} holen" (target=_blank, rel=noopener noreferrer)
   - Nummerierte Schrittliste
   - Maskiertes Input mit Einblend-Toggle, weiche Prefix-Validierung
   - "Verbindung testen": simuliertes Loading -> Erfolg/Fehler (rein clientseitig, kein echter Call)
   - Erfolgszustand mit gruenem Check und Mock-Usage-Vorschau
   - SecurityNote-Block
3. **`src/components/toolfolio/integrationen.tsx`** — B-24 Integrationen-Seite mit Sidebar/AppShell, Kategorien Google Workspace, Bank, E-Mail (Stubs) plus neue Kategorie "AI-Services / API-Verbrauch" mit Provider-Grid.
4. **`src/routes/integrationen.tsx`** — Route.

## Datenmodell-Erweiterung

5. **`src/lib/abos-data.ts`** — `AboListItem` erweitern um `costType?: "flat" | "usage_based"`, `integrationProviderId?: string`, `usageCapability?: UsageCapability`, `lastSyncedAt?: string`, `currentPeriodSpend?: number`, `creditsRemaining?: number`. Mock-Werte fuer Anthropic/OpenAI/Perplexity setzen.

## Anpassungen bestehender Templates

6. **`src/components/toolfolio/onboarding-wizard.tsx`** — neuen optionalen Schritt "AI-Services verbinden" in Stepper einfuegen (nach E-Mail/Beleg-Schritt), Provider-Grid + Modal, Skip-CTA "Spaeter in den Integrationen erledigen".
7. **`src/components/toolfolio/ai-credits.tsx`** — pro Tool Datenquellen-Badge (Live-API gruen / aus Rechnung grau). Inline-CTA "Per API verbinden fuer Live-Daten" oeffnet Modal bei verbrauchsbasierten Tools ohne Verbindung. Verlauf/Spike-Texte minimal ergaenzen ("Live-Daten").
8. **`src/components/toolfolio/dashboard.tsx`** — Waechter-Block um eine Live-AI-Spike-Nudge ergaenzen; KPI-Bereich optionale Kachel "variable AI-Kosten (Live)".
9. **`src/components/toolfolio/abo-detail.tsx`** — fuer `usage_based`-Abos Abschnitt "Live-Verbrauch" (verlinkt auf `/ai-credits`) mit Badge "per API verbunden" oder Connect-CTA.
10. **`src/components/toolfolio/budget-forecast.tsx`** — variable AI-Kosten visuell trennen (eigene Spur/Legende "variabel"), Hinweis, dass Live-verbundene Tools praezisere Hochrechnung haben.
11. **`src/components/toolfolio/app-shell.tsx`** — Sidebar-Eintrag "Integrationen" ergaenzen (falls noch nicht vorhanden).

## Backend-Kontrakt (dokumentiert, nicht implementiert)

Da reine Frontend-Templates: Endpoints (`POST/GET/DELETE /api/integrations/ai/...`) als Kommentar-Block oben in `connect-ai-service-modal.tsx` dokumentieren. Sicherheitsregeln (kein Key im Browser-Storage, alle Test-Calls ueber Backend) als Kommentar festhalten. Im Mock: Key nur in lokalem React-State, kein localStorage.

## Design-Hinweise

- Gleiche Tokens und Komponenten wie bestehende Backend-Templates.
- Capability-Badges: full = emerald, partial = amber, spend_only = slate.
- Keine Gedankenstriche, korrekte Umlaute, Du-Form.
- Provider-Logos als farbige Initial-Tiles (kein Asset-Import).

## Akzeptanz

Alle 9 Kriterien aus dem Prompt sind durch obige Aenderungen abgedeckt.