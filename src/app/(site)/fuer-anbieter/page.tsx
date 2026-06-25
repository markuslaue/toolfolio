import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Target, Scale, TrendingUp, Check, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Für Anbieter: Software fair im DACH-Verzeichnis listen",
  description:
    "Liste deine Software im Toolfolio-Verzeichnis. Verifizierte Preise, qualifizierte Leads direkt an dich, und eine goldene Regel: Rang und Bewertungen sind niemals käuflich.",
};

const VORTEILE = [
  { icon: Target, title: "Qualifizierte Leads, direkt an dich", desc: "Interessenten kommen mit echtem Bedarf. Leads gehen direkt per E-Mail oder Webhook an dich, wir sind nur Vermittler." },
  { icon: BadgeCheck, title: "Verifizierter Vertrauens-Badge", desc: "Belege deine Preise mit echten Daten und zeig den Badge, dem Käufer im DACH-Raum vertrauen." },
  { icon: Scale, title: "Faire, transparente Regeln", desc: "Kaufbar ist nur Sichtbarkeit, klar als gesponsert markiert. Organischer Rang und Bewertungen bleiben unbestechlich." },
  { icon: TrendingUp, title: "Sichtbar bei Wechselwilligen", desc: "Erscheine genau dort, wo Nutzer Alternativen vergleichen und ihre Tool-Kosten optimieren." },
];

const SCHRITTE = [
  "Profil anlegen und Tool-Daten hinterlegen",
  "Preise belegen und Vertrauens-Badge freischalten",
  "Optional: gesponserte Sichtbarkeit, klar gekennzeichnet",
];

export default function FuerAnbieterPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">Für Anbieter</div>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Werde sichtbar, wo fair verglichen wird.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Toolfolio ist das DACH-Verzeichnis mit Preisen, die echt sind. Liste deine Software,
          gewinne Vertrauen und erhalte qualifizierte Leads, ohne dass Rang oder Bewertungen käuflich
          wären.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {VORTEILE.map((v) => (
          <div key={v.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <v.icon className="size-5" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold">{v.title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-[24px] border border-border bg-secondary/40 p-8">
        <h2 className="font-display text-2xl font-semibold tracking-tight">In drei Schritten gelistet</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {SCHRITTE.map((s, i) => (
            <li key={s} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <p className="mt-3 text-sm">{s}</p>
            </li>
          ))}
        </ol>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href="/kontakt"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90"
          >
            Anbieter werden <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/badge"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-base font-semibold transition hover:bg-accent"
          >
            <Check className="size-4" /> Vertrauens-Badge ansehen
          </Link>
        </div>
      </div>
    </div>
  );
}
