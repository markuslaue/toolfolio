import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionSeite, NUTZER_SCHWELLE } from "@/components/verzeichnis/collection-seite";
import { ladeLinkZiele } from "@/lib/link-ziele";
import { Finder } from "@/components/verzeichnis/finder";
import { Faq } from "@/components/verzeichnis/faq";
import { getAutor, STANDARD_AUTOR } from "@/lib/autoren";
import { collectionGraph, SITE, type FaqEintrag } from "@/lib/schema";
import { type Kandidat } from "@/lib/finder";
import {
  getCollection, alleCollectionPfade, bewertungenFuer, organischerScore, istFreigegeben,
  type Zone, type ProduktInZone,
} from "@/lib/verzeichnis";

export const revalidate = 600;

export async function generateStaticParams() {
  return await alleCollectionPfade();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cluster: string; collection: string }>;
}): Promise<Metadata> {
  const { cluster, collection } = await params;
  const data = await getCollection(collection);
  if (!data) return { title: "Nicht gefunden" };

  const url = `${SITE}/verzeichnis/${cluster}/${collection}`;
  const titel = data.collection.meta_title ?? data.collection.name;
  const beschreibung = data.collection.meta_description ?? undefined;

  /* Nur redaktionell freigegebener Text wird indexierbar ausgeliefert. Ein ungepruefter
     KI-Text im Index ist schlimmer als gar kein Text: er steht dort unter unserem Namen,
     und gelesen hat ihn niemand. */
  const freigegeben = istFreigegeben(data.collection.content_status);

  return {
    title: titel,
    description: beschreibung,
    alternates: { canonical: url },
    robots: freigegeben ? undefined : { index: false, follow: true },
    openGraph: {
      type: "website",
      url,
      title: titel,
      description: beschreibung,
      siteName: "Toolfolio",
      locale: "de_DE",
    },
    twitter: { card: "summary_large_image", title: titel, description: beschreibung },
  };
}

export default async function CollectionRoute({
  params,
}: {
  params: Promise<{ cluster: string; collection: string }>;
}) {
  const { collection } = await params;
  const data = await getCollection(collection);
  if (!data) notFound();

  const bew = await bewertungenFuer(data.produkte.map((p) => p.id));
  const autor = getAutor(data.collection.autor_slug ?? STANDARD_AUTOR);
  const linkZiele = await ladeLinkZiele();

  /* Sortierung: die gesponserte Zone zuerst (sie ist gekennzeichnet), darunter die
     organische, und die ist serverseitig sortiert, unabhaengig von jeder Bezahlung. */
  const sortiert: ProduktInZone[] = (["gesponsert", "organisch", "community"] as Zone[]).flatMap((zone) => {
    const list = data.produkte.filter((p) => p.zone === zone);
    if (zone === "organisch") {
      return list.sort((a, b) => organischerScore(b, bew.get(b.id)) - organischerScore(a, bew.get(a.id)));
    }
    return list.sort((a, b) => a.position - b.position);
  });

  const organisch = sortiert.filter((p) => p.zone === "organisch");

  /* Nutzerzahlen: erst ab NUTZER_SCHWELLE Konten. Darunter null, und die Oberflaeche
     sagt "zu wenig Daten", statt eine Zahl zu zeigen, die eine Person deanonymisiert.
     Heute hat kein Produkt Nutzer im Tracker, also ist die Karte ueberall ehrlich leer. */
  const nutzerJeProdukt = new Map<string, number | null>(data.produkte.map((p) => [p.id, null]));

  const config = data.collection.finder_config;
  const individuell = data.collection.finder_status === "live" && !!config?.categoryQuestions?.length;

  // Kandidaten fuer das Matching: ALLE Produkte, ohne Ansehen der Zone.
  // Wer bezahlt, wird sichtbarer, nicht passender.
  const kandidaten: Kandidat[] = data.produkte.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    farbe: p.farbe,
    kurzbeschreibung: p.kurzbeschreibung,
    tags: p.tags,
    rabatt: p.rabatt,
  }));

  // Der Anzeigenkunde. Er bekommt jede Anfrage, und der Finder sagt es dem Nutzer.
  const gesponsertProdukt = sortiert.find((p) => p.zone === "gesponsert") ?? null;

  const faq = (data.collection.faq ?? []) as FaqEintrag[];
  const freigegeben = istFreigegeben(data.collection.content_status);

  /* Schema-Markup nur bei redaktioneller Freigabe. Ungeprueften Text auszuzeichnen
     hiesse, Google um eine hervorgehobene Darstellung von etwas zu bitten, das wir
     selbst nie gelesen haben. */
  const graph = freigegeben
    ? collectionGraph({
        collection: data.collection,
        cluster: data.cluster,
        produkte: organisch,
        bewertungen: bew,
        faq,
        autor,
        aktualisiertAm: data.collection.aktualisiert_am,
      })
    : null;

  return (
    <>
      {graph && (
        <script
          type="application/ld+json"
          // Serverseitig gerendert: Crawler sehen es ohne JavaScript.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        />
      )}

      <CollectionSeite
        linkZiele={linkZiele}
        collection={{
          name: data.collection.name,
          slug: data.collection.slug,
          h1: data.collection.h1,
          intro_md: data.collection.intro_md,
          content_md: data.collection.content_md,
          experten_zitat: data.collection.experten_zitat,
          aktualisiert: new Date(data.collection.aktualisiert_am).toLocaleDateString("de-DE"),
          /* FEHLER, den ich hier hatte: das Bild war auf null verdrahtet, konnte also gar
             nicht erscheinen. Ohne Quellenangabe wird es weiterhin NICHT ausgespielt:
             bei KI-Bildern ist die Quelle "ki", und die Seite kennzeichnet es als solches. */
          hero:
            data.collection.hero_url && data.collection.hero_quelle
              ? {
                  url: data.collection.hero_url,
                  autor: data.collection.hero_autor,
                  autorUrl: data.collection.hero_autor_url,
                  quelle: data.collection.hero_quelle,
                  quelleUrl: data.collection.hero_quelle_url,
                }
              : null,
        }}
        cluster={{ name: data.cluster.name, slug: data.cluster.slug }}
        produkte={sortiert}
        bewertungen={bew}
        nutzerJeProdukt={nutzerJeProdukt}
        autor={autor}
        akzent={data.cluster.farbe ?? "#12B76A"}
        finder={
          data.produkte.length > 0 ? (
            <Finder
              collectionId={data.collection.id}
              collectionName={data.collection.name}
              kategorieFragen={individuell ? config!.categoryQuestions : []}
              kandidaten={kandidaten}
              headline={config?.introHeadline ?? `Finde die passende ${data.collection.name}`}
              ctaLabel={config?.ctaLabel ?? "Passende Software finden"}
              individuell={individuell}
              gesponsert={gesponsertProdukt ? { id: gesponsertProdukt.id, name: gesponsertProdukt.name, rabatt: gesponsertProdukt.rabatt } : null}
            />
          ) : undefined
        }
        finderCta={
          data.produkte.length > 0
            ? (config?.ctaLabel ?? `Passende ${data.collection.name} finden`)
            : undefined
        }
        faq={faq.length > 0 ? <Faq eintraege={faq} thema={data.collection.name} /> : undefined}
      />
    </>
  );
}

// NUTZER_SCHWELLE wird hier nur referenziert, damit die Regel sichtbar bleibt:
// unter dieser Schwelle zeigen wir keine Nutzerzahl. Siehe collection-seite.tsx.
void NUTZER_SCHWELLE;
