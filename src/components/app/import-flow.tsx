"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  X,
  Check,
  Loader2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatEur } from "@/lib/constants";
import {
  KATEGORIEN,
  INTERVALLE,
  INTERVALL_LABEL,
  KATEGORIE_FARBEN,
  type Intervall,
} from "@/lib/abos";
import { parseKontoauszug, erkenneAbos, type Treffer, type Konfidenz, type Buchung } from "@/lib/import";
import { bulkCreateAbos, type AboInput } from "@/app/app/abos/actions";

type Row = Treffer & { include: boolean };

const GRUPPEN: { key: Konfidenz; titel: string; sub: string; stil: string }[] = [
  { key: "hoch", titel: "Sicher erkannt", sub: "Wiederkehrende Abos, die wir eindeutig zuordnen konnten.", stil: "text-success" },
  { key: "mittel", titel: "Bitte prüfen", sub: "Könnten Abos sein. Schau kurz drüber, bevor du übernimmst.", stil: "text-warning" },
  { key: "dublette", titel: "Schon vorhanden", sub: "Sieht aus wie ein Abo, das du bereits erfasst hast.", stil: "text-muted-foreground" },
];

const STEPS = ["Hochladen", "Analyse", "Prüfen", "Fertig"];

/** YYYY-MM-DD -> DD.MM.YYYY (fuer die Referenzliste). */
function fmtImportDatum(iso: string): string {
  if (!iso) return "ohne Datum";
  const [y, m, d] = iso.split("-");
  return d ? `${d}.${m}.${y}` : iso;
}

export function ImportFlow({
  kanalOptionen,
  existingTools,
}: {
  kanalOptionen: string[];
  existingTools: string[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [datei, setDatei] = useState<{ name: string; size: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [kanal, setKanal] = useState<string>(kanalOptionen[0] ?? "");
  const [rows, setRows] = useState<Row[]>([]);
  const [analyseSub, setAnalyseSub] = useState(0);
  const [busy, setBusy] = useState(false);
  const [angelegt, setAngelegt] = useState(0);

  async function handleFile(files: FileList | null) {
    if (!files || files.length === 0) return;
    const alle: Buchung[] = [];
    let gesamtGroesse = 0;
    const namen: string[] = [];
    for (const f of Array.from(files)) {
      const text = await f.text();
      const { buchungen } = parseKontoauszug(f.name, text);
      alle.push(...buchungen);
      gesamtGroesse += f.size;
      namen.push(f.name);
    }
    if (alle.length === 0) {
      toast.error("Diese Datei(en) konnten wir nicht lesen. Unterstützt werden CSV, CAMT.053 (XML) und MT940.");
      return;
    }
    const treffer = erkenneAbos(alle, existingTools);
    if (treffer.length === 0) {
      toast.error("Keine wiederkehrenden Software-Abbuchungen gefunden.");
      return;
    }
    setDatei({ name: namen.length === 1 ? namen[0] : `${namen.length} Dateien`, size: gesamtGroesse });
    setRows(treffer.map((t) => ({ ...t, include: t.konfidenz !== "dublette" })));
    setAnalyseSub(0);
    setStep(2);
  }

  // Analyse-Animation, danach zu Schritt 3.
  useEffect(() => {
    if (step !== 2) return;
    const t1 = setTimeout(() => setAnalyseSub(1), 700);
    const t2 = setTimeout(() => setAnalyseSub(2), 1400);
    const t3 = setTimeout(() => setAnalyseSub(3), 2000);
    const t4 = setTimeout(() => setStep(3), 2400);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [step]);

  function patch(id: string, p: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  }

  const gewaehlt = rows.filter((r) => r.include);

  async function uebernehmen() {
    if (gewaehlt.length === 0) {
      toast.error("Wähle mindestens ein Abo aus.");
      return;
    }
    setBusy(true);
    const inputs: AboInput[] = gewaehlt.map((r) => ({
      tool: r.tool,
      initial: r.initial,
      farbe: KATEGORIE_FARBEN[r.kategorie] ?? r.farbe,
      kategorie: r.kategorie,
      kosten: r.betrag,
      waehrung: "EUR",
      intervall: r.intervall,
      naechste_abbuchung: r.naechsteAbbuchung,
      zahlungskanal: kanal || null,
      status: "aktiv",
      mit_verzeichnis: false,
    }));
    const res = await bulkCreateAbos(inputs);
    setBusy(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    setAngelegt(res.angelegt ?? gewaehlt.length);
    setStep(4);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Kontoauszug importieren
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Lade deinen Auszug hoch, wir erkennen die wiederkehrenden Abos für dich.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex flex-wrap items-center gap-2">
        {STEPS.map((label, i) => {
          const n = (i + 1) as 1 | 2 | 3 | 4;
          const done = step > n;
          const active = step === n;
          return (
            <div key={label} className="flex items-center gap-2">
              <span className={cn("grid size-7 place-items-center rounded-full text-xs font-semibold", done ? "bg-success text-white" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                {done ? <Check className="size-3.5" /> : n}
              </span>
              <span className={cn("text-sm", active ? "font-semibold text-foreground" : "text-muted-foreground")}>{label}</span>
              {i < STEPS.length - 1 && <span className="mx-1 hidden h-px w-8 bg-border sm:block" />}
            </div>
          );
        })}
      </div>

      {/* Schritt 1: Upload */}
      {step === 1 && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files); }}
              onClick={() => fileRef.current?.click()}
              className={cn("cursor-pointer rounded-[20px] border-2 border-dashed p-10 text-center transition-colors", dragOver ? "border-primary bg-primary/5" : "border-primary/40 bg-background hover:bg-primary/[0.03]")}
            >
              <input ref={fileRef} type="file" multiple className="hidden" accept=".csv,.txt,.xml,.sta,.940,.mt940" onChange={(e) => handleFile(e.target.files)} />
              <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Upload className="size-7" /></div>
              <div className="font-display text-lg font-semibold">Zieh deine Kontoauszüge hierher oder wähle Dateien.</div>
              <div className="mt-1 text-sm text-muted-foreground">Mehrere Dateien möglich. Unterstützt: CSV, CAMT.053 (XML) und MT940 (Export aus deinem Online-Banking)</div>
            </div>

            {datei && (
              <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
                <div className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground"><FileText className="size-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{datei.name}</div>
                  <div className="text-xs text-muted-foreground">{(datei.size / 1024).toFixed(1)} KB</div>
                </div>
                <button onClick={() => setDatei(null)} className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-muted" aria-label="Datei entfernen"><X className="size-4" /></button>
              </div>
            )}

            {kanalOptionen.length > 0 && (
              <div className="rounded-xl border bg-card p-4">
                <label className="text-sm font-medium">Zahlungskanal zuordnen</label>
                <p className="mt-0.5 text-xs text-muted-foreground">Erkannte Abbuchungen werden direkt diesem Kanal zugewiesen.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {kanalOptionen.map((k) => (
                    <button key={k} onClick={() => setKanal(k)} className={cn("h-9 rounded-full border px-3 text-sm font-medium transition-colors", kanal === k ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-accent")}>{k}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="size-4 text-primary" /> Deine Daten bleiben deine</div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Wir lesen den Auszug nur im Browser, um Abos zu erkennen. Gespeichert wird ausschließlich, was du bestätigst.</p>
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="size-4 text-primary" /> Tipp</div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Lade am besten die letzten 12 Monate hoch, damit auch jährliche Abos sicher erkannt werden.</p>
            </div>
          </aside>
        </div>
      )}

      {/* Schritt 2: Analyse */}
      {step === 2 && (
        <div className="rounded-2xl border bg-card p-10">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Loader2 className="size-7 animate-spin" /></div>
            <div className="font-display text-3xl font-semibold tabular-nums">{rows.length} mögliche Abos gefunden</div>
            <div className="mt-6 space-y-3 text-left">
              {["Buchungen werden gelesen", "Wiederkehrende Zahlungen werden erkannt", "Anbieter werden zu Tools aufgelöst"].map((label, i) => {
                const done = analyseSub > i;
                const active = analyseSub === i;
                return (
                  <div key={label} className={cn("flex items-center gap-3 rounded-xl border px-4 py-3 text-sm", done ? "border-success/30 bg-success/10 text-foreground" : active ? "border-primary/30 bg-primary/5" : "border-border bg-background text-muted-foreground")}>
                    <div className={cn("grid size-6 place-items-center rounded-full", done ? "bg-success text-white" : active ? "bg-primary/15 text-primary" : "bg-muted")}>
                      {done ? <Check className="size-3.5" /> : active ? <Loader2 className="size-3.5 animate-spin" /> : null}
                    </div>
                    <span className="font-medium">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Schritt 3: Review */}
      {step === 3 && (
        <div className="space-y-6">
          {GRUPPEN.map((g) => {
            const items = rows.filter((r) => r.konfidenz === g.key);
            if (items.length === 0) return null;
            return (
              <section key={g.key} className="overflow-hidden rounded-2xl border bg-card">
                <div className="flex items-center justify-between border-b bg-secondary/30 px-5 py-3">
                  <div>
                    <div className={cn("font-display text-sm font-semibold", g.stil)}>{g.titel} · {items.length}</div>
                    <div className="text-xs text-muted-foreground">{g.sub}</div>
                  </div>
                </div>
                <ul className="divide-y">
                  {items.map((r) => (
                    <li key={r.id} className="flex flex-col gap-3 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <label className="flex items-center gap-3 sm:w-56">
                          <input type="checkbox" checked={r.include} onChange={(e) => patch(r.id, { include: e.target.checked })} className="size-4 shrink-0 rounded border-border accent-primary" />
                          <span className="grid size-9 shrink-0 place-items-center rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: KATEGORIE_FARBEN[r.kategorie] ?? r.farbe }}>{r.initial}</span>
                          <Input value={r.tool} onChange={(e) => patch(r.id, { tool: e.target.value })} className="h-9" />
                        </label>
                        <div className="min-w-0 flex-1 truncate text-xs text-muted-foreground" title={r.buchungstext}>
                          {r.buchungstext}
                          {r.anzahl > 1 && <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5">{r.anzahl}×</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Select value={r.kategorie} onValueChange={(v) => patch(r.id, { kategorie: v })}>
                            <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                            <SelectContent>{KATEGORIEN.map((k) => (<SelectItem key={k} value={k}>{k}</SelectItem>))}</SelectContent>
                          </Select>
                          <Select value={r.intervall} onValueChange={(v) => patch(r.id, { intervall: v as Intervall })}>
                            <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                            <SelectContent>{INTERVALLE.map((iv) => (<SelectItem key={iv} value={iv}>{INTERVALL_LABEL[iv]}</SelectItem>))}</SelectContent>
                          </Select>
                          <Input
                            value={String(r.betrag).replace(".", ",")}
                            onChange={(e) => { const n = Number(e.target.value.replace(/\./g, "").replace(",", ".")); patch(r.id, { betrag: isFinite(n) ? n : r.betrag }); }}
                            className="h-9 w-24 text-right tabular-nums"
                          />
                        </div>
                      </div>

                      {r.referenzen.length > 0 && (
                        <details className="rounded-lg border border-border/60 bg-secondary/30 px-3 py-2 text-xs sm:ml-[15rem]">
                          <summary className="flex cursor-pointer select-none items-center gap-1.5 text-muted-foreground">
                            <FileText className="size-3.5" />
                            {r.referenzen.length} {r.referenzen.length === 1 ? "Buchung" : "Buchungen"} mit allen Referenzen
                          </summary>
                          <ul className="mt-2 space-y-1.5">
                            {r.referenzen.map((ref, i) => (
                              <li key={i} className="flex items-start justify-between gap-3 border-t border-border/40 pt-1.5 first:border-0 first:pt-0">
                                <div className="min-w-0">
                                  <div className="tabular-nums text-muted-foreground">{fmtImportDatum(ref.datum)}</div>
                                  <div className="break-words text-foreground/80">{ref.text || "(kein Verwendungszweck)"}</div>
                                </div>
                                <div className="shrink-0 font-medium tabular-nums">{formatEur(Math.abs(ref.betrag))}</div>
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card/95 p-4 backdrop-blur">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{gewaehlt.length}</span> ausgewählt ·{" "}
              {formatEur(gewaehlt.reduce((s, r) => s + (r.intervall === "monatlich" ? r.betrag : r.intervall === "jaehrlich" ? r.betrag / 12 : r.betrag / 3), 0))} pro Monat
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setStep(1); setDatei(null); setRows([]); }}>Andere Datei</Button>
              <Button onClick={uebernehmen} disabled={busy} className="gap-2">
                {busy && <Loader2 className="size-4 animate-spin" />}
                {gewaehlt.length} Abos übernehmen
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Schritt 4: Erfolg */}
      {step === 4 && (
        <div className="rounded-[20px] border border-dashed bg-card p-12 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-success/10 text-success"><CheckCircle2 className="size-7" /></span>
          <h2 className="mt-4 font-display text-xl font-semibold">{angelegt} {angelegt === 1 ? "Abo" : "Abos"} angelegt</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">Deine importierten Abos sind jetzt im Tracker. Prüfe Fristen und Zuordnung in der Liste.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="gap-2"><Link href="/app/abos">Zu meinen Abos <ArrowRight className="size-4" /></Link></Button>
            <Button asChild variant="outline"><Link href="/app">Zum Dashboard</Link></Button>
          </div>
        </div>
      )}
    </div>
  );
}
