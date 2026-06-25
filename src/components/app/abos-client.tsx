"use client";

import { useState } from "react";
import { Plus, Receipt, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AboFormPanel } from "@/components/app/abo-form-panel";
import {
  INTERVALL_LABEL,
  STATUS_LABEL,
  STATUS_FARBEN,
  KATEGORIE_FARBEN,
  toolInitial,
  type Abo,
  type Intervall,
  type AboStatus,
} from "@/lib/abos";
import { formatEur } from "@/lib/constants";

function dezimal(v: string | null): string | null {
  if (!v) return null;
  const [y, m, d] = v.split("-");
  return d ? `${d}.${m}.${y}` : v;
}

function AboKarte({ abo, onClick }: { abo: Abo; onClick: () => void }) {
  const farbe = abo.farbe ?? KATEGORIE_FARBEN[abo.kategorie] ?? "#6C5CE7";
  const st = STATUS_FARBEN[abo.status as AboStatus] ?? STATUS_FARBEN.aktiv;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-[16px] border bg-card p-4 text-left shadow-soft transition-colors hover:border-primary/40"
    >
      <span
        className="grid size-11 shrink-0 place-items-center rounded-xl font-display text-base font-semibold text-white"
        style={{ backgroundColor: farbe }}
      >
        {abo.initial ?? toolInitial(abo.tool)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{abo.tool}</span>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{ backgroundColor: st.bg, color: st.text }}
          >
            <span className="size-1.5 rounded-full" style={{ backgroundColor: st.dot }} />
            {STATUS_LABEL[abo.status as AboStatus] ?? abo.status}
          </span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span>{abo.kategorie}</span>
          {abo.kunde && <span>· {abo.kunde}</span>}
          {abo.naechste_abbuchung && (
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="size-3" />
              {dezimal(abo.naechste_abbuchung)}
            </span>
          )}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="font-semibold tabular-nums">
          {abo.waehrung === "USD" ? "$" : ""}
          {formatEur(abo.kosten).replace("€", "").trim()}
          {abo.waehrung === "USD" ? "" : " €"}
        </div>
        <div className="text-xs text-muted-foreground">
          {INTERVALL_LABEL[abo.intervall as Intervall] ?? abo.intervall}
        </div>
      </div>
    </button>
  );
}

export function AbosClient({ abos }: { abos: Abo[] }) {
  const [open, setOpen] = useState(false);
  const [aktiv, setAktiv] = useState<Abo | null>(null);

  function neu() {
    setAktiv(null);
    setOpen(true);
  }
  function bearbeiten(a: Abo) {
    setAktiv(a);
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Abos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {abos.length > 0
              ? `${abos.length} ${abos.length === 1 ? "Abo" : "Abos"} erfasst.`
              : "Erfasse dein erstes Software-Abo."}
          </p>
        </div>
        <Button onClick={neu} className="gap-2">
          <Plus className="size-4" /> Abo hinzufügen
        </Button>
      </div>

      {abos.length === 0 ? (
        <div className="rounded-[20px] border border-dashed bg-card p-12 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Receipt className="size-6" />
          </span>
          <h2 className="mt-4 font-display text-lg font-semibold">
            Noch keine Abos
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Lege dein erstes Abo an, um Kosten, Fristen und Abbuchungen im Blick zu
            behalten.
          </p>
          <Button onClick={neu} className="mt-5 gap-2">
            <Plus className="size-4" /> Abo hinzufügen
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {abos.map((a) => (
            <AboKarte key={a.id} abo={a} onClick={() => bearbeiten(a)} />
          ))}
        </div>
      )}

      <AboFormPanel
        key={aktiv?.id ?? "neu"}
        open={open}
        onOpenChange={setOpen}
        abo={aktiv}
      />
    </div>
  );
}
