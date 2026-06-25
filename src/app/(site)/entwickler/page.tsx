import type { Metadata } from "next";
import Link from "next/link";
import { Rocket, BadgeCheck, Euro, Check, ArrowRight } from "lucide-react";
import { INDIE_LISTING_FEE_EUR, formatEur } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Für Entwickler: Indie-SaaS fair listen",
  description:
    "Du baust ein eigenes SaaS? Liste es im Toolfolio-Verzeichnis mit verifiziertem Vertrauens-Badge, einmalige faire Gebühr, qualifizierte Leads direkt an dich.",
};

const PUNKTE = [
  "Einmalige, faire Listing-Gebühr statt Provision auf jeden Verkauf",
  "Verifizierter Vertrauens-Badge bei belegten Preisen",
  "Leads direkt per E-Mail oder Webhook, ohne Mittelsmann",
  "Sichtbar bei DACH-Nutzern, die gezielt Alternativen suchen",
];

export default function EntwicklerPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-coral">Für Entwickler</div>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Dein Indie-SaaS, fair gelistet.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Kein undurchsichtiges Provisionsmodell, keine gekauften Rankings. Eine faire Gebühr, ein
          verifizierter Badge und Leads, die direkt bei dir landen.
        </p>
      </div>

      <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1.3fr_1fr]">
        <ul className="space-y-3">
          {PUNKTE.map((p) => (
            <li key={p} className="flex items-start gap-2.5 rounded-2xl border border-border bg-card p-4 shadow-soft text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-success" />
              <span>{p}</span>
            </li>
          ))}
        </ul>

        <div className="rounded-[24px] border border-primary bg-card p-6 shadow-soft ring-1 ring-primary">
          <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <Euro className="size-5" />
          </span>
          <h2 className="mt-4 font-display text-lg font-semibold">Indie-Listing</h2>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-3xl font-bold tabular-nums">
              {formatEur(INDIE_LISTING_FEE_EUR)}
            </span>
            <span className="text-sm text-muted-foreground">einmalig</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Verifizierter Badge inklusive. Preis ist ein Platzhalter und wird vor Livegang final
            festgelegt.
          </p>
          <Link
            href="/kontakt"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Tool einreichen <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <Rocket className="size-5 text-primary" />
          <h3 className="mt-3 font-semibold">Schnell startklar</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Profil, Tool-Daten, Preise hinterlegen, fertig. Ohne technische Integration.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <BadgeCheck className="size-5 text-success" />
          <h3 className="mt-3 font-semibold">Vertrauen ab Tag eins</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Der Vertrauens-Badge zeigt Käufern, dass deine Preise belegt sind.{" "}
            <Link href="/badge" className="font-medium text-primary hover:underline">
              Mehr zum Badge
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
