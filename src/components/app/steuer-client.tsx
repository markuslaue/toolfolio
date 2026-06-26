"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Info, Download, Calculator, Globe2, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatEur as euro } from "@/lib/constants";

export type AboPosten = { id: string; tool: string; anbieter: string; kategorie: string; kanal: string; kunde: string | null; betragMonat: number };
export type AiPosten = { id: string; tool: string; kategorie: string; jahr: number; monat: number; betrag: number };

type Granular = "jahr" | "quartal" | "monat";
type Format = "datev" | "csv";

const MONATE = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

function kontoDefault(kat: string, rahmen: "SKR04" | "SKR03"): string {
  const k = kat.toLowerCase();
  const s4 = k.includes("host") ? "6835" : k.includes("market") ? "6600" : k.includes("kommunik") ? "6805" : "6837";
  const s3 = k.includes("host") ? "4806" : k.includes("market") ? "4610" : k.includes("kommunik") ? "4920" : "4940";
  return rahmen === "SKR04" ? s4 : s3;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-3xl bg-card border border-border shadow-sm ${className}`}>{children}</div>;
}

export function SteuerClient({ aboPosten, aiPosten, jahr }: { aboPosten: AboPosten[]; aiPosten: AiPosten[]; jahr: number }) {
  const [granular, setGranular] = useState<Granular>("jahr");
  const [quartal, setQuartal] = useState(Math.floor(new Date().getMonth() / 3) + 1);
  const [monat, setMonat] = useState(new Date().getMonth() + 1);
  const [format, setFormat] = useState<Format>("datev");
  const [rahmen, setRahmen] = useState<"SKR04" | "SKR03">("SKR04");
  const [nurReverse, setNurReverse] = useState(false);

  const kategorien = useMemo(() => {
    const set = new Set<string>(aboPosten.map((a) => a.kategorie));
    if (aiPosten.length) set.add("AI");
    return [...set].sort();
  }, [aboPosten, aiPosten]);

  const anbieterListe = useMemo(() => {
    const set = new Set<string>(aboPosten.map((a) => a.anbieter));
    aiPosten.forEach((a) => set.add(a.tool));
    return [...set].sort();
  }, [aboPosten, aiPosten]);

  const [ustMapping, setUstMapping] = useState<Record<string, number>>({});
  const [reverseAnbieter, setReverseAnbieter] = useState<Record<string, boolean>>({});

  const ustVon = (kat: string) => ustMapping[kat] ?? 19;
  const istReverse = (anbieter: string) => reverseAnbieter[anbieter] ?? false;

  const zeitraumLabel = granular === "jahr" ? `Jahr ${jahr}` : granular === "quartal" ? `Q${quartal} ${jahr}` : `${MONATE[monat - 1]} ${jahr}`;
  const factor = granular === "jahr" ? 12 : granular === "quartal" ? 3 : 1;

  // Posten fuer den Zeitraum zusammenstellen
  const posten = useMemo(() => {
    const list: { id: string; tool: string; anbieter: string; kategorie: string; kanal: string; kunde: string | null; betrag: number }[] = [];
    for (const a of aboPosten) {
      list.push({ id: a.id, tool: a.tool, anbieter: a.anbieter, kategorie: a.kategorie, kanal: a.kanal, kunde: a.kunde, betrag: Math.round(a.betragMonat * factor * 100) / 100 });
    }
    // AI: echte Werte im Zeitraum summieren je Dienst
    const inPeriod = (r: AiPosten) => r.jahr === jahr && (granular === "jahr" || (granular === "quartal" ? Math.floor((r.monat - 1) / 3) + 1 === quartal : r.monat === monat));
    const aiSum = new Map<string, number>();
    for (const r of aiPosten) if (inPeriod(r)) aiSum.set(r.tool, (aiSum.get(r.tool) ?? 0) + r.betrag);
    for (const [tool, betrag] of aiSum) {
      list.push({ id: `ai-${tool}`, tool, anbieter: tool, kategorie: "AI", kanal: "", kunde: null, betrag: Math.round(betrag * 100) / 100 });
    }
    return list
      .map((p) => {
        const satz = ustVon(p.kategorie);
        const reverse = istReverse(p.anbieter);
        const netto = reverse ? p.betrag : Math.round((p.betrag / (1 + satz / 100)) * 100) / 100;
        const ust = reverse ? Math.round(p.betrag * (satz / 100) * 100) / 100 : Math.round((p.betrag - netto) * 100) / 100;
        const brutto = reverse ? p.betrag : p.betrag;
        return { ...p, satz, reverse, netto, ust, brutto, konto: kontoDefault(p.kategorie, rahmen) };
      })
      .filter((p) => p.betrag > 0 && (nurReverse ? p.reverse : true));
    // ustVon/istReverse lesen nur ustMapping/reverseAnbieter, die bereits in den Deps stehen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aboPosten, aiPosten, factor, jahr, granular, quartal, monat, ustMapping, reverseAnbieter, rahmen, nurReverse]);

  const bilanz = useMemo(() => {
    const netto = posten.reduce((s, p) => s + p.netto, 0);
    const ust = posten.filter((p) => !p.reverse).reduce((s, p) => s + p.ust, 0);
    const reverse = posten.filter((p) => p.reverse).reduce((s, p) => s + p.netto, 0);
    const brutto = posten.reduce((s, p) => s + p.brutto, 0);
    return { anzahl: posten.length, netto, ust, reverse, brutto };
  }, [posten]);

  function exportCsv() {
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const num = (n: number) => n.toFixed(2).replace(".", ",");
    const kopf = ["Belegzeitraum", "Bezeichnung", "Anbieter", "Kategorie", "Konto", "Netto", "USt-Satz", "USt-Betrag", "Brutto", "Reverse-Charge", "Zahlungskanal", "Kunde"];
    const lines = [kopf.map(esc).join(";")];
    for (const p of posten) {
      lines.push([zeitraumLabel, p.tool, p.anbieter, p.kategorie, format === "datev" ? p.konto : "", num(p.netto), `${p.satz}%`, num(p.ust), num(p.brutto), p.reverse ? "ja" : "nein", p.kanal, p.kunde ?? ""].map((c) => esc(String(c))).join(";"));
    }
    const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `steuer-export-${zeitraumLabel.replace(/\s/g, "-").toLowerCase()}-${format}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${format === "datev" ? "DATEV-kompatible" : "Einfache"} CSV erstellt`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Steuer-Export</h1>
        <p className="text-muted-foreground max-w-2xl">Softwarekosten kategorisiert für deinen Steuerberater, inklusive Reverse-Charge-Kennzeichnung.</p>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
        <Info className="size-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-amber-900">
          Entwurf, keine Steuerberatung. Beträge wiederkehrender Abos sind auf den Zeitraum hochgerechnet, AI-Kosten sind erfasste Istwerte. Das Reverse-Charge-Flag setzt du je Anbieter selbst, es ist kein verbindliches Urteil. Bitte mit deinem Steuerberater prüfen.
        </p>
      </div>

      {/* Builder */}
      <Card className="p-5">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Zeitraum</Label>
            <Select value={granular} onValueChange={(v) => setGranular(v as Granular)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="jahr">Jahr ({jahr})</SelectItem>
                <SelectItem value="quartal">Quartal</SelectItem>
                <SelectItem value="monat">Monat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {granular === "quartal" && (
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Quartal</Label>
              <Select value={String(quartal)} onValueChange={(v) => setQuartal(Number(v))}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{[1, 2, 3, 4].map((q) => <SelectItem key={q} value={String(q)}>Q{q}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          {granular === "monat" && (
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Monat</Label>
              <Select value={String(monat)} onValueChange={(v) => setMonat(Number(v))}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{MONATE.map((m, i) => <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as Format)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="datev">DATEV-kompatible CSV</SelectItem>
                <SelectItem value="csv">Einfache CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Kontenrahmen</Label>
            <Select value={rahmen} onValueChange={(v) => setRahmen(v as "SKR04" | "SKR03")}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SKR04">SKR04 (Standard)</SelectItem>
                <SelectItem value="SKR03">SKR03</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Optionen</Label>
            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background/60 px-3 py-1.5">
              <span className="text-sm">Nur Reverse-Charge</span>
              <Switch checked={nurReverse} onCheckedChange={setNurReverse} />
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={exportCsv} className="gap-2" disabled={posten.length === 0}><Download className="size-4" /> Jetzt exportieren ({zeitraumLabel})</Button>
        </div>
      </Card>

      {/* Bilanz */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Posten" value={String(bilanz.anzahl)} />
        <Kpi label="Netto gesamt" value={euro(bilanz.netto)} />
        <Kpi label="USt (inländisch)" value={euro(bilanz.ust)} />
        <Kpi label="Reverse-Charge (netto)" value={euro(bilanz.reverse)} tone="amber" />
      </div>

      {/* Mapping + Reverse-Charge */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-primary/10 text-primary grid place-items-center"><Calculator className="size-4" /></div>
            <div>
              <div className="font-display text-lg font-semibold">Konten-Mapping</div>
              <div className="text-xs text-muted-foreground">Kontenrahmen {rahmen}, USt-Satz je Kategorie.</div>
            </div>
          </div>
          <div className="mt-4 divide-y divide-border">
            {kategorien.length === 0 && <p className="py-3 text-sm text-muted-foreground">Noch keine Kategorien.</p>}
            {kategorien.map((kat) => (
              <div key={kat} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 flex-wrap">
                <div className="min-w-32 flex-1 text-sm font-medium">{kat}</div>
                <span className="w-16 text-sm tabular-nums text-muted-foreground">{kontoDefault(kat, rahmen)}</span>
                <Select value={String(ustVon(kat))} onValueChange={(v) => setUstMapping((m) => ({ ...m, [kat]: Number(v) }))}>
                  <SelectTrigger className="w-24 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="19">19 %</SelectItem>
                    <SelectItem value="7">7 %</SelectItem>
                    <SelectItem value="0">0 %</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-amber-100 text-amber-700 grid place-items-center"><Globe2 className="size-4" /></div>
            <div>
              <div className="font-display text-lg font-semibold">Reverse-Charge</div>
              <div className="text-xs text-muted-foreground">Markiere ausländische Anbieter (Steuerschuld bei dir).</div>
            </div>
          </div>
          <div className="mt-4 max-h-64 divide-y divide-border overflow-y-auto pr-1">
            {anbieterListe.length === 0 && <p className="py-3 text-sm text-muted-foreground">Noch keine Anbieter.</p>}
            {anbieterListe.map((an) => (
              <div key={an} className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
                <span className="text-sm font-medium">{an}</span>
                <Switch checked={istReverse(an)} onCheckedChange={(c) => setReverseAnbieter((m) => ({ ...m, [an]: c }))} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Posten-Tabelle */}
      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          <h2 className="font-display text-lg font-semibold">Posten ({zeitraumLabel})</h2>
        </div>
        {posten.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-6 text-sm text-muted-foreground">
            <AlertTriangle className="size-4" /> Keine Posten im gewählten Zeitraum.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-2 font-medium">Bezeichnung</th>
                  <th className="py-2 pr-2 font-medium">Kategorie</th>
                  <th className="py-2 pr-2 font-medium">Konto</th>
                  <th className="py-2 pr-2 text-right font-medium">Netto</th>
                  <th className="py-2 pr-2 text-right font-medium">USt</th>
                  <th className="py-2 pr-2 text-right font-medium">Brutto</th>
                  <th className="py-2 font-medium">RC</th>
                </tr>
              </thead>
              <tbody>
                {posten.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2 pr-2 font-medium">{p.tool}<div className="text-xs font-normal text-muted-foreground">{p.anbieter}</div></td>
                    <td className="py-2 pr-2 text-muted-foreground">{p.kategorie}</td>
                    <td className="py-2 pr-2 tabular-nums text-muted-foreground">{p.konto}</td>
                    <td className="py-2 pr-2 text-right tabular-nums">{euro(p.netto)}</td>
                    <td className="py-2 pr-2 text-right tabular-nums text-muted-foreground">{p.reverse ? "RC" : euro(p.ust)}</td>
                    <td className="py-2 pr-2 text-right tabular-nums">{euro(p.brutto)}</td>
                    <td className="py-2">{p.reverse && <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">ja</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "amber" }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className={`mt-2 font-display text-2xl font-semibold tracking-tight tabular-nums ${tone === "amber" ? "text-amber-700" : ""}`}>{value}</div>
    </div>
  );
}
