/**
 * Collection-Seite des Verzeichnisses. Port des Lovable-Entwurfs
 * (marketing/campingplatz-software-page.tsx), aber an echte Daten verdrahtet.
 *
 * BEWUSST NICHT UEBERNOMMEN aus dem Entwurf, weil erfunden:
 *   - Sternebewertungen und Rezensionszahlen ("4,6 aus 128 Bewertungen").
 *     Wir haben zu diesen Produkten null Bewertungen.
 *   - "342 Toolfolio-Nutzer" je Produkt. Wir haben diese Zahl nicht, und selbst
 *     wenn: sie darf erst ab einer Mindestschwelle raus (Anonymitaet, Leitplanke 3).
 *   - "Cloud-basiert 7 / 8" und das "Marktsignal" samt Sparkline. Frei erfunden.
 *
 * Stattdessen steht dort, was wir wirklich wissen, und wo nichts steht, steht,
 * dass wir es nicht wissen. Genau das ist der Unterschied zu Capterra.
 */
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  ChevronRight,
  Circle,
  ExternalLink,
  Info,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { ExpertenZitat, AutorBox } from "@/components/verzeichnis/experte";
import { HeroHintergrund, type HeroBild } from "@/components/verzeichnis/hero-hintergrund";
import { produktInitialen, type ProduktInZone, type Bewertung, type Zone } from "@/lib/verzeichnis";
import { ausgangsLink } from "@/lib/ausgang";
import { verlinke, neuerLinkKontext, type LinkKontext } from "@/lib/interne-links";
import type { Autor } from "@/lib/autoren";

/* -------------------------------- Typen ---------------------------------- */

export type CollectionDaten = {
  name: string;
  slug: string;
  h1: string | null;
  intro_md: string | null;
  content_md: string | null;
  experten_zitat: string | null;
  aktualisiert: string | null;
  hero: HeroBild | null;
};

export type ClusterDaten = { name: string; slug: string };

/** Wie viele Konten ein Tool mindestens einsetzen muessen, bevor wir eine Zahl zeigen. */
export const NUTZER_SCHWELLE = 5;

const PALETTE = ["#12B76A", "#2563EB", "#F59E0B", "#EC4899", "#8B5CF6", "#06B6D4", "#EF4444", "#0EA5E9"];

/* ------------------------------ Bausteine -------------------------------- */

function Stat({ label, wert, farbe }: { label: string; wert: string; farbe?: string }) {
  return (
    <div className="rounded-2xl border bg-background/60 px-3 py-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-foreground/45">{label}</div>
      <div className="mt-0.5 font-display text-lg font-semibold tabular-nums" style={farbe ? { color: farbe } : undefined}>
        {wert}
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, titel, id }: { eyebrow?: string; titel: string; id: string }) {
  return (
    <div id={id} className="scroll-mt-32">
      {eyebrow && (
        <div className="text-[11px] font-semibold uppercase tracking-widest text-foreground/50">{eyebrow}</div>
      )}
      <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{titel}</h2>
    </div>
  );
}

/* ------------------------- Markdown mit Eyebrows -------------------------- */

type Abschnitt = { eyebrow?: string; titel: string; id: string; bloecke: Block[] };
type Block = { typ: "h3"; text: string } | { typ: "p"; text: string } | { typ: "ul"; punkte: string[] };

function anker(t: string): string {
  return t
    .toLowerCase()
    .replaceAll("ä", "ae").replaceAll("ö", "oe").replaceAll("ü", "ue").replaceAll("ß", "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** "## [Grundverständnis] Was eine Software leistet" -> eyebrow + titel */
function parseAbschnitte(md: string): Abschnitt[] {
  const out: Abschnitt[] = [];
  let liste: string[] = [];

  const schliessen = () => {
    if (liste.length && out.length) {
      out[out.length - 1].bloecke.push({ typ: "ul", punkte: liste });
    }
    liste = [];
  };

  for (const roh of md.split("\n")) {
    const z = roh.trim();
    if (!z) {
      schliessen();
      continue;
    }
    if (z.startsWith("## ")) {
      schliessen();
      const rest = z.slice(3).trim();
      const m = rest.match(/^\[([^\]]+)\]\s*(.+)$/);
      const eyebrow = m?.[1];
      const titel = m?.[2] ?? rest;
      out.push({ eyebrow, titel, id: anker(titel), bloecke: [] });
    } else if (z.startsWith("### ")) {
      schliessen();
      out.at(-1)?.bloecke.push({ typ: "h3", text: z.slice(4) });
    } else if (z.startsWith("- ") || z.startsWith("* ")) {
      liste.push(z.slice(2));
    } else {
      schliessen();
      out.at(-1)?.bloecke.push({ typ: "p", text: z });
    }
  }
  schliessen();
  return out;
}

function fett(text: string): ReactNode[] {
  // Nicht-fette Teile bleiben ROHE Strings, damit die interne Verlinkung sie noch
  // sehen kann. In <span> gewickelt waeren sie fuer den Linker unsichtbar.
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter((t) => t !== "")
    .map((t, i) =>
      t.startsWith("**") && t.endsWith("**") ? (
        <strong key={`b${i}`} className="font-semibold text-foreground">
          {t.slice(2, -2)}
        </strong>
      ) : (
        t
      ),
    );
}

/** Fliesstext mit Fett-Auszeichnung UND interner Verlinkung (nur wenn ein Kontext da ist). */
function renderInline(text: string, ctx?: LinkKontext): ReactNode[] {
  const teile = fett(text);
  return ctx ? verlinke(teile, ctx) : teile;
}

function Bloecke({ bloecke, ctx }: { bloecke: Block[]; ctx?: LinkKontext }) {
  return (
    <>
      {bloecke.map((b, i) => {
        if (b.typ === "h3")
          return (
            <h3 key={i} className="mt-6 font-display text-lg font-semibold">
              {b.text}
            </h3>
          );
        if (b.typ === "ul")
          return (
            <ul key={i} className="mt-3 list-disc space-y-1.5 pl-5 text-foreground/70">
              {b.punkte.map((p, j) => (
                <li key={j}>{renderInline(p, ctx)}</li>
              ))}
            </ul>
          );
        return (
          <p key={i} className="mt-4 leading-relaxed text-foreground/70">
            {renderInline(b.text, ctx)}
          </p>
        );
      })}
    </>
  );
}

/* ----------------------------- Produktkarte ------------------------------- */

function ProduktZeile({
  p,
  rang,
  bewertung,
  nutzer,
  vonSlug,
}: {
  p: ProduktInZone;
  /** Platz in der organischen Rangliste. Die Anzeige oben hat KEINEN Rang: sie ist
      bezahlte Sichtbarkeit, kein erreichter Platz. */
  rang?: number;
  bewertung?: Bewertung;
  /** Wie viele Toolfolio-Konten das Tool einsetzen. null = unter der Schwelle. */
  nutzer: number | null;
  /** Slug der Kategorieseite. Kommt aus dem Server, nicht aus dem Referrer:
      der waere manipulierbar und bei manchen Browsereinstellungen gar nicht da. */
  vonSlug: string;
}) {
  const ton = PALETTE[((rang ?? 1) - 1) % PALETTE.length];
  const gesponsert = p.zone === "gesponsert";

  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lift ${
        gesponsert ? "border-coral/40 ring-1 ring-coral/20" : "border-border"
      }`}
    >
      <div
        aria-hidden
        className="absolute bottom-0 left-0 top-0 w-1.5 opacity-80 transition-opacity group-hover:opacity-100"
        style={{ background: gesponsert ? "#FF7A66" : ton }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{ background: `radial-gradient(120% 80% at 0% 0%, ${ton} 0%, transparent 55%)` }}
      />

      {gesponsert && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-coral/15 px-2.5 py-1 text-[11px] font-semibold text-coral">
          <Megaphone className="size-3" /> Gesponsert
        </span>
      )}

      <div className="relative grid items-stretch gap-5 p-5 pl-6 sm:p-6 sm:pl-7 lg:grid-cols-[minmax(240px,1.1fr)_minmax(0,2fr)_minmax(190px,1fr)_auto] lg:gap-8">
        {/* Identität */}
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <span
              className="grid size-14 place-items-center rounded-2xl font-display text-base font-bold tracking-wide"
              style={{ background: `${ton}18`, color: ton, boxShadow: `inset 0 0 0 1px ${ton}25` }}
              aria-hidden
            >
              {produktInitialen(p.name)}
            </span>
            {!gesponsert && (
              <span className="inline-flex items-center rounded-md bg-foreground/[0.05] px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums text-foreground/60">
                #{String(rang).padStart(2, "0")}
              </span>
            )}
          </div>
          <div className="min-w-0 pt-0.5">
            <Link
              href={`/software/${p.slug}`}
              className="block truncate font-display text-xl font-semibold leading-tight transition-colors hover:text-primary"
            >
              {p.name}
            </Link>
            {p.anbieter && (
              <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-foreground/55">
                <Building2 className="size-3 shrink-0" />
                <span className="truncate">{p.anbieter}</span>
              </div>
            )}
            {p.einsatzgebiet && (
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="inline-flex items-center rounded-md border bg-background/60 px-1.5 py-0.5 text-[10px] font-medium text-foreground/60">
                  {p.einsatzgebiet}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Beschreibung und Funktionen */}
        <div className="min-w-0 lg:border-l lg:border-border/70 lg:pl-6 xl:pl-8">
          <p className="line-clamp-3 text-[13.5px] leading-relaxed text-foreground/75">
            {p.kurzbeschreibung ?? "Für dieses Tool liegt noch keine Beschreibung vor."}
          </p>
          {p.features?.length > 0 && (
            <div className="mt-3">
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-foreground/45">
                Kernfunktionen
              </div>
              <ul className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
                {p.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-[12.5px] text-foreground/75">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ background: ton }} aria-hidden />
                    <span className="truncate">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bewertung, Verbreitung, Preis: alles mit ehrlichem Leerzustand */}
        <div className="flex flex-col justify-center gap-3 lg:border-l lg:border-border/70 lg:pl-6">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-foreground/45">Bewertung</div>
            {bewertung && bewertung.anzahl > 0 ? (
              <div className="mt-1 flex items-center gap-1.5">
                <div className="flex items-center" aria-label={`${bewertung.schnitt} von 5`}>
                  {[0, 1, 2, 3, 4].map((i) => {
                    const fill = Math.max(0, Math.min(1, bewertung.schnitt - i));
                    return (
                      <span key={i} className="relative inline-block size-3.5">
                        <Star className="absolute inset-0 size-3.5 text-foreground/15" strokeWidth={2} />
                        <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                          <Star className="size-3.5 fill-amber-400 text-amber-400" strokeWidth={2} />
                        </span>
                      </span>
                    );
                  })}
                </div>
                <span className="font-display text-sm font-semibold tabular-nums">
                  {bewertung.schnitt.toFixed(1).replace(".", ",")}
                </span>
                <span className="text-[11px] text-foreground/50">({bewertung.anzahl})</span>
              </div>
            ) : (
              <div className="mt-1 text-sm text-foreground/50">Noch keine Bewertung</div>
            )}
          </div>

          {/* Verbreitung: nur ab Mindestschwelle, sonst gar nichts behaupten. */}
          <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-background/50 px-2.5 py-2">
            <span
              className="grid size-8 shrink-0 place-items-center rounded-lg"
              style={{ background: `${ton}18`, color: ton }}
              aria-hidden
            >
              <Users className="size-4" />
            </span>
            <div className="min-w-0">
              {nutzer !== null ? (
                <>
                  <div className="font-display text-sm font-semibold leading-tight tabular-nums">
                    {nutzer.toLocaleString("de-DE")}
                  </div>
                  <div className="text-[10.5px] leading-tight text-foreground/55">Toolfolio-Konten nutzen es</div>
                </>
              ) : (
                <>
                  <div className="text-[12px] font-medium leading-tight text-foreground/70">Zu wenig Daten</div>
                  <div className="text-[10.5px] leading-tight text-foreground/55">
                    ab {NUTZER_SCHWELLE} Konten zeigen wir die Zahl
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-foreground/45">Preis</div>
            {p.preis_hinweis ? (
              <>
                <div className="mt-0.5 font-display text-base font-semibold">{p.preis_hinweis}</div>
                <div className="text-[11px] text-foreground/50">
                  Listenpreis, unverifiziert
                  {p.preis_stand && ` · Stand ${p.preis_stand.split("-").reverse().join(".")}`}
                </div>
              </>
            ) : (
              <>
                <div className="mt-0.5 text-sm font-semibold text-foreground/70">Auf Anfrage</div>
                <div className="text-[11px] text-foreground/50">Anbieter nennt keinen Preis</div>
              </>
            )}
          </div>
        </div>

        {/* Aktionen */}
        <div className="flex items-stretch justify-end gap-2 lg:min-w-[150px] lg:flex-col">
          {/* "Details" nur, wenn die Detailseite wirklich veroeffentlicht ist. Sonst
              fuehrt der einzige Weg direkt zum Anbieter, und die Detailseite "gibt es
              noch nicht" (echter 404). */}
          {p.detailseite_status === "veroeffentlicht" && (
            <Link
              href={`/software/${p.slug}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Details <ArrowRight className="size-4" />
            </Link>
          )}
          {(p.affiliate_url || p.website_url) && (
            <a
              /* UEBER DEN AUSGANG, nicht direkt.
                 Dort wird der Klick gezaehlt und UTM angehaengt, damit der Anbieter in
                 SEINEM Werkzeug sieht, dass der Besucher von uns kam. Ohne das taucht
                 Toolfolio dort nur als eines von vielen Referrals auf und niemand
                 rechnet uns die Reichweite zu.

                 Welche Zieladresse benutzt wird (Affiliate oder direkt), entscheidet der
                 Ausgang serverseitig. rel bleibt hier: "sponsored" ist bei bezahlten
                 Links Google-Vorgabe, und das gilt fuer den sichtbaren Link. */
              href={ausgangsLink(p.slug, vonSlug, p.zone)}
              target="_blank"
              rel={p.affiliate_url ? "sponsored noopener noreferrer" : "noopener noreferrer nofollow"}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border bg-background/60 px-4 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              Anbieter <ExternalLink className="size-3.5" />
            </a>
          )}
          {/* AFFILIATE-KENNZEICHNUNG.
              Ist ein Affiliate-Link gesetzt, verdienen wir an einem Klick, und das gehoert
              offengelegt (§ 5a UWG). Das Tool bleibt organisch platziert: die Provision
              aendert NICHTS an Rang oder Empfehlung. Nur der Klick bringt uns Geld, und das
              sagen wir. */}
          {p.affiliate_url && (
            <span className="text-center text-[10px] leading-tight text-foreground/45 lg:text-right">
              Affiliate-Link, wir erhalten ggf. eine Provision
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

/* ------------------------------ Die Seite -------------------------------- */

export function CollectionSeite({
  collection,
  cluster,
  produkte,
  bewertungen,
  nutzerJeProdukt,
  autor,
  akzent = "#12B76A",
  finder,
  finderCta,
  faq,
}: {
  collection: CollectionDaten;
  cluster: ClusterDaten;
  produkte: ProduktInZone[];
  bewertungen: Map<string, Bewertung>;
  /** Produkt-ID -> Anzahl Konten, oder null wenn unter der Schwelle. */
  nutzerJeProdukt: Map<string, number | null>;
  autor: Autor | null;
  /** Akzentfarbe des Clusters. */
  akzent?: string;
  /** Der Anfrage-Finder. Steht laut Entwurf zwischen gesponserter Zone und Tool-Liste. */
  finder?: ReactNode;
  /** Beschriftung des Haupt-Handlungsaufrufs im Kopf. Fehlt sie, gibt es keinen Finder. */
  finderCta?: string;
  /** Die FAQ. Steht am Ende des Guides, vor der Autorenbox. */
  faq?: ReactNode;
}) {
  const abschnitte = collection.content_md ? parseAbschnitte(collection.content_md) : [];
  /* Ein Kontext pro Seite: er merkt sich, welcher Begriff schon verlinkt ist (max. einmal
     pro Seite) und verhindert Selbstlinks auf genau diese Seite. */
  const linkCtx = neuerLinkKontext(`/verzeichnis/${cluster.slug}/${collection.slug}`);

  const zonen: Zone[] = ["gesponsert", "organisch", "community"];
  const jeZone = (z: Zone) => produkte.filter((p) => p.zone === z);

  const mitPreis = produkte.filter((p) => p.preis_hinweis).length;
  const zitatNach = Math.min(2, Math.max(0, abschnitte.length - 1));

  return (
    <div className="min-h-screen">
      {/* Brotkrumen.
          Das pb ist nicht Kosmetik: ohne es stoesst die Oberkante des Hero-Bildes
          direkt an die Zeile, und der Pfad sieht aus, als klebte er am Bild. */}
      <div className="mx-auto max-w-7xl px-4 pb-7 pt-6 sm:px-6 sm:pb-9">
        <nav aria-label="Brotkrumen" className="text-xs text-foreground/55 sm:text-sm">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/verzeichnis" className="hover:text-foreground">
                Verzeichnis
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-3.5" />
            </li>
            <li>
              <Link href={`/verzeichnis/${cluster.slug}`} className="hover:text-foreground">
                {cluster.name}
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-3.5" />
            </li>
            <li className="font-medium text-foreground">{collection.name}</li>
          </ol>
        </nav>
      </div>

      {/* Kopf. Das Hintergrundbild sitzt zwischen Brotkrumen und Sprungnavigation.
          `isolate` ist hier nicht Deko: es erzeugt den Stapelkontext, in dem das Bild
          auf z-0 und der Text auf z-10 liegen. Ohne ihn faellt das Bild hinter den
          Seitenhintergrund und verschwindet. */}
      <section className="relative isolate overflow-hidden">
        <HeroHintergrund bild={collection.hero} akzent={akzent} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12">
          <div className="grid items-end gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-widest shadow-soft"
                  style={{ color: akzent }}
                >
                  Kategorie · {cluster.name}
                </span>
                {collection.aktualisiert && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.04] px-2.5 py-1 text-[11px] font-semibold text-foreground/60">
                    <Circle className="size-1.5 fill-success text-success" />
                    Zuletzt aktualisiert {collection.aktualisiert}
                  </span>
                )}
              </div>

              <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                {collection.h1 ?? collection.name}
              </h1>

              {collection.intro_md && (
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/70 sm:text-lg">
                  {renderInline(collection.intro_md, linkCtx)}
                </p>
              )}

              {/* Der Haupt-Handlungsaufruf: er fuehrt in den Finder, nicht zur Tool-Liste.
                  Er traegt die Farbe des Clusters, damit jede Rubrik ihren eigenen Ton hat.
                  Wer schon weiss, was er sucht, nimmt die Sprungnavigation darunter. */}
              {finderCta && (
                <>
                  <div className="mt-7">
                    <a
                      href="#finder"
                      className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lift transition-opacity hover:opacity-90"
                      style={{ background: akzent }}
                    >
                      <Sparkles className="size-4" />
                      {finderCta}
                    </a>
                  </div>
                  <p className="mt-3 max-w-md text-xs leading-relaxed text-foreground/55">
                    Kostenlos, unverbindlich und in unter zwei Minuten. Wir stellen dir echte Fragen zur Software, keine
                    Werbung.
                  </p>
                </>
              )}

              {!finderCta && (
                <div className="mt-7 flex flex-wrap gap-2">
                  <a
                    href="#ranking"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90"
                  >
                    Zu den Tools <ArrowRight className="size-4" />
                  </a>
                  {abschnitte[0] && (
                    <a
                      href={`#${abschnitte[0].id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border bg-card px-4 py-2.5 text-sm font-medium hover:border-foreground/30"
                    >
                      Erst verstehen
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Snapshot: NUR was wir wirklich wissen. */}
            <div className="relative rounded-3xl border bg-card/95 p-5 shadow-lift backdrop-blur-sm sm:p-6">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-foreground/50">
                  <Info className="size-3.5" style={{ color: akzent }} /> Was wir wissen
                </div>
                <span className="font-mono text-[10px] text-foreground/40">/{collection.slug}</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <Stat label="Anbieter" wert={String(produkte.length)} />
                <Stat label="mit Preisangabe" wert={`${mitPreis} / ${produkte.length}`} farbe={akzent} />
                <Stat label="Verifizierte Preise" wert="0" farbe="#F5A623" />
                <Stat label="Bewertungen" wert={String([...bewertungen.values()].reduce((s, b) => s + b.anzahl, 0))} />
              </div>

              <div className="mt-4 rounded-2xl border border-warning/30 bg-warning/10 p-4">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-warning" />
                  <p className="text-[13px] leading-snug text-foreground/80">
                    Noch kein verifizierter Preis in dieser Kategorie. Was du siehst, sind Listenpreise der Anbieter.
                    Verifiziert heißt bei uns: aus echten, anonymisierten Abrechnungsdaten, ab einer Mindestzahl an
                    Konten.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sprungnavigation */}
      {abschnitte.length > 0 && (
        <div className="sticky top-0 z-30 border-y bg-background/85 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center gap-1 overflow-x-auto py-2 text-sm">
              <a
                href="#ranking"
                className="shrink-0 rounded-full px-3 py-1.5 font-semibold text-foreground/80 hover:bg-foreground/[0.05]"
              >
                Tools
              </a>
              {abschnitte.map((a) => (
                <a
                  key={a.id}
                  href={`#${a.id}`}
                  className="shrink-0 rounded-full px-3 py-1.5 font-medium text-foreground/60 hover:bg-foreground/[0.05] hover:text-foreground"
                >
                  {a.eyebrow ?? a.titel}
                </a>
              ))}
              <div className="ml-auto hidden items-center gap-2 text-xs text-foreground/50 md:flex">
                <ShieldCheck className="size-3.5" style={{ color: akzent }} />
                Serverseitig sortiert, nicht käuflich
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zone 00: die ANZEIGE.
          Sie steht oben, aber sie steht ABGETRENNT und ist als Anzeige gekennzeichnet.
          Sie taucht nur auf, wenn es wirklich einen gesponserten Anbieter gibt: eine
          leere Anzeigenflaeche waere eine Aufforderung, sie zu fuellen, und genau das
          soll das Layout nicht tun. Heute hat diese Kategorie keinen, also fehlt sie. */}
      {jeZone("gesponsert").length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
          <div className="mb-2 flex justify-end">
            <span className="rounded-full border bg-card px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground/45">
              Anzeige
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {jeZone("gesponsert").map((p) => (
              <ProduktZeile
                key={p.id}
                p={p}
                bewertung={bewertungen.get(p.id)}
                nutzer={nutzerJeProdukt.get(p.id) ?? null}
                vonSlug={collection.slug}
              />
            ))}
          </div>
          <p className="mt-2 text-right text-[11px] text-foreground/45">
            Bezahlte Platzierung. Sie beeinflusst weder die organische Reihenfolge unten noch das Ergebnis des Finders.
          </p>
        </section>
      )}

      {/* Der Finder. Laut Entwurf zwischen Anzeige und Tool-Liste: wer schon weiss,
          was er will, scrollt daran vorbei. Wer nicht weiss, was er will, bekommt
          hier Hilfe, bevor er sich durch acht Karten arbeitet. */}
      {finder && (
        <div id="finder" className="mx-auto max-w-7xl scroll-mt-16 px-4 sm:px-6">
          {finder}
        </div>
      )}

      {/* Tools */}
      <section id="ranking" className="mx-auto max-w-7xl scroll-mt-16 px-4 pb-16 pt-12 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-foreground/50">
              Zone · Organisch
            </div>
            <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {produkte.length} {produkte.length === 1 ? "Tool" : "Tools"} im Vergleich
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-foreground/60">
              Serverseitig sortiert nach Vollständigkeit und verifizierten Bewertungen. Nicht käuflich.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Bewusst OHNE die gesponserte Zone: die steht oben als Anzeige und wird
              hier nicht ein zweites Mal gezeigt. Wer bezahlt, bekommt Sichtbarkeit,
              aber keinen Platz in der Rangliste. */}
          {(["organisch", "community"] as Zone[]).flatMap((z) => {
            const items = jeZone(z);
            if (items.length === 0) return [];
            return items.map((p, i) => (
              <ProduktZeile
                key={p.id}
                p={p}
                rang={z === "organisch" ? i + 1 : undefined}
                bewertung={bewertungen.get(p.id)}
                nutzer={nutzerJeProdukt.get(p.id) ?? null}
                vonSlug={collection.slug}
              />
            ));
          })}
          {produkte.length === 0 && (
            <div className="rounded-3xl border border-dashed p-10 text-center text-sm text-foreground/60">
              Dieser Kategorie ist noch kein Tool zugeordnet.
            </div>
          )}
        </div>
      </section>

      {/* Inhalt */}
      {abschnitte.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div className="min-w-0">
              {abschnitte.map((a, i) => (
                <div key={a.id} className={i > 0 ? "mt-14" : ""}>
                  <SectionHeader eyebrow={a.eyebrow} titel={a.titel} id={a.id} />
                  <Bloecke bloecke={a.bloecke} ctx={linkCtx} />
                  {autor && collection.experten_zitat && i === zitatNach && (
                    <ExpertenZitat autor={autor} zitat={collection.experten_zitat} thema={collection.name} />
                  )}
                </div>
              ))}
            </div>

            {/* Seitenspalte: Inhaltsverzeichnis */}
            <aside className="lg:sticky lg:top-20 lg:self-start">
              <div className="rounded-3xl border bg-card p-6 shadow-soft">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-foreground/50">Inhalt</div>
                <ul className="mt-3 space-y-2 text-sm">
                  {abschnitte.map((a) => (
                    <li key={a.id}>
                      <a href={`#${a.id}`} className="group flex items-start gap-2 text-foreground/70 hover:text-foreground">
                        <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                        <span className="-ml-5 group-hover:ml-0 transition-all">{a.titel}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>

          {faq && <div className="max-w-3xl">{faq}</div>}

          {autor && (
            <div className="mt-12 max-w-3xl">
              <AutorBox autor={autor} />
            </div>
          )}
        </section>
      )}

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <p className="rounded-2xl border bg-secondary/40 p-4 text-xs text-foreground/60">
          Käuflich ist ausschließlich die Sichtbarkeit in der gesponserten Zone, immer gekennzeichnet. Die organische
          Reihenfolge, die Bewertungen und die verifizierten Daten sind nie käuflich und werden serverseitig unabhängig
          berechnet. Preisangaben tragen Stand und Quelle.
        </p>
      </div>
    </div>
  );
}
