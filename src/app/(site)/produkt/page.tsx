import type { Metadata } from "next";
import Link from "next/link";
import {
  Receipt,
  BellRing,
  FileUp,
  BarChart3,
  Sparkles,
  Users,
  CreditCard,
  Bot,
  FileText,
  LineChart,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Produkt: Alle Funktionen von Toolfolio",
  description:
    "Vom zentralen Abo-Tracker über den Fristen-Wächter bis zu verifizierten Preisen, Sparvorschlägen und Weiterverrechnung. So behältst du deine Software-Kosten im Griff.",
};

const GRUPPEN = [
  {
    titel: "Überblick & Tracking",
    items: [
      { icon: Receipt, title: "Abo-Tracker", desc: "Alle Software-Abos mit Kosten, Intervall, Zahlungskanal und Kunde an einem Ort." },
      { icon: LineChart, title: "Dashboard", desc: "Monats- und Jahreskosten, Kostenverteilung nach Kategorie und anstehende Abbuchungen." },
      { icon: CreditCard, title: "Zahlungskanäle", desc: "Karten, SEPA, PayPal und mehr als Referenz, ohne sensible Daten zu hinterlegen." },
    ],
  },
  {
    titel: "Kontrolle & Sparen",
    items: [
      { icon: BellRing, title: "Fristen-Wächter", desc: "Kündigungsfristen und Trial-Enden nach Dringlichkeit, damit nichts still verlängert." },
      { icon: BarChart3, title: "Verifizierte Preise", desc: "Benchmark aus echten, anonymisierten Marktdaten. Sieh, ob du fair zahlst." },
      { icon: Sparkles, title: "Sparvorschläge", desc: "Günstigere Tarife und Alternativen bei gleicher Leistung, konkret beziffert." },
      { icon: Bot, title: "KI-Credits im Blick", desc: "Variable Kosten wie API-Verbrauch sichtbar machen, bevor die Rechnung überrascht." },
    ],
  },
  {
    titel: "Agentur & Buchhaltung",
    items: [
      { icon: Users, title: "Weiterverrechnung", desc: "Toolkosten je Kunde, Aufschläge und Marge auf einen Blick." },
      { icon: FileUp, title: "Kontoauszug-Import", desc: "Abbuchungen einlesen, wiederkehrende Abos erkennen und übernehmen." },
      { icon: FileText, title: "Belege & Steuer-Export", desc: "Rechnungen sammeln und sauber für die Buchhaltung exportieren." },
    ],
  },
];

export default function ProduktPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">Produkt</div>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Alles, um deine Software-Kosten zu beherrschen.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Ein Tracker für deinen Bestand, ein Wächter für deine Fristen und ein Verzeichnis mit
          Preisen, die echt sind.
        </p>
      </div>

      <div className="mt-14 space-y-14">
        {GRUPPEN.map((g) => (
          <section key={g.titel}>
            <h2 className="font-display text-2xl font-semibold tracking-tight">{g.titel}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((it) => (
                <div key={it.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <it.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold">{it.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{it.desc}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16 flex flex-col items-center justify-between gap-4 rounded-[24px] border border-border bg-secondary/40 p-8 text-center sm:flex-row sm:text-left">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Bereit, aufzuräumen?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Kostenlos starten, ohne Kreditkarte.</p>
        </div>
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
