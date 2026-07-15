import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, BadgeCheck, Check, X, ShieldCheck, Star } from "lucide-react";
import { Breadcrumb } from "@/components/verzeichnis/breadcrumb";
import { Sterne } from "@/components/verzeichnis/sterne";
import { getProdukt, alleProduktSlugs, produktInitialen } from "@/lib/verzeichnis";
import { ContentPiece } from "@/components/verzeichnis/content-piece";

export const revalidate = 600;

export async function generateStaticParams() {
  return (await alleProduktSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProdukt(slug);
  if (!data || data.produkt.detailseite_status !== "veroeffentlicht") return { title: "Nicht gefunden", robots: { index: false } };
  return {
    title: data.produkt.detail_meta_title ?? `${data.produkt.name}: Funktionen, Preise & Bewertungen`,
    description: data.produkt.detail_meta_description ?? data.produkt.kurzbeschreibung ?? `${data.produkt.name} im Toolfolio-Verzeichnis.`,
    alternates: { canonical: `https://toolfolio.de/software/${slug}` },
  };
}

function fmtStand(iso: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return d ? `${d}.${m}.${y}` : iso;
}

export default async function SoftwareDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProdukt(slug);
  if (!data) notFound();
  const { produkt: p, bewertung, reviews, collections } = data;

  /* DER RIEGEL. Solange die Detailseite nicht veroeffentlicht ist, gibt es sie nicht:
     echter 404, nicht nur noindex. Genau der von Markus gewuenschte Zustand, und
     zugleich Schutz vor "thin content" im Index. Der Link zum Anbieter fuehrt bis
     dahin direkt zur Website (das steuert die Collection-Seite). */
  if (p.detailseite_status !== "veroeffentlicht") notFound();

  const verifiziert = reviews.filter((r) => r.verifiziert);
  const offen = reviews.filter((r) => !r.verifiziert);
  const ersteCollection = collections[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Breadcrumb
        items={[
          { name: "Verzeichnis", href: "/verzeichnis" },
          ...(ersteCollection ? [{ name: ersteCollection.name, href: `/verzeichnis/${ersteCollection.cluster_slug}/${ersteCollection.slug}` }] : []),
          { name: p.name },
        ]}
      />

      {/* Kopf */}
      <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl font-display text-2xl font-bold text-white" style={{ backgroundColor: p.farbe }}>
            {produktInitialen(p.name)}
          </span>
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">{p.name}</h1>
            {p.anbieter && <div className="text-sm text-muted-foreground">von {p.anbieter}</div>}
            {bewertung.anzahl > 0 && (
              <div className="mt-1.5 flex items-center gap-2 text-sm">
                <Sterne wert={bewertung.schnitt} />
                <span className="font-medium tabular-nums">{bewertung.schnitt.toString().replace(".", ",")}</span>
                <span className="text-xs text-muted-foreground">({bewertung.anzahl} Bewertungen)</span>
              </div>
            )}
          </div>
        </div>
        {(p.affiliate_url || p.website_url) && (
          <div className="flex flex-col items-end gap-1">
            <a
              href={p.affiliate_url ?? p.website_url ?? "#"}
              target="_blank"
              rel={p.affiliate_url ? "sponsored noopener noreferrer" : "noopener noreferrer nofollow"}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Zur Website <ExternalLink className="size-4" />
            </a>
            {p.affiliate_url && (
              <span className="text-[10px] text-muted-foreground">Affiliate-Link, wir erhalten ggf. eine Provision</span>
            )}
          </div>
        )}
      </header>

      {p.langbeschreibung && <p className="mt-6 text-foreground/85 leading-relaxed">{p.langbeschreibung}</p>}

      {/* Der redaktionelle Detailtext, erzeugt aus den Herstellerdaten. Er ist der
          eigentliche Ranking-Baustein: ein SoftwareApplication-Steckbrief allein
          reicht Google nicht. */}
      {p.detail_md && (
        <div className="mt-8">
          <ContentPiece md={p.detail_md} />
        </div>
      )}

      {/* Review-Themen. Erscheinen NUR, wenn es echte gibt. "Kunden loben X" ohne echte
          Bewertungen waere erfundener Inhalt. Aktuell hat kein Produkt welche, der Block
          bleibt also leer, bis Bewertungen da sind. */}
      {p.review_themen && p.review_themen.length > 0 && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Star className="size-4 text-primary" /> Was Nutzer sagen
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {p.review_themen.map((t, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                {t.art === "lob" ? <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" /> : <X className="mt-0.5 size-4 shrink-0 text-rose-600" />}
                <span>{t.thema} <span className="text-xs text-muted-foreground">({t.beleg} Nennungen)</span></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preis (UWG: Stand + Quelle + Link) */}
      {p.preis_hinweis && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-semibold"><BadgeCheck className="size-4 text-primary" /> Preis</div>
          <div className="mt-2 text-lg font-medium">{p.preis_hinweis}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Listenpreis{p.preis_stand && <>, Stand {fmtStand(p.preis_stand)}</>}.{" "}
            {p.preis_quelle_url && (
              <a href={p.preis_quelle_url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 text-primary hover:underline">
                Quelle <ExternalLink className="size-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Features + Plattformen */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {p.features.length > 0 && (
          <div>
            <h2 className="font-display text-lg font-semibold">Funktionen</h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              {p.features.map((f) => (<li key={f} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-success" />{f}</li>))}
            </ul>
          </div>
        )}
        <div className="space-y-6">
          {p.plattformen.length > 0 && (
            <div>
              <h2 className="font-display text-lg font-semibold">Plattformen</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.plattformen.map((pl) => (<span key={pl} className="rounded-full bg-secondary px-2.5 py-1 text-xs">{pl}</span>))}
              </div>
            </div>
          )}
          {p.einsatzgebiet && (
            <div>
              <h2 className="font-display text-lg font-semibold">Einsatzgebiet</h2>
              <p className="mt-2 text-sm text-muted-foreground">{p.einsatzgebiet}</p>
            </div>
          )}
        </div>
      </div>

      {/* Pro / Contra */}
      {(p.pro.length > 0 || p.contra.length > 0) && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {p.pro.length > 0 && (
            <div className="rounded-2xl border border-success/30 bg-success/5 p-5">
              <div className="font-display font-semibold text-success">Spricht dafuer</div>
              <ul className="mt-3 space-y-1.5 text-sm">
                {p.pro.map((x) => (<li key={x} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-success" />{x}</li>))}
              </ul>
            </div>
          )}
          {p.contra.length > 0 && (
            <div className="rounded-2xl border border-coral/30 bg-coral/5 p-5">
              <div className="font-display font-semibold text-coral">Zu bedenken</div>
              <ul className="mt-3 space-y-1.5 text-sm">
                {p.contra.map((x) => (<li key={x} className="flex items-start gap-2"><X className="mt-0.5 size-4 shrink-0 text-coral" />{x}</li>))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Bewertungen, getrennt nach verifiziert / nicht verifiziert */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Bewertungen</h2>
        {reviews.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Noch keine Bewertungen.</p>
        ) : (
          <div className="mt-4 space-y-6">
            {verifiziert.length > 0 && (
              <div>
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                  <ShieldCheck className="size-3.5" /> Verifizierte Bewertungen ({verifiziert.length})
                </div>
                <div className="space-y-3">{verifiziert.map((r) => <ReviewKarte key={r.id} r={r} />)}</div>
              </div>
            )}
            {offen.length > 0 && (
              <div>
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                  <Star className="size-3.5" /> Nicht verifiziert ({offen.length})
                </div>
                <div className="space-y-3">{offen.map((r) => <ReviewKarte key={r.id} r={r} />)}</div>
              </div>
            )}
          </div>
        )}
        <Link href={`/verzeichnis/bewerten?tool=${p.slug}`} className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-accent">
          Bewertung abgeben
        </Link>
      </section>

      {collections.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-lg font-semibold">Gelistet in</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {collections.map((c) => (
              <Link key={c.slug} href={`/verzeichnis/${c.cluster_slug}/${c.slug}`} className="rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:border-primary/40">
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ReviewKarte({ r }: { r: { sterne: number; titel: string | null; text: string | null; autor_name: string | null } }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <Sterne wert={r.sterne} />
        {r.autor_name && <span className="text-xs text-muted-foreground">{r.autor_name}</span>}
      </div>
      {r.titel && <div className="mt-2 font-medium">{r.titel}</div>}
      {r.text && <p className="mt-1 text-sm text-foreground/80">{r.text}</p>}
    </div>
  );
}
