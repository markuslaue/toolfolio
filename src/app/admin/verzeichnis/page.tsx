import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, Package, Search } from "lucide-react";
import { redaktionOderRaus } from "@/lib/redaktion";

export const metadata: Metadata = { title: "Redaktion", robots: { index: false, follow: false } };

/**
 * Eine Zeile der Sicht dir_cluster_stats.
 *
 * Diese Seite stellte frueher 183 Abfragen: je Cluster fuenf Zaehlungen, dann alle
 * Collection-IDs geladen und die Produkte mit einem Filter ueber bis zu 1000 UUIDs
 * gezaehlt. Das war nicht langsam, weil das Verzeichnis gross ist, sondern weil die
 * Arbeit im Anwendungscode statt in der Datenbank gemacht wurde. Jetzt: eine Abfrage.
 */
type ClusterStat = {
  id: string;
  name: string;
  slug: string;
  farbe: string;
  status: string;
  collections: number;
  live: number;
  mit_text: number;
  text_ungeprueft: number;
  finder_live: number;
  finder_pruef: number;
  produkte: number;
};

export default async function RedaktionPage() {
  const { admin } = await redaktionOderRaus("/admin/verzeichnis");

  const { data } = await admin.from("dir_cluster_stats").select("*").order("name");
  const zeilen = (data as ClusterStat[]) ?? [];

  /* Der naechtliche Aufbau. Zaehlungen als head-Abfragen, damit die Seite nicht
     tausend Zeilen laedt, um vier Zahlen zu zeigen. */
  const zaehleWarteschlange = (zustand: string) =>
    admin.from("dir_warteschlange").select("collection_id", { count: "exact", head: true }).eq("zustand", zustand);

  const [wOffen, wFertig, wDurch, wFehler, { data: durchgefallen }] = await Promise.all([
    zaehleWarteschlange("offen"),
    zaehleWarteschlange("fertig"),
    zaehleWarteschlange("durchgefallen"),
    zaehleWarteschlange("fehler"),
    admin
      .from("dir_warteschlange")
      .select("collection_id, letzter_fehler, versuche, zuletzt_am, dir_collection(name, slug, gate_bericht, dir_cluster(slug))")
      .in("zustand", ["durchgefallen", "fehler"])
      .order("zuletzt_am", { ascending: false })
      .limit(20),
  ]);

  type Warteeintrag = {
    collection_id: string;
    letzter_fehler: string | null;
    versuche: number;
    dir_collection: {
      name: string;
      slug: string;
      gate_bericht: { pruefungen?: { name: string; soll: string; ist: string; bestanden: boolean }[] } | null;
      dir_cluster: { slug: string } | null;
    } | null;
  };
  const prueflliste = (durchgefallen as unknown as Warteeintrag[]) ?? [];
  const nachtAktiv = (wOffen.count ?? 0) + (wFertig.count ?? 0) + (wDurch.count ?? 0) + (wFehler.count ?? 0) > 0;

  const gesamt = {
    collections: zeilen.reduce((s, z) => s + Number(z.collections), 0),
    live: zeilen.reduce((s, z) => s + Number(z.live), 0),
    produkte: zeilen.reduce((s, z) => s + Number(z.produkte), 0),
    finderLive: zeilen.reduce((s, z) => s + Number(z.finder_live), 0),
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Redaktion</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {gesamt.collections} Kategorien in {zeilen.length} Clustern · {gesamt.live} live · {gesamt.produkte} Produkte
        zugeordnet · {gesamt.finderLive} Lead-Formulare live
      </p>

      {/* NAECHTLICHER AUFBAU.
          Er steht ganz oben, weil er der einzige Teil des Verzeichnisses ist, der ohne
          Zutun laeuft. Was unbeaufsichtigt arbeitet, muss sichtbar sein, sonst merkt man
          erst nach Wochen, dass es seit Wochen nichts tut. */}
      {nachtAktiv && (
        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold">Nächtlicher Aufbau</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Zahl label="offen" wert={wOffen.count ?? 0} />
            <Zahl label="live gegangen" wert={wFertig.count ?? 0} ton="gut" />
            <Zahl label="durchgefallen" wert={wDurch.count ?? 0} ton={(wDurch.count ?? 0) > 0 ? "warnung" : undefined} />
            <Zahl label="Fehler" wert={wFehler.count ?? 0} ton={(wFehler.count ?? 0) > 0 ? "schlecht" : undefined} />
          </div>

          {prueflliste.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-2xl border bg-card">
              <div className="border-b bg-muted/40 px-4 py-2.5 text-sm font-semibold">
                Wartet auf dich: {prueflliste.length} {prueflliste.length === 1 ? "Kategorie" : "Kategorien"}
              </div>
              <ul className="divide-y">
                {prueflliste.map((e) => {
                  const c = e.dir_collection;
                  const offen = (c?.gate_bericht?.pruefungen ?? []).filter((p) => !p.bestanden);
                  return (
                    <li key={e.collection_id} className="px-4 py-3">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <Link
                          href={`/admin/verzeichnis/collection/${c?.slug ?? ""}`}
                          className="font-medium hover:underline"
                        >
                          {c?.name ?? "Unbekannt"}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {e.versuche} {e.versuche === 1 ? "Versuch" : "Versuche"}
                        </span>
                      </div>

                      {/* JE BEDINGUNG, was gefehlt hat. "Durchgefallen" allein waere eine
                          Aussage ohne Begruendung, und dann kann niemand entscheiden, ob
                          nachgebessert oder verworfen gehoert. */}
                      {offen.length > 0 ? (
                        <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {offen.map((p) => (
                            <li key={p.name}>
                              <span className="font-medium text-foreground">{p.name}:</span> {p.ist}{" "}
                              <span className="text-muted-foreground/70">(nötig: {p.soll})</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1.5 text-xs text-destructive">{e.letzter_fehler ?? "Ohne Angabe."}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      )}

      <div className="mt-8 overflow-hidden rounded-2xl border bg-card">
        <ul className="divide-y">
          {zeilen.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/verzeichnis/${c.slug}`}
                className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/40"
              >
                <span className="size-3 shrink-0 rounded-full" style={{ background: c.farbe }} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{c.name}</span>
                    {c.status === "veroeffentlicht" && (
                      <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                        Hub live
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                    <span>{c.collections} Kategorien</span>
                    <span className="inline-flex items-center gap-1">
                      <FileText className="size-3" /> {c.mit_text} mit Text
                      {Number(c.text_ungeprueft) > 0 && (
                        <span className="text-warning">({c.text_ungeprueft} ungeprüft)</span>
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Package className="size-3" /> {c.produkte} Produkte
                    </span>
                    {Number(c.live) > 0 && <span className="font-medium text-success">{c.live} live</span>}
                  </div>

                  {/* Finder-Fortschritt: die Steuerung des Rollouts. Jede Kategorie
                      braucht einen eigenen Fragensatz, und man sieht hier auf einen
                      Blick, wie weit dieser Cluster ist. */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1 w-24 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width: `${Number(c.collections) ? (Number(c.finder_live) / Number(c.collections)) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Search className="size-3" />
                      {c.finder_live} von {c.collections} Lead-Formularen live
                      {Number(c.finder_pruef) > 0 && ` · ${c.finder_pruef} in Prüfung`}
                    </span>
                  </div>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Kleine Kennzahl. Ton nur, wenn die Zahl etwas bedeutet: eine 0 bei "Fehler" ist
    eine gute Nachricht und wird deshalb nicht rot. */
function Zahl({ label, wert, ton }: { label: string; wert: number; ton?: "gut" | "warnung" | "schlecht" }) {
  const farbe =
    ton === "gut" ? "text-success"
    : ton === "warnung" ? "text-warning"
    : ton === "schlecht" ? "text-destructive"
    : "";
  return (
    <div className="rounded-2xl border bg-card px-4 py-3">
      <div className={`font-display text-2xl font-semibold tabular-nums ${farbe}`}>{wert}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
