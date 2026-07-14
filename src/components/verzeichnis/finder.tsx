"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Sparkles, ChevronLeft, ChevronRight, Check, ShieldCheck, Loader2, Search, X, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  BASIS_FRAGEN, finde, ergebnisGuete,
  type FinderFrage, type Kandidat, type Treffer, type Guete,
} from "@/lib/finder";
import { einwilligungText, einwilligungHinweis, anfrageHinweis } from "@/lib/einwilligung";
import { anfrageSenden } from "@/app/(site)/verzeichnis/anfrage-actions";

export function Finder({
  collectionId,
  collectionName,
  kategorieFragen,
  kandidaten,
  headline,
  ctaLabel,
  individuell,
  gesponsert,
}: {
  collectionId: string;
  collectionName: string;
  kategorieFragen: FinderFrage[];
  kandidaten: Kandidat[];
  headline: string;
  ctaLabel: string;
  /** false = generischer Basis-Finder, weil fuer diese Kategorie noch kein Fragensatz existiert. */
  individuell: boolean;
  /** Der gesponserte Anbieter der Kategorie. Er bekommt JEDE Anfrage, und das sagen wir. */
  gesponsert?: string | null;
}) {
  const [offen, setOffen] = useState(false);

  /* Reihenfolge: erst Fachfragen, dann Qualifizierung, dann Empfehlung, dann Kontakt.
     Wer wissen will, welche Software passt, will nicht zuerst seine Firmengroesse
     angeben. Erst Wert liefern, dann fragen. */
  const fragen = useMemo(() => [...kategorieFragen, ...BASIS_FRAGEN], [kategorieFragen]);

  const [schritt, setSchritt] = useState(0);
  const [antworten, setAntworten] = useState<Record<string, string[]>>({});

  const gesamt = fragen.length + 2; // Fragen + Ergebnis + Kontakt
  const istErgebnis = schritt === fragen.length;
  const istKontakt = schritt === fragen.length + 1;

  // Gematcht wird NUR auf die Kategoriefragen. Die Basisfragen qualifizieren den
  // Lead, sie sagen nichts darueber aus, ob ein Tool fachlich passt.
  const treffer = useMemo(
    () => (istErgebnis || istKontakt ? finde(antworten, kategorieFragen, kandidaten) : []),
    [antworten, kategorieFragen, kandidaten, istErgebnis, istKontakt],
  );
  const guete = ergebnisGuete(treffer, kandidaten);

  function setzeAntwort(frage: FinderFrage, wert: string) {
    setAntworten((a) => {
      const bisher = a[frage.id] ?? [];
      if (frage.type === "multi") {
        return { ...a, [frage.id]: bisher.includes(wert) ? bisher.filter((w) => w !== wert) : [...bisher, wert] };
      }
      return { ...a, [frage.id]: [wert] };
    });
  }

  function zuruecksetzen() {
    setSchritt(0);
    setAntworten({});
    setOffen(false);
  }

  if (!offen) {
    return (
      <section className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          <Search className="size-3" /> Software-Finder
        </span>
        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-semibold tracking-tight">{headline}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Kostenlos, unverbindlich und in unter zwei Minuten. Wir stellen dir echte Fragen zur Software, filtern aus{" "}
              {kandidaten.length} {kandidaten.length === 1 ? "Tool" : "Tools"} die passenden heraus und begründen jede
              Empfehlung.
              {!individuell && (
                <>
                  {" "}
                  Für diese Kategorie haben wir die Fachfragen noch nicht geschrieben, deshalb fragen wir vorerst nur das
                  Grundsätzliche.
                </>
              )}
            </p>
          </div>
          <Button size="lg" className="shrink-0 gap-2 rounded-2xl" onClick={() => setOffen(true)}>
            <Sparkles className="size-4" /> {ctaLabel}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${((schritt + 1) / gesamt) * 100}%` }}
              />
            </div>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {schritt + 1} / {gesamt}
            </span>
          </div>
        </div>
        <button onClick={zuruecksetzen} className="shrink-0 text-muted-foreground hover:text-foreground" aria-label="Schließen">
          <X className="size-5" />
        </button>
      </div>

      <div className="mt-6">
        {!istErgebnis && !istKontakt && (
          <FrageSchritt
            frage={fragen[schritt]}
            gewaehlt={antworten[fragen[schritt].id] ?? []}
            onWaehle={(w) => setzeAntwort(fragen[schritt], w)}
          />
        )}

        {istErgebnis && <ErgebnisSchritt treffer={treffer} guete={guete} kandidaten={kandidaten} />}

        {istKontakt && (
          <KontaktSchritt
            collectionId={collectionId}
            collectionName={collectionName}
            treffer={treffer}
            antworten={antworten}
            gesponsert={gesponsert ?? null}
            onFertig={zuruecksetzen}
          />
        )}
      </div>

      {!istKontakt && (
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setSchritt((s) => Math.max(0, s - 1))}
            disabled={schritt === 0}
            className="gap-1 rounded-full"
          >
            <ChevronLeft className="size-4" /> Zurück
          </Button>
          <Button
            onClick={() => setSchritt((s) => s + 1)}
            disabled={!istErgebnis && (antworten[fragen[schritt].id] ?? []).length === 0}
            className="gap-1 rounded-2xl"
          >
            {istErgebnis ? "Anfrage stellen" : "Weiter"} <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------- Fragen */

function FrageSchritt({
  frage, gewaehlt, onWaehle,
}: {
  frage: FinderFrage;
  gewaehlt: string[];
  onWaehle: (wert: string) => void;
}) {
  return (
    <div>
      <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{frage.label}</h3>
      {frage.warum && <p className="mt-1.5 text-sm text-muted-foreground">{frage.warum}</p>}
      {frage.type === "multi" && (
        <p className="mt-1 text-xs text-muted-foreground">Mehrfachauswahl möglich.</p>
      )}

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {(frage.options ?? []).map((o) => {
          const aktiv = gewaehlt.includes(o.value);
          return (
            <button
              key={o.value}
              onClick={() => onWaehle(o.value)}
              className={cn(
                "relative rounded-2xl border-2 p-4 text-left transition-all",
                aktiv ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
              )}
            >
              <div className="pr-7 font-medium">{o.label}</div>
              {o.hinweis && <div className="mt-1 pr-7 text-xs text-muted-foreground">{o.hinweis}</div>}
              {aktiv && (
                <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {frage.ausschluss && (
        <p className="mt-3 text-xs text-muted-foreground">
          Das ist ein Ausschlusskriterium: Tools, die das nicht können, zeigen wir dir gar nicht erst.
        </p>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- Ergebnis */

function ErgebnisSchritt({
  treffer, guete, kandidaten,
}: {
  treffer: Treffer[];
  guete: Guete;
  kandidaten: Kandidat[];
}) {
  /* WIR HABEN ZU DIESEN TOOLS NOCH KEINE ANGABEN.
     Das ist keine Aussage ueber die Tools, sondern eine Luecke in UNSEREN Daten, und der
     Nutzer muss den Unterschied erfahren. "Da passt nichts" waere eine Beleidigung der
     Anbieter fuer einen Fehler, den wir gemacht haben. */
  if (guete === "keine_daten") {
    return (
      <div>
        <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
          Empfehlen können wir hier noch nichts, und das sagen wir dir lieber.
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Zu den {kandidaten.length} Tools dieser Kategorie haben wir die Funktionsdaten noch nicht geprüft. Wir
          könnten dir jetzt drei Namen nennen, aber die wären geraten, und geraten ist genau das, was wir hier nicht
          tun.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Deine Anfrage geht trotzdem raus, mit allem, was du uns gerade erzählt hast. Die Anbieter melden sich bei
          dir und können deine Fragen direkt beantworten.
        </p>
        <p className="mt-5 flex items-start gap-2 rounded-xl bg-secondary/50 p-3 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            Wir arbeiten die Kategorie gerade auf. Sobald wir die Funktionen belegt haben, bekommst du hier eine
            begründete Empfehlung statt einer Liste.
          </span>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
        {guete === "keins"
          ? "Da passt nichts sauber."
          : guete === "duenn"
            ? "Kein Tool erfüllt alles, was du brauchst."
            : `Das passt zu dem, was du beschrieben hast.`}
      </h3>

      {guete === "keins" && (
        <p className="mt-2 text-sm text-muted-foreground">
          Von den {kandidaten.length} Tools erfüllt keines deine Ausschlusskriterien. Das ist ein ehrliches Ergebnis und
          kein Fehler. Stell trotzdem eine Anfrage, dann suchen wir dir jemanden, oder lockere eine Bedingung.
        </p>
      )}

      {guete === "duenn" && (
        <p className="mt-2 text-sm text-muted-foreground">
          Wir zeigen dir trotzdem, was am nächsten dran ist, und sagen dir bei jedem ehrlich, was fehlt. Ein Tool zu
          empfehlen, das die Hälfte nicht kann, wäre keine Empfehlung.
        </p>
      )}

      <div className="mt-5 space-y-3">
        {treffer.map((t, i) => (
          <div key={t.kandidat.id} className="rounded-2xl border border-border p-4">
            <div className="flex items-start gap-3">
              <span
                className="grid size-10 shrink-0 place-items-center rounded-xl font-display font-bold text-white"
                style={{ background: t.kandidat.farbe }}
              >
                {t.kandidat.name[0]}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{t.kandidat.name}</span>
                  {i === 0 && guete === "gut" && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                      passt am besten
                    </span>
                  )}
                </div>
                {t.kandidat.kurzbeschreibung && (
                  <p className="mt-1 text-sm text-muted-foreground">{t.kandidat.kurzbeschreibung}</p>
                )}

                {t.passt.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {t.passt.map((p) => (
                      <li key={p} className="flex items-start gap-1.5 text-sm">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {t.passtNicht.length > 0 && (
                  <ul className="mt-1.5 space-y-1">
                    {t.passtNicht.map((p) => (
                      <li key={p} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                        <X className="mt-0.5 size-3.5 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Was wir bei KEINEM Tool der Kategorie wissen. Das ist eine Luecke in
                    unseren Daten, kein Mangel des Tools, und wird deshalb getrennt und
                    ohne wertendes Icon gezeigt. */}
                {t.unbekannt.length > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Dazu haben wir für kein Tool dieser Kategorie eine belastbare Angabe:{" "}
                    {t.unbekannt.join(", ")}. Frag das im Gespräch ab.
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 flex items-start gap-2 rounded-xl bg-secondary/50 p-3 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>
          Diese Auswahl richtet sich ausschließlich nach deinen Antworten. Bezahlte Platzierung spielt hier keine Rolle
          und kann das Ergebnis nicht beeinflussen. Wo uns eine Angabe fehlt, steht &bdquo;nicht belegt&ldquo;, statt
          dass wir zu deinen Gunsten raten.
        </span>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ Kontakt */

function KontaktSchritt({
  collectionId, collectionName, treffer, antworten, gesponsert, onFertig,
}: {
  collectionId: string;
  collectionName: string;
  treffer: Treffer[];
  antworten: Record<string, string[]>;
  gesponsert: string | null;
  onFertig: () => void;
}) {
  const [busy, startT] = useTransition();
  const [launchOk, setLaunchOk] = useState(false);
  const [fertig, setFertig] = useState(false);

  function absenden(fd: FormData) {
    startT(async () => {
      const r = await anfrageSenden({
        collectionId,
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        telefon: String(fd.get("telefon") ?? ""),
        firma: String(fd.get("firma") ?? ""),
        nachricht: String(fd.get("nachricht") ?? ""),
        antworten,
        empfohlen: treffer.map((t) => t.kandidat.id),
        launchEinwilligung: launchOk,
        kategorie: collectionName,
      });
      if (r.error) {
        toast.error(r.error);
        return;
      }
      setFertig(true);
    });
  }

  if (fertig) {
    return (
      <div className="py-6 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
          <Check className="size-7" />
        </span>
        <h3 className="mt-4 font-display text-xl font-semibold">Deine Anfrage ist raus.</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Wir leiten sie an die passenden Anbieter weiter. Sie melden sich direkt bei dir.
          {launchOk && " Zu deiner Einwilligung schicken wir dir gleich eine E-Mail mit einem Bestätigungslink. Erst wenn du den anklickst, ist sie gültig."}
        </p>
        <Button variant="outline" className="mt-6 rounded-2xl" onClick={onFertig}>
          Schließen
        </Button>
      </div>
    );
  }

  return (
    <form action={absenden}>
      <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">Wohin dürfen die Angebote?</h3>

      {/* WER DEN LEAD BEKOMMT, im Klartext, VOR dem Absenden.
          Der gesponserte Anbieter bekommt jede Anfrage, weil er dafuer bezahlt. Das
          verschweigen wir nicht, wir schreiben es hin und kennzeichnen es als Anzeige.
          Einen Lead still an einen Zahler weiterzureichen waere genau der
          Vertrauensbruch, den wir dem Rest der Branche vorwerfen. */}
      <div className="mt-3 rounded-xl border border-border bg-secondary/40 p-3 text-sm">
        <div className="font-medium">Deine Anfrage geht an:</div>
        <ul className="mt-2 space-y-1">
          {treffer.map((t) => (
            <li key={t.kandidat.id} className="flex items-center gap-2">
              <Check className="size-3.5 shrink-0 text-emerald-600" />
              <span>{t.kandidat.name}</span>
              <span className="text-xs text-muted-foreground">passt zu deinen Antworten</span>
            </li>
          ))}
          {gesponsert && !treffer.some((t) => t.kandidat.name === gesponsert) && (
            <li className="flex items-center gap-2">
              <Megaphone className="size-3.5 shrink-0 text-coral" />
              <span>{gesponsert}</span>
              <span className="rounded-full bg-coral/15 px-1.5 py-0.5 text-[10px] font-semibold text-coral">
                Anzeige
              </span>
            </li>
          )}
          {treffer.length === 0 && !gesponsert && (
            <li className="text-muted-foreground">die passenden Anbieter dieser Kategorie</li>
          )}
        </ul>
        {gesponsert && (
          <p className="mt-2 text-xs text-muted-foreground">
            Der als Anzeige gekennzeichnete Anbieter bezahlt dafür, deine Anfrage zu bekommen. Auf die Empfehlung
            oben hat das keinen Einfluss: die richtet sich nur nach deinen Antworten.
          </p>
        )}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="f-name">Name</Label>
          <Input id="f-name" name="name" required maxLength={80} placeholder="Vor- und Nachname" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-email">E-Mail</Label>
          <Input id="f-email" name="email" type="email" required maxLength={120} placeholder="du@betrieb.de" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-firma">Betrieb (optional)</Label>
          <Input id="f-firma" name="firma" maxLength={100} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-telefon">Telefon (optional)</Label>
          <Input id="f-telefon" name="telefon" maxLength={40} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="f-nachricht">Noch etwas, das die Anbieter wissen sollten? (optional)</Label>
          <textarea
            id="f-nachricht"
            name="nachricht"
            maxLength={1000}
            rows={3}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Die ANFRAGE selbst braucht keine Einwilligung: sie ist Vertragsanbahnung
          (Art. 6 I b). Hier steht deshalb nur ein Transparenzhinweis, KEINE Checkbox.
          Eine Pflicht-Checkbox waere nicht nur ueberfluessig, sie wuerde die Anfrage
          faelschlich als einwilligungsbeduerftig darstellen. */}
      <p className="mt-5 rounded-xl bg-secondary/50 p-3 text-xs text-muted-foreground">
        {anfrageHinweis(null)}
      </p>

      {/* Der LAUNCH-SERVICE ist Werbung und braucht eine eigene, freiwillige,
          NICHT vorangekreuzte Einwilligung (Art. 6 I a, § 7 UWG). Sie ist bewusst
          von der Anfrage getrennt: die Anfrage geht auch ohne sie raus. */}
      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3">
        <Checkbox
          checked={launchOk}
          onCheckedChange={(v) => setLaunchOk(v === true)}
          className="mt-0.5"
          aria-describedby="launch-hinweis"
        />
        <span className="text-sm">
          {einwilligungText(collectionName)}
          <span id="launch-hinweis" className="mt-1 block text-xs text-muted-foreground">
            {einwilligungHinweis()}
          </span>
        </span>
      </label>

      <Button type="submit" size="lg" disabled={busy} className="mt-6 w-full gap-2 rounded-2xl sm:w-auto">
        {busy && <Loader2 className="size-4 animate-spin" />} Anfrage abschicken
      </Button>
    </form>
  );
}
