import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Scale, Eye, HeartHandshake, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Über uns: Die Idee hinter Toolfolio",
  description:
    "Toolfolio wird von der OMMM GmbH in Leipzig gebaut. Unser Anspruch: ehrliche, verifizierte Preise und ein Kostenüberblick, dem Agenturen und Solopreneure im DACH-Raum vertrauen.",
};

const WERTE = [
  { icon: Scale, title: "Ehrlichkeit der Daten", desc: "Verifiziert, zu wenig Daten oder Listenpreis. Wir kennzeichnen jeden Zustand klar und vermeiden Scheingenauigkeit." },
  { icon: Eye, title: "Die goldene Regel", desc: "Kaufbar ist nur Sichtbarkeit, immer als gesponsert markiert. Rang, Bewertungen und verifizierte Preise sind niemals käuflich." },
  { icon: ShieldCheck, title: "Datenschutz zuerst", desc: "Personenbezogene Daten bleiben strikt getrennt von der anonymen Auswertung. EU-Hosting, DSGVO-konform." },
  { icon: HeartHandshake, title: "Vermittler, nicht Mittelsmann", desc: "Wir hosten keine fremde Software und wickeln keine fremden Zahlungen ab. Leads gehen direkt an den Anbieter." },
];

export default function UeberUnsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="text-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">Über uns</div>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Wir machen Software-Kosten ehrlich.
        </h1>
      </div>

      <div className="mx-auto mt-10 max-w-2xl space-y-5 text-muted-foreground">
        <p>
          Toolfolio entsteht bei der <strong className="text-foreground">OMMM GmbH</strong> in
          Leipzig. Wir kommen aus der Praxis von Agenturen und Selbstständigen und kennen das
          Problem aus erster Hand: Software-Abos verteilen sich über Konten, Karten und Köpfe,
          niemand hat den Überblick, und stille Verlängerungen kosten echtes Geld.
        </p>
        <p>
          Unsere Idee ist einfach: ein eingeloggter Tracker, der deine Kosten und Fristen im Griff
          hält, plus ein öffentliches Verzeichnis, dessen Preise durch echte, anonymisierte
          Abrechnungsdaten belegt sind. Beides verstärkt sich, ohne dass je personenbezogene Daten
          in die Auswertung fließen.
        </p>
        <p>
          Wir verdienen an fairen Abos und an klar gekennzeichneter Sichtbarkeit, niemals daran,
          Rankings oder Preise zu verbiegen. Das ist unser Versprechen.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {WERTE.map((w) => (
          <div key={w.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <w.icon className="size-5" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold">{w.title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{w.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/registrieren"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90"
        >
          Kostenlos starten <ArrowRight className="size-4" />
        </Link>
        <Link
          href="/kontakt"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-base font-semibold transition hover:bg-accent"
        >
          Kontakt aufnehmen
        </Link>
      </div>
    </div>
  );
}
