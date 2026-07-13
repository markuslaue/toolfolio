/**
 * Vorschau einer Collection im echten Layout, auch wenn sie noch Entwurf ist.
 *
 * Nur fuer Inhaber-/Redaktionskonten (profiles.is_staff). Die oeffentliche Seite
 * kann Entwuerfe nicht zeigen, weil die RLS sie fuer anonyme Besucher wegblendet.
 * Diese Route liest bewusst mit der Service-Role, deshalb ist das Rollen-Gate hier
 * serverseitig und nicht verhandelbar.
 *
 * Kein Indexieren, keine Sitemap, kein Link von aussen.
 */
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ListOrdered, Megaphone, Users } from "lucide-react";
import { ContentPiece } from "@/components/verzeichnis/content-piece";
import { AutorBox } from "@/components/verzeichnis/experte";
import { ProduktKarte } from "@/components/verzeichnis/produkt-karte";
import { getAutor, STANDARD_AUTOR } from "@/lib/autoren";
import { bewertungenFuer, organischerScore, type Produkt, type ProduktInZone, type Zone } from "@/lib/verzeichnis";
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

const ZONEN: { zone: Zone; titel: string; sub: string; icon: typeof Megaphone; stil: string }[] = [
  {
    zone: "gesponsert",
    titel: "Gesponsert",
    sub: "Bezahlte Platzierung, immer als solche gekennzeichnet. Rang und Bewertungen bleiben davon unberührt.",
    icon: Megaphone,
    stil: "text-coral",
  },
  {
    zone: "organisch",
    titel: "Organisch",
    sub: "Serverseitig sortiert nach Vollständigkeit und verifizierten Bewertungen, nicht käuflich.",
    icon: ListOrdered,
    stil: "text-primary",
  },
  {
    zone: "community",
    titel: "Community",
    sub: "Von der Community vorgeschlagen, noch nicht redaktionell geprüft.",
    icon: Users,
    stil: "text-muted-foreground",
  },
];

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
      "id, name, slug, h1, meta_title, meta_description, intro_md, content_md, content_status, content_woerter, experten_zitat, autor_slug, status, dir_cluster(name, slug)",
    )
    .eq("slug", collection)
    .maybeSingle();
  if (!data) notFound();

  const cluster = data.dir_cluster as unknown as { name: string; slug: string } | null;
  const autor = getAutor(data.autor_slug ?? STANDARD_AUTOR);

  // Produkte inklusive Entwuerfe. Oeffentlich waeren nur veroeffentlichte sichtbar.
  const { data: cp } = await admin
    .from("dir_collection_produkt")
    .select("zone, position, gesponsert_bis, dir_produkt(*)")
    .eq("collection_id", data.id);

  const produkte: ProduktInZone[] = (
    (cp ?? []) as unknown as { zone: Zone; position: number; gesponsert_bis: string | null; dir_produkt: Produkt }[]
  )
    .filter((r) => r.dir_produkt)
    .map((r) => ({ ...r.dir_produkt, zone: r.zone, position: r.position, gesponsert_bis: r.gesponsert_bis }));

  const bew = await bewertungenFuer(produkte.map((p) => p.id));

  function inZone(zone: Zone): ProduktInZone[] {
    const list = produkte.filter((p) => p.zone === zone);
    if (zone === "organisch") {
      return list.sort((a, b) => organischerScore(b, bew.get(b.id)) - organischerScore(a, bew.get(a.id)));
    }
    return list.sort((a, b) => a.position - b.position);
  }

  const ungeprueft = produkte.filter((p) => p.status !== "veroeffentlicht").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Redaktions-Leiste, die es oeffentlich nicht gibt */}
      <div className="mb-8 rounded-2xl border border-warning/40 bg-warning/10 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
          <div className="min-w-0 flex-1">
            <div className="font-semibold">Vorschau, nicht öffentlich</div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Collection: <span className="font-medium text-foreground">{data.status}</span> · Text:{" "}
              <span className="font-medium text-foreground">
                {STATUS_TEXT[data.content_status] ?? data.content_status}
              </span>
              {data.content_woerter ? ` · ${data.content_woerter} Wörter` : ""} ·{" "}
              <span className="font-medium text-foreground">
                {produkte.length} Produkte, davon {ungeprueft} ungeprüft
              </span>
            </p>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
              <span>
                Meta-Title ({data.meta_title?.length ?? 0}):{" "}
                <span className="text-foreground">{data.meta_title}</span>
              </span>
              <span>Meta-Description ({data.meta_description?.length ?? 0})</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="text-sm text-muted-foreground">
        <Link href="/verzeichnis" className="hover:text-foreground">
          Verzeichnis
        </Link>
        {cluster && <> · {cluster.name}</>}
      </nav>

      <header className="mt-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{data.h1 ?? data.name}</h1>
        {data.intro_md && <p className="mt-3 max-w-3xl text-muted-foreground">{data.intro_md}</p>}
        <div className="mt-4 text-sm text-muted-foreground">
          {produkte.length} {produkte.length === 1 ? "Tool" : "Tools"} im Vergleich
        </div>
      </header>

      <div className="mt-10 space-y-10">
        {ZONEN.map(({ zone, titel, sub, icon: Icon, stil }) => {
          const items = inZone(zone);
          if (items.length === 0) return null;
          return (
            <section key={zone}>
              <div className="mb-4 flex items-start gap-2">
                <Icon className={`mt-0.5 size-5 ${stil}`} />
                <div>
                  <h2 className={`font-display text-lg font-semibold ${stil}`}>{titel}</h2>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </div>
              <div className="space-y-3">
                {items.map((p, i) => (
                  <ProduktKarte
                    key={p.id}
                    p={p}
                    bewertung={bew.get(p.id)}
                    rang={zone === "organisch" ? i + 1 : undefined}
                  />
                ))}
              </div>
            </section>
          );
        })}
        {produkte.length === 0 && (
          <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Dieser Collection ist noch kein Produkt zugeordnet.
          </div>
        )}
      </div>

      {data.content_md ? (
        <>
          <ContentPiece
            md={data.content_md}
            titel={`Alles über ${data.name}`}
            experte={autor && data.experten_zitat ? { autor, zitat: data.experten_zitat, thema: data.name } : undefined}
          />
          {autor && <AutorBox autor={autor} />}
        </>
      ) : (
        <p className="mt-16 border-t pt-10 text-sm text-muted-foreground">
          Für diese Collection gibt es noch keinen Text.
        </p>
      )}
    </div>
  );
}
