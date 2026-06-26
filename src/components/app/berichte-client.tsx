"use client";

import { Printer, Download, FileBarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatEur } from "@/lib/constants";

export type Position = {
  tool: string;
  kategorie: string;
  kosten: number;
  aufschlag: number;
  weiter: number;
  marge: number;
};
export type KundenReport = {
  kunde: string;
  farbe: string;
  positionen: Position[];
  summeKosten: number;
  summeWeiter: number;
  summeMarge: number;
};
type Unternehmen = { name: string | null; strasse: string | null; plz: string | null; ort: string | null; ust_id: string | null } | null;

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export function BerichteClient({
  reports,
  unternehmen,
  stand,
}: {
  reports: KundenReport[];
  unternehmen: Unternehmen;
  stand: string;
}) {
  const gesamtKosten = reports.reduce((s, r) => s + r.summeKosten, 0);
  const gesamtWeiter = reports.reduce((s, r) => s + r.summeWeiter, 0);
  const gesamtMarge = reports.reduce((s, r) => s + r.summeMarge, 0);

  function csv() {
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const kopf = ["Kunde", "Tool", "Kategorie", "Kosten/Monat", "Aufschlag %", "Weiterverrechnet/Monat", "Marge/Monat"];
    const lines: string[] = [kopf.map(esc).join(";")];
    for (const r of reports) {
      for (const p of r.positionen) {
        lines.push([r.kunde, p.tool, p.kategorie, eur(p.kosten), String(p.aufschlag).replace(".", ","), eur(p.weiter), eur(p.marge)].map((c) => esc(String(c))).join(";"));
      }
    }
    const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `weiterverrechnung-${stand}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Weiterverrechnungs-Report</h1>
          <p className="mt-1 text-sm text-muted-foreground">Weiterverrechenbare Toolkosten und Marge pro Kunde, monatlich.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={csv} disabled={reports.length === 0}><Download className="size-4" /> CSV</Button>
          <Button variant="outline" className="gap-2" onClick={() => window.print()} disabled={reports.length === 0}><Printer className="size-4" /> Drucken</Button>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-[20px] border border-dashed bg-card p-12 text-center print:hidden">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><FileBarChart className="size-6" /></span>
          <h2 className="mt-4 font-display text-lg font-semibold">Noch nichts weiterzuverrechnen</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Markiere Abos als „weiterverrechnen“, ordne sie einem Kunden zu und hinterlege einen Aufschlag. Dann erscheint hier dein Report.
          </p>
        </div>
      ) : (
        <div className="space-y-6 rounded-[20px] border bg-card p-6 shadow-soft print:border-0 print:shadow-none">
          {/* Kopf */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
            <div>
              <div className="font-display text-lg font-semibold">{unternehmen?.name ?? "Weiterverrechnungs-Report"}</div>
              {unternehmen?.strasse && <div className="text-sm text-muted-foreground">{unternehmen.strasse}</div>}
              {(unternehmen?.plz || unternehmen?.ort) && <div className="text-sm text-muted-foreground">{unternehmen?.plz} {unternehmen?.ort}</div>}
              {unternehmen?.ust_id && <div className="text-xs text-muted-foreground">USt-IdNr.: {unternehmen.ust_id}</div>}
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div className="font-medium text-foreground">Weiterverrechnungs-Report</div>
              <div>Stand: {fmtDate(stand)}</div>
              <div>Monatlich wiederkehrend</div>
            </div>
          </div>

          {/* Pro Kunde */}
          {reports.map((r) => (
            <section key={r.kunde} className="break-inside-avoid">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full" style={{ backgroundColor: r.farbe }} />
                <h2 className="font-display text-base font-semibold">{r.kunde}</h2>
              </div>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="py-2 pr-2 font-medium">Tool</th>
                      <th className="py-2 pr-2 font-medium">Kategorie</th>
                      <th className="py-2 pr-2 text-right font-medium">Kosten/Mo.</th>
                      <th className="py-2 pr-2 text-right font-medium">Aufschlag</th>
                      <th className="py-2 pr-2 text-right font-medium">Weiterverr./Mo.</th>
                      <th className="py-2 text-right font-medium">Marge/Mo.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.positionen.map((p) => (
                      <tr key={p.tool} className="border-b last:border-0">
                        <td className="py-2 pr-2 font-medium">{p.tool}</td>
                        <td className="py-2 pr-2 text-muted-foreground">{p.kategorie}</td>
                        <td className="py-2 pr-2 text-right tabular-nums">{formatEur(p.kosten)}</td>
                        <td className="py-2 pr-2 text-right tabular-nums text-muted-foreground">{p.aufschlag} %</td>
                        <td className="py-2 pr-2 text-right tabular-nums">{formatEur(p.weiter)}</td>
                        <td className="py-2 text-right tabular-nums text-success">{formatEur(p.marge)}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2">
                      <td className="py-2 pr-2 font-semibold" colSpan={2}>Summe {r.kunde}</td>
                      <td className="py-2 pr-2 text-right font-semibold tabular-nums">{formatEur(r.summeKosten)}</td>
                      <td className="py-2 pr-2" />
                      <td className="py-2 pr-2 text-right font-semibold tabular-nums">{formatEur(r.summeWeiter)}</td>
                      <td className="py-2 text-right font-semibold tabular-nums text-success">{formatEur(r.summeMarge)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          ))}

          {/* Gesamt */}
          <div className="flex flex-wrap items-center justify-end gap-x-8 gap-y-2 border-t-2 pt-4 text-sm">
            <div className="text-muted-foreground">Toolkosten gesamt: <span className="font-semibold tabular-nums text-foreground">{formatEur(gesamtKosten)}</span></div>
            <div className="text-muted-foreground">Weiterverrechnet gesamt: <span className="font-semibold tabular-nums text-foreground">{formatEur(gesamtWeiter)}</span></div>
            <div className="text-muted-foreground">Marge gesamt: <span className="font-semibold tabular-nums text-success">{formatEur(gesamtMarge)}</span></div>
          </div>
          <p className="text-xs text-muted-foreground">Monatlich wiederkehrende Werte, normalisiert (jährlich/quartalsweise umgerechnet). Beträge in EUR, ohne Gewähr.</p>
        </div>
      )}
    </div>
  );
}

function eur(n: number) {
  return n.toFixed(2).replace(".", ",");
}
