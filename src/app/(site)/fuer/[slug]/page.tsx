import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Building2, Briefcase, User as UserIcon, type LucideIcon } from "lucide-react";
import { AudiencePage, type AudienceData } from "@/components/marketing/audience-page";

const DATEN: Record<string, AudienceData & { icon: LucideIcon; metaDesc: string }> = {
  agenturen: {
    slug: "agenturen",
    eyebrow: "Für Agenturen",
    icon: Building2,
    title: "Toolkosten je Kunde, Marge im Blick, Reporting ohne Schätzen.",
    intro:
      "Agenturen jonglieren Dutzende Tools über mehrere Kunden und Gesellschaften. Toolfolio ordnet jede Lizenz dem richtigen Kunden zu, rechnet weiter und zeigt deine Marge.",
    metaDesc:
      "Für Agenturen: Toolkosten je Kunde zuordnen, weiterverrechnen, Marge sehen und Fristen im Griff behalten.",
    pains: [
      { title: "Welche Lizenz gehört zu welchem Kunden?", body: "Beim Reporting wird geschätzt, die Marge bleibt unklar." },
      { title: "Weiterverrechnung ist lückenhaft.", body: "Toolkosten werden vergessen und schmälern still deinen Gewinn." },
      { title: "Mehrere Gesellschaften, ein Chaos.", body: "Karten, Konten und PayPal verteilen sich über das ganze Team." },
    ],
    features: [
      { eyebrow: "Zuordnung", title: "Kosten pro Kunde", body: "Jedes Abo bekommt seinen Kunden. Summen und Anteile sind sofort sichtbar." },
      { eyebrow: "Weiterverrechnung", title: "Marge auf einen Blick", body: "Aufschlag hinterlegen, weiterverrechneten Betrag und Marge je Kunde sehen." },
      { eyebrow: "Kontrolle", title: "Fristen & Team", body: "Kündigungsfristen im Griff, Rollen und mehrere Gesellschaften sauber getrennt." },
    ],
    andere: [
      { slug: "freelancer", label: "Freelancer" },
      { slug: "solopreneure", label: "Solopreneure" },
    ],
  },
  freelancer: {
    slug: "freelancer",
    eyebrow: "Für Freelancer",
    icon: Briefcase,
    title: "Alle Abos auf einen Blick. Nie wieder eine Frist verpassen.",
    intro:
      "Als Freelancer zahlst du jedes vergessene Abo aus eigener Tasche. Toolfolio bündelt deine Tools, warnt vor Fristen und hält deine Belege fürs Finanzamt beisammen.",
    metaDesc:
      "Für Freelancer: alle Software-Abos zentral, Fristen-Wächter gegen stille Verlängerungen, Belege geordnet.",
    pains: [
      { title: "Trial vergessen zu kündigen.", body: "Vier Monate ungenutzt bezahlt, ohne es zu merken." },
      { title: "Belege überall verstreut.", body: "Zur Steuer wird gesucht statt gefunden." },
      { title: "Kein Überblick über die Summe.", body: "Am Monatsende ist mehr weg als gedacht." },
    ],
    features: [
      { eyebrow: "Überblick", title: "Ein Ort für alles", body: "Kosten, Intervall und nächste Abbuchung je Tool, sauber strukturiert." },
      { eyebrow: "Wächter", title: "Fristen rechtzeitig", body: "Kündigungsfristen und Trial-Enden nach Dringlichkeit, mit Erinnerung." },
      { eyebrow: "Buchhaltung", title: "Belege parat", body: "Rechnungen sammeln und sauber für die Steuer exportieren." },
    ],
    andere: [
      { slug: "agenturen", label: "Agenturen" },
      { slug: "solopreneure", label: "Solopreneure" },
    ],
  },
  solopreneure: {
    slug: "solopreneure",
    eyebrow: "Für Solopreneure",
    icon: UserIcon,
    title: "Schlanker Stack, klare Kosten, mehr für KI-Tools übrig.",
    intro:
      "Solopreneure bauen schnell und testen viel. Toolfolio hält deinen Stack schlank, zeigt KI-Kosten, bevor sie überraschen, und macht günstigere Alternativen sichtbar.",
    metaDesc:
      "Für Solopreneure: Software-Stack schlank halten, KI-Kosten im Blick, bei gleicher Leistung weniger zahlen.",
    pains: [
      { title: "KI-Credits laufen aus dem Ruder.", body: "Am Monatsende doppelt so hoch wie geplant." },
      { title: "Zu viele Tools, zu wenig Übersicht.", body: "Vieles getestet, manches vergessen, alles bezahlt." },
      { title: "Zahlst du fair?", body: "Ohne Vergleich bleibt es ein Bauchgefühl." },
    ],
    features: [
      { eyebrow: "Kontrolle", title: "KI-Kosten sichtbar", body: "Variable Kosten wie API-Verbrauch im Blick behalten." },
      { eyebrow: "Schlank", title: "Stack aufräumen", body: "Redundante und ungenutzte Tools erkennen und kündigen." },
      { eyebrow: "Sparen", title: "Faire Preise", body: "Mit verifizierten Marktpreisen zahlst du nicht mehr als nötig." },
    ],
    andere: [
      { slug: "agenturen", label: "Agenturen" },
      { slug: "freelancer", label: "Freelancer" },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(DATEN).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const d = DATEN[slug];
  if (!d) return { title: "Für wen" };
  return { title: `${d.eyebrow}: Toolfolio`, description: d.metaDesc };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = DATEN[slug];
  if (!d) notFound();
  return <AudiencePage data={d} />;
}
