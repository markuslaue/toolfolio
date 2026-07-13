"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Sparkles,
  Plus,
  ExternalLink,
  Check,
  Filter,
  Heart,
  Info,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AboFormPanel, type AboVorbelegung } from "@/components/app/abo-form-panel";
import { WennSchreibbar } from "@/components/app/read-only-context";
import { cn } from "@/lib/utils";
import { formatEur } from "@/lib/constants";

/* -------------------------------- Typen ----------------------------------- */

export type DirTool = {
  id: string;
  slug: string;
  name: string;
  initialen: string;
  farbe: string;
  anbieter: string | null;
  kategorie: string;
  kurzbeschreibung: string | null;
  features: string[];
  pro: string[];
  contra: string[];
  /** Freitext des Anbieters, z. B. "ab 12 € pro Monat". Kein verifizierter Preis. */
  preisHinweis: string | null;
  preisStand: string | null;
  preisQuelle: string | null;
  /** Schnitt und Anzahl der Community-Bewertungen. */
  bewertung: { schnitt: number; anzahl: number } | null;
  /** Steckt in deinem eigenen Bestand. */
  imStack: boolean;
  aboId: string | null;
  /** Was du selbst dafür zahlst, auf den Monat normalisiert. */
  meinPreis: number | null;
  /** Andere Produkte aus denselben Sammlungen. */
  alternativen: { name: string; slug: string; farbe: string }[];
};

export type KategorieKachel = { name: string; anzahl: number; farbe: string };

type Filterwahl = "alle" | "stack" | "neu";
type Sortierung = "bewertung" | "name" | "kategorie";

export function VerzeichnisClient({
  tools,
  kategorien,
  fuerDich,
  kanalOptionen,
  kundenOptionen,
}: {
  tools: DirTool[];
  kategorien: KategorieKachel[];
  /** Tools aus Kategorien, die du schon nutzt, die dir aber noch fehlen. */
  fuerDich: DirTool[];
  kanalOptionen: string[];
  kundenOptionen: string[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [kat, setKat] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filterwahl>("alle");
  const [sort, setSort] = useState<Sortierung>("bewertung");
  const [quickview, setQuickview] = useState<DirTool | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [vorbelegung, setVorbelegung] = useState<AboVorbelegung | undefined>();
  const [formSeq, setFormSeq] = useState(0);

  const aktiv = q.trim().length > 0 || kat !== null || filter !== "alle";

  const ergebnisse = useMemo(() => {
    let liste = tools.slice();
    const needle = q.trim().toLowerCase();
    if (needle) {
      liste = liste.filter(
        (t) =>
          t.name.toLowerCase().includes(needle) ||
          (t.anbieter ?? "").toLowerCase().includes(needle) ||
          (t.kurzbeschreibung ?? "").toLowerCase().includes(needle) ||
          t.kategorie.toLowerCase().includes(needle),
      );
    }
    if (kat) liste = liste.filter((t) => t.kategorie === kat);
    if (filter === "stack") liste = liste.filter((t) => t.imStack);
    if (filter === "neu") liste = liste.filter((t) => !t.imStack);

    return liste.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name, "de");
      if (sort === "kategorie") return a.kategorie.localeCompare(b.kategorie, "de") || a.name.localeCompare(b.name, "de");
      // Bewertung: erst die mit Bewertungen, danach alphabetisch.
      const sa = a.bewertung?.schnitt ?? -1;
      const sb = b.bewertung?.schnitt ?? -1;
      return sb - sa || a.name.localeCompare(b.name, "de");
    });
  }, [tools, q, kat, filter, sort]);

  /** Ein Verzeichnis-Tool als eigenes Abo anlegen: Formular vorbefuellt oeffnen. */
  function alsAboAnlegen(t: DirTool) {
    setVorbelegung({
      tool: t.name,
      anbieter: t.anbieter ?? "",
      kategorie: t.kategorie,
      mit_verzeichnis: true,
      // Bewusst KEIN Betrag: der Preis im Verzeichnis ist ein Listenhinweis,
      // kein verifizierter Preis. Was du zahlst, weisst nur du.
      notizen: t.preisHinweis ? `Listenpreis laut Anbieter: ${t.preisHinweis}` : "",
    });
    setFormSeq((s) => s + 1);
    setQuickview(null);
    setFormOpen(true);
  }

  return (
    <div className="space-y-8">
      {/* Kopf mit Suche */}
      <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Verzeichnis</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Finde Tools und übernimm sie in deinen Bestand.
        </p>
        <div className="relative mt-5 max-w-2xl">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tool, Kategorie oder Anbieter suchen"
            aria-label="Verzeichnis durchsuchen"
            className="h-14 w-full rounded-2xl border bg-background pl-12 pr-4 text-base placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Für dich */}
      {!aktiv && fuerDich.length > 0 && (
        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
                <Sparkles className="size-4 text-primary" /> Für dich
              </h2>
              <p className="text-sm text-muted-foreground">
                Aus Kategorien, in denen du schon Tools hast, aber diese hier noch nicht.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {fuerDich.map((t) => (
              <button
                key={t.id}
                onClick={() => setQuickview(t)}
                className="rounded-2xl border bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Kachel initialen={t.initialen} farbe={t.farbe} groesse={40} />
                <div className="mt-3 font-display text-sm font-semibold">{t.name}</div>
                <div className="line-clamp-2 text-[11px] text-muted-foreground">
                  {t.kurzbeschreibung ?? t.kategorie}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Kategorien */}
      {!aktiv && kategorien.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold tracking-tight">Kategorien</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {kategorien.map((k) => (
              <button
                key={k.name}
                onClick={() => setKat(k.name)}
                className="group rounded-2xl border bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className="grid size-10 place-items-center rounded-xl text-white"
                  style={{ background: k.farbe }}
                >
                  <Layers className="size-5" />
                </div>
                <div className="mt-3 font-display text-sm font-semibold">{k.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {k.anzahl} {k.anzahl === 1 ? "Tool" : "Tools"}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Ergebnisse */}
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              {aktiv ? `${ergebnisse.length} ${ergebnisse.length === 1 ? "Ergebnis" : "Ergebnisse"}` : "Alle Tools"}
            </h2>
            {kat && (
              <button
                onClick={() => setKat(null)}
                className="rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                {kat} ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Filter className="size-4 shrink-0 text-muted-foreground" />
            {(
              [
                ["alle", "Alle"],
                ["stack", "In meinem Bestand"],
                ["neu", "Noch nicht bei mir"],
              ] as [Filterwahl, string][]
            ).map(([f, label]) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  filter === f
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
            <Select value={sort} onValueChange={(v) => setSort(v as Sortierung)}>
              <SelectTrigger className="h-8 w-[190px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bewertung">Sortieren: Bewertung</SelectItem>
                <SelectItem value="name">Sortieren: Name</SelectItem>
                <SelectItem value="kategorie">Sortieren: Kategorie</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {ergebnisse.length === 0 ? (
          <div className="rounded-3xl border border-dashed bg-card/50 p-10 text-center">
            <h3 className="font-display text-lg font-semibold">Nichts gefunden</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Das Verzeichnis kennt dieses Tool noch nicht. Du kannst es trotzdem als eigenes Abo anlegen.
            </p>
            <WennSchreibbar>
              <Button
                className="mt-4 gap-1.5"
                onClick={() => {
                  setVorbelegung(q.trim() ? { tool: q.trim() } : undefined);
                  setFormSeq((s) => s + 1);
                  setFormOpen(true);
                }}
              >
                <Plus className="size-4" /> Manuell anlegen
              </Button>
            </WennSchreibbar>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ergebnisse.map((t) => (
              <ToolKarte
                key={t.id}
                t={t}
                onDetails={() => setQuickview(t)}
                onAdd={() => alsAboAnlegen(t)}
                onOpenAbo={() => t.aboId && router.push(`/app/abos/${t.aboId}`)}
              />
            ))}
          </div>
        )}
      </section>

      <Quickview
        tool={quickview}
        onClose={() => setQuickview(null)}
        onAdd={(t) => alsAboAnlegen(t)}
        onOpenAbo={(t) => t.aboId && router.push(`/app/abos/${t.aboId}`)}
      />

      <AboFormPanel
        key={formSeq}
        open={formOpen}
        onOpenChange={setFormOpen}
        vorbelegung={vorbelegung}
        kanalOptionen={kanalOptionen}
        kundenOptionen={kundenOptionen}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}

/* ------------------------------- Bausteine -------------------------------- */

function Kachel({ initialen, farbe, groesse = 44 }: { initialen: string; farbe: string; groesse?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-xl font-display font-bold text-white"
      style={{ background: farbe, width: groesse, height: groesse, fontSize: groesse * 0.42 }}
    >
      {initialen}
    </div>
  );
}

function Pill({
  tone = "muted",
  children,
}: {
  tone?: "primary" | "muted" | "success";
  children: React.ReactNode;
}) {
  const cls = {
    primary: "bg-primary/10 text-primary border-primary/30",
    success: "bg-success/10 text-success border-success/30",
    muted: "bg-muted text-muted-foreground border-border",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      {children}
    </span>
  );
}

function ToolKarte({
  t,
  onAdd,
  onDetails,
  onOpenAbo,
}: {
  t: DirTool;
  onAdd: () => void;
  onDetails: () => void;
  onOpenAbo: () => void;
}) {
  return (
    <div className="flex flex-col rounded-3xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-3">
        <Kachel initialen={t.initialen} farbe={t.farbe} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-base font-semibold">{t.name}</div>
          <div className="mt-1">
            <Pill>{t.kategorie}</Pill>
          </div>
        </div>
        {t.imStack && (
          <Pill tone="primary">
            <Check className="size-3" /> im Bestand
          </Pill>
        )}
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
        {t.kurzbeschreibung ?? "Noch keine Beschreibung hinterlegt."}
      </p>

      {/* Preisblock: ehrlich gekennzeichnet, kein verifizierter Preis. */}
      <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-muted/40 px-3 py-2.5 text-xs">
        <div className="min-w-0 text-muted-foreground">
          {t.preisHinweis ? (
            <>
              <span className="font-semibold text-foreground">{t.preisHinweis}</span>
              <span className="block text-[10px]">Listenpreis, unverifiziert</span>
            </>
          ) : (
            <span className="text-[11px]">Kein Preis hinterlegt</span>
          )}
        </div>
        {t.imStack && t.meinPreis !== null && (
          <div className="shrink-0 text-right">
            <div className="text-[10px] text-muted-foreground">du zahlst</div>
            <div className="font-display text-sm font-semibold tabular-nums">{formatEur(t.meinPreis)}</div>
          </div>
        )}
      </div>

      {t.bewertung && t.bewertung.anzahl > 0 && (
        <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Heart className="size-3.5 text-coral" />
          {t.bewertung.schnitt.toFixed(1).replace(".", ",")} von 5 aus {t.bewertung.anzahl}{" "}
          {t.bewertung.anzahl === 1 ? "Bewertung" : "Bewertungen"}
        </div>
      )}

      <div className="mt-auto flex gap-2 pt-4">
        {t.imStack ? (
          <Button size="sm" variant="outline" className="flex-1" onClick={onOpenAbo}>
            Abo öffnen
          </Button>
        ) : (
          <WennSchreibbar>
            <Button size="sm" className="flex-1 gap-1.5" onClick={onAdd}>
              <Plus className="size-3.5" /> Als Abo hinzufügen
            </Button>
          </WennSchreibbar>
        )}
        <Button size="sm" variant="ghost" onClick={onDetails}>
          Details
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------- Quickview ------------------------------- */

function Quickview({
  tool,
  onClose,
  onAdd,
  onOpenAbo,
}: {
  tool: DirTool | null;
  onClose: () => void;
  onAdd: (t: DirTool) => void;
  onOpenAbo: (t: DirTool) => void;
}) {
  return (
    <Sheet open={!!tool} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        {tool && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <Kachel initialen={tool.initialen} farbe={tool.farbe} />
                <div className="min-w-0">
                  <SheetTitle className="font-display text-xl">{tool.name}</SheetTitle>
                  <SheetDescription>
                    {tool.kategorie}
                    {tool.anbieter ? ` · ${tool.anbieter}` : ""}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="space-y-5 px-4 pb-6">
              {tool.kurzbeschreibung && <p className="text-sm">{tool.kurzbeschreibung}</p>}

              {/* Preis: Zustand offen benennen (Leitplanke: keine Scheingenauigkeit) */}
              <div className="rounded-2xl border bg-muted/40 p-4">
                <h3 className="font-display text-sm font-semibold">Preis</h3>
                {tool.preisHinweis ? (
                  <>
                    <p className="mt-1.5 text-sm">{tool.preisHinweis}</p>
                    <p className="mt-2 flex items-start gap-1.5 text-[11px] text-muted-foreground">
                      <Info className="mt-px size-3.5 shrink-0" />
                      Listenpreis des Anbieters, nicht verifiziert.
                      {tool.preisStand && ` Stand ${tool.preisStand.split("-").reverse().join(".")}.`}
                    </p>
                  </>
                ) : (
                  <p className="mt-1.5 text-sm text-muted-foreground">Für dieses Tool ist kein Preis hinterlegt.</p>
                )}
                <p className="mt-2 flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <Info className="mt-px size-3.5 shrink-0" />
                  Einen verifizierten Preis zeigen wir erst, wenn genug anonymisierte Abrechnungsdaten vorliegen.
                  Aktuell reichen sie nicht.
                </p>
              </div>

              {tool.imStack && tool.meinPreis !== null && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <h3 className="font-display text-sm font-semibold">Dein Abo</h3>
                  <p className="mt-1.5 text-sm">
                    Du zahlst{" "}
                    <span className="font-display text-base font-semibold tabular-nums">
                      {formatEur(tool.meinPreis)}
                    </span>{" "}
                    pro Monat.
                  </p>
                </div>
              )}

              {tool.features.length > 0 && (
                <div>
                  <h3 className="mb-2 font-display text-sm font-semibold">Funktionen</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {tool.features.map((f) => (
                      <span key={f} className="rounded-full border bg-card px-2.5 py-1 text-xs">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(tool.pro.length > 0 || tool.contra.length > 0) && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {tool.pro.length > 0 && (
                    <div className="rounded-2xl border border-success/20 bg-success/5 p-3">
                      <h4 className="text-xs font-semibold text-success">Dafür</h4>
                      <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                        {tool.pro.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {tool.contra.length > 0 && (
                    <div className="rounded-2xl border p-3">
                      <h4 className="text-xs font-semibold">Dagegen</h4>
                      <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                        {tool.contra.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {tool.alternativen.length > 0 && (
                <div>
                  <h3 className="mb-2 font-display text-sm font-semibold">Ähnliche Tools im Verzeichnis</h3>
                  <div className="flex flex-wrap gap-2">
                    {tool.alternativen.map((a) => (
                      <Link
                        key={a.slug}
                        href={`/software/${a.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs hover:bg-accent"
                      >
                        <span className="size-2 rounded-full" style={{ background: a.farbe }} />
                        <span className="font-medium">{a.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col items-stretch gap-2 pt-2 sm:flex-row sm:items-center">
                {tool.imStack ? (
                  <Button className="flex-1" onClick={() => onOpenAbo(tool)}>
                    Abo öffnen
                  </Button>
                ) : (
                  <WennSchreibbar>
                    <Button className="flex-1 gap-1.5" onClick={() => onAdd(tool)}>
                      <Plus className="size-4" /> Als Abo hinzufügen
                    </Button>
                  </WennSchreibbar>
                )}
                <Link
                  href={`/software/${tool.slug}`}
                  className="inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Ausführlich im Verzeichnis ansehen <ExternalLink className="size-3" />
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
