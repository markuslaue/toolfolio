export type UsageCapability = "full" | "partial" | "spend_only";

export interface AiProvider {
  id: string;
  name: string;
  initial: string;
  farbe: string;
  keyType: "Admin Key" | "API Key";
  keyTypeWarning?: string;
  keyPrefix?: string;
  setupUrl: string;
  usageCapability: UsageCapability;
  usageLabel: string;
  instructions: string[];
  securityNote: string;
}

export const aiProviders: AiProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    initial: "O",
    farbe: "#10A37F",
    keyType: "Admin Key",
    keyTypeWarning:
      "Wichtig: Es muss der Admin-Key der Organisation sein, NICHT der normale Projekt-Key. Nur der Admin-Key kann Verbrauch und Kosten lesen.",
    keyPrefix: "sk-",
    setupUrl: "https://platform.openai.com/settings/organization/admin-keys",
    usageCapability: "full",
    usageLabel: "Live-Verbrauch + Kosten",
    instructions: [
      "Logge dich auf platform.openai.com ein.",
      "Klicke unten links auf deinen Organisationsnamen und waehle 'Organization settings'.",
      "Oeffne links 'Admin keys' und klicke 'Create admin key'.",
      "Vergib einen Namen (z.B. Toolfolio), kopiere den Key und fuege ihn unten ein.",
    ],
    securityNote:
      "Toolfolio liest ausschliesslich die Usage- und Cost-Endpoints. Der Key wird verschluesselt gespeichert und ist jederzeit widerrufbar.",
  },
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    initial: "A",
    farbe: "#D97757",
    keyType: "Admin Key",
    keyTypeWarning:
      "Es muss der Admin-Key sein (beginnt mit sk-ant-admin), nicht der normale API-Key. Admin-Keys haben aktuell Read-Write-Rechte ohne feinere Abstufung, Toolfolio liest aber nur Usage und Cost.",
    keyPrefix: "sk-ant-admin",
    setupUrl: "https://console.anthropic.com/settings/admin-keys",
    usageCapability: "full",
    usageLabel: "Live-Verbrauch + Kosten",
    instructions: [
      "Logge dich auf console.anthropic.com ein.",
      "Oeffne 'Organization settings' und dann 'Admin keys'.",
      "Klicke 'Create admin key' und vergib einen Namen.",
      "Kopiere den Key (sk-ant-admin...) und fuege ihn unten ein.",
    ],
    securityNote:
      "Toolfolio liest nur die Usage- und Cost-Report-Endpoints. Verschluesselte Speicherung, jederzeit widerrufbar.",
  },
  {
    id: "google-gemini",
    name: "Google Gemini",
    initial: "G",
    farbe: "#4285F4",
    keyType: "API Key",
    keyTypeWarning:
      "Die vollstaendige Kostenauslese laeuft bei Google ueber die Cloud Billing (Prepaid-Credits). Mit einem reinen API-Key ist der Verbrauch nur eingeschraenkt sichtbar.",
    keyPrefix: "AIza",
    setupUrl: "https://aistudio.google.com/apikey",
    usageCapability: "partial",
    usageLabel: "Eingeschraenkt (Cloud Billing noetig)",
    instructions: [
      "Logge dich auf aistudio.google.com ein.",
      "Oeffne die API-Key-Seite und erstelle einen Key fuer dein Projekt.",
      "Kopiere den Key und fuege ihn unten ein.",
      "Fuer vollstaendige Kosten verbinde spaeter optional dein Google-Cloud-Billing-Konto.",
    ],
    securityNote:
      "Toolfolio nutzt den Key nur lesend. Detaillierte Kosten erfordern eine separate Cloud-Billing-Anbindung.",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    initial: "P",
    farbe: "#1FB8CD",
    keyType: "API Key",
    keyPrefix: "pplx-",
    setupUrl: "https://www.perplexity.ai/settings/api",
    usageCapability: "partial",
    usageLabel: "Eingeschraenkt",
    instructions: [
      "Logge dich auf perplexity.ai ein.",
      "Oeffne 'Settings' und den Bereich 'API'.",
      "Generiere einen API-Key (pplx-...) und fuege ihn unten ein.",
    ],
    securityNote:
      "Der Verbrauch ist bei Perplexity programmatisch nur eingeschraenkt abrufbar. Toolfolio ergaenzt fehlende Werte ueber die Rechnung.",
  },
  {
    id: "xai-grok",
    name: "xAI (Grok)",
    initial: "X",
    farbe: "#0F1419",
    keyType: "API Key",
    keyPrefix: "xai-",
    setupUrl: "https://console.x.ai",
    usageCapability: "partial",
    usageLabel: "Eingeschraenkt",
    instructions: [
      "Logge dich auf console.x.ai ein.",
      "Oeffne den Bereich 'API Keys' und erstelle einen neuen Key.",
      "Kopiere den Key und fuege ihn unten ein.",
    ],
    securityNote:
      "Der programmatische Verbrauchs-Read ist bei xAI aktuell eingeschraenkt. Toolfolio ergaenzt sonst ueber die Rechnung.",
  },
];

export function capabilityBadge(cap: UsageCapability): { bg: string; text: string; label: string } {
  if (cap === "full") return { bg: "#E7F8EF", text: "#0B6B40", label: "Live-Verbrauch + Kosten" };
  if (cap === "partial") return { bg: "#FEF3DA", text: "#8A5A0B", label: "Eingeschraenkt" };
  return { bg: "#ECE6DA", text: "#3D3A4D", label: "Nur Rechnung" };
}

export function findProvider(id?: string): AiProvider | undefined {
  if (!id) return undefined;
  return aiProviders.find((p) => p.id === id);
}
