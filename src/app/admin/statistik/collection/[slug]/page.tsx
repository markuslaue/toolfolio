import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, MousePointerClick, ArrowUpRight, ExternalLink } from "lucide-react";
import { redaktionOderRaus } from "@/lib/redaktion";
import { zeitraum, anfragenJeCollection, klicksJeProdukt } from "@/lib/statistik";
import { letztesRanking } from "@/lib/ranking";
import { RankingButton } from "./ranking-button";

export const metadata: Metadata = { title: "Kategorie-Statistik", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * AD-15: Alles zu EINER Kategorie an einem Ort.
 *
 * Die Frage, die diese Seite beantwortet: Bringt diese Kategorieseite Traffic, fuer
 * welche Suchbegriffe, auf welcher Position, und was macht der Besucher dann? Die drei
 * Quellen (Search Console, DataForSEO, unsere eigenen Klicks) stehen nebeneinander,
 * weil erst zusammen ein Bild entsteht.
 */
export default async function CollectionStatistik({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tage?: string }>;
}) {
  const { admin } = await redaktionOderRaus("/admin/statistik");
  const { slug } = await params;
  const sp = await searchParams;
  const tage = [7, 30, 90, 365].includes(Number(sp.tage)) ? Number(sp.tage) : 30;
  const z = zeitraum(tage);

  const { data: coll } = await admin
    .from("dir_collection")
    .select("id, name, slug, status, fokus_keyword, dir_cluster(name, slug)")
    .eq("slug", slug)
    .maybeSingle();
  if (!coll) notFound();

  const collectionId = coll.id as string;
  const cluster = coll.dir_cluster as unknown as { name: string; slug: string } | null;

  const [anfragen, klickMap, ranking, zuordnungen] = await Promise.all([
    anfragenJeCollection(collectionId, z),
    klicksJeProdukt(z),
    letztesRanking(collectionId),
    admin
      .from("dir_collection_produkt")
      .select("zone, dir_produkt(id, name, slug)")
      .eq("collection_id", collectionId),
  ]);

  const impr = anfragen.reduce((s, a) => s + a.impressionen, 0);
  const klicksSuche = anfragen.reduce((s, a) => s + a.klicks, 0);

  // Klicks auf die Anbieter DIESER Kategorie.
  const anbieter = (zuordnungen.data ?? [])
    .map((r) => {
      const p = r.dir_produkt as unknown as { id: string; name: string; slug: string } | null;
      if (!p) return null;
      const k = klickMap.get(p.id)?.klicks ?? 0;
      return { ...p, zone: r.zone as string, klicks: k };
    })
    .filter((x): x is { id: string; name: string; slug: string; zone: string; klicks: number } => x !== null)
    .sort((a, b) => b.klicks - a.klicks);
  const klicksAus = anbieter.reduce((s, a) => s + a.klicks, 0);

  const oeffentlichePfad = cluster ? `/verzeichnis/${cluster.slug}/${coll.slug}` : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/admin/statistik" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Alle Kategorien
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{coll.name as string}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {cluster?.name ?? "Ohne Hub"}
            {oeffentlichePfad && (
              <>
                {" · "}
                <a href={oeffentlichePfad} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 hover:text-foreground">
                  Seite ansehen <ExternalLink className="size-3" />
                </a>
              </>
            )}
          </p>
        </div>
        <div className="flex gap-1.5">
          {[7, 30, 90, 365].map((t) => (
            <Link
              key={t}
              href={`/admin/statistik/collection/${slug}?tage=${t}`}
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${
                tage === t ? "border-foreground bg-foreground text-background" : "bg-card hover:bg-accent"
              }`}
            >
              {t === 365 ? "12M" : `${t}T`}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Kachel icon={Eye} label="Impressionen bei Google" wert={impr.toLocaleString("de-DE")} />
        <Kachel icon={ArrowUpRight} label="Klicks aus der Suche" wert={klicksSuche.toLocaleString("de-DE")} />
        <Kachel icon={MousePointerClick} label="Klicks auf Anbieter" wert={klicksAus.toLocaleString("de-DE")} />
      </div>

      {/* RANKING aus DataForSEO. Die einzige Quelle, die auch dann etwas sagt, wenn die
          Search Console noch schweigt: sie zeigt die Position, selbst ohne Impressionen. */}
      <div className="mt-8 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">Ranking bei Google</h2>
        <RankingButton collectionId={collectionId} slug={slug} schonDa={ranking.length > 0} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Keyword: {(coll.fokus_keyword as string) || (coll.name as string)}. Kostet pro Abfrage ein paar Cent, deshalb auf Knopfdruck statt automatisch.
      </p>

      {ranking.length === 0 ? (
        <div className="mt-3 rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
          Noch nicht abgefragt. Der Knopf oben holt die aktuelle Position in DE, AT und CH.
        </div>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {ranking.map((r) => (
            <div key={r.land} className="rounded-2xl border bg-card p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-muted-foreground">{r.land}</span>
                <span className="font-display text-2xl font-semibold tabular-nums">
                  {r.position ? `#${r.position}` : "> 100"}
                </span>
              </div>
              {r.topDomains.length > 0 && (
                <div className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  Oben: {r.topDomains.slice(0, 3).join(", ")}
                </div>
              )}
              <div className="mt-1 text-[10px] text-muted-foreground/70">
                Stand {new Date(r.erhobenAm).toLocaleDateString("de-DE")}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUCHANFRAGEN aus der Search Console. */}
      <h2 className="mt-8 font-display text-lg font-semibold">Suchanfragen</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Womit Besucher diese Seite bei Google gefunden haben. Google lässt sehr seltene Anfragen weg.
      </p>
      {anfragen.length === 0 ? (
        <div className="mt-3 rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
          Noch keine Suchdaten. Google braucht nach der Veröffentlichung einige Wochen, bis hier etwas steht.
        </div>
      ) : (
        <div className="mt-3 overflow-hidden rounded-2xl border bg-card">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 border-b bg-muted/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Suchanfrage</span>
            <span className="w-14 text-right">Impr.</span>
            <span className="w-12 text-right">Klicks</span>
            <span className="w-12 text-right">Pos.</span>
          </div>
          <ul className="divide-y">
            {anfragen.slice(0, 50).map((a) => (
              <li key={a.anfrage} className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-4 py-2 text-sm">
                <span className="min-w-0 truncate">{a.anfrage}</span>
                <span className="w-14 text-right tabular-nums">{a.impressionen.toLocaleString("de-DE")}</span>
                <span className="w-12 text-right tabular-nums">{a.klicks}</span>
                <span className="w-12 text-right tabular-nums text-muted-foreground">
                  {a.position ? a.position.toFixed(1).replace(".", ",") : "–"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ANBIETER dieser Kategorie und ihre Klicks. */}
      <h2 className="mt-8 font-display text-lg font-semibold">Anbieter dieser Kategorie</h2>
      {anbieter.length === 0 ? (
        <div className="mt-3 rounded-2xl border bg-card p-5 text-sm text-muted-foreground">Keine Anbieter zugeordnet.</div>
      ) : (
        <div className="mt-3 overflow-hidden rounded-2xl border bg-card">
          <ul className="divide-y">
            {anbieter.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <Link href={`/admin/statistik/anbieter/${a.slug}`} className="min-w-0 flex-1 truncate font-medium hover:underline">
                  {a.name}
                </Link>
                {a.zone === "gesponsert" && (
                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">Anzeige</span>
                )}
                <span className="w-16 text-right tabular-nums">{a.klicks}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

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
