import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, ShieldCheck, Database, Scale, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Vertrauens-Badge & Listing-Standard",
  description:
    "Der Toolfolio-Vertrauens-Badge steht für belegte Preise und faire Regeln. So entsteht er, das hält er ein, das verspricht er Käufern.",
};

const STANDARDS = [
  { icon: Database, title: "Belegte Preise", desc: "Verifizierte Preise entstehen aus echten, anonymisierten Abrechnungsdaten mit hoher Mindestschwelle, nie aus Selbstauskunft allein." },
  { icon: Scale, title: "Unbestechlicher Rang", desc: "Bewertungen und organischer Rang sind niemals käuflich. Kaufbar ist nur Sichtbarkeit, immer als gesponsert gekennzeichnet." },
  { icon: ShieldCheck, title: "Transparente Zustände", desc: "Jeder Preis trägt seinen Zustand offen: verifiziert, zu wenig Daten oder Listenpreis. Keine Scheingenauigkeit." },
];

export default function BadgePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-success/10 text-success">
          <BadgeCheck className="size-7" />
        </span>
        <div className="mt-5 text-xs font-semibold uppercase tracking-widest text-success">
          Vertrauens-Badge
        </div>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Ein Badge, der etwas bedeutet.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Der Vertrauens-Badge zeigt Käufern im DACH-Raum: Hier stimmen die Preise, und die Regeln
          sind fair. Er ist kein Werbeplatz, sondern ein Versprechen.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {STANDARDS.map((s) => (
          <div key={s.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <span className="grid size-11 place-items-center rounded-xl bg-success/10 text-success">
              <s.icon className="size-5" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold">{s.title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-[24px] border border-border bg-secondary/40 p-8 text-center">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Du bietest Software an?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Belege deine Preise und schalte den Vertrauens-Badge frei. So gewinnst du Käufer, die genau
          auf solche Signale achten.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/fuer-anbieter"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90"
          >
            Für Anbieter <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/entwickler"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-base font-semibold transition hover:bg-accent"
          >
            Für Entwickler
          </Link>
        </div>
      </div>
    </div>
  );
}
