"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Play, Loader2, Check, AlertTriangle, Info, X, Database, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { seiteNeuAufbauen } from "@/app/admin/verzeichnis/actions";

/**
 * Der Kategorie-Lauf im Backend.
 *
 * WARUM DAS PROTOKOLL SICHTBAR IST und nicht nur ein Spinner: Ein Lauf verwirft
 * hunderte Domains und legt am Ende ein Dutzend Produkte an. Wer nicht sieht, WAS
 * verworfen wurde und WARUM, kann dem Ergebnis nicht trauen. Eine Blackbox darf man
 * ein Verzeichnis nicht bauen lassen. Das Protokoll ist deshalb kein Debug-Ausgabe,
 * sondern das Ergebnis, das die Redaktion beurteilt.
 */

type Zeile = { zeit: string; art: "info" | "ok" | "warnung" | "fehler"; text: string };

type PhaseId = "suchen" | "pruefen" | "text" | "bild" | "anbieterdaten";
type Fortschritt = { phase: PhaseId; label: string; aktuell: number | null; gesamt: number | null };

type Lauf = {
  id: string;
  status: "laeuft" | "fertig" | "fehler" | "abgebrochen";
  phase: string | null;
  fortschritt: Fortschritt | null;
  protokoll: Zeile[];
  ergebnis: Record<string, unknown> | null;
  beendet_am: string | null;
};

/* Die Phasen eines vollen Laufs, in der Reihenfolge, in der sie kommen.
   "anbieterdaten" ist bewusst NICHT dabei: das ist ein eigener Lauf mit einer
   einzigen Phase, und ihn in diese Leiste zu pressen wuerde nur verwirren. */
const PHASEN: { id: PhaseId; kurz: string; lang: string }[] = [
  { id: "suchen", kurz: "Suchen", lang: "Suchergebnisse in DE, AT und CH abfragen" },
  { id: "pruefen", kurz: "Prüfen", lang: "Herstellerseiten einzeln besuchen und auswerten" },
  { id: "text", kurz: "Text", lang: "Guide, FAQ, Zitat und Meta schreiben" },
  { id: "bild", kurz: "Bild", lang: "Hintergrundbild erzeugen" },
];

const ART_STIL: Record<Zeile["art"], string> = {
  info: "text-muted-foreground",
  ok: "text-emerald-700",
  warnung: "text-amber-700",
  fehler: "text-rose-700",
};

const ART_ICON = {
  info: Info,
  ok: Check,
  warnung: AlertTriangle,
  fehler: X,
} as const;

export function LaufKarte({
  collectionId,
  collectionName,
  collectionSlug,
  produkteVorhanden,
  letzterLauf,
}: {
  collectionId: string;
  collectionName: string;
  collectionSlug: string;
  produkteVorhanden: number;
  letzterLauf: Lauf | null;
}) {
  const router = useRouter();
  const [lauf, setLauf] = useState<Lauf | null>(letzterLauf);
  const [start, setStart] = useState(false);
  const [offen, setOffen] = useState(letzterLauf?.status === "laeuft");

  const [discovery, setDiscovery] = useState(produkteVorhanden === 0);
  const [content, setContent] = useState(true);
  const [bild, setBild] = useState(true);

  const laeuft = lauf?.status === "laeuft";
  const logRef = useRef<HTMLDivElement>(null);

  /* Welche Werkzeuge hat der SERVER? Nicht mein Rechner, der Server.
     Genau daran ist ein Lauf schon einmal gescheitert: der Anthropic-Schluessel lag
     lokal, aber nicht im Container. Die Karte fragt das jetzt vorher ab und sperrt
     die Schritte, die nicht laufen koennen, statt sie anzubieten und Geld zu verbrennen. */
  const [schluessel, setSchluessel] = useState<{ anthropic: boolean; openai: boolean } | null>(null);
  useEffect(() => {
    fetch("/api/admin/verzeichnis/lauf")
      .then((r) => (r.ok ? r.json() : null))
      .then(setSchluessel)
      .catch(() => setSchluessel(null));
  }, []);

  /* Solange der Lauf laeuft, alle zwei Sekunden nachfragen. Kein WebSocket: ein Lauf
     dauert Minuten und wird von einem einzigen Menschen beobachtet. Polling ist hier
     die einfachere Loesung, und einfacher ist besser, wenn beides funktioniert. */
  const hole = useCallback(async () => {
    if (!lauf) return;
    const res = await fetch(`/api/admin/verzeichnis/lauf/${lauf.id}`);
    if (!res.ok) return;
    const neu = (await res.json()) as Lauf;
    setLauf(neu);
    if (neu.status !== "laeuft") {
      /* Der Lauf hat die Datenbank DIREKT veraendert, an den Server-Actions vorbei.
         router.refresh() laedt nur das Backend neu. Die oeffentliche Seite ist ISR und
         bliebe bis zu zehn Minuten alt: neuer Text, neues Bild, neue Produkte, und der
         Besucher sieht nichts davon. */
      if (neu.status === "fertig") await seiteNeuAufbauen(collectionSlug);
      router.refresh();
    }
  }, [lauf, router]);

  useEffect(() => {
    if (!laeuft) return;
    const t = setInterval(hole, 2000);
    return () => clearInterval(t);
  }, [laeuft, hole]);

  // Immer die neueste Zeile im Blick behalten.
  useEffect(() => {
    if (laeuft && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [lauf?.protokoll.length, laeuft]);

  async function starte(pfad: string, body: object) {
    setStart(true);
    try {
      const res = await fetch(pfad, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Start fehlgeschlagen.");
        return;
      }
      setLauf({
        id: json.laufId,
        status: "laeuft",
        phase: "Start",
        fortschritt: null,
        protokoll: [],
        ergebnis: null,
        beendet_am: null,
      });
      setOffen(true);
    } finally {
      setStart(false);
    }
  }

  const nichtsGewaehlt = !discovery && !content && !bild;
  const kiFehlt = schluessel !== null && !schluessel.anthropic;
  const bildFehlt = schluessel !== null && !schluessel.openai;
  // Ein Lauf ohne seine Werkzeuge ist kein Lauf, sondern eine teure Art, nichts zu tun.
  const gesperrt = (kiFehlt && (discovery || content)) || (bildFehlt && bild);

  return (
    <div className="mt-4 rounded-2xl border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-4 p-4">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Database className="size-5" />
          </span>
          <div>
            <div className="font-semibold">Kategorie loslegen</div>
            <p className="mt-0.5 max-w-2xl text-sm text-muted-foreground">
              Sucht die Anbieter in DE, AT und CH, prüft jede Herstellerseite einzeln, schreibt Guide, FAQ, Zitat und
              Meta und erzeugt das Bild. Alles bleibt ungeprüft: veröffentlichen kannst du erst nach deiner Freigabe.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t px-4 py-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox checked={discovery} onCheckedChange={(v) => setDiscovery(v === true)} disabled={laeuft} />
          Anbieter suchen
          {produkteVorhanden > 0 && (
            <span className="text-xs text-muted-foreground">({produkteVorhanden} schon da, findet weitere)</span>
          )}
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox checked={content} onCheckedChange={(v) => setContent(v === true)} disabled={laeuft} />
          Text, FAQ und Meta
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox checked={bild} onCheckedChange={(v) => setBild(v === true)} disabled={laeuft} />
          Hintergrundbild
        </label>

        <div className="ml-auto flex flex-wrap gap-2">
          <Button
            className="gap-1.5"
            disabled={laeuft || start || nichtsGewaehlt || gesperrt}
            onClick={() => starte("/api/admin/verzeichnis/lauf", { collectionId, discovery, content, bild })}
          >
            {laeuft || start ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
            {laeuft ? "Läuft ..." : "Lauf starten"}
          </Button>

          <Button
            variant="outline"
            className="gap-1.5"
            disabled={laeuft || start || produkteVorhanden === 0 || kiFehlt}
            title={
              produkteVorhanden === 0
                ? "Erst Anbieter suchen, dann können wir ihre Daten holen."
                : "Lädt je Anbieter Preis- und Funktionsseiten und füllt das Datenblatt."
            }
            onClick={() => starte("/api/admin/verzeichnis/produkte", { collectionId })}
          >
            {start ? <Loader2 className="size-4 animate-spin" /> : <Database className="size-4" />}
            Anbieterdaten holen ({produkteVorhanden})
          </Button>
        </div>
      </div>

      {lauf && lauf.status === "laeuft" && lauf.fortschritt && <Statusleiste f={lauf.fortschritt} />}

      {(kiFehlt || bildFehlt) && (
        <div className="border-t border-warning/40 bg-warning/10 px-4 py-3 text-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <div>
              <div className="font-semibold">In der Server-Umgebung fehlen Zugangsdaten.</div>
              <p className="mt-0.5 text-muted-foreground">
                {kiFehlt && <>Ohne <code className="font-mono text-xs">ANTHROPIC_API_KEY</code> können Anbieter nicht geprüft und keine Texte geschrieben werden. </>}
                {bildFehlt && <>Ohne <code className="font-mono text-xs">OPENAI_API_KEY</code> kann kein Bild erzeugt werden. </>}
                Trag sie in <code className="font-mono text-xs">/opt/toolfolio/.env</code> ein und starte den Container neu.
                Die betroffenen Schritte sind gesperrt, damit kein Guthaben verbrannt wird.
              </p>
            </div>
          </div>
        </div>
      )}

      {lauf && (
        <div className="border-t">
          <button
            onClick={() => setOffen((o) => !o)}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-muted/40"
          >
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                lauf.status === "laeuft" && "bg-primary/10 text-primary",
                lauf.status === "fertig" && "bg-emerald-100 text-emerald-800",
                lauf.status === "fehler" && "bg-rose-100 text-rose-800",
              )}
            >
              {lauf.status === "laeuft" && <Loader2 className="size-3 animate-spin" />}
              {lauf.status === "laeuft" ? (lauf.phase ?? "läuft") : lauf.status === "fertig" ? "fertig" : "Fehler"}
            </span>
            <span className="text-muted-foreground">
              {lauf.protokoll.length} {lauf.protokoll.length === 1 ? "Zeile" : "Zeilen"} im Protokoll
            </span>
            <ChevronDown className={cn("ml-auto size-4 text-muted-foreground transition-transform", offen && "rotate-180")} />
          </button>

          {offen && (
            <div
              ref={logRef}
              className="max-h-80 overflow-y-auto border-t bg-muted/20 px-4 py-3 font-mono text-xs leading-relaxed"
            >
              {lauf.protokoll.length === 0 && <div className="text-muted-foreground">Der Lauf startet gerade ...</div>}
              {lauf.protokoll.map((z, i) => {
                const Icon = ART_ICON[z.art];
                return (
                  <div key={i} className={cn("flex items-start gap-2 py-0.5", ART_STIL[z.art])}>
                    <span className="shrink-0 tabular-nums text-muted-foreground/60">
                      {new Date(z.zeit).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                    <Icon className="mt-0.5 size-3 shrink-0" />
                    <span className="break-words">{z.text}</span>
                  </div>
                );
              })}
              {lauf.status === "fertig" && (
                <div className="mt-2 border-t pt-2 text-muted-foreground">
                  Fertig. Prüfe die Kandidaten unten und den Text in der Vorschau, dann gib frei.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!lauf && (
        <p className="border-t px-4 py-2.5 text-xs text-muted-foreground">
          Noch kein Lauf für {collectionName}.
        </p>
      )}
    </div>
  );
}


/* ------------------------------------------------------------- Statusleiste */

/**
 * Wo stehen wir gerade, und wie lange noch.
 *
 * Das Protokoll darunter sagt, WAS passiert ist. Diese Leiste sagt, WIE WEIT wir sind.
 * Beides zusammen ist der Unterschied zwischen "da tut sich was" und "noch 114 von 161
 * Domains, dauert also noch ein paar Minuten".
 */
function Statusleiste({ f }: { f: Fortschritt }) {
  // Ein Lauf ohne Discovery beginnt bei "text". Die Leiste zeigt dann trotzdem alle
  // Phasen, markiert die uebersprungenen aber nicht faelschlich als erledigt.
  const idx = PHASEN.findIndex((p) => p.id === f.phase);
  const anteil = f.gesamt && f.gesamt > 0 ? Math.min(1, (f.aktuell ?? 0) / f.gesamt) : null;

  // Anbieterdaten ist ein eigener Lauf: eine Phase, keine Leiste mit vier Schritten.
  if (f.phase === "anbieterdaten") {
    return (
      <div className="border-t bg-muted/20 px-4 py-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium">Anbieterdaten holen</span>
          {f.gesamt && (
            <span className="tabular-nums text-muted-foreground">
              {f.aktuell} von {f.gesamt}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{f.label}</p>
        {anteil !== null && (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${anteil * 100}%` }} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border-t bg-muted/20 px-4 py-3">
      <div className="flex items-center gap-1.5">
        {PHASEN.map((p, i) => {
          const fertig = idx > i;
          const aktiv = idx === i;
          return (
            <div key={p.id} className="flex min-w-0 flex-1 items-center gap-1.5">
              <div
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-bold transition-colors",
                  fertig && "bg-emerald-500 text-white",
                  aktiv && "bg-primary text-primary-foreground ring-4 ring-primary/15",
                  !fertig && !aktiv && "bg-secondary text-muted-foreground",
                )}
              >
                {fertig ? <Check className="size-3" /> : i + 1}
              </div>
              <span
                className={cn(
                  "hidden truncate text-xs sm:inline",
                  aktiv ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                {p.kurz}
              </span>
              {i < PHASEN.length - 1 && <div className="h-px flex-1 bg-border" />}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="min-w-0 flex-1 truncate text-sm">{f.label}</p>
        {f.gesamt ? (
          <span className="shrink-0 text-sm font-medium tabular-nums text-muted-foreground">
            {f.aktuell} von {f.gesamt}
          </span>
        ) : (
          <span className="shrink-0 text-sm text-muted-foreground">läuft ...</span>
        )}
      </div>

      {/* Der Balken NUR, wenn wir wirklich zaehlen koennen. Beim Schreiben des Textes
          wissen wir nicht, wie weit das Modell ist, und ein Balken, der eine Zahl
          vortaeuscht, die es nicht gibt, ist schlimmer als kein Balken. */}
      {anteil !== null ? (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${anteil * 100}%` }} />
        </div>
      ) : (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-primary/50" />
        </div>
      )}
    </div>
  );
}
