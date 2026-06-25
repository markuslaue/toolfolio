import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Check, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Demo buchen: Toolfolio in 20 Minuten",
  description:
    "Lass dir Toolfolio in einer kurzen Demo zeigen: Abo-Tracker, Fristen-Wächter, verifizierte Preise und Weiterverrechnung für Agenturen.",
};

const PUNKTE = [
  "Wie du in Minuten alle Abos zusammenführst",
  "Fristen-Wächter und automatische Warnungen",
  "Verifizierte Preise und Sparpotenzial in der Praxis",
  "Weiterverrechnung und Marge je Kunde",
];

export default function DemoPage() {
  const mailto =
    "mailto:hallo@toolfolio.de?subject=" +
    encodeURIComponent("Demo-Anfrage über toolfolio.de");

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">Demo</div>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Sieh Toolfolio in 20 Minuten.
          </h1>
          <p className="mt-4 text-muted-foreground">
            Wir zeigen dir live, wie du deine Software-Kosten in den Griff bekommst, und beantworten
            deine Fragen. Unverbindlich und kostenlos.
          </p>
          <ul className="mt-6 space-y-3">
            {PUNKTE.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[24px] border border-border bg-card p-6 shadow-soft sm:p-8">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <CalendarDays className="size-6" />
          </span>
          <h2 className="mt-4 font-display text-xl font-semibold">Termin anfragen</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Schreib uns kurz, wann es dir passt und wie viele Tools ihr ungefähr nutzt. Wir melden uns
            mit Terminvorschlägen.
          </p>
          <Link
            href={mailto}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90"
          >
            Demo anfragen <ArrowRight className="size-4" />
          </Link>
          <p className="mt-4 text-xs text-muted-foreground">
            Lieber direkt loslegen?{" "}
            <Link href="/registrieren" className="font-medium text-primary hover:underline">
              Kostenlos starten
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
