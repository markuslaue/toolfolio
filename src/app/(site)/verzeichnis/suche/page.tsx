import type { Metadata } from "next";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { Breadcrumb } from "@/components/verzeichnis/breadcrumb";
import { sucheVerzeichnis, produktInitialen } from "@/lib/verzeichnis";

export const metadata: Metadata = {
  title: "Suche im Software-Verzeichnis",
  robots: { index: false },
};

export default async function SucheSeite({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const begriff = (q ?? "").trim();
  const res = begriff ? await sucheVerzeichnis(begriff) : { produkte: [], collections: [] };
  const treffer = res.produkte.length + res.collections.length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Breadcrumb items={[{ name: "Verzeichnis", href: "/verzeichnis" }, { name: "Suche" }]} />

      <form action="/verzeichnis/suche" className="mt-6 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input name="q" defaultValue={begriff} placeholder="Tool oder Kategorie suchen" className="h-12 w-full rounded-full border border-border bg-card pl-12 pr-4 text-sm outline-none focus:border-primary" />
        </div>
        <button type="submit" className="h-12 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Suchen</button>
      </form>

      {begriff && (
        <p className="mt-6 text-sm text-muted-foreground">
          {treffer} {treffer === 1 ? "Treffer" : "Treffer"} fuer <span className="font-medium text-foreground">{begriff}</span>
        </p>
      )}

      {res.collections.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">Kategorien</h2>
          <div className="mt-3 space-y-2">
            {res.collections.map((c) => (
              <Link key={c.id} href={`/verzeichnis/suche?q=${encodeURIComponent(c.name)}`} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm hover:border-primary/40">
                <span className="font-medium">{c.name}</span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {res.produkte.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tools</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {res.produkte.map((p) => (
              <Link key={p.id} href={`/software/${p.slug}`} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/40">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl font-display text-sm font-bold text-white" style={{ backgroundColor: p.farbe }}>
                  {produktInitialen(p.name)}
                </span>
                <div className="min-w-0">
                  <div className="font-medium">{p.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{p.kurzbeschreibung}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {begriff && treffer === 0 && (
        <p className="mt-10 text-center text-sm text-muted-foreground">Keine Treffer. Versuche einen anderen Begriff.</p>
      )}
    </div>
  );
}
