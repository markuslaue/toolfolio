/**
 * Vorschau einer Collection im echten Layout, auch wenn sie noch Entwurf ist.
 *
 * Nur fuer Inhaber-/Redaktionskonten (profiles.is_staff). Die oeffentliche Seite
 * kann Entwuerfe nicht zeigen, weil die RLS sie fuer anonyme Besucher wegblendet.
 * Diese Route liest bewusst mit der Service-Role, deshalb liegt das Rollen-Gate
 * DAVOR und ist nicht verhandelbar.
 *
 * Kein Indexieren, keine Sitemap, kein Link von aussen.
 */
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { CollectionSeite, NUTZER_SCHWELLE } from "@/components/verzeichnis/collection-seite";
import { getAutor, STANDARD_AUTOR } from "@/lib/autoren";
import { bewertungenFuer, type Produkt, type ProduktInZone, type Zone } from "@/lib/verzeichnis";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Vorschau",
  robots: { index: false, follow: false },
};

const STATUS_TEXT: Record<string, string> = {
  fehlt: "Noch kein Text erzeugt.",
  ki_ungeprueft: "Von der KI geschrieben, noch nicht geprüft. Kann nicht veröffentlicht werden.",
  geprueft: "Redaktionell geprüft und freigegeben.",
};

/** Toolname vergleichbar machen ("Camping.care" und "camping care"). */
function normalisiere(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export default async function VorschauSeite({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/verzeichnis/vorschau/${collection}`);

  const { data: profil } = await supabase.from("profiles").select("is_staff").eq("id", user.id).maybeSingle();
  if (!profil?.is_staff) notFound();

  // Erst ab hier die Service-Role, nach bestandener Rollenpruefung.
  const admin = createAdminClient();
  const { data } = await admin
    .from("dir_collection")
    .select(
      "id, name, slug, h1, intro_md, content_md, content_status, content_woerter, experten_zitat, autor_slug, status, content_erzeugt_am, dir_cluster(name, slug)",
    )
    .eq("slug", collection)
    .maybeSingle();
  if (!data) notFound();

  const cluster = (data.dir_cluster as unknown as { name: string; slug: string } | null) ?? {
    name: "Verzeichnis",
    slug: "",
  };
  const autor = getAutor(data.autor_slug ?? STANDARD_AUTOR);

  const { data: cp } = await admin
    .from("dir_collection_produkt")
    .select("zone, position, gesponsert_bis, dir_produkt(*)")
    .eq("collection_id", data.id);

  const produkte: ProduktInZone[] = (
    (cp ?? []) as unknown as { zone: Zone; position: number; gesponsert_bis: string | null; dir_produkt: Produkt }[]
  )
    .filter((r) => r.dir_produkt)
    .map((r) => ({ ...r.dir_produkt, zone: r.zone, position: r.position, gesponsert_bis: r.gesponsert_bis }))
    .sort((a, b) => a.position - b.position);

  const bewertungen = await bewertungenFuer(produkte.map((p) => p.id));

  /* Verbreitung: wie viele TOOLFOLIO-KONTEN setzen das Tool wirklich ein?
     Das ist die eine Zahl, die kein Wettbewerber hat. Sie darf aber erst ab einer
     Mindestschwelle raus, sonst ist sie ein Rueckschluss auf einzelne Kunden
     (Leitplanke 3: personenbezogen und anonym strikt trennen). */
  const { data: abos } = await admin.from("abos").select("tool, user_id").neq("status", "archiviert");
  const kontenJeTool = new Map<string, Set<string>>();
  for (const a of (abos as { tool: string; user_id: string }[]) ?? []) {
    const k = normalisiere(a.tool);
    if (!kontenJeTool.has(k)) kontenJeTool.set(k, new Set());
    kontenJeTool.get(k)!.add(a.user_id);
  }

  const nutzerJeProdukt = new Map<string, number | null>();
  for (const p of produkte) {
    const n = kontenJeTool.get(normalisiere(p.name))?.size ?? 0;
    nutzerJeProdukt.set(p.id, n >= NUTZER_SCHWELLE ? n : null);
  }

  const ungeprueft = produkte.filter((p) => p.status !== "veroeffentlicht").length;
  const aktualisiert = data.content_erzeugt_am
    ? new Date(data.content_erzeugt_am).toLocaleDateString("de-DE")
    : null;

  return (
    <>
      {/* Redaktions-Leiste, die es oeffentlich nicht gibt */}
      <div className="border-b border-dashed border-warning/50 bg-warning/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-xs sm:px-6">
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-warning/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-warning">
              <AlertTriangle className="size-3" /> Vorschau
            </span>
            <span className="font-medium text-foreground/80">
              Collection: <span className="font-semibold">{data.status}</span> ·{" "}
              {STATUS_TEXT[data.content_status] ?? data.content_status}
            </span>
          </div>
          <div className="font-mono tabular-nums text-foreground/60">
            {data.content_woerter ?? 0} Wörter · {produkte.length} Produkte · {ungeprueft} ungeprüft
          </div>
        </div>
      </div>

      <CollectionSeite
        collection={{
          name: data.name,
          slug: data.slug,
          h1: data.h1,
          intro_md: data.intro_md,
          content_md: data.content_md,
          experten_zitat: data.experten_zitat,
          aktualisiert,
        }}
        cluster={cluster}
        produkte={produkte}
        bewertungen={bewertungen}
        nutzerJeProdukt={nutzerJeProdukt}
        autor={autor}
      />
    </>
  );
}
