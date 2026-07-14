import type { Metadata } from "next";
import Link from "next/link";
import { Search, ArrowRight, ShieldCheck, Layers, Star } from "lucide-react";
import { getHub } from "@/lib/verzeichnis";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Software-Verzeichnis: Tools vergleichen, Preise & Bewertungen",
  description:
    "Das Toolfolio-Verzeichnis: Software nach Kategorien vergleichen, mit Preisangaben (Stand und Quelle) und ehrlichen, teils verifizierten Bewertungen. Fuer Agenturen, Freelancer und Teams im DACH-Raum.",
};

export default async function VerzeichnisHub() {
  const hub = await getHub();

  return (
    <div className="bg-background">
      {/* Hero + Suche */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-20 -top-32 size-[480px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-20 top-20 size-[420px] rounded-full bg-coral/15 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-coral" /> Verzeichnis
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Finde die richtige <span className="text-primary">Software.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Vergleiche Tools nach Funktionen und Preis, mit ehrlichen Bewertungen. Preise tragen immer Stand und Quelle.
          </p>
          <form action="/verzeichnis/suche" className="mx-auto mt-8 flex max-w-xl items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <input
                name="q"
                placeholder="Tool oder Kategorie suchen, z. B. Design"
                className="h-12 w-full rounded-full border border-border bg-card pl-12 pr-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <button type="submit" className="h-12 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Suchen
            </button>
          </form>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4 text-success" /> Preise mit Stand & Quelle</span>
            <span className="inline-flex items-center gap-1.5"><Star className="size-4 text-[#F5A623]" /> Verifizierte Bewertungen</span>
            <span className="inline-flex items-center gap-1.5"><Layers className="size-4 text-primary" /> Drei Zonen, klar getrennt</span>
          </div>
        </div>
      </section>

      {/* Cluster + Collections */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {hub.map(({ cluster, collections, gesamt }) => (
            <div key={cluster.id} className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl text-white" style={{ backgroundColor: cluster.farbe }}>
                  <Layers className="size-5" />
                </span>
                <div className="min-w-0">
                  <Link href={`/verzeichnis/${cluster.slug}`} className="font-display text-xl font-semibold hover:text-primary">
                    {cluster.name}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {gesamt} {gesamt === 1 ? "Kategorie" : "Kategorien"}
                  </div>
                </div>
              </div>
              {cluster.meta_description && <p className="mt-3 text-sm text-muted-foreground">{cluster.meta_description}</p>}
              <ul className="mt-4 space-y-1.5">
                {collections.map((co) => (
                  <li key={co.id}>
                    <Link href={`/verzeichnis/${cluster.slug}/${co.slug}`} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent">
                      <span>{co.name}</span>
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
              {gesamt > collections.length && (
                <div className="mt-2 px-2 text-xs text-muted-foreground">
                  und {gesamt - collections.length} weitere
                </div>
              )}
              <Link
                href={`/verzeichnis/${cluster.slug}`}
                className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-primary hover:underline"
              >
                Alle in {cluster.name} <ArrowRight className="size-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
