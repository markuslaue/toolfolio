import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Upload, FileText, X, Check, AlertTriangle, Info, ChevronDown, ChevronRight,
  Sparkles, Shield, Loader2, CreditCard, Tag, User as UserIcon, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { kanaele, kategorien, kunden, kategorieFarben } from "@/lib/abos-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;

type Confidence = "hoch" | "mittel" | "dublette";

interface Treffer {
  id: string;
  tool: string;
  initial: string;
  farbe: string;
  buchungstext: string;
  betrag: number;
  intervall: "monatlich" | "jährlich" | "quartalsweise";
  letzteAbbuchung: string;
  kategorie: string;
  kanal: string;
  konfidenz: Confidence;
  imVerzeichnis: boolean;
  aktiv: boolean;
  kunde: string;
}

const mockTreffer: Treffer[] = [
  // Gruppe A – sicher (14)
  { id: "t1", tool: "Notion", initial: "N", farbe: "#000000", buchungstext: "DD STRIPE*NOTION LABS 14EUR", betrag: 14, intervall: "monatlich", letzteAbbuchung: "2026-06-04", kategorie: "Produktivität", kanal: kanaele[0], konfidenz: "hoch", imVerzeichnis: true, aktiv: true, kunde: "Intern / nicht zugeordnet" },
  { id: "t2", tool: "Ahrefs", initial: "A", farbe: "#0F66F0", buchungstext: "PADDLE.NET* AHREFS PRO", betrag: 99, intervall: "monatlich", letzteAbbuchung: "2026-06-09", kategorie: "SEO", kanal: kanaele[0], konfidenz: "hoch", imVerzeichnis: true, aktiv: true, kunde: "Kunde Nordwerk" },
  { id: "t3", tool: "Adobe Creative Cloud", initial: "A", farbe: "#FA0F00", buchungstext: "ADOBE SYSTEMS DE", betrag: 65.99, intervall: "monatlich", letzteAbbuchung: "2026-06-11", kategorie: "Design", kanal: kanaele[1], konfidenz: "hoch", imVerzeichnis: true, aktiv: true, kunde: "Intern / nicht zugeordnet" },
  { id: "t4", tool: "Figma", initial: "F", farbe: "#F24E1E", buchungstext: "FIGMA INC SAN FRANCISCO", betrag: 15, intervall: "monatlich", letzteAbbuchung: "2026-06-12", kategorie: "Design", kanal: kanaele[0], konfidenz: "hoch", imVerzeichnis: true, aktiv: true, kunde: "Intern / nicht zugeordnet" },
  { id: "t5", tool: "Lovable", initial: "L", farbe: "#6C5CE7", buchungstext: "PAYPAL *LOVABLE MONATLICH", betrag: 25, intervall: "monatlich", letzteAbbuchung: "2026-06-15", kategorie: "Entwicklung", kanal: kanaele[3], konfidenz: "hoch", imVerzeichnis: true, aktiv: true, kunde: "Intern / nicht zugeordnet" },
  { id: "t6", tool: "Anthropic API", initial: "A", farbe: "#D4A27F", buchungstext: "ANTHROPIC PBC", betrag: 42.18, intervall: "monatlich", letzteAbbuchung: "2026-06-02", kategorie: "KI / API", kanal: kanaele[1], konfidenz: "hoch", imVerzeichnis: true, aktiv: true, kunde: "Kunde Holzbau Kessler" },
  { id: "t7", tool: "Google Workspace", initial: "G", farbe: "#4285F4", buchungstext: "GOOGLE*GSUITE_TOOLFOLIO", betrag: 11.50, intervall: "monatlich", letzteAbbuchung: "2026-06-06", kategorie: "Kommunikation", kanal: kanaele[2], konfidenz: "hoch", imVerzeichnis: true, aktiv: true, kunde: "Intern / nicht zugeordnet" },
  { id: "t8", tool: "Slack", initial: "S", farbe: "#4A154B", buchungstext: "SLACK TECHNOLOGIES INC", betrag: 7.25, intervall: "monatlich", letzteAbbuchung: "2026-06-07", kategorie: "Kommunikation", kanal: kanaele[0], konfidenz: "hoch", imVerzeichnis: true, aktiv: true, kunde: "Intern / nicht zugeordnet" },
  { id: "t9", tool: "Linear", initial: "L", farbe: "#5E6AD2", buchungstext: "LINEAR APP", betrag: 8, intervall: "monatlich", letzteAbbuchung: "2026-06-10", kategorie: "Entwicklung", kanal: kanaele[0], konfidenz: "hoch", imVerzeichnis: true, aktiv: true, kunde: "Intern / nicht zugeordnet" },
  { id: "t10", tool: "Vercel", initial: "V", farbe: "#000000", buchungstext: "VERCEL INC", betrag: 20, intervall: "monatlich", letzteAbbuchung: "2026-06-13", kategorie: "Entwicklung", kanal: kanaele[1], konfidenz: "hoch", imVerzeichnis: true, aktiv: true, kunde: "Kunde Solea" },
  { id: "t11", tool: "GitHub", initial: "G", farbe: "#181717", buchungstext: "GITHUB INC", betrag: 4, intervall: "monatlich", letzteAbbuchung: "2026-06-14", kategorie: "Entwicklung", kanal: kanaele[1], konfidenz: "hoch", imVerzeichnis: true, aktiv: true, kunde: "Intern / nicht zugeordnet" },
  { id: "t12", tool: "Loom", initial: "L", farbe: "#625DF5", buchungstext: "LOOM INC SUBSCRIPTION", betrag: 12.50, intervall: "monatlich", letzteAbbuchung: "2026-06-16", kategorie: "Kommunikation", kanal: kanaele[0], konfidenz: "hoch", imVerzeichnis: true, aktiv: true, kunde: "Intern / nicht zugeordnet" },
  { id: "t13", tool: "ChatGPT Team", initial: "C", farbe: "#10A37F", buchungstext: "OPENAI LLC TEAM PLAN", betrag: 25, intervall: "monatlich", letzteAbbuchung: "2026-06-03", kategorie: "KI / API", kanal: kanaele[0], konfidenz: "hoch", imVerzeichnis: true, aktiv: true, kunde: "Intern / nicht zugeordnet" },
  { id: "t14", tool: "Canva", initial: "C", farbe: "#00C4CC", buchungstext: "CANVA* I12345 SYDNEY", betrag: 11.99, intervall: "monatlich", letzteAbbuchung: "2026-06-08", kategorie: "Design", kanal: kanaele[3], konfidenz: "hoch", imVerzeichnis: true, aktiv: true, kunde: "Intern / nicht zugeordnet" },

  // Gruppe B – bitte prüfen (2)
  { id: "t15", tool: "AWS (Amazon Web Services)", initial: "A", farbe: "#FF9900", buchungstext: "AMZN AWS BILLING DE", betrag: 23.47, intervall: "monatlich", letzteAbbuchung: "2026-06-01", kategorie: "Entwicklung", kanal: kanaele[1], konfidenz: "mittel", imVerzeichnis: false, aktiv: false, kunde: "Intern / nicht zugeordnet" },
  { id: "t16", tool: "Möglicher Einmalkauf", initial: "?", farbe: "#6B7280", buchungstext: "APPLE.COM/BILL DEVELOPER", betrag: 99, intervall: "jährlich", letzteAbbuchung: "2026-05-20", kategorie: "Entwicklung", kanal: kanaele[0], konfidenz: "mittel", imVerzeichnis: false, aktiv: false, kunde: "Intern / nicht zugeordnet" },

  // Gruppe C – bereits erfasst (2)
  { id: "t17", tool: "Calendly", initial: "C", farbe: "#006BFF", buchungstext: "CALENDLY.COM ATLANTA", betrag: 16, intervall: "monatlich", letzteAbbuchung: "2026-06-18", kategorie: "Produktivität", kanal: kanaele[3], konfidenz: "dublette", imVerzeichnis: true, aktiv: false, kunde: "Intern / nicht zugeordnet" },
  { id: "t18", tool: "Typeform", initial: "T", farbe: "#262627", buchungstext: "TYPEFORM SL BARCELONA", betrag: 35, intervall: "monatlich", letzteAbbuchung: "2026-06-22", kategorie: "Produktivität", kanal: kanaele[0], konfidenz: "dublette", imVerzeichnis: true, aktiv: false, kunde: "Kunde Nordwerk" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

export function ImportFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [files, setFiles] = useState<{ name: string; size: number }[]>([]);
  const [kanal, setKanal] = useState<string>(kanaele[0]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [treffer, setTreffer] = useState<Treffer[]>(mockTreffer);
  const [openA, setOpenA] = useState(true);
  const [openB, setOpenB] = useState(true);
  const [openC, setOpenC] = useState(false);
  const [showRaw, setShowRaw] = useState<Record<string, boolean>>({});

  // Analyse-Animation
  const [analyseSub, setAnalyseSub] = useState(0);
  const [counter, setCounter] = useState(0);
  useEffect(() => {
    if (step !== 2) return;
    setAnalyseSub(0);
    setCounter(0);
    const t1 = setTimeout(() => setAnalyseSub(1), 900);
    const t2 = setTimeout(() => setAnalyseSub(2), 2000);
    const t3 = setTimeout(() => setAnalyseSub(3), 3100);
    const t4 = setTimeout(() => setStep(3), 3900);
    const targets = [3, 9, 14, 18];
    const ticks = targets.map((v, i) => setTimeout(() => setCounter(v), 600 + i * 700));
    return () => {
      [t1, t2, t3, t4, ...ticks].forEach(clearTimeout);
    };
  }, [step]);

  const grpA = treffer.filter((t) => t.konfidenz === "hoch");
  const grpB = treffer.filter((t) => t.konfidenz === "mittel");
  const grpC = treffer.filter((t) => t.konfidenz === "dublette");

  const monatsBetrag = useMemo(() => {
    return treffer
      .filter((t) => t.aktiv && t.konfidenz !== "dublette")
      .reduce((sum, t) => {
        const m =
          t.intervall === "monatlich"
            ? t.betrag
            : t.intervall === "jährlich"
              ? t.betrag / 12
              : t.betrag / 3;
        return sum + m;
      }, 0);
  }, [treffer]);

  const addedCount = treffer.filter((t) => t.aktiv && t.konfidenz !== "dublette").length;
  const ignoredCount =
    treffer.filter((t) => !t.aktiv && t.konfidenz !== "dublette").length;
  const dupCount = grpC.length;

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const allowed = [".csv", ".xml", ".sta", ".mt940", ".txt"];
    const valid: { name: string; size: number }[] = [];
    Array.from(incoming).forEach((f) => {
      const ok = allowed.some((ext) => f.name.toLowerCase().endsWith(ext));
      if (!ok) {
        toast.error("Format nicht unterstützt", {
          description: `Dieses Format können wir noch nicht lesen, probiere CSV oder CAMT.`,
        });
        return;
      }
      valid.push({ name: f.name, size: f.size });
    });
    setFiles((prev) => [...prev, ...valid]);
  };

  const toggle = (id: string, val?: boolean) =>
    setTreffer((prev) =>
      prev.map((t) => (t.id === id ? { ...t, aktiv: val ?? !t.aktiv } : t)),
    );
  const update = (id: string, patch: Partial<Treffer>) =>
    setTreffer((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  if (step === 4) return <ErfolgsState onZuAbos={() => navigate({ to: "/abos" })} onDashboard={() => navigate({ to: "/" })} anzahl={addedCount} />;

  return (
    <div className="space-y-6 pb-32">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
          Kontoauszug importieren
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Lade deinen Auszug hoch und wir erkennen alle wiederkehrenden Abos für dich.
        </p>
      </div>

      <Stepper step={step} />

      {step === 1 && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "rounded-[20px] border-2 border-dashed cursor-pointer p-10 text-center transition-colors",
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-primary/40 bg-background hover:bg-primary/[0.03]",
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept=".csv,.xml,.sta,.mt940,.txt"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <div className="mx-auto size-14 rounded-2xl bg-primary/10 grid place-items-center text-primary mb-4">
                <Upload className="size-7" />
              </div>
              <div className="font-display text-lg font-semibold">
                Zieh deinen Kontoauszug hierher oder wähle eine Datei.
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Unterstützt: CSV, CAMT.053 (XML), MT940
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Die meisten Banken bieten diese im Online-Banking als Export an.{" "}
                <a
                  href="#"
                  onClick={(e) => e.stopPropagation()}
                  className="text-primary hover:underline"
                >
                  Welches Format hat meine Bank?
                </a>
              </div>
            </div>

            {files.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-2">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                  >
                    <div className="size-9 rounded-lg bg-muted grid place-items-center text-muted-foreground">
                      <FileText className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{f.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {(f.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <button
                      onClick={() => setFiles((p) => p.filter((_, idx) => idx !== i))}
                      className="size-7 rounded-md hover:bg-muted grid place-items-center text-muted-foreground"
                      aria-label="Datei entfernen"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-xl border border-border bg-card p-4">
              <label className="text-sm font-medium">Zahlungskanal zuordnen</label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Damit erkannte Abbuchungen direkt dem richtigen Kanal zugewiesen werden.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {kanaele.map((k) => (
                  <button
                    key={k}
                    onClick={() => setKanal(k)}
                    className={cn(
                      "h-9 px-3 rounded-full text-sm font-medium border transition-colors",
                      kanal === k
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-accent",
                    )}
                  >
                    {k}
                  </button>
                ))}
                <button className="h-9 px-3 rounded-full text-sm font-medium border border-dashed border-border text-muted-foreground hover:bg-accent">
                  + Neuen Kanal anlegen
                </button>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Shield className="size-4 text-primary" />
                Deine Daten bleiben deine
              </div>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Wir analysieren deinen Auszug nur, um Abos zu erkennen. Die Rohdaten
                werden danach verworfen, gespeichert wird nur, was du bestätigst.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="size-4 text-primary" />
                Tipp
              </div>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Lade am besten die letzten 12 Monate hoch, damit auch jährliche Abos
                sicher erkannt werden.
              </p>
            </div>
          </aside>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-2xl border border-border bg-card p-10">
          <div className="max-w-md mx-auto text-center">
            <div className="mx-auto size-14 rounded-2xl bg-primary/10 grid place-items-center text-primary mb-5">
              <Loader2 className="size-7 animate-spin" />
            </div>
            <div className="font-display text-3xl font-semibold tabular-nums">
              {counter} mögliche Abos gefunden
            </div>
            <div className="mt-6 space-y-3 text-left">
              {[
                "Buchungen werden gelesen",
                "Wiederkehrende Zahlungen werden erkannt",
                "Anbieter werden zu Tools aufgelöst",
              ].map((label, i) => {
                const done = analyseSub > i;
                const active = analyseSub === i;
                return (
                  <div
                    key={label}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm",
                      done
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : active
                          ? "border-primary/30 bg-primary/5"
                          : "border-border bg-background text-muted-foreground",
                    )}
                  >
                    <div
                      className={cn(
                        "size-6 rounded-full grid place-items-center",
                        done
                          ? "bg-emerald-500 text-white"
                          : active
                            ? "bg-primary/15 text-primary"
                            : "bg-muted",
                      )}
                    >
                      {done ? (
                        <Check className="size-3.5" />
                      ) : active ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : null}
                    </div>
                    <span className="font-medium">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          {/* Bilanz */}
          <div className="rounded-2xl border border-border bg-card p-5 flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="font-display text-lg">
              <span className="font-semibold">{treffer.length}</span> mögliche Abos
              erkannt, davon{" "}
              <span className="font-semibold text-emerald-600">{grpA.length}</span>{" "}
              sicher.
            </div>
            <div className="text-sm text-muted-foreground">
              Kurz prüfen, dann fertig.
            </div>
          </div>

          {/* Sammelzahlungs-Banner */}
          <div className="rounded-2xl border border-[#F0533D]/30 bg-[#FFF1ED] p-4 flex items-start gap-3">
            <div className="size-9 rounded-lg bg-[#F0533D]/15 text-[#F0533D] grid place-items-center shrink-0">
              <AlertTriangle className="size-4" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-[#1F1D2B]">
                Sammelbuchungen erkannt
              </div>
              <p className="text-sm text-[#1F1D2B]/80 mt-0.5">
                Wir sehen Sammelbuchungen über PayPal und Stripe. Was darüber läuft,
                können wir aus dem Kontoauszug nicht einzeln aufschlüsseln. Importiere
                dafür den PayPal- oder Stripe-Export.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" className="bg-[#F0533D] hover:bg-[#F0533D]/90">
                  PayPal-Export importieren
                </Button>
                <Button size="sm" variant="outline">
                  Stripe-Export importieren
                </Button>
              </div>
            </div>
          </div>

          {/* Bulk-Leiste */}
          <div className="rounded-xl border border-border bg-card p-3 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setTreffer((p) =>
                  p.map((t) => (t.konfidenz === "hoch" ? { ...t, aktiv: true } : t)),
                )
              }
            >
              Alle in „Sicher erkannt" auswählen
            </Button>
            <Button size="sm" variant="ghost" className="text-muted-foreground">
              <Tag className="size-3.5" /> Kategorie setzen
            </Button>
            <Button size="sm" variant="ghost" className="text-muted-foreground">
              <CreditCard className="size-3.5" /> Kanal ändern
            </Button>
            <Button size="sm" variant="ghost" className="text-muted-foreground">
              <UserIcon className="size-3.5" /> Kunde zuordnen
            </Button>
          </div>

          {/* Gruppen */}
          <Gruppe
            title="Sicher erkannt"
            count={grpA.length}
            color="emerald"
            open={openA}
            onToggle={() => setOpenA(!openA)}
          >
            {grpA.map((t) => (
              <TrefferCard
                key={t.id}
                t={t}
                showRaw={!!showRaw[t.id]}
                onToggleRaw={() => setShowRaw((s) => ({ ...s, [t.id]: !s[t.id] }))}
                onToggle={(v) => toggle(t.id, v)}
                onUpdate={(p) => update(t.id, p)}
              />
            ))}
          </Gruppe>

          <Gruppe
            title="Bitte prüfen"
            count={grpB.length}
            color="amber"
            open={openB}
            onToggle={() => setOpenB(!openB)}
          >
            {grpB.map((t) => (
              <TrefferCard
                key={t.id}
                t={t}
                showRaw={!!showRaw[t.id]}
                onToggleRaw={() => setShowRaw((s) => ({ ...s, [t.id]: !s[t.id] }))}
                onToggle={(v) => toggle(t.id, v)}
                onUpdate={(p) => update(t.id, p)}
              />
            ))}
          </Gruppe>

          <Gruppe
            title="Bereits in Toolfolio"
            count={grpC.length}
            color="muted"
            open={openC}
            onToggle={() => setOpenC(!openC)}
            subtitle="übersprungen"
          >
            {grpC.map((t) => (
              <TrefferCard
                key={t.id}
                t={t}
                showRaw={!!showRaw[t.id]}
                onToggleRaw={() => setShowRaw((s) => ({ ...s, [t.id]: !s[t.id] }))}
                onToggle={(v) => toggle(t.id, v)}
                onUpdate={(p) => update(t.id, p)}
                dimmed
              />
            ))}
          </Gruppe>
        </div>
      )}

      {/* Sticky Footer */}
      <div className="fixed bottom-0 inset-x-0 z-30 border-t border-border bg-background/95 backdrop-blur">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-0 text-sm">
            {step === 1 && (
              <span className="text-muted-foreground">
                {files.length === 0
                  ? "Lade mindestens eine Datei hoch, um zu starten."
                  : `${files.length} Datei${files.length === 1 ? "" : "en"} bereit zur Analyse.`}
              </span>
            )}
            {step === 2 && (
              <span className="text-muted-foreground">
                Einen Moment, wir lesen deine Buchungen.
              </span>
            )}
            {step === 3 && (
              <span>
                <span className="font-medium text-foreground">Wird hinzugefügt:</span>{" "}
                <span className="tabular-nums font-semibold">{addedCount} Abos</span>,
                zusammen{" "}
                <span className="tabular-nums font-semibold">{fmt(monatsBetrag)}</span>{" "}
                pro Monat.{" "}
                <span className="text-muted-foreground">
                  Ignoriert: {ignoredCount}. Bereits vorhanden: {dupCount} (übersprungen).
                </span>
              </span>
            )}
          </div>
          {step === 1 && (
            <>
              <Button variant="ghost" asChild>
                <Link to="/abos">Abbrechen</Link>
              </Button>
              <Button disabled={files.length === 0} onClick={() => setStep(2)}>
                Analysieren
              </Button>
            </>
          )}
          {step === 3 && (
            <>
              <Button variant="ghost" onClick={() => setStep(1)}>
                Zurück
              </Button>
              <Button
                disabled={addedCount === 0}
                onClick={() => {
                  toast.success(`${addedCount} Abos hinzugefügt`);
                  setStep(4);
                }}
              >
                Abos hinzufügen
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const labels = ["Hochladen", "Analyse", "Prüfen & Bestätigen"];
  return (
    <ol className="flex items-center gap-2 sm:gap-3">
      {labels.map((l, i) => {
        const idx = (i + 1) as Step;
        const done = step > idx;
        const active = step === idx;
        return (
          <li key={l} className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div
              className={cn(
                "size-7 shrink-0 rounded-full grid place-items-center text-xs font-semibold border",
                done
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : active
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-border text-muted-foreground",
              )}
            >
              {done ? <Check className="size-3.5" /> : idx}
            </div>
            <div
              className={cn(
                "text-sm font-medium truncate",
                active
                  ? "text-foreground"
                  : done
                    ? "text-foreground"
                    : "text-muted-foreground",
              )}
            >
              {l}
            </div>
            {i < labels.length - 1 && (
              <div
                className={cn(
                  "h-px flex-1 min-w-4",
                  done ? "bg-emerald-500" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Gruppe({
  title,
  count,
  color,
  open,
  onToggle,
  children,
  subtitle,
}: {
  title: string;
  count: number;
  color: "emerald" | "amber" | "muted";
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  subtitle?: string;
}) {
  const colors = {
    emerald: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
    amber: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
    muted: { dot: "bg-muted-foreground", text: "text-muted-foreground", bg: "bg-muted" },
  }[color];
  return (
    <section className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 hover:bg-accent/40 transition-colors"
      >
        {open ? (
          <ChevronDown className="size-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-4 text-muted-foreground" />
        )}
        <span className={cn("size-2.5 rounded-full", colors.dot)} />
        <span className="font-display font-semibold text-base">{title}</span>
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            colors.bg,
            colors.text,
          )}
        >
          {count}
        </span>
        {subtitle && (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        )}
      </button>
      {open && count > 0 && (
        <div className="border-t border-border p-3 space-y-2 bg-background/50">
          {children}
        </div>
      )}
    </section>
  );
}

function TrefferCard({
  t,
  showRaw,
  onToggleRaw,
  onToggle,
  onUpdate,
  dimmed,
}: {
  t: Treffer;
  showRaw: boolean;
  onToggleRaw: () => void;
  onToggle: (v: boolean) => void;
  onUpdate: (p: Partial<Treffer>) => void;
  dimmed?: boolean;
}) {
  const dotColor =
    t.konfidenz === "hoch"
      ? "bg-emerald-500"
      : t.konfidenz === "mittel"
        ? "bg-amber-500"
        : "bg-muted-foreground";
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-3 sm:p-4 transition-all hover:shadow-sm",
        dimmed && "opacity-60",
      )}
    >
      <div className="flex flex-wrap items-start gap-3">
        <div
          className="size-10 shrink-0 rounded-lg grid place-items-center text-white text-sm font-semibold"
          style={{ backgroundColor: t.farbe }}
        >
          {t.initial}
        </div>
        <div className="flex-1 min-w-[180px]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{t.tool}</span>
            <span
              className={cn("size-2 rounded-full", dotColor)}
              title={
                t.konfidenz === "hoch"
                  ? "Sicher erkannt"
                  : t.konfidenz === "mittel"
                    ? "Bitte prüfen"
                    : "Dublette"
              }
            />
            {t.imVerzeichnis && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                im Verzeichnis
              </span>
            )}
            {t.konfidenz === "dublette" && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                bereits erfasst
              </span>
            )}
          </div>
          <button
            onClick={onToggleRaw}
            className="mt-1 text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            {showRaw ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
            {showRaw ? t.buchungstext : "Original-Buchungstext anzeigen"}
          </button>
        </div>
        <div className="text-right">
          <div className="font-semibold tabular-nums">{fmt(t.betrag)}</div>
          <div className="text-xs text-muted-foreground">
            {t.intervall} · zuletzt{" "}
            {new Date(t.letzteAbbuchung).toLocaleDateString("de-DE")}
          </div>
        </div>
        <label className="inline-flex items-center gap-2 cursor-pointer shrink-0">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {t.aktiv ? "Ist ein Abo" : "Ignorieren"}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={t.aktiv}
            onClick={() => onToggle(!t.aktiv)}
            className={cn(
              "relative h-6 w-10 rounded-full transition-colors",
              t.aktiv ? "bg-primary" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-5 rounded-full bg-white shadow transition-all",
                t.aktiv ? "left-[18px]" : "left-0.5",
              )}
            />
          </button>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <select
          value={t.kategorie}
          onChange={(e) => onUpdate({ kategorie: e.target.value })}
          className="h-7 rounded-full px-3 border-0 font-medium cursor-pointer"
          style={{
            backgroundColor:
              (kategorieFarben as Record<string, string>)[t.kategorie] + "20" ||
              "#F3F4F6",
            color: (kategorieFarben as Record<string, string>)[t.kategorie] || "#374151",
          }}
        >
          {kategorien.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <select
          value={t.kanal}
          onChange={(e) => onUpdate({ kanal: e.target.value })}
          className="h-7 rounded-full px-3 bg-muted text-foreground border-0 font-medium cursor-pointer"
        >
          {kanaele.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <select
          value={t.kunde}
          onChange={(e) => onUpdate({ kunde: e.target.value })}
          className="h-7 rounded-full px-3 bg-muted text-foreground border-0 font-medium cursor-pointer"
        >
          {kunden.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ErfolgsState({
  anzahl,
  onZuAbos,
  onDashboard,
}: {
  anzahl: number;
  onZuAbos: () => void;
  onDashboard: () => void;
}) {
  return (
    <div className="min-h-[60vh] grid place-items-center relative overflow-hidden">
      <Konfetti />
      <div className="text-center relative z-10 max-w-md">
        <div className="mx-auto size-16 rounded-2xl bg-emerald-500 text-white grid place-items-center mb-5">
          <Check className="size-8" />
        </div>
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          Geschafft. {anzahl} Abos hinzugefügt.
        </h2>
        <p className="text-muted-foreground mt-2">
          Schau dir gleich an, was alles in deinem Tool-Stack steckt.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Button onClick={onZuAbos}>Zu meinen Abos</Button>
          <Button variant="outline" onClick={onDashboard}>
            Zum Dashboard
          </Button>
        </div>
        <div className="mt-6 inline-flex items-start gap-2 text-xs text-muted-foreground bg-card border border-border rounded-xl px-3 py-2 text-left">
          <Info className="size-3.5 mt-0.5 text-primary shrink-0" />
          <span>
            Tipp: Verbinde dein Beleg-Postfach, damit neue Rechnungen automatisch
            landen.
          </span>
        </div>
      </div>
    </div>
  );
}

function Konfetti() {
  const pieces = Array.from({ length: 60 });
  const colors = ["#6C5CE7", "#FF7A66", "#12B76A", "#F5A623", "#3B82F6"];
  return (
    <div className="pointer-events-none absolute inset-0">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.6;
        const duration = 1.6 + Math.random() * 1.4;
        const color = colors[i % colors.length];
        const size = 6 + Math.random() * 6;
        return (
          <span
            key={i}
            className="absolute top-[-20px] rounded-sm"
            style={{
              left: `${left}%`,
              width: size,
              height: size * 0.4,
              background: color,
              animation: `konfetti ${duration}s ease-out ${delay}s forwards`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes konfetti {
          to { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
