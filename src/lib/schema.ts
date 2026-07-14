import type { Collection, Cluster, ProduktInZone, Bewertung } from "@/lib/verzeichnis";
import type { Autor } from "@/lib/autoren";

/**
 * Strukturierte Daten fuer die Collection-Seite, als zusammenhaengender @graph.
 *
 * DIE EINE REGEL, die alles andere schlaegt: Markiert wird NUR, was auf der Seite
 * SICHTBAR ist. Kein erfundener Preis, kein Rating ohne echte Bewertung, kein Feld,
 * dem nichts entspricht. Falsches Markup ist kein SEO-Trick, es ist ein
 * Richtlinienverstoss, und der kostet die Rich Results fuer die GANZE Domain,
 * nicht nur fuer eine Seite. Das Risiko steht in keinem Verhaeltnis.
 *
 * Deshalb sind hier ueberall Auslassungen statt Platzhalter: fehlt der Beleg,
 * fehlt der Knoten.
 */

export const SITE = "https://toolfolio.de";
const ORG_ID = `${SITE}/#organization`;
const SITE_ID = `${SITE}/#website`;

type Knoten = Record<string, unknown>;

function organisation(): Knoten {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: "Toolfolio",
    url: SITE,
    legalName: "OMMM GmbH",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Leipzig",
      addressCountry: "DE",
    },
  };
}

function website(): Knoten {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: SITE,
    name: "Toolfolio",
    inLanguage: "de-DE",
    publisher: { "@id": ORG_ID },
  };
}

function person(autor: Autor): Knoten {
  const knoten: Knoten = {
    "@type": "Person",
    "@id": `${SITE}/autor/${autor.slug}#person`,
    name: autor.name,
    jobTitle: autor.rolle,
    description: autor.kurz,
    worksFor: { "@id": ORG_ID },
    knowsAbout: autor.expertise,
  };
  // url nur, wenn die Autorenseite auch wirklich erreichbar ist. Ein Link ins
  // Leere im Markup ist schlechter als gar kein Link.
  if (autor.freigegeben) knoten.url = `${SITE}/autor/${autor.slug}`;
  // sameAs NUR mit echten Profilen. Ein leeres Array waere ein leeres Versprechen.
  const sameAs = [autor.linkedin].filter(Boolean);
  if (sameAs.length > 0) knoten.sameAs = sameAs;
  return knoten;
}

/**
 * Ein Produkt als SoftwareApplication.
 *
 * `offers` NUR bei echtem Preis. Bei "Auf Anfrage" gibt es keinen Preis, also
 * gibt es kein offers. Einen Preis zu erfinden, damit das Markup vollstaendiger
 * aussieht, waere genau der Betrug, den die Richtlinien meinen.
 *
 * `aggregateRating` NUR bei echten, verifizierten Bewertungen, die auf der Seite
 * SICHTBAR sind, und mit exakt den sichtbaren Zahlen.
 */
function software(p: ProduktInZone, bewertung: Bewertung | undefined): Knoten {
  const knoten: Knoten = {
    "@type": "SoftwareApplication",
    /* FEHLER, den ich hier hatte: die URL lautete /verzeichnis/produkt/<slug>.
       Diese Route gibt es nicht. Die Produkt-Detailseiten liegen unter /software/<slug>.
       Das Markup verwies also auf 404-Seiten, und ein SoftwareApplication-Knoten mit
       toter URL ist wertlos bis schaedlich. */
    "@id": `${SITE}/software/${p.slug}#software`,
    name: p.name,
    url: `${SITE}/software/${p.slug}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: p.plattformen.length > 0 ? p.plattformen.join(", ") : "Web",
  };
  if (p.kurzbeschreibung) knoten.description = p.kurzbeschreibung;
  if (p.anbieter) {
    knoten.publisher = { "@type": "Organization", name: p.anbieter };
  }
  if (p.website_url) knoten.sameAs = [p.website_url];
  if (p.features.length > 0) knoten.featureList = p.features;

  // Preis: nur wenn er belegt ist und einen Stand hat.
  const preis = echterPreis(p.preis_hinweis);
  if (preis !== null) {
    knoten.offers = {
      "@type": "Offer",
      price: preis.betrag,
      priceCurrency: preis.waehrung,
      url: p.preis_quelle_url ?? p.website_url ?? undefined,
      ...(p.preis_stand ? { priceValidUntil: undefined, availabilityStarts: p.preis_stand } : {}),
    };
  }

  // Bewertung: nur echt, nur verifiziert, nur wenn sichtbar.
  if (bewertung && bewertung.anzahl > 0 && bewertung.verifiziert > 0) {
    knoten.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: bewertung.schnitt,
      reviewCount: bewertung.anzahl,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return knoten;
}

/**
 * Aus einem Preis-Hinweis einen echten Preis lesen, oder null.
 *
 * "Auf Anfrage", "individuell", leer: das sind KEINE Preise. Nur wenn wirklich eine
 * Zahl mit Waehrung dasteht, entsteht ein offers-Knoten.
 */
function echterPreis(hinweis: string | null): { betrag: string; waehrung: string } | null {
  if (!hinweis) return null;
  const treffer = hinweis.match(/(\d+(?:[.,]\d{1,2})?)\s*(EUR|€|USD|\$)/i);
  if (!treffer) return null;
  const betrag = treffer[1].replace(",", ".");
  const roh = treffer[2].toUpperCase();
  const waehrung = roh === "€" ? "EUR" : roh === "$" ? "USD" : roh;
  return { betrag, waehrung };
}

export type FaqEintrag = { frage: string; antwort: string };

export function collectionGraph({
  collection,
  cluster,
  produkte,
  bewertungen,
  faq,
  autor,
  aktualisiertAm,
}: {
  collection: Collection;
  cluster: Cluster;
  /** NUR die organische Zone, in genau der Reihenfolge, in der sie sichtbar ist. */
  produkte: ProduktInZone[];
  bewertungen: Map<string, Bewertung>;
  faq: FaqEintrag[];
  autor: Autor | null;
  aktualisiertAm: string;
}): Knoten {
  const url = `${SITE}/verzeichnis/${cluster.slug}/${collection.slug}`;
  const seiteId = `${url}#webpage`;

  const graph: Knoten[] = [organisation(), website()];

  const seite: Knoten = {
    "@type": "CollectionPage",
    "@id": seiteId,
    url,
    name: collection.meta_title ?? collection.h1 ?? collection.name,
    description: collection.meta_description ?? undefined,
    inLanguage: "de-DE",
    isPartOf: { "@id": SITE_ID },
    dateModified: aktualisiertAm,
    about: { "@type": "Thing", name: collection.name },
    breadcrumb: { "@id": `${url}#breadcrumb` },
  };
  if (autor) {
    seite.author = { "@id": `${SITE}/autor/${autor.slug}#person` };
    graph.push(person(autor));
  }
  graph.push(seite);

  graph.push({
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Verzeichnis", item: `${SITE}/verzeichnis` },
      { "@type": "ListItem", position: 2, name: cluster.name, item: `${SITE}/verzeichnis/${cluster.slug}` },
      { "@type": "ListItem", position: 3, name: collection.name, item: url },
    ],
  });

  /* ItemList: die ORGANISCHE Reihenfolge, sonst nichts.
     Die gesponserte Zone taucht hier NICHT auf. Wer bezahlt, wird sichtbarer,
     aber er wandert nicht in die strukturierten Daten der Rangliste. Sonst
     waere die bezahlte Platzierung genau das, was die Goldene Regel verbietet:
     ein gekaufter Rang. */
  if (produkte.length > 0) {
    graph.push({
      "@type": "ItemList",
      "@id": `${url}#toolliste`,
      name: `${collection.name} im Vergleich`,
      numberOfItems: produkte.length,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      itemListElement: produkte.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: software(p, bewertungen.get(p.id)),
      })),
    });
  }

  // FAQPage nur, wenn es eine sichtbare FAQ gibt. Wortgleich, aus derselben Quelle.
  if (faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.frage,
        acceptedAnswer: { "@type": "Answer", text: f.antwort },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}
