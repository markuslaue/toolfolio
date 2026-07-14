"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ClipboardList, Wand2, Loader2, Check, AlertTriangle, Info, ChevronDown, Megaphone, Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FINDER_STATUS_LABEL, FINDER_STATUS_STIL, type FinderFrage, type FinderStatus } from "@/lib/finder";
import { gibFinderFrei, finderZurueckziehen } from "@/app/admin/verzeichnis/actions";

/**
 * Das Lead-Formular einer Kategorie: erzeugen, lesen, freigeben.
 *
 * WARUM DIE BEGRUENDUNGEN HIER STEHEN und nicht nur die Felder: Dieses Formular
 * verteilt Leads an ZAHLENDE Kunden. Wer es freigibt, muss wissen, WAS gefragt wird
 * und WOZU. Ein Feld, dessen Zweck niemand erklaeren kann, gehoert geloescht, nicht
 * freigegeben.
 */

export type FinderEntwurf = {
  status?: string;
  introHeadline?: string;
  ctaLabel?: string;
  categoryQuestions?: FinderFrage[];
  begruendung?: string;
};

export function FinderKarte({
  collectionId,
  collectionSlug,
  status,
  entwurf,
  gesponsert,
  produkteMitTags,
  produkteGesamt,
}: {
  collectionId: string;
  collectionSlug: string;
  status: FinderStatus;
  entwurf: FinderEntwurf | null;
  /** Der gesponserte Anbieter der Kategorie, falls es einen gibt. */
  gesponsert: string | null;
  produkteMitTags: number;
  produkteGesamt: number;
}) {
  const router = useRouter();
  const [start, setStart] = useState(false);
  const [pending, setPending] = useState(false);
  const [laufId, setLaufId] = useState<string | null>(null);
  const [offen, setOffen] = useState(false);
  const [wunsch, setWunsch] = useState("");

  const fragen = entwurf?.categoryQuestions ?? [];
  const hatEntwurf = fragen.length > 0;

  /* Solange der Entwurf laeuft, nachfragen. Er dauert nur eine knappe Minute, aber
     ohne Rueckmeldung wuerde man den Knopf noch dreimal druecken. */
  const pruefe = useCallback(async () => {
    if (!laufId) return;
    const res = await fetch(`/api/admin/verzeichnis/lauf/${laufId}`);
    if (!res.ok) return;
    const lauf = await res.json();
    if (lauf.status !== "laeuft") {
      setLaufId(null);
      if (lauf.status === "fehler") {
        const letzte = lauf.protokoll?.filter((z: { art: string }) => z.art === "fehler").at(-1);
        toast.error(letzte?.text ?? "Der Entwurf ist fehlgeschlagen.");
      } else {
        toast.success("Entwurf fertig. Lies die Begründungen und gib frei.");
        setOffen(true);
      }
      router.refresh();
    }
  }, [laufId, router]);

  useEffect(() => {
    if (!laufId) return;
    const t = setInterval(pruefe, 2000);
    return () => clearInterval(t);
  }, [laufId, pruefe]);

  async function erzeuge(mitWunsch = false) {
    setStart(true);
    try {
      const res = await fetch("/api/admin/verzeichnis/finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collectionId,
          // Der Wunsch geht NUR mit, wenn er auch gemeint ist. Sonst wuerde ein alter,
          // stehengebliebener Text stillschweigend die naechste Konzeption steuern.
          wunsch: mitWunsch && wunsch.trim() ? wunsch.trim() : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Start fehlgeschlagen.");
        return;
      }
      setLaufId(json.laufId);
      if (mitWunsch) setWunsch("");
    } finally {
      setStart(false);
    }
  }

  function aktion(fn: () => Promise<{ ok?: boolean; error?: string }>, erfolg: string) {
    setPending(true);
    fn()
      .then((r) => {
        if (r.error) toast.error(r.error);
        else {
          toast.success(erfolg);
          router.refresh();
        }
      })
      .finally(() => setPending(false));
  }

  const laeuft = laufId !== null;

  return (
    <div className="mt-4 rounded-2xl border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-4 p-4">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <ClipboardList className="size-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">Lead-Formular</span>
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", FINDER_STATUS_STIL[status])}>
                {FINDER_STATUS_LABEL[status]}
              </span>
            </div>
            <p className="mt-0.5 max-w-2xl text-sm text-muted-foreground">
              {status === "live"
                ? "Besucher sehen den kategoriespezifischen Fragensatz. Die Anfragen gehen an den Anzeigenkunden und an die fachlich passenden Anbieter."
                : status === "in_review"
                  ? "Ein Entwurf liegt vor. Lies die Begründungen, dann gib frei. Bis dahin sehen Besucher nur die generischen Grundfragen."
                  : "Noch kein eigener Fragensatz. Die Seite zeigt die generischen Grundfragen, es entsteht also nie eine leere Stelle."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {!hatEntwurf && (
            <Button className="gap-1.5" disabled={laeuft || start || pending} onClick={() => erzeuge(false)}>
              {laeuft || start ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
              {laeuft ? "Konzipiert ..." : "Lead-Formular konzipieren"}
            </Button>
          )}

          {hatEntwurf && status !== "live" && (
            <Button
              className="gap-1.5"
              disabled={pending || laeuft}
              onClick={() =>
                aktion(() => gibFinderFrei(collectionId, collectionSlug), "Lead-Formular ist auf der Seite live.")
              }
            >
              <Check className="size-4" /> Lead-Formular freischalten
            </Button>
          )}
          {status === "live" && (
            <Button
              variant="outline"
              className="gap-1.5 text-warning"
              disabled={pending || laeuft}
              onClick={() =>
                aktion(() => finderZurueckziehen(collectionId, collectionSlug), "Zurück in die Prüfung.")
              }
            >
              <Ban className="size-4" /> Zurückziehen
            </Button>
          )}
        </div>
      </div>

      {/* Wohin die Leads gehen. Das ist die Information, die der Redaktion beim Freigeben
          wirklich fehlt: nicht "gibt es ein Formular", sondern "wer bekommt die Leute". */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t px-4 py-2.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Megaphone className="size-3.5 text-coral" />
          {gesponsert ? (
            <>
              Jede Anfrage geht an <span className="font-semibold text-foreground">{gesponsert}</span> (Anzeige)
            </>
          ) : (
            <>Kein Anzeigenkunde in dieser Kategorie</>
          )}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Info className="size-3.5" />
          plus an die Anbieter, die laut den Antworten passen
        </span>
        <span className={cn("inline-flex items-center gap-1.5", produkteMitTags === 0 && "text-warning")}>
          {produkteMitTags === 0 ? <AlertTriangle className="size-3.5" /> : <Check className="size-3.5" />}
          {produkteMitTags} von {produkteGesamt} Produkten haben belegte Fähigkeiten
        </span>
      </div>

      {/* WARNUNG, wenn kein Produkt Faehigkeiten hat.
          Ohne sie kann das Matching nichts leisten: der Nutzer bekommt KEINE Empfehlung
          (die Oberflaeche sagt ihm das ehrlich), und der Lead geht nur an den
          Anzeigenkunden. Das ist funktionsfaehig, aber es ist nicht das Produkt. */}
      {produkteMitTags === 0 && produkteGesamt > 0 && (
        <div className="border-t border-warning/40 bg-warning/10 px-4 py-3 text-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <div>
              <div className="font-semibold">Ohne Fähigkeiten kann nichts empfohlen werden.</div>
              <p className="mt-0.5 max-w-3xl text-muted-foreground">
                &bdquo;Fähigkeiten&ldquo; sind die belegten Funktionen je Tool (etwa DATEV-Export oder
                Mehrmandantenfähigkeit). Sie entstehen beim <strong>Konzipieren</strong>: erst werden die Fragen
                entworfen, dann ordnet die KI jedem Produkt zu, welche davon es laut seiner eigenen Seite wirklich hat.
              </p>
              <p className="mt-1.5 max-w-3xl text-muted-foreground">
                Solange hier 0 steht, bekommt der Besucher <strong>keine Empfehlung</strong> (wir sagen ihm das ehrlich,
                statt drei Namen zu raten), und seine Anfrage geht nur an den Anzeigenkunden. Konzipiere das Formular,
                dann füllt sich das hier von selbst.
              </p>
            </div>
          </div>
        </div>
      )}

      {hatEntwurf && (
        <div className="border-t">
          <button
            onClick={() => setOffen((o) => !o)}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-muted/40"
          >
            <span className="font-medium">
              {fragen.length} {fragen.length === 1 ? "Fachfrage" : "Fachfragen"} ansehen
            </span>
            <span className="text-muted-foreground">
              · dazu die festen Teile: Qualifizierung, Empfehlung, Kontakt, zwei Einwilligungen
            </span>
            <ChevronDown className={cn("ml-auto size-4 text-muted-foreground transition-transform", offen && "rotate-180")} />
          </button>

          {offen && (
            <div className="space-y-4 border-t bg-muted/20 p-4">
              {entwurf?.begruendung && (
                <div className="rounded-xl border bg-card p-3 text-sm">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Warum genau diese Fragen
                  </div>
                  <p className="text-muted-foreground">{entwurf.begruendung}</p>
                </div>
              )}

              {fragen.map((f, i) => (
                <div key={f.id} className="rounded-xl border bg-card p-4">
                  <div className="flex flex-wrap items-start gap-2">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{f.label}</div>

                      {/* DAS WARUM. Der eigentliche Grund, warum diese Ansicht existiert. */}
                      {f.warum && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">Warum: </span>
                          {f.warum}
                        </p>
                      )}

                      {f.ausschluss && (
                        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">
                          <Ban className="size-3" /> Ausschlusskriterium: Tools ohne diese Fähigkeit werden gar nicht
                          erst gezeigt
                        </span>
                      )}

                      <div className="mt-3 space-y-1.5">
                        {(f.options ?? []).map((o) => (
                          <div key={o.value} className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="rounded-md bg-secondary px-2 py-0.5">{o.label}</span>
                            {o.tags.length > 0 ? (
                              o.tags.map((t) => (
                                <span
                                  key={t}
                                  className="rounded-full bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary"
                                >
                                  {t}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">stellt keine Anforderung</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <p className="text-xs text-muted-foreground">
                Nach diesen Fragen kommen immer dieselben festen Teile: die Qualifizierung (Größe, Zeitrahmen,
                Bestand), die begründete Empfehlung, und erst danach Kontakt mit zwei getrennten Häkchen. Der Kontakt
                wird nie pro Kategorie neu erfunden: sonst gäbe es 1.300 verschiedene Datenschutzhinweise, und einer
                davon wäre falsch.
              </p>

              {/* DER AENDERUNGSWUNSCH.
                  Ohne ihn koennte man nur so lange neu konzipieren lassen, bis zufaellig
                  etwas Brauchbares herauskommt. Mit ihm sagt die Redaktion, WAS anders
                  werden soll, und der vorherige Entwurf geht mit in den Prompt: sonst
                  faengt das Modell jedes Mal bei null an und wirft die guten Fragen mit weg. */}
              <div className="rounded-xl border bg-card p-4">
                <label htmlFor="wunsch" className="text-sm font-medium">
                  Etwas anders haben wollen?
                </label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Schreib hin, was sich ändern soll. Der bisherige Entwurf geht mit in die Konzeption, gute Fragen
                  bleiben also erhalten. Zum Beispiel: &bdquo;Frag nicht nach der Cloud, das können alle. Frag
                  stattdessen nach DATEV und nach Mehrmandantenfähigkeit.&ldquo;
                </p>
                <textarea
                  id="wunsch"
                  value={wunsch}
                  onChange={(e) => setWunsch(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  disabled={laeuft || start}
                  placeholder="Änderungswunsch, in deinen Worten"
                  className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    className="gap-1.5"
                    disabled={laeuft || start || pending || !wunsch.trim()}
                    onClick={() => erzeuge(true)}
                  >
                    {laeuft || start ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
                    Mit diesem Wunsch neu konzipieren
                  </Button>
                  <Button
                    variant="ghost"
                    className="gap-1.5 text-muted-foreground"
                    disabled={laeuft || start || pending}
                    onClick={() => erzeuge(false)}
                  >
                    Ohne Wunsch neu konzipieren
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
