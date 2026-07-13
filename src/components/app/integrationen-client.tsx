"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plug, ExternalLink, Loader2, ShieldCheck, RefreshCw, Unplug, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WennSchreibbar } from "@/components/app/read-only-context";
import { PROVIDERS, CAPABILITY_LABEL, CAPABILITY_STIL, type AiProvider } from "@/lib/integrationen";
import { verbinden, trennen, jetztSynchronisieren, type IntegrationResult } from "@/app/app/einstellungen/integrationen/actions";

export type IntegrationInfo = {
  provider: string;
  label: string | null;
  guthaben: number | null;
  last_sync_at: string | null;
  last_status: string | null;
};

/** Betrag in der Waehrung des Anbieters (DataForSEO rechnet z. B. in USD). */
function fmtBetrag(wert: number, waehrung: "EUR" | "USD"): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: waehrung }).format(wert);
}

function fmtZeit(iso: string | null): string {
  if (!iso) return "noch nie";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} Uhr`;
}

export function IntegrationenClient({ verbunden }: { verbunden: IntegrationInfo[] }) {
  const byProvider = new Map(verbunden.map((v) => [v.provider, v]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Integrationen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Verbinde verbrauchsbasierte Dienste, damit Toolfolio Guthaben und Kosten automatisch mitschreibt.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-success/25 bg-success/5 p-3 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
        <span>
          Zugangsdaten werden <strong>verschlüsselt</strong> gespeichert, nie angezeigt und ausschliesslich serverseitig für
          <strong> lesende</strong> Abfragen genutzt. Du kannst die Verbindung jederzeit trennen, dann werden sie hart gelöscht.
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {PROVIDERS.map((p) => (
          <ProviderKarte key={p.id} p={p} info={byProvider.get(p.id)} />
        ))}
      </div>
    </div>
  );
}

function ProviderKarte({ p, info }: { p: AiProvider; info?: IntegrationInfo }) {
  const [open, setOpen] = useState(false);
  const [seq, setSeq] = useState(0);
  const [pending, start] = useTransition();
  const istVerbunden = !!info;

  function sync() {
    start(async () => {
      const r = await jetztSynchronisieren(p.id);
      if (r.error) toast.error(r.error);
      else toast.success("Verbrauch aktualisiert.");
    });
  }
  function disconnect() {
    start(async () => {
      const r = await trennen(p.id);
      if (r.error) toast.error(r.error);
      else toast.success("Verbindung getrennt, Zugangsdaten gelöscht.");
    });
  }

  const fehler = info?.last_status && info.last_status !== "ok" ? info.last_status : null;

  return (
    <div className="flex flex-col rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl font-display text-sm font-bold text-white" style={{ backgroundColor: p.farbe }}>
          {p.name.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="font-display text-lg font-semibold">{p.name}</div>
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", CAPABILITY_STIL[p.capability])}>
              {CAPABILITY_LABEL[p.capability]}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{p.beschreibung}</p>
        </div>
      </div>

      {istVerbunden ? (
        <div className="mt-4 space-y-2 rounded-xl bg-secondary/40 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-medium text-success">
              <CheckCircle2 className="size-4" /> Verbunden
            </span>
            <span className="text-xs text-muted-foreground">{info!.label}</span>
          </div>
          {info!.guthaben !== null && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Restguthaben</span>
              <span className="font-semibold tabular-nums">{fmtBetrag(info!.guthaben, p.waehrung)}</span>
            </div>
          )}
          {p.waehrung !== "EUR" && (
            <div className="text-[11px] text-muted-foreground">
              Anbieter rechnet in {p.waehrung}. Der Verbrauch wird mit deinem hinterlegten Kurs in Euro verbucht.
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Zuletzt synchronisiert</span>
            <span className="tabular-nums">{fmtZeit(info!.last_sync_at)}</span>
          </div>
          {fehler && (
            <div className="flex items-start gap-1.5 rounded-lg bg-coral/10 p-2 text-xs text-coral">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" /> {fehler}
            </div>
          )}
        </div>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground">Noch nicht verbunden.</p>
      )}

      <WennSchreibbar>
        <div className="mt-4 flex flex-wrap gap-2">
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setSeq((s) => s + 1); }}>
            <DialogTrigger asChild>
              <Button variant={istVerbunden ? "outline" : "default"} className="gap-1.5">
                <Plug className="size-4" /> {istVerbunden ? "Zugangsdaten ersetzen" : "Verbinden"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <VerbindenForm key={seq} p={p} onFertig={() => setOpen(false)} />
            </DialogContent>
          </Dialog>

          {istVerbunden && (
            <>
              <Button variant="outline" className="gap-1.5" disabled={pending} onClick={sync}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Jetzt synchronisieren
              </Button>
              <Button variant="ghost" className="gap-1.5 text-muted-foreground hover:text-destructive" disabled={pending} onClick={disconnect}>
                <Unplug className="size-4" /> Trennen
              </Button>
            </>
          )}
        </div>
      </WennSchreibbar>
    </div>
  );
}

function VerbindenForm({ p, onFertig }: { p: AiProvider; onFertig: () => void }) {
  const [state, action, pending] = useActionState(verbinden, {} as IntegrationResult);

  useEffect(() => {
    if (state.ok) {
      toast.success(state.hinweis ?? "Verbunden.");
      onFertig();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, onFertig]);

  return (
    <form action={action}>
      <input type="hidden" name="provider" value={p.id} />
      <DialogHeader>
        <DialogTitle>{p.name} verbinden</DialogTitle>
        <DialogDescription>
          Wir prüfen die Zugangsdaten direkt beim Anbieter und speichern sie danach verschlüsselt.
        </DialogDescription>
      </DialogHeader>

      {p.warnung && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-foreground/80">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
          <span>{p.warnung}</span>
        </div>
      )}

      <a
        href={p.keyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        Zugangsdaten bei {p.name} holen <ExternalLink className="size-3.5" />
      </a>

      <div className="mt-4 grid gap-4">
        {p.felder.map((f) => (
          <div key={f.key}>
            <Label htmlFor={f.key}>{f.label}</Label>
            <Input
              id={f.key}
              name={f.key}
              type={f.typ === "password" ? "password" : "text"}
              placeholder={f.placeholder}
              autoComplete="off"
              required
              className="mt-1"
            />
          </div>
        ))}

        {p.waehrung !== "EUR" && (
          <div>
            <Label htmlFor="kurs">Umrechnungskurs (1 {p.waehrung} = ? EUR)</Label>
            <Input id="kurs" name="kurs" inputMode="decimal" defaultValue="0,92" required className="mt-1 w-32 tabular-nums" />
            <div className="mt-1 text-xs text-muted-foreground">
              {p.name} rechnet in {p.waehrung}. Damit Kosten und Budget in Euro stimmen, verbuchen wir den Verbrauch mit
              diesem Kurs. Du kannst ihn jederzeit anpassen, indem du die Zugangsdaten erneut speicherst.
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={pending} className="gap-2">
          {pending && <Loader2 className="size-4 animate-spin" />} Verbindung testen und speichern
        </Button>
      </div>
    </form>
  );
}
