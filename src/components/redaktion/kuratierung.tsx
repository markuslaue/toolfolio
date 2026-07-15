"use client";

import Link from "next/link";
import { useMemo, useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle,
  Check,
  ExternalLink,
  Eye,
  Globe,
  Loader2,
  Pencil,
  Search,
  Trash2,
  X,
  Image as ImageIcon,
  Wand2,
  Handshake,
  FileText,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PRODUKT_STATUS_LABEL, PRODUKT_STATUS_STIL, type ProduktStatus } from "@/lib/redaktion-status";
import {
  setProduktStatus,
  setProduktStatusViele,
  entferneAusCollection,
  korrigiereProdukt,
  setAffiliate,
  setDetailseiteStatus,
  setZone,
  gibContentFrei,
  veroeffentliche,
  erzeugeHeroBild,
  zurueckInEntwurf,
} from "@/app/admin/verzeichnis/actions";

export type CmsProdukt = {
  id: string;
  name: string;
  slug: string;
  anbieter: string | null;
  website_url: string | null;
  kurzbeschreibung: string | null;
  preis_hinweis: string | null;
  status: ProduktStatus;
  zone: "gesponsert" | "organisch" | "community";
  partnerprogramm: "unbekannt" | "ja" | "nein";
  partnerprogramm_url: string | null;
  affiliate_url: string | null;
  detailseite_status: "keine" | "entwurf" | "veroeffentlicht";
};

export type CmsCollection = {
  id: string;
  name: string;
  slug: string;
  status: "entwurf" | "veroeffentlicht";
  content_status: "fehlt" | "ki_ungeprueft" | "geprueft";
  content_woerter: number | null;
  hero_url: string | null;
  cluster: { name: string; slug: string };
};

/* --------------------------- Auffaelligkeiten ---------------------------- */

/**
 * Automatisch erkennbare Verdachtsmomente. Das ist KEINE Entscheidung, sondern
 * ein Hinweis: Die Maschine sagt "schau hier hin", der Mensch entscheidet.
 */
function auffaellig(p: CmsProdukt): string[] {
  const raus: string[] = [];
  const host = (() => {
    try {
      return new URL(p.website_url ?? "").hostname;
    } catch {
      return "";
    }
  })();

  if (/[®™©]/.test(p.name)) raus.push("Sonderzeichen im Namen");
  if (p.name.split(/\s+/).length > 4) raus.push("Name klingt nach Überschrift, nicht nach Marke");
  if (host.split(".").length > 3) raus.push("Verdacht auf Spiegel- oder Hosting-Domain");
  if (host && !host.toLowerCase().includes(p.name.toLowerCase().replace(/[^a-z0-9]/gi, "").slice(0, 5).toLowerCase()))
    raus.push("Name und Domain passen nicht zusammen");
  if (!p.kurzbeschreibung) raus.push("keine Beschreibung");
  return raus;
}

/* ------------------------------ Hauptansicht ----------------------------- */

export function Kuratierung({ collection, produkte }: { collection: CmsCollection; produkte: CmsProdukt[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [q, setQ] = useState("");
  const [nurAuffaellig, setNurAuffaellig] = useState(false);
  const [markiert, setMarkiert] = useState<Set<string>>(new Set());
  const [bearbeite, setBearbeite] = useState<string | null>(null);
  const [detailLauf, setDetailLauf] = useState<string | null>(null);
  const [detailStart, setDetailStart] = useState(false);

  /* Der Detailseiten-Lauf erzeugt die redaktionellen Detailtexte aus den bereits
     gezogenen Anbieterdaten. Wir pollen ihn und laden bei Ende die Seite neu. */
  useEffect(() => {
    if (!detailLauf) return;
    const t = setInterval(async () => {
      const res = await fetch(`/api/admin/verzeichnis/lauf/${detailLauf}`);
      if (!res.ok) return;
      const l = await res.json();
      if (l.status !== "laeuft") {
        setDetailLauf(null);
        const fertig = l.ergebnis?.detailseiten;
        if (l.status === "fehler") toast.error(l.protokoll?.filter((z: { art: string }) => z.art === "fehler").at(-1)?.text ?? "Aufbereiten fehlgeschlagen.");
        else toast.success(`${fertig ?? 0} Detailtexte im Entwurf. Prüfe sie und schalte sie einzeln live.`);
        router.refresh();
      }
    }, 3000);
    return () => clearInterval(t);
  }, [detailLauf, router]);

  async function detailseitenAufbereiten() {
    setDetailStart(true);
    try {
      const res = await fetch("/api/admin/verzeichnis/detailseiten", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionId: collection.id }),
      });
      const j = await res.json();
      if (!res.ok) { toast.error(j.error ?? "Start fehlgeschlagen."); return; }
      setDetailLauf(j.laufId);
    } finally { setDetailStart(false); }
  }
  const detailLaeuft = detailLauf !== null;

  const gefiltert = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return produkte.filter((p) => {
      if (nurAuffaellig && auffaellig(p).length === 0) return false;
      if (!needle) return true;
      return (
        p.name.toLowerCase().includes(needle) ||
        (p.anbieter ?? "").toLowerCase().includes(needle) ||
        (p.website_url ?? "").toLowerCase().includes(needle)
      );
    });
  }, [produkte, q, nurAuffaellig]);

  const zaehler = useMemo(() => {
    const z: Record<string, number> = {};
    for (const p of produkte) z[p.status] = (z[p.status] ?? 0) + 1;
    return z;
  }, [produkte]);

  const alleMarkiert = gefiltert.length > 0 && gefiltert.every((p) => markiert.has(p.id));

  function lauf(fn: () => Promise<{ ok?: boolean; error?: string }>, erfolg: string) {
    start(async () => {
      const res = await fn();
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(erfolg);
      setMarkiert(new Set());
      router.refresh();
    });
  }

  const veroeffentlichbar = produkte.filter((p) => p.status === "veroeffentlicht").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Kopf */}
      <nav className="text-sm text-muted-foreground">
        <Link href="/admin/verzeichnis" className="hover:text-foreground">
          Redaktion
        </Link>
        {" · "}
        <Link href={`/admin/verzeichnis/${collection.cluster.slug}`} className="hover:text-foreground">
          {collection.cluster.name}
        </Link>
      </nav>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{collection.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {produkte.length} Kandidaten · {zaehler.veroeffentlicht ?? 0} veröffentlicht ·{" "}
            {zaehler.redaktionell_geprueft ?? 0} geprüft · {zaehler.ki_ungeprueft ?? 0} ungeprüft
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Der Link auf die ECHTE Seite, und zwar nur, wenn es sie wirklich gibt.
              Wer gerade veroeffentlicht hat, will genau das sehen. Ihn danach suchen zu
              lassen (der Pfad ist /verzeichnis/<cluster>/<slug>, den tippt niemand von
              Hand richtig) ist eine unnoetige Huerde. */}
          {collection.status === "veroeffentlicht" && (
            <Button asChild variant="outline" className="gap-1.5">
              <a
                href={`/verzeichnis/${collection.cluster.slug}/${collection.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-4" /> Live ansehen
              </a>
            </Button>
          )}
          <Button asChild variant="outline" className="gap-1.5">
            <Link href={`/verzeichnis/vorschau/${collection.slug}`}>
              <Eye className="size-4" /> Vorschau
            </Link>
          </Button>
          <Button variant="outline" className="gap-1.5" disabled={detailLaeuft || detailStart} onClick={detailseitenAufbereiten}>
            {detailLaeuft || detailStart ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
            {detailLaeuft ? "Bereitet auf ..." : "Detailseiten aufbereiten"}
          </Button>
          {collection.status === "veroeffentlicht" ? (
            <Button
              variant="outline"
              className="gap-1.5 text-warning"
              disabled={pending}
              onClick={() => lauf(() => zurueckInEntwurf(collection.id, collection.slug), "Zurück in den Entwurf.")}
            >
              Vom Netz nehmen
            </Button>
          ) : (
            <Button
              className="gap-1.5"
              disabled={pending}
              onClick={() =>
                lauf(
                  () => veroeffentliche(collection.id, collection.slug),
                  `Live unter /verzeichnis/${collection.cluster.slug}/${collection.slug}`,
                )
              }
            >
              <Globe className="size-4" /> Veröffentlichen
            </Button>
          )}
        </div>
      </div>

      {/* Text-Freigabe: der Trigger blockt das Veroeffentlichen ohne sie */}
      <div
        className={cn(
          "mt-6 rounded-2xl border p-4",
          collection.content_status === "geprueft"
            ? "border-success/30 bg-success/5"
            : "border-warning/40 bg-warning/10",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            {collection.content_status === "geprueft" ? (
              <Check className="mt-0.5 size-5 shrink-0 text-success" />
            ) : (
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
            )}
            <div>
              <div className="font-semibold">
                {collection.content_status === "geprueft"
                  ? "Text ist freigegeben"
                  : collection.content_status === "ki_ungeprueft"
                    ? "Text ist von der KI, noch nicht geprüft"
                    : "Es gibt noch keinen Text"}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {collection.content_status === "ki_ungeprueft"
                  ? `${collection.content_woerter ?? 0} Wörter. Lies ihn in der Vorschau. Ohne Freigabe lässt die Datenbank das Veröffentlichen nicht zu.`
                  : collection.content_status === "geprueft"
                    ? `${collection.content_woerter ?? 0} Wörter, redaktionell abgenommen.`
                    : "Erst erzeugen, dann prüfen, dann veröffentlichen."}
              </p>
            </div>
          </div>
          {collection.content_status === "ki_ungeprueft" && (
            <Button
              variant="outline"
              className="gap-1.5"
              disabled={pending}
              onClick={() => lauf(() => gibContentFrei(collection.id, collection.slug), "Text freigegeben.")}
            >
              <Check className="size-4" /> Text freigeben
            </Button>
          )}
        </div>
      </div>

      {/* Hero-Bild */}
      <div className="mt-4 rounded-2xl border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            {collection.hero_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={collection.hero_url}
                alt=""
                className="h-14 w-24 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <span className="grid h-14 w-24 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                <ImageIcon className="size-5" />
              </span>
            )}
            <div>
              <div className="font-semibold">
                {collection.hero_url ? "Hintergrundbild vorhanden" : "Noch kein Hintergrundbild"}
              </div>
              <p className="mt-0.5 max-w-xl text-sm text-muted-foreground">
                {collection.hero_url
                  ? "KI-erzeugt, liegt unscharf und abgedunkelt hinter der Überschrift. Auf der Seite ist es als KI-Bild gekennzeichnet."
                  : "Ohne Bild zeigt der Seitenkopf einen Farbverlauf. Das ist kein Fehler, nur schlichter."}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="gap-1.5"
            disabled={pending}
            onClick={() =>
              lauf(
                () => erzeugeHeroBild(collection.id, collection.slug),
                collection.hero_url ? "Neues Bild erzeugt." : "Bild erzeugt.",
              )
            }
          >
            <Wand2 className="size-4" />
            {collection.hero_url ? "Neues Bild erzeugen" : "Bild erzeugen"}
          </Button>
        </div>
      </div>

      {/* Werkzeugleiste */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Produkt, Anbieter oder Domain suchen"
            className="pl-9"
          />
        </div>
        <button
          onClick={() => setNurAuffaellig((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            nurAuffaellig
              ? "border-warning bg-warning/10 text-warning"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          <AlertTriangle className="size-3.5" /> Nur Auffällige (
          {produkte.filter((p) => auffaellig(p).length > 0).length})
        </button>
      </div>

      {/* Stapelaktionen */}
      {markiert.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border bg-card p-3 shadow-soft">
          <span className="text-sm font-medium">{markiert.size} markiert</span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={pending}
              onClick={() =>
                lauf(
                  () => setProduktStatusViele([...markiert], "redaktionell_geprueft", collection.slug),
                  `${markiert.size} als geprüft markiert.`,
                )
              }
            >
              <Check className="size-4" /> Geprüft
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              disabled={pending}
              onClick={() =>
                lauf(
                  () => setProduktStatusViele([...markiert], "veroeffentlicht", collection.slug),
                  `${markiert.size} veröffentlicht.`,
                )
              }
            >
              <Globe className="size-4" /> Veröffentlichen
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-destructive"
              disabled={pending}
              onClick={() =>
                lauf(
                  () => setProduktStatusViele([...markiert], "entwurf", collection.slug),
                  `${markiert.size} zurückgezogen.`,
                )
              }
            >
              <X className="size-4" /> Verwerfen
            </Button>
          </div>
        </div>
      )}

      {/* Liste */}
      <div className="mt-4 overflow-hidden rounded-2xl border bg-card">
        <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-2.5 text-xs font-medium text-muted-foreground">
          <Checkbox
            checked={alleMarkiert}
            onCheckedChange={(v) => setMarkiert(v === true ? new Set(gefiltert.map((p) => p.id)) : new Set())}
            aria-label="Alle markieren"
          />
          <span>
            {gefiltert.length} von {produkte.length}
          </span>
        </div>

        <ul className="divide-y">
          {gefiltert.map((p) => {
            const hinweise = auffaellig(p);
            const imBearbeiten = bearbeite === p.id;
            return (
              <li key={p.id} className={cn("px-4 py-3", markiert.has(p.id) && "bg-primary/[0.03]")}>
                <div className="flex flex-wrap items-start gap-3">
                  <Checkbox
                    checked={markiert.has(p.id)}
                    onCheckedChange={(v) =>
                      setMarkiert((m) => {
                        const n = new Set(m);
                        if (v === true) n.add(p.id);
                        else n.delete(p.id);
                        return n;
                      })
                    }
                    className="mt-1"
                    aria-label={`${p.name} markieren`}
                  />

                  <div className="min-w-0 flex-1">
                    {imBearbeiten ? (
                      <ProduktBearbeiten
                        p={p}
                        collectionSlug={collection.slug}
                        onFertig={() => {
                          setBearbeite(null);
                          router.refresh();
                        }}
                      />
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{p.name}</span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                              PRODUKT_STATUS_STIL[p.status],
                            )}
                          >
                            {PRODUKT_STATUS_LABEL[p.status]}
                          </span>
                          {p.zone === "gesponsert" && (
                            <span className="rounded-full bg-coral/15 px-2 py-0.5 text-[11px] font-semibold text-coral">
                              Gesponsert
                            </span>
                          )}
                          {/* Hat ein Partnerprogramm, aber wir sind (noch) nicht dabei:
                              ein Hinweis fuer die Redaktion, sich anzumelden. */}
                          {p.partnerprogramm === "ja" && !p.affiliate_url && (
                            <a
                              href={p.partnerprogramm_url ?? undefined}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-800 hover:bg-violet-200"
                              title="Der Anbieter hat ein Partnerprogramm. Anmelden und den Affiliate-Link eintragen."
                            >
                              <Handshake className="size-3" /> Partnerprogramm
                            </a>
                          )}
                          {/* Wir sind dabei: der Affiliate-Link ist gesetzt. */}
                          {p.affiliate_url && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                              <Handshake className="size-3" /> Affiliate aktiv
                            </span>
                          )}
                        </div>

                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                          {p.anbieter && <span>{p.anbieter}</span>}
                          {p.website_url && (
                            <a
                              href={p.website_url}
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                              className="inline-flex items-center gap-1 hover:text-foreground"
                            >
                              {new URL(p.website_url).hostname} <ExternalLink className="size-3" />
                            </a>
                          )}
                          {p.preis_hinweis && <span>Listenpreis: {p.preis_hinweis}</span>}
                        </div>

                        {p.kurzbeschreibung && (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.kurzbeschreibung}</p>
                        )}

                        {hinweise.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {hinweise.map((h) => (
                              <span
                                key={h}
                                className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning"
                              >
                                <AlertTriangle className="size-3" /> {h}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {!imBearbeiten && (
                    <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                      <Select
                        value={p.zone}
                        onValueChange={(v) =>
                          lauf(() => setZone(p.id, collection.id, v, collection.slug), "Zone gesetzt.")
                        }
                      >
                        <SelectTrigger className="h-8 w-[128px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="organisch">Organisch</SelectItem>
                          <SelectItem value="gesponsert">Gesponsert</SelectItem>
                          <SelectItem value="community">Community</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button size="icon" variant="ghost" className="size-8" onClick={() => setBearbeite(p.id)} aria-label="Bearbeiten">
                        <Pencil className="size-4" />
                      </Button>

                      {p.status !== "veroeffentlicht" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1"
                          disabled={pending}
                          onClick={() =>
                            lauf(
                              () => setProduktStatus(p.id, "veroeffentlicht", collection.slug),
                              `${p.name} veröffentlicht.`,
                            )
                          }
                        >
                          <Check className="size-3.5" /> Freigeben
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 gap-1 text-muted-foreground"
                          disabled={pending}
                          onClick={() =>
                            lauf(() => setProduktStatus(p.id, "entwurf", collection.slug), `${p.name} zurückgezogen.`)
                          }
                        >
                          Zurückziehen
                        </Button>
                      )}

                      {/* Detailseite: eigener Schalter, unabhaengig vom Verzeichnis-Status.
                          Er steuert, ob /software/<slug> oeffentlich existiert. */}
                      {p.detailseite_status === "veroeffentlicht" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 gap-1 text-emerald-700"
                          disabled={pending}
                          title="Detailseite ist live. Klicken zum Offline-nehmen."
                          onClick={() => lauf(() => setDetailseiteStatus(p.id, "entwurf", collection.slug), "Detailseite offline.")}
                        >
                          <Globe2 className="size-3.5" /> Detailseite live
                        </Button>
                      ) : p.detailseite_status === "entwurf" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1"
                          disabled={pending}
                          title="Detailtext liegt vor. Klicken, um die Seite zu veroeffentlichen."
                          onClick={() => lauf(() => setDetailseiteStatus(p.id, "veroeffentlicht", collection.slug), "Detailseite ist live.")}
                        >
                          <FileText className="size-3.5" /> Detailseite live schalten
                        </Button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground" title="Noch kein Detailtext. Erst oben 'Detailseiten aufbereiten'.">
                          keine Detailseite
                        </span>
                      )}

                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        disabled={pending}
                        onClick={() =>
                          lauf(
                            () => entferneAusCollection(p.id, collection.id, collection.slug),
                            `${p.name} aus der Kategorie entfernt.`,
                          )
                        }
                        aria-label="Aus der Kategorie entfernen"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
          {gefiltert.length === 0 && (
            <li className="px-4 py-10 text-center text-sm text-muted-foreground">Nichts gefunden.</li>
          )}
        </ul>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Öffentlich sichtbar sind nur Produkte im Status „Veröffentlicht“, und nur, wenn auch die Collection
        veröffentlicht ist. Aktuell: {veroeffentlichbar} von {produkte.length}.
      </p>
    </div>
  );
}

/* ---------------------------- Inline-Bearbeitung -------------------------- */

function ProduktBearbeiten({
  p,
  collectionSlug,
  onFertig,
}: {
  p: CmsProdukt;
  collectionSlug: string;
  onFertig: () => void;
}) {
  const [name, setName] = useState(p.name);
  const [anbieter, setAnbieter] = useState(p.anbieter ?? "");
  const [affiliateUrl, setAffiliateUrl] = useState(p.affiliate_url ?? "");
  const [pending, start] = useTransition();

  function speichern() {
    start(async () => {
      const r1 = await korrigiereProdukt(p.id, name, anbieter, collectionSlug);
      if (r1.error) {
        toast.error(r1.error);
        return;
      }
      const r2 = await setAffiliate(p.id, affiliateUrl, collectionSlug);
      if (r2.error) {
        toast.error(r2.error);
        return;
      }
      toast.success("Gespeichert.");
      onFertig();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[180px] flex-1">
          <label className="text-xs text-muted-foreground">Produktname</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-8" />
        </div>
        <div className="min-w-[160px] flex-1">
          <label className="text-xs text-muted-foreground">Anbieter</label>
          <Input value={anbieter} onChange={(e) => setAnbieter(e.target.value)} className="mt-1 h-8" />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">
          Affiliate-Link{" "}
          <span className="text-muted-foreground/70">
            (nur wenn wir beigetreten sind: der Link wird im Frontend als Affiliate gekennzeichnet)
          </span>
        </label>
        <Input
          value={affiliateUrl}
          onChange={(e) => setAffiliateUrl(e.target.value)}
          placeholder={p.partnerprogramm_url ? `Programm: ${p.partnerprogramm_url}` : "https://..."}
          className="mt-1 h-8"
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" className="h-8 gap-1" onClick={speichern} disabled={pending}>
          {pending && <Loader2 className="size-3.5 animate-spin" />} Speichern
        </Button>
        <Button size="sm" variant="ghost" className="h-8" onClick={onFertig}>
          Abbrechen
        </Button>
      </div>
    </div>
  );
}
