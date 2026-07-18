import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, AlertTriangle, Minus, ExternalLink } from "lucide-react";
import { redaktionOderRaus } from "@/lib/redaktion";
import { FINDER_STATUS_LABEL, FINDER_STATUS_STIL } from "@/lib/finder";

export const metadata: Metadata = { title: "Redaktion", robots: { index: false, follow: false } };

type Coll = {
  id: string;
  name: string;
  slug: string;
  prio: number;
  status: string;
  content_status: string;
  finder_status: "todo" | "in_review" | "live";
  content_woerter: number | null;
};

export default async function ClusterRedaktion({
  params,
  searchParams,
}: {
  params: Promise<{ cluster: string }>;
  searchParams: Promise<{ finder?: string }>;
}) {
  const { cluster } = await params;
  const filter = (await searchParams)?.finder;
  const { admin } = await redaktionOderRaus(`/admin/verzeichnis/${cluster}`);

  const { data: c } = await admin.from("dir_cluster").select("id, name, slug").eq("slug", cluster).maybeSingle();
  if (!c) notFound();

  const { data: collections } = await admin
    .from("dir_collection")
    .select("id, name, slug, prio, status, content_status, content_woerter, finder_status")
    .eq("cluster_id", c.id)
    .order("prio")
    .order("name");

  const alle = (collections as Coll[]) ?? [];

  /* Filter nach Finder-Status. Als Link, nicht als Client-Komponente: die Redaktion
     soll einen gefilterten Stand verschicken und wiederfinden koennen, und dafuer
     muss er in der URL stehen. */
  const gefiltert = filter && filter !== "alle" ? alle.filter((x) => x.finder_status === filter) : alle;

  /* Rein alphabetisch, aufsteigend: erst Zahlen, dann A bis Z.
     Bewusst NICHT nach Prioritaet oder Bearbeitungsstand: wer eine bestimmte Kategorie
     sucht, sucht sie beim Namen. Wer die unbearbeiteten sucht, hat dafuer den Filter.
     Eine Sortierung, die zwei Fragen gleichzeitig beantworten will, beantwortet keine.

     localeCompare mit "de": Umlaute landen dort, wo man sie erwartet (Ö bei O, nicht
     hinter Z). numeric: true: "3D Architekt" vor "10er Paket", nicht danach, denn eine
     rein zeichenweise Sortierung stellt "10" vor "3". */
  const colls = [...gefiltert].sort((a, b) =>
    a.name.localeCompare(b.name, "de", { numeric: true, sensitivity: "base" }),
  );
  const zaehler = {
    alle: alle.length,
    ohneText: alle.filter((x) => x.content_status === "fehlt").length,
    seiteLive: alle.filter((x) => x.status === "veroeffentlicht").length,
    todo: alle.filter((x) => x.finder_status === "todo").length,
    in_review: alle.filter((x) => x.finder_status === "in_review").length,
    live: alle.filter((x) => x.finder_status === "live").length,
  };

  const ids = colls.map((x) => x.id);
  const { data: zuordnungen } = ids.length
    ? await admin.from("dir_collection_produkt").select("collection_id").in("collection_id", ids)
    : { data: [] };

  const produkte = new Map<string, number>();
  for (const z of ((zuordnungen as { collection_id: string }[]) ?? [])) {
    produkte.set(z.collection_id, (produkte.get(z.collection_id) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/admin/verzeichnis" className="hover:text-foreground">
          Redaktion
        </Link>
      </nav>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">{c.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {zaehler.alle} Kategorien, alphabetisch · {zaehler.seiteLive} Seiten live ·{" "}
        {zaehler.live} Lead-Formulare live
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Zwei verschiedene Dinge: eine <strong>Seite</strong> ist live, wenn du sie veröffentlicht hast. Ein{" "}
        <strong>Lead-Formular</strong> ist live, wenn du den kategoriespezifischen Fragensatz freigegeben hast. Ohne
        ihn zeigt die Seite nur die generischen Grundfragen.
      </p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {(
          [
            ["alle", `Alle (${zaehler.alle})`],
            ["todo", `Formular offen (${zaehler.todo})`],
            ["in_review", `Formular in Prüfung (${zaehler.in_review})`],
            ["live", `Formular live (${zaehler.live})`],
          ] as const
        ).map(([wert, label]) => {
          const aktiv = (filter ?? "alle") === wert;
          return (
            <Link
              key={wert}
              href={wert === "alle" ? `/admin/verzeichnis/${cluster}` : `/admin/verzeichnis/${cluster}?finder=${wert}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                aktiv ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border bg-card">
        <ul className="divide-y">
          {colls.map((x) => {
            const n = produkte.get(x.id) ?? 0;
            return (
              <li key={x.id} className="flex items-center transition-colors hover:bg-muted/40">
                <Link
                  href={`/admin/verzeichnis/collection/${x.slug}`}
                  className="flex min-w-0 flex-1 items-center gap-4 px-4 py-3"
                >
                  <span className="w-8 shrink-0 text-xs font-mono text-muted-foreground">P{x.prio}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{x.name}</span>
                      {x.content_status === "fehlt" && n === 0 && (
                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          noch nichts passiert
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        {x.content_status === "geprueft" ? (
                          <Check className="size-3 text-success" />
                        ) : x.content_status === "auto_freigegeben" ? (
                          <Check className="size-3 text-sky-600" />
                        ) : x.content_status === "ki_ungeprueft" ? (
                          <AlertTriangle className="size-3 text-warning" />
                        ) : (
                          <Minus className="size-3" />
                        )}
                        {x.content_status === "fehlt" ? "kein Text" : `${x.content_woerter ?? 0} Wörter`}
                      </span>
                      <span>{n} Produkte</span>
                      <span className={`rounded-full px-1.5 py-0.5 font-medium ${FINDER_STATUS_STIL[x.finder_status]}`}>
                        Lead-Formular: {FINDER_STATUS_LABEL[x.finder_status]}
                      </span>
                      {x.status === "veroeffentlicht" && <span className="font-medium text-success">live</span>}
                    </div>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>

                {/* Der Live-Link steht NEBEN der Zeile, nicht darin: ein Link im Link ist
                    ungueltiges HTML und der Klick landet unvorhersehbar. */}
                {x.status === "veroeffentlicht" && (
                  <a
                    href={`/verzeichnis/${cluster}/${x.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Die veröffentlichte Seite ansehen"
                    className="mr-3 shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-foreground"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
