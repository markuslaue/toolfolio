"use client";

import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip as ReTooltip,
} from "recharts";
import {
  Wallet,
  TrendingUp,
  Layers,
  Bell,
  CalendarClock,
  AlertTriangle,
  Plus,
  ArrowRight,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatEur } from "@/lib/constants";
import { INTERVALL_LABEL, type Intervall } from "@/lib/abos";

type Kpis = {
  monatsKosten: number;
  jahresKosten: number;
  aktiv: number;
  trials: number;
  pausiert: number;
  gesamt: number;
};
type KatWert = { kategorie: string; wert: number; farbe: string };
type Naechste = {
  id: string;
  tool: string;
  initial: string | null;
  farbe: string;
  datum: string;
  kosten: number;
  waehrung: string;
  intervall: string;
};
type Aktion = { id: string; tool: string; typ: "frist" | "trial"; datum: string };

function fmtDate(v: string): string {
  const [y, m, d] = v.split("-");
  return d ? `${d}.${m}.${y}` : v;
}
function preis(kosten: number, waehrung: string): string {
  const wert = formatEur(kosten).replace("€", "").trim();
  return waehrung === "USD" ? `$${wert}` : `${wert} €`;
}

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof Wallet;
}) {
  return (
    <div className="rounded-[20px] border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-3 font-display text-2xl font-bold tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function Dashboard({
  kpis,
  kategorien,
  naechste,
  aktionen,
}: {
  kpis: Kpis;
  kategorien: KatWert[];
  naechste: Naechste[];
  aktionen: Aktion[];
}) {
  if (kpis.gesamt === 0) {
    return (
      <div className="rounded-[20px] border border-dashed bg-card p-12 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Receipt className="size-6" />
        </span>
        <h1 className="mt-4 font-display text-xl font-semibold">Willkommen bei Toolfolio</h1>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Lege dein erstes Abo an, dann erscheinen hier deine Gesamtkosten, Fristen und
          die Verteilung nach Kategorien.
        </p>
        <Button asChild className="mt-5 gap-2">
          <Link href="/app/abos">
            <Plus className="size-4" /> Erstes Abo anlegen
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Übersicht</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Deine Software-Kosten auf einen Blick.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Kosten pro Monat" value={formatEur(kpis.monatsKosten)} icon={Wallet} />
        <KpiCard
          label="Hochrechnung pro Jahr"
          value={formatEur(kpis.jahresKosten)}
          hint="linear auf 12 Monate"
          icon={TrendingUp}
        />
        <KpiCard
          label="Aktive Abos"
          value={String(kpis.aktiv)}
          hint={`${kpis.trials} Trials · ${kpis.pausiert} pausiert`}
          icon={Layers}
        />
        <KpiCard
          label="Fristen & Trials bald"
          value={String(aktionen.length)}
          hint="in den nächsten 30 Tagen"
          icon={Bell}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Kosten nach Kategorie */}
        <div className="rounded-[20px] border bg-card p-5 shadow-soft lg:col-span-2">
          <h2 className="font-display text-base font-semibold">Kosten nach Kategorie</h2>
          <p className="text-xs text-muted-foreground">monatlich, ohne archivierte/gekündigte</p>
          {kategorien.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Keine Daten.</p>
          ) : (
            <div className="mt-4" style={{ height: Math.max(160, kategorien.length * 44) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={kategorien}
                  layout="vertical"
                  margin={{ left: 8, right: 16, top: 0, bottom: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="kategorie"
                    width={110}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  />
                  <ReTooltip
                    cursor={{ fill: "var(--muted)" }}
                    formatter={(v) => [formatEur(Number(v)), "pro Monat"]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="wert" radius={[6, 6, 6, 6]} barSize={22}>
                    {kategorien.map((k) => (
                      <Cell key={k.kategorie} fill={k.farbe} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Aktions-Center */}
        <div className="rounded-[20px] border bg-card p-5 shadow-soft">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold">
            <AlertTriangle className="size-4 text-warning" /> Aktions-Center
          </h2>
          {aktionen.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Alles im grünen Bereich. Keine Fristen in den nächsten 30 Tagen.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {aktionen.slice(0, 6).map((a) => (
                <li key={`${a.id}-${a.typ}`}>
                  <Link
                    href={`/app/abos/${a.id}`}
                    className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/5 px-3 py-2.5 hover:bg-warning/10"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-warning/15 text-warning">
                      {a.typ === "trial" ? <CalendarClock className="size-4" /> : <Bell className="size-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{a.tool}</div>
                      <div className="text-xs text-muted-foreground">
                        {a.typ === "trial" ? "Trial endet" : "Kündigungsfrist"} am {fmtDate(a.datum)}
                      </div>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Naechste Abbuchungen */}
      <div className="rounded-[20px] border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">Nächste Abbuchungen</h2>
          <Link href="/app/abos" className="text-sm text-primary hover:underline">
            Alle Abos
          </Link>
        </div>
        {naechste.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Keine anstehenden Abbuchungen hinterlegt.
          </p>
        ) : (
          <ul className="mt-3 divide-y">
            {naechste.map((a) => (
              <li key={a.id}>
                <Link href={`/app/abos/${a.id}`} className="flex items-center gap-3 py-2.5 hover:opacity-80">
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-lg text-sm font-semibold text-white"
                    style={{ backgroundColor: a.farbe }}
                  >
                    {a.initial ?? a.tool[0]?.toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{a.tool}</div>
                    <div className="text-xs text-muted-foreground tabular-nums">{fmtDate(a.datum)}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-semibold tabular-nums">{preis(a.kosten, a.waehrung)}</div>
                    <div className="text-xs text-muted-foreground">
                      {INTERVALL_LABEL[a.intervall as Intervall] ?? a.intervall}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
