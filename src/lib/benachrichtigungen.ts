import { tageBis, type Frist } from "@/lib/fristen";
import type { Vorschlag } from "@/lib/sparvorschlaege";

export type AktionTyp =
  | "frist"
  | "trial"
  | "preiserhoehung"
  | "spike"
  | "zombie"
  | "sparvorschlag"
  | "gutschein"
  | "karte"
  | "guthaben"
  | "import";

export type Zeitgruppe = "Heute" | "Gestern" | "Diese Woche" | "Älter";
export type BenachrStatus = "gelesen" | "erledigt" | "ignoriert";

export interface Aktion {
  key: string;
  typ: AktionTyp;
  titel: string;
  beschreibung: string;
  chip?: string;
  zeit: string;
  gruppe: Zeitgruppe;
  ungelesen: boolean;
  aktion: { label: string; to: string };
}

export interface AktivitaetsEintrag {
  id: string;
  typ: "abo-add" | "kunde-zuordnen" | "import" | "vorschlag-umgesetzt" | "preis-erhoehung" | "report" | "zahlungskanal";
  text: string;
  zeit: string;
  gruppe: Zeitgruppe;
  ts: number; // zum Sortieren
}

function faelligText(tage: number): string {
  if (tage < 0) return `seit ${Math.abs(tage)} Tagen überfällig`;
  if (tage === 0) return "heute fällig";
  if (tage === 1) return "morgen fällig";
  return `in ${tage} Tagen fällig`;
}

/** Live abgeleitete, handlungsrelevante Benachrichtigungen aus Fristen + Sparvorschlaegen. */
export function buildAktionen(
  fristen: Frist[],
  offeneVorschlaege: Vorschlag[],
  statusMap: Map<string, BenachrStatus>,
  heute = new Date(),
): Aktion[] {
  const out: Aktion[] = [];

  for (const f of fristen) {
    const tage = tageBis(f.datum, heute);
    if (tage > 45 || tage < -60) continue; // nur relevantes Fenster
    const key = `frist:${f.key}`;
    const st = statusMap.get(key);
    if (st === "erledigt" || st === "ignoriert") continue;

    let typ: AktionTyp = "frist";
    let titel = `Kündigungsfrist für ${f.titel} läuft bald ab`;
    let to = "/app/fristen";
    let label = "Frist ansehen";
    if (f.art === "trial") {
      typ = "trial";
      titel = `Trial bei ${f.titel} endet bald`;
      label = "Entscheiden";
    } else if (f.art === "karte") {
      typ = "karte";
      titel = `${f.titel} läuft ab`;
      to = "/app/zahlungskanaele";
      label = "Karte aktualisieren";
    }

    out.push({
      key,
      typ,
      titel,
      beschreibung: f.konsequenz,
      chip: f.titel,
      zeit: faelligText(tage),
      gruppe: "Heute",
      ungelesen: st !== "gelesen",
      aktion: { label, to },
    });
  }

  for (const v of offeneVorschlaege) {
    const key = `spar:${v.key}`;
    const st = statusMap.get(key);
    if (st === "erledigt" || st === "ignoriert") continue;
    out.push({
      key,
      typ: v.typ === "zombie" ? "zombie" : "sparvorschlag",
      titel: v.typ === "zombie" ? v.titel : `Neuer Sparvorschlag: ${v.titel}`,
      beschreibung: v.begruendung,
      chip: v.tools[0]?.name,
      zeit: "gerade vorgeschlagen",
      gruppe: "Heute",
      ungelesen: st !== "gelesen",
      aktion: { label: v.typ === "zombie" ? "Kündigung prüfen" : "Vorschlag ansehen", to: "/app/sparen" },
    });
  }

  return out;
}

/** Spike-Benachrichtigungen aus AI-Credit-Diensten mit erkanntem Ausreisser. */
export function buildSpikeAktionen(
  spikes: { id: string; name: string; faktor: number }[],
  statusMap: Map<string, BenachrStatus>,
): Aktion[] {
  const out: Aktion[] = [];
  for (const s of spikes) {
    const key = `spike:${s.id}`;
    const st = statusMap.get(key);
    if (st === "erledigt" || st === "ignoriert") continue;
    out.push({
      key,
      typ: "spike",
      titel: `AI-Spend-Spike bei ${s.name}`,
      beschreibung: `Der Verbrauch liegt diesen Monat beim ${String(s.faktor).replace(".", ",")}-fachen deines Schnitts.`,
      chip: s.name,
      zeit: "diesen Monat",
      gruppe: "Heute",
      ungelesen: st !== "gelesen",
      aktion: { label: "Verlauf ansehen", to: "/app/ai-credits" },
    });
  }
  return out;
}

/** Zeitgruppe + relativer Text aus einem Zeitstempel (Vergangenheit). */
export function zeitgruppe(ts: number, heute = new Date()): { gruppe: Zeitgruppe; zeit: string } {
  const diffMs = heute.getTime() - ts;
  const tag = 24 * 60 * 60 * 1000;
  const std = Math.floor(diffMs / (60 * 60 * 1000));
  const tage = Math.floor(diffMs / tag);

  let zeit: string;
  if (std < 1) zeit = "gerade eben";
  else if (std < 24) zeit = `vor ${std} Stunde${std === 1 ? "" : "n"}`;
  else if (tage === 1) zeit = "gestern";
  else zeit = `vor ${tage} Tagen`;

  let gruppe: Zeitgruppe;
  const heuteStart = new Date(heute.getFullYear(), heute.getMonth(), heute.getDate()).getTime();
  if (ts >= heuteStart) gruppe = "Heute";
  else if (ts >= heuteStart - tag) gruppe = "Gestern";
  else if (ts >= heuteStart - 7 * tag) gruppe = "Diese Woche";
  else gruppe = "Älter";

  return { gruppe, zeit };
}
