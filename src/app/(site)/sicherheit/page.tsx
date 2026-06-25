import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Server,
  KeyRound,
  SplitSquareHorizontal,
  EyeOff,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Sicherheit & Datenschutz bei Toolfolio",
  description:
    "EU-Hosting, DSGVO-konform, strikte Trennung von personenbezogenen und anonymen Daten, keine vollständigen Kartennummern, keine Passwörter fremder Tools. So schützt Toolfolio deine Daten.",
};

const PUNKTE = [
  { icon: Server, title: "Hosting in der EU", desc: "Datenbank und Anwendung laufen in der EU. Verträge mit Dienstleistern nach DSGVO-Standard." },
  { icon: KeyRound, title: "Keine sensiblen Zahlungsdaten", desc: "Wir speichern niemals vollständige Kartennummern, Prüfziffern oder IBAN, nur Referenzen wie die letzten vier Ziffern." },
  { icon: Lock, title: "Keine fremden Passwörter", desc: "Toolfolio verlangt nie Zugangsdaten zu deinen anderen Tools. Hinterlegte KI-API-Keys werden verschlüsselt abgelegt und nur serverseitig genutzt." },
  { icon: SplitSquareHorizontal, title: "Trennung von Daten", desc: "Personenbezogene Abo- und Kostendaten sind strikt getrennt von der anonymen Aggregat-Ebene. Nur Aggregate mit hoher Mindestschwelle speisen Benchmark und Auswertung." },
  { icon: EyeOff, title: "Zugriffsschutz", desc: "Row Level Security auf jeder Tabelle. Jeder sieht ausschließlich die Daten seines eigenen Kontos beziehungsweise Mandanten." },
  { icon: ShieldCheck, title: "Cookielose Statistik", desc: "Wir nutzen cookielose, datensparsame Reichweitenmessung. Nicht notwendige Einbettungen laden erst nach deiner Einwilligung." },
];

export default function SicherheitPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="text-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-success">Sicherheit</div>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Sicher genug für deine Buchhaltung.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Vertrauen entsteht durch Technik und durch Verzicht. Wir sammeln bewusst nur, was wir
          brauchen, und trennen sauber, was getrennt gehört.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {PUNKTE.map((p) => (
          <div key={p.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <span className="grid size-11 place-items-center rounded-xl bg-success/10 text-success">
              <p.icon className="size-5" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold">{p.title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{p.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-secondary/40 p-5 text-sm text-muted-foreground">
        Details zur Verarbeitung, zu Dienstleistern und deinen Rechten findest du in der{" "}
        <Link href="/datenschutz" className="font-medium text-primary hover:underline">
          Datenschutzerklärung
        </Link>
        .
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/registrieren"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90"
        >
          Kostenlos starten <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
