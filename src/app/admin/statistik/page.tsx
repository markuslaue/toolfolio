import type { Metadata } from "next";
import Link from "next/link";
import { Search, MousePointerClick, Eye, ArrowUpRight, LayoutGrid, Building2 } from "lucide-react";
import { redaktionOderRaus } from "@/lib/redaktion";
import {
  zeitraum,
  klicksJeProdukt,
  klicksJeCollection,
  gscJeCollection,
} from "@/lib/statistik";

export const metadata: Metadata = { title: "Statistik", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * AD-15: Auswertung, getrennt nach Collections und Anbietern.
 *
 * ---------------------------------------------------------------------------
 * DER GRUND FUER DIE TRENNUNG und die Suche:
 *
 * Eine Collection und ein Anbieter beantworten verschiedene Fragen. Bei der Collection
 * fragt man: bringt diese Seite Traffic, fuer welche Suchbegriffe, auf welcher Position?
 * Beim Anbieter fragt man: wie viel Reichweite haben wir IHM geliefert? Beides in einer
 * Liste zu mischen hilft bei keiner der beiden Fragen.
 *
 * Und weil es tausende Anbieter gibt, wird gesucht, nicht gescrollt. Die grossen
 * Tabellen werden nie komplett geladen: entweder die Treffer der Suche oder die mit dem
 * meisten Traffic.
 * ---------------------------------------------------------------------------
 */

const ZEITRAEUME = [
  { tage: 7, label: "7 Tage" },
  { tage: 30, label: "30 Tage" },
  { tage: 90, label: "90 Tage" },
  { tage: 365, label: "12 Monate" },
] as const;

const TREFFER_MAX = 80;

type Suchparam = { ansicht?: string; q?: string; tage?: string };

function link(basis: Suchparam, aenderung: Partial<Suchparam>): string {
  const p = new URLSearchParams();
  const zusammen = { ...basis, ...aenderung };
  if (zusammen.ansicht) p.set("ansicht", zusammen.ansicht);
  if (zusammen.q) p.set("q", zusammen.q);
  if (zusammen.tage) p.set("tage", zusammen.tage);
  const s = p.toString();
  return `/admin/statistik${s ? `?${s}` : ""}`;
}

export default async function StatistikPage({ searchParams }: { searchParams: Promise<Suchparam> }) {
  const { admin } = await redaktionOderRaus("/admin/statistik");
  const sp = await searchParams;

  const ansicht = sp.ansicht === "anbieter" ? "anbieter" : "collections";
  const q = (sp.q ?? "").trim();
  const tage = ZEITRAEUME.some((z) => String(z.tage) === sp.tage) ? Number(sp.tage) : 30;
  const z = zeitraum(tage);
  const basis: Suchparam = { ansicht, q: q || undefined, tage: String(tage) };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Statistik</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Wie sich der Traffic verhält, getrennt nach Kategorieseiten und Anbietern.
      </p>

      {/* Ansicht wechseln */}
      <div className="mt-6 inline-flex rounded-xl border bg-card p-1">
        <Link
          href={link(basis, { ansicht: "collections", q: undefined })}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            ansicht === "collections" ? "bg-foreground text-background" : "hover:bg-accent"
          }`}
        >
          <LayoutGrid className="size-4" /> Kategorien
        </Link>
        <Link
          href={link(basis, { ansicht: "anbieter", q: undefined })}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            ansicht === "anbieter" ? "bg-foreground text-background" : "hover:bg-accent"
          }`}
        >
          <Building2 className="size-4" /> Anbieter
        </Link>
      </div>

      {/* Zeitraum */}
      <div className="mt-4 flex flex-wrap gap-2">
        {ZEITRAEUME.map((zr) => (
          <Link
            key={zr.tage}
            href={link(basis, { tage: String(zr.tage) })}
            className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
              tage === zr.tage ? "border-foreground bg-foreground text-background" : "bg-card hover:bg-accent"
            }`}
          >
            {zr.label}
          </Link>
        ))}
      </div>

      {/* Suche. Einfaches GET-Formular, damit die Suche in der URL steht und teilbar ist. */}
      <form method="GET" className="mt-4 flex gap-2">
        <input type="hidden" name="ansicht" value={ansicht} />
        <input type="hidden" name="tage" value={String(tage)} />
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            placeholder={ansicht === "collections" ? "Kategorie suchen, z. B. Lager-Logistik-Software" : "Anbieter suchen, z. B. Immo-Tours"}
            className="w-full rounded-xl border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-foreground/40"
          />
        </div>
        <button type="submit" className="rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90">
          Suchen
        </button>
        {q && (
          <Link href={link(basis, { q: undefined })} className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-accent">
            Zurücksetzen
          </Link>
        )}
      </form>

      <div className="mt-6">
        {ansicht === "collections" ? (
          <CollectionAnsicht admin={admin} z={z} q={q} basis={basis} />
        ) : (
          <AnbieterAnsicht admin={admin} z={z} q={q} basis={basis} />
        )}
      </div>
    </div>
  );
}

/* ------------------------------- Kategorien ------------------------------ */

async function CollectionAnsicht({
  admin,
  z,
  q,
  basis,
}: {
  admin: Awaited<ReturnType<typeof redaktionOderRaus>>["admin"];
  z: ReturnType<typeof zeitraum>;
  q: string;
  basis: Suchparam;
}) {
  const [gsc, klicks] = await Promise.all([gscJeCollection(z), klicksJeCollection(z)]);

  // Welche Collections zeigen? Bei Suche: Namenstreffer. Ohne Suche: die mit Traffic,
  // sonst hilfsweise die zuletzt veroeffentlichten, damit die Seite nicht leer wirkt.
  type Row = { id: string; name: string; slug: string; clusterSlug: string | null };
  let rows: Row[] = [];

  if (q) {
    const { data } = await admin
      .from("dir_collection")
      .select("id, name, slug, dir_cluster(slug)")
      .ilike("name", `%${q}%`)
      .limit(TREFFER_MAX);
    rows = (data ?? []).map((c) => ({
      id: c.id as string,
      name: c.name as string,
      slug: c.slug as string,
      clusterSlug: (c.dir_cluster as unknown as { slug: string } | null)?.slug ?? null,
    }));
  } else {
    const mitTraffic = new Set([...gsc.keys(), ...klicks.keys()]);
    const { data } = await admin
      .from("dir_collection")
      .select("id, name, slug, status, auto_gebaut_am, dir_cluster(slug)")
      .eq("status", "veroeffentlicht")
      .order("auto_gebaut_am", { ascending: false, nullsFirst: false })
      .limit(400);
    const alle = (data ?? []).map((c) => ({
      id: c.id as string,
      name: c.name as string,
      slug: c.slug as string,
      clusterSlug: (c.dir_cluster as unknown as { slug: string } | null)?.slug ?? null,
    }));
    // Zuerst die mit Traffic, dann der Rest (neueste zuerst), auf TREFFER_MAX begrenzt.
    rows = [...alle.filter((c) => mitTraffic.has(c.id)), ...alle.filter((c) => !mitTraffic.has(c.id))].slice(0, TREFFER_MAX);
  }

  const angereichert = rows
    .map((c) => ({ ...c, g: gsc.get(c.id), aus: klicks.get(c.id) ?? 0 }))
    .sort((a, b) => (b.g?.impressionen ?? 0) - (a.g?.impressionen ?? 0) || b.aus - a.aus || a.name.localeCompare(b.name));

  const summeImpr = [...gsc.values()].reduce((s, g) => s + g.impressionen, 0);
  const summeKlicksSuche = [...gsc.values()].reduce((s, g) => s + g.klicks, 0);
  const summeAus = [...klicks.values()].reduce((s, n) => s + n, 0);

  return (
    <>
      {!q && (
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Kachel icon={Eye} label="Impressionen (Google)" wert={summeImpr.toLocaleString("de-DE")} />
          <Kachel icon={ArrowUpRight} label="Klicks aus der Suche" wert={summeKlicksSuche.toLocaleString("de-DE")} />
          <Kachel icon={MousePointerClick} label="Klicks auf Anbieter" wert={summeAus.toLocaleString("de-DE")} />
        </div>
      )}

      {angereichert.length === 0 ? (
        <Leer text={q ? `Keine Kategorie gefunden für „${q}".` : "Noch keine veröffentlichten Kategorien."} />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 border-b bg-muted/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Kategorie</span>
            <span className="w-14 text-right">Impr.</span>
            <span className="w-14 text-right">Klicks</span>
            <span className="w-12 text-right">Pos.</span>
            <span className="w-16 text-right">Anbieter</span>
          </div>
          <ul className="divide-y">
            {angereichert.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/admin/statistik/collection/${c.slug}`}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted/40"
                >
                  <span className="min-w-0 truncate font-medium">{c.name}</span>
                  <span className="w-14 text-right tabular-nums">{c.g?.impressionen.toLocaleString("de-DE") ?? "0"}</span>
                  <span className="w-14 text-right tabular-nums">{c.g?.klicks ?? 0}</span>
                  <span className="w-12 text-right tabular-nums text-muted-foreground">
                    {c.g?.position ? c.g.position.toFixed(1).replace(".", ",") : "–"}
                  </span>
                  <span className="w-16 text-right tabular-nums">{c.aus}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <FussHinweis art="collection" gezeigt={angereichert.length} basis={basis} />
    </>
  );
}

/* -------------------------------- Anbieter ------------------------------- */

async function AnbieterAnsicht({
  admin,
  z,
  q,
  basis,
}: {
  admin: Awaited<ReturnType<typeof redaktionOderRaus>>["admin"];
  z: ReturnType<typeof zeitraum>;
  q: string;
  basis: Suchparam;
}) {
  const klicks = await klicksJeProdukt(z);

  type Row = { id: string; name: string; anbieter: string | null; slug: string };
  let rows: Row[] = [];

  if (q) {
    const { data } = await admin
      .from("dir_produkt")
      .select("id, name, anbieter, slug")
      .or(`name.ilike.%${q}%,anbieter.ilike.%${q}%`)
      .limit(TREFFER_MAX);
    rows = (data ?? []) as Row[];
  } else {
    // Ohne Suche: die Anbieter mit den meisten Klicks. Ihre IDs stehen in der Klick-Map.
    const ids = [...klicks.entries()].sort((a, b) => b[1].klicks - a[1].klicks).slice(0, TREFFER_MAX).map(([id]) => id);
    if (ids.length > 0) {
      const { data } = await admin.from("dir_produkt").select("id, name, anbieter, slug").in("id", ids);
      rows = (data ?? []) as Row[];
    }
  }

  const angereichert = rows
    .map((p) => ({ ...p, k: klicks.get(p.id) ?? { klicks: 0, affiliate: 0, gesponsert: 0 } }))
    .sort((a, b) => b.k.klicks - a.k.klicks || a.name.localeCompare(b.name));

  const summe = [...klicks.values()].reduce((s, k) => s + k.klicks, 0);
  const summeAff = [...klicks.values()].reduce((s, k) => s + k.affiliate, 0);

  return (
    <>
      {!q && (
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Kachel icon={MousePointerClick} label="Klicks auf Anbieter" wert={summe.toLocaleString("de-DE")} />
          <Kachel icon={ArrowUpRight} label="davon über Affiliate" wert={summeAff.toLocaleString("de-DE")} />
          <Kachel icon={Building2} label="Anbieter mit Klicks" wert={klicks.size.toLocaleString("de-DE")} />
        </div>
      )}

      {angereichert.length === 0 ? (
        <Leer
          text={
            q
              ? `Kein Anbieter gefunden für „${q}".`
              : "Noch keine Klicks auf Anbieter. Sobald jemand über eine Kategorieseite auf einen Anbieter klickt, steht er hier. Zum Durchsuchen aller Anbieter oben das Suchfeld benutzen."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b bg-muted/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Anbieter</span>
            <span className="w-16 text-right">Klicks</span>
            <span className="w-20 text-right">Affiliate</span>
          </div>
          <ul className="divide-y">
            {angereichert.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/statistik/anbieter/${p.slug}`}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted/40"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{p.name}</span>
                    {p.anbieter && <span className="block truncate text-xs text-muted-foreground">{p.anbieter}</span>}
                  </span>
                  <span className="w-16 text-right font-display text-base font-semibold tabular-nums">{p.k.klicks}</span>
                  <span className="w-20 text-right tabular-nums text-muted-foreground">{p.k.affiliate || "–"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <FussHinweis art="anbieter" gezeigt={angereichert.length} basis={basis} />
    </>
  );
}

/* -------------------------------- Bausteine ------------------------------ */

function Kachel({ icon: Icon, label, wert }: { icon: React.ComponentType<{ className?: string }>; label: string; wert: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="mt-1 font-display text-2xl font-semibold tabular-nums">{wert}</div>
    </div>
  );
}

function Leer({ text }: { text: string }) {
  return <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">{text}</div>;
}

function FussHinweis({ art, gezeigt, basis }: { art: "collection" | "anbieter"; gezeigt: number; basis: Suchparam }) {
  if (gezeigt < TREFFER_MAX) return null;
  return (
    <p className="mt-2 text-xs text-muted-foreground">
      Es werden die ersten {TREFFER_MAX} {art === "collection" ? "Kategorien" : "Anbieter"} gezeigt.{" "}
      {basis.q ? "Grenze die Suche weiter ein." : "Nutze die Suche, um eine bestimmte Seite zu finden."}
    </p>
  );
}
