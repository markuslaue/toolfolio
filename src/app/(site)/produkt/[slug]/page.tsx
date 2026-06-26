import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeatureBySlug } from "@/lib/feature-details";

// Slugs + Metadaten serverseitig (Daten liegen im "use client"-Modul und sind
// dort nur als Client-Referenzen importierbar, siehe RSC-Gotcha).
const SLUGS = ["ueberblick", "erfassen", "trials", "fristen", "ai", "benchmark", "sparen", "kunden", "weiterverrechnung", "archiv"] as const;

const META: Record<string, { title: string; description: string }> = {
  ueberblick: { title: "Dashboard & Überblick", description: "Alle Software-Abos, Kosten und Abrechnungszeiträume auf einen Blick. Monats- und Jahressicht, Verteilung nach Kategorie, Kanal und Kunde." },
  erfassen: { title: "Abos erfassen: Import, Postfach, manuell", description: "Kontoauszug importieren, Belege ans Postfach leiten oder manuell anlegen. Toolfolio findet auch vergessene Abos." },
  trials: { title: "Trial- & Zombie-Erkennung", description: "Toolfolio warnt vor dem Übergang vom Trial ins bezahlte Abo und markiert ungenutzte Zombie-Abos zur Kündigung." },
  fristen: { title: "Kündigungsfristen-Wächter (DACH)", description: "Laufzeit, letzter Kündigungstermin und Konsequenz pro Vertrag. Rechtzeitige Erinnerung gegen stille Verlängerung." },
  ai: { title: "AI-Credit-Tracker", description: "OpenAI, Anthropic, ElevenLabs und Co. mit Verlauf, Spike-Erkennung und Monatsbudgets im selben Cockpit." },
  benchmark: { title: "Preis-Benchmark", description: "Vergleiche deine Preise mit dem anonymisierten Markt-Median vergleichbarer Agenturen und Freelancer." },
  sparen: { title: "Sparvorschläge mit Jahres-Ersparnis", description: "Intervall-Wechsel, Redundanzen und Zombies, jeder Vorschlag mit konkretem Euro-Betrag pro Jahr." },
  kunden: { title: "Toolkosten pro Kunde", description: "Tools Kunden zuordnen, weiterverrechnen und die Marge sehen. Der Agentur-Layer von Toolfolio." },
  weiterverrechnung: { title: "Weiterverrechnungs-Report", description: "Zuordenbare Tool-Kosten pro Kunde und Monat als klarer Report, direkt in die Rechnung oder als CSV." },
  archiv: { title: "Archiv & Steuer-/DATEV-Export", description: "Rechnungen und Verträge je Abo, plus Steuer-Export mit Reverse-Charge und DATEV-kompatibler CSV." },
};

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const m = META[slug];
  return m ? { title: `${m.title} | Toolfolio`, description: m.description } : { title: "Funktion" };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!META[slug]) notFound();
  return <FeatureBySlug slug={slug} />;
}
