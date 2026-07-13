import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Megaphone, ListOrdered, Users } from "lucide-react";
import { Breadcrumb } from "@/components/verzeichnis/breadcrumb";
import { ProduktKarte } from "@/components/verzeichnis/produkt-karte";
import { ContentPiece } from "@/components/verzeichnis/content-piece";
import { getCollection, alleCollectionPfade, bewertungenFuer, organischerScore, type Zone, type ProduktInZone, type Bewertung } from "@/lib/verzeichnis";

export const revalidate = 600;

export async function generateStaticParams() {
  return await alleCollectionPfade();
}

export async function generateMetadata({ params }: { params: Promise<{ collection: string }> }): Promise<Metadata> {
  const { collection } = await params;
  const data = await getCollection(collection);
  if (!data) return { title: "Nicht gefunden" };
  return {
    title: data.collection.meta_title ?? data.collection.name,
    description: data.collection.meta_description ?? undefined,
  };
}

const ZONEN: { zone: Zone; titel: string; sub: string; icon: typeof Megaphone; stil: string }[] = [
  { zone: "gesponsert", titel: "Gesponsert", sub: "Bezahlte Platzierung, immer als solche gekennzeichnet. Rang und Bewertungen bleiben davon unberührt.", icon: Megaphone, stil: "text-coral" },
  { zone: "organisch", titel: "Organisch", sub: "Serverseitig sortiert nach Vollständigkeit und verifizierten Bewertungen, nicht käuflich.", icon: ListOrdered, stil: "text-primary" },
  { zone: "community", titel: "Community", sub: "Von der Community vorgeschlagen, noch nicht redaktionell geprüft.", icon: Users, stil: "text-muted-foreground" },
];

export default async function CollectionSeite({ params }: { params: Promise<{ cluster: string; collection: string }> }) {
  const { cluster, collection } = await params;
  const data = await getCollection(collection);
  if (!data) notFound();

  const bew = await bewertungenFuer(data.produkte.map((p) => p.id));

  function inZone(zone: Zone): ProduktInZone[] {
    const list = data!.produkte.filter((p) => p.zone === zone);
    if (zone === "organisch") {
      return list.sort((a, b) => organischerScore(b, bew.get(b.id)) - organischerScore(a, bew.get(a.id)));
    }
    return list.sort((a, b) => a.position - b.position);
  }

  const schnittGesamt = (() => {
    const alle = [...bew.values()] as Bewertung[];
    if (!alle.length) return null;
    const total = alle.reduce((s, b) => s + b.schnitt * b.anzahl, 0);
    const n = alle.reduce((s, b) => s + b.anzahl, 0);
    return n ? Math.round((total / n) * 10) / 10 : null;
  })();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Breadcrumb
        items={[
          { name: "Verzeichnis", href: "/verzeichnis" },
          { name: data.cluster.name, href: `/verzeichnis/${data.cluster.slug}` },
          { name: data.collection.name },
        ]}
      />

      <header className="mt-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{data.collection.h1 ?? data.collection.name}</h1>
        {data.collection.intro_md && <p className="mt-3 max-w-3xl text-muted-foreground">{data.collection.intro_md}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
          <span>{data.produkte.length} Tools im Vergleich</span>
          {schnittGesamt !== null && <span>Ø {schnittGesamt.toString().replace(".", ",")} von 5</span>}
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
                  <ProduktKarte key={p.id} p={p} bewertung={bew.get(p.id)} rang={zone === "organisch" ? i + 1 : undefined} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Das SEO-Content-Piece steht bewusst UNTER den Produkten: Wer sucht, will
          zuerst Tools sehen. Der Text macht die URL fuer das Keyword relevant. */}
      {data.collection.content_md && (
        <ContentPiece md={data.collection.content_md} titel={`Alles über ${data.collection.name}`} />
      )}

      <p className="mt-12 rounded-2xl border border-border bg-secondary/40 p-4 text-xs text-muted-foreground">
        Hinweis: Käuflich ist ausschließlich die Sichtbarkeit in der gesponserten Zone, immer gekennzeichnet. Die organische Reihenfolge,
        die Bewertungen und die verifizierten Daten sind nie käuflich und werden serverseitig unabhängig berechnet. Preisangaben tragen Stand und Quelle.
      </p>
    </div>
  );
}
