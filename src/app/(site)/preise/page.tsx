import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight, ShieldCheck } from "lucide-react";
import {
  PLANS,
  TRIAL_DAYS,
  FREE_ABO_LIMIT,
  YEARLY_DISCOUNT,
  formatEur,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Preise: Toolfolio kostenlos starten",
  description:
    "Starte kostenlos ohne Kreditkarte. Pro und Agentur mit verifizierten Preisen, Fristen-Wächter und Weiterverrechnung. 14 Tage voller Zugang zum Testen.",
};

type Plan = {
  id: keyof typeof PLANS;
  highlight?: boolean;
  cta: string;
  beschreibung: string;
  features: string[];
};

const PLAENE: Plan[] = [
  {
    id: "free",
    cta: "Kostenlos starten",
    beschreibung: "Für den Einstieg und kleine Setups.",
    features: [
      `Bis ${FREE_ABO_LIMIT} Abos verwalten`,
      "Fristen- und Trial-Wächter",
      "Zahlungskanäle und Kunden",
      "Dashboard mit Monats- und Jahreskosten",
      "Benchmark als Teaser",
    ],
  },
  {
    id: "pro",
    highlight: true,
    cta: `${TRIAL_DAYS} Tage testen`,
    beschreibung: "Für Freelancer und Solopreneure mit vielen Tools.",
    features: [
      "Unbegrenzte Abos",
      "Verifizierte Preise und voller Benchmark",
      "Sparvorschläge und Alternativen",
      "Kontoauszug-Import",
      "Belege und Steuer-Export",
      "E-Mail-Warnungen vor Fristen",
    ],
  },
  {
    id: "agentur",
    cta: `${TRIAL_DAYS} Tage testen`,
    beschreibung: "Für Agenturen mit Kunden und Weiterverrechnung.",
    features: [
      "Alles aus Pro",
      "Weiterverrechnung und Marge je Kunde",
      "Team und Rollen",
      "Mehrere Gesellschaften (Mandanten)",
      "Weiterverrechnungs-Report",
      "Priorisierter Support",
    ],
  },
];

function PreisKarte({ plan }: { plan: Plan }) {
  const p = PLANS[plan.id];
  return (
    <div
      className={`relative flex flex-col rounded-[24px] border bg-card p-6 shadow-soft ${
        plan.highlight ? "border-primary ring-1 ring-primary" : "border-border"
      }`}
    >
      {plan.highlight && (
        <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          Beliebt
        </span>
      )}
      <div className="font-display text-lg font-semibold">{p.name}</div>
      <p className="mt-1 text-sm text-muted-foreground">{plan.beschreibung}</p>
      <div className="mt-5 flex items-baseline gap-1">
        <span className="font-display text-4xl font-bold tabular-nums">
          {p.monthlyEur === 0 ? "0 €" : formatEur(p.monthlyEur)}
        </span>
        <span className="text-sm text-muted-foreground">/ Monat</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {p.monthlyEur === 0
          ? "dauerhaft kostenlos"
          : `bei jährlicher Zahlung rund ${Math.round(YEARLY_DISCOUNT * 100)} % günstiger`}
      </p>
      <Link
        href="/registrieren"
        className={`mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
          plan.highlight
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "border border-border bg-card hover:bg-accent"
        }`}
      >
        {plan.cta} <ArrowRight className="size-4" />
      </Link>
      <ul className="mt-6 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-success" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const FAQ = [
  {
    q: "Brauche ich eine Kreditkarte zum Testen?",
    a: `Nein. Du startest kostenlos und testest Pro und Agentur ${TRIAL_DAYS} Tage mit vollem Zugang, ohne Zahlungsmittel.`,
  },
  {
    q: "Was bedeutet „verifizierter Preis“?",
    a: "Ein Preis gilt erst als verifiziert, wenn genügend echte, anonymisierte Abrechnungsdaten vorliegen. Sonst kennzeichnen wir ihn als „zu wenig Daten“ oder als Listenpreis. Niemals Scheingenauigkeit.",
  },
  {
    q: "Kann ich Sichtbarkeit im Verzeichnis kaufen?",
    a: "Sichtbarkeit ja, immer klar als gesponsert gekennzeichnet. Organischer Rang, Bewertungen und verifizierte Daten sind niemals käuflich.",
  },
  {
    q: "Wo liegen meine Daten?",
    a: "In der EU, DSGVO-konform. Wir speichern keine vollständigen Kartennummern oder IBAN, nur Referenzen, und keine Passwörter fremder Tools.",
  },
];

export default function PreisePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">Preise</div>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Faire Preise. {TRIAL_DAYS} Tage kostenlos testen.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Starte ohne Kreditkarte. Du zahlst erst, wenn Toolfolio dir Geld spart. Preise in Euro,
          zzgl. USt.
        </p>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {PLAENE.map((plan) => (
          <PreisKarte key={plan.id} plan={plan} />
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Preise sind Platzhalter und werden vor dem Livegang final festgelegt.
      </p>

      <div className="mx-auto mt-16 max-w-3xl">
        <h2 className="text-center font-display text-2xl font-semibold tracking-tight">
          Häufige Fragen
        </h2>
        <dl className="mt-6 space-y-4">
          {FAQ.map((item) => (
            <div key={item.q} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <dt className="font-semibold">{item.q}</dt>
              <dd className="mt-1.5 text-sm text-muted-foreground">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mx-auto mt-12 flex max-w-3xl items-center justify-center gap-2 rounded-2xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
        <ShieldCheck className="size-4 shrink-0 text-success" />
        DSGVO-konform, EU-Hosting, keine Passwörter fremder Tools, nur Referenzen statt sensibler
        Zahlungsdaten.
      </div>
    </div>
  );
}
