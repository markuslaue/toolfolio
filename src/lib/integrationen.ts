/** B-24: Provider-Registry fuer verbrauchsbasierte API-Dienste. */

/**
 * Ehrlich darueber, was ein Anbieter ueber seine API wirklich hergibt:
 * - full:       Verbrauch UND Kosten
 * - partial:    Verbrauch/Guthaben, Kosten nur teilweise
 * - spend_only: nur Geldwerte (Guthaben/Ausgaben), keine Nutzungsdetails
 */
export type UsageCapability = "full" | "partial" | "spend_only";

export type AuthTyp = "basic" | "apikey";

export type ProviderId = "dataforseo" | "openai" | "anthropic";

export interface AiProvider {
  id: ProviderId;
  name: string;
  farbe: string;
  beschreibung: string;
  capability: UsageCapability;
  authTyp: AuthTyp;
  /** Waehrung, in der der Anbieter abrechnet. Ist sie nicht EUR, wird ein Kurs gepflegt. */
  waehrung: "EUR" | "USD";
  /** Felder, die der Nutzer eingibt. */
  felder: { key: string; label: string; typ: "text" | "password"; placeholder?: string }[];
  /** Wo der Nutzer die Zugangsdaten findet. */
  keyUrl: string;
  /** Warnhinweis, falls es sich um ein Passwort statt eines Tokens handelt. */
  warnung?: string;
}

export const CAPABILITY_LABEL: Record<UsageCapability, string> = {
  full: "Verbrauch und Kosten",
  partial: "Verbrauch, Kosten teilweise",
  spend_only: "Nur Guthaben und Ausgaben",
};

export const CAPABILITY_STIL: Record<UsageCapability, string> = {
  full: "bg-success/15 text-success",
  partial: "bg-warning/15 text-warning",
  spend_only: "bg-muted text-muted-foreground",
};

export const PROVIDERS: AiProvider[] = [
  {
    id: "dataforseo",
    name: "DataForSEO",
    farbe: "#1F6FEB",
    beschreibung: "SEO-Daten-APIs auf Guthaben-Basis. Wir lesen Restguthaben und verbrauchte Beträge.",
    capability: "spend_only",
    authTyp: "basic",
    waehrung: "USD",
    felder: [
      { key: "login", label: "Login (E-Mail)", typ: "text", placeholder: "name@agentur.de" },
      { key: "passwort", label: "API-Passwort", typ: "password" },
    ],
    keyUrl: "https://app.dataforseo.com/api-access",
    warnung:
      "DataForSEO bietet nur Basic Auth (Login + Passwort), kein Token. Wir speichern die Zugangsdaten verschlüsselt, geben sie nie aus und nutzen ausschliesslich lesende Endpunkte.",
  },
  {
    id: "openai",
    name: "OpenAI",
    farbe: "#10A37F",
    beschreibung:
      "Liest die tatsächlichen Kosten deiner Organisation pro Tag. Damit siehst du den Verbrauch live, statt ihn aus der Monatsrechnung zu schätzen.",
    capability: "spend_only",
    authTyp: "apikey",
    waehrung: "USD",
    felder: [
      {
        key: "admin_key",
        label: "Admin-API-Key",
        typ: "password",
        placeholder: "sk-admin-...",
      },
    ],
    keyUrl: "https://platform.openai.com/settings/organization/admin-keys",
    warnung:
      "Es muss ein Admin-Key sein (beginnt mit sk-admin-), kein normaler API-Key: nur der darf die Kosten-Endpunkte lesen. Er kann keine Anfragen an Modelle stellen und kostet dich also nichts. Wir speichern ihn verschlüsselt, geben ihn nie aus und lesen ausschliesslich Kosten.",
  },
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    farbe: "#CC785C",
    beschreibung:
      "Liest den Kostenbericht deiner Organisation pro Tag. Verbrauch live statt geschätzt.",
    capability: "spend_only",
    authTyp: "apikey",
    waehrung: "USD",
    felder: [
      {
        key: "admin_key",
        label: "Admin-API-Key",
        typ: "password",
        placeholder: "sk-ant-admin...",
      },
    ],
    keyUrl: "https://console.anthropic.com/settings/admin-keys",
    warnung:
      "Es muss ein Admin-Key sein (beginnt mit sk-ant-admin), kein normaler API-Key: nur der darf den Kostenbericht lesen. Er kann keine Anfragen an Modelle stellen. Wir speichern ihn verschlüsselt, geben ihn nie aus und lesen ausschliesslich Kosten.",
  },
];

export function provider(id: string): AiProvider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

/** Was ein Sync vom Anbieter zurueckbringt. */
export type Verbrauch = {
  /** Restguthaben in EUR/USD laut Anbieter. Postpaid-Anbieter liefern null. */
  guthaben: number | null;
  /** Insgesamt verbrauchter Betrag seit Kontoeroeffnung (kumuliert). */
  kumuliertAusgegeben: number | null;
  /**
   * EXAKTE Monatswerte, wenn der Anbieter datierte Tageswerte liefert
   * (OpenAI, Anthropic). Betrag in der Waehrung des Anbieters.
   *
   * Warum das besser ist als der kumulierte Zuwachs: Der Zuwachs seit dem letzten
   * Abgleich landet immer im LAUFENDEN Monat. Laeuft der Abgleich am 1. um 3 Uhr,
   * faellt der Verbrauch der letzten Tage des Vormonats faelschlich in den neuen.
   * Wer datierte Werte liefert, bekommt deshalb exakte Monatszahlen geschrieben.
   */
  monate?: { jahr: number; monat: number; betrag: number }[];
};
