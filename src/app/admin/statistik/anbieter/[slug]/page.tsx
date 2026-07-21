import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MousePointerClick, ArrowUpRight, Smartphone, ExternalLink } from "lucide-react";
import { redaktionOderRaus } from "@/lib/redaktion";
import { zeitraum } from "@/lib/statistik";

export const metadata: Metadata = { title: "Anbieter-Statistik", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * AD-15: Alles zu EINEM Anbieter.
 *
 * Die Frage hier ist eine andere als bei der Kategorie: nicht "bringt die Seite
 * Traffic", sondern "wie viel Reichweite haben WIR diesem Anbieter geliefert". Das ist
 * die Zahl fuer das Gespraech ueber bezahlte Sichtbarkeit, und sie wird nach Herkunft
 * aufgeschluesselt: aus welchen Kategorien kamen die Klicks, und aus welcher Zone.
 */
export default async function AnbieterStatistik({
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

  const { data: produkt } = await admin
    .from("dir_produkt")
    .select("id, name, anbieter, slug, website_url, affiliate_url, status")
    .eq("slug", slug)
    .maybeSingle();
  if (!produkt) notFound();

  const produktId = produkt.id as string;

  const [{ data: klicks }, { data: zuordnungen }] = await Promise.all([
    admin
      .from("dir_klick")
      .select("collection_id, zone, ist_affiliate, geraet, erstellt_am")
      .eq("produkt_id", produktId)
      .gte("erstellt_am", z.seit)
      .limit(100000),
    admin
      .from("dir_collection_produkt")
      .select("zone, dir_collection(id, name, slug, status)")
      .eq("produkt_id", produktId),
  ]);

  const alle = klicks ?? [];
  const gesamt = alle.length;
  const affiliate = alle.filter((k) => k.ist_affiliate).length;
  const gesponsert = alle.filter((k) => k.zone === "gesponsert").length;
  const mobil = alle.filter((k) => k.geraet === "mobil").length;

  // Klicks nach Herkunfts-Kategorie.
  const jeColl = new Map<string, number>();
  for (const k of alle) {
    if (k.collection_id) jeColl.set(k.collection_id as string, (jeColl.get(k.collection_id as string) ?? 0) + 1);
  }

  // Die Kategorien, in denen der Anbieter gelistet ist (auch ohne Klicks).
  const gelistet = (zuordnungen ?? [])
    .map((r) => {
      const c = r.dir_collection as unknown as { id: string; name: string; slug: string; status: string } | null;
      if (!c) return null;
      return { ...c, zone: r.zone as string, klicks: jeColl.get(c.id) ?? 0 };
    })
    .filter((x): x is { id: string; name: string; slug: string; status: string; zone: string; klicks: number } => x !== null)
    .sort((a, b) => b.klicks - a.klicks || a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/admin/statistik?ansicht=anbieter" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Alle Anbieter
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{produkt.name as string}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {(produkt.anbieter as string) || "Anbieter unbekannt"}
            {produkt.website_url && (
              <>
                {" · "}
                <a href={produkt.website_url as string} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 hover:text-foreground">
                  Website <ExternalLink className="size-3" />
                </a>
              </>
            )}
            {produkt.affiliate_url && (
              <span className="ml-2 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">Affiliate</span>
            )}
          </p>
        </div>
        <div className="flex gap-1.5">
          {[7, 30, 90, 365].map((t) => (
            <Link
              key={t}
              href={`/admin/statistik/anbieter/${slug}?tage=${t}`}
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${
                tage === t ? "border-foreground bg-foreground text-background" : "bg-card hover:bg-accent"
              }`}
            >
              {t === 365 ? "12M" : `${t}T`}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Kachel icon={MousePointerClick} label="Klicks gesamt" wert={gesamt.toLocaleString("de-DE")} />
        <Kachel icon={ArrowUpRight} label="aus der Anzeigenzone" wert={gesponsert.toLocaleString("de-DE")} />
        <Kachel icon={ArrowUpRight} label="über Affiliate" wert={affiliate.toLocaleString("de-DE")} />
        <Kachel icon={Smartphone} label="mobil" wert={gesamt ? `${Math.round((mobil / gesamt) * 100)} %` : "–"} />
      </div>

      <h2 className="mt-8 font-display text-lg font-semibold">Gelistet in diesen Kategorien</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Woher die Klicks kamen, und wo der Anbieter überall auftaucht, auch ohne Klicks.
      </p>
      {gelistet.length === 0 ? (
        <div className="mt-3 rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
          Dieser Anbieter ist keiner Kategorie zugeordnet.
        </div>
      ) : (
        <div className="mt-3 overflow-hidden rounded-2xl border bg-card">
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b bg-muted/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Kategorie</span>
            <span className="w-16 text-right">Zone</span>
            <span className="w-16 text-right">Klicks</span>
          </div>
          <ul className="divide-y">
            {gelistet.map((c) => (
              <li key={c.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-2.5 text-sm">
                <Link href={`/admin/statistik/collection/${c.slug}`} className="min-w-0 truncate font-medium hover:underline">
                  {c.name}
                </Link>
                <span className="w-16 text-right text-xs text-muted-foreground">
                  {c.zone === "gesponsert" ? "Anzeige" : c.zone === "community" ? "Community" : "organisch"}
                </span>
                <span className="w-16 text-right tabular-nums">{c.klicks}</span>
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
