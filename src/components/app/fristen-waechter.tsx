"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  TimerReset,
  Bell,
  CreditCard,
  Check,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ART_LABEL,
  DRINGLICHKEIT_LABEL,
  dringlichkeit,
  tageBis,
  type Frist,
  type FristArt,
  type Dringlichkeit,
} from "@/lib/fristen";
import { quittiereFrist } from "@/app/app/fristen/actions";

function fmtDate(v: string): string {
  const [y, m, d] = v.split("-");
  return d ? `${d}.${m}.${y}` : v;
}

function ArtIcon({ art }: { art: FristArt }) {
  if (art === "trial") return <TimerReset className="size-4" />;
  if (art === "karte") return <CreditCard className="size-4" />;
  return <Bell className="size-4" />;
}

function tageText(iso: string): string {
  const d = tageBis(iso);
  if (d < 0) return `vor ${Math.abs(d)} ${Math.abs(d) === 1 ? "Tag" : "Tagen"}`;
  if (d === 0) return "heute";
  if (d === 1) return "morgen";
  return `in ${d} Tagen`;
}

const GRUPPEN: Dringlichkeit[] = ["ueberfaellig", "sehrbald", "bald", "weiter"];

const GRUPPE_STYLE: Record<Dringlichkeit, string> = {
  ueberfaellig: "text-destructive",
  sehrbald: "text-warning",
  bald: "text-foreground",
  weiter: "text-muted-foreground",
};

export function FristenWaechter({ fristen }: { fristen: Frist[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function erledigen(f: Frist) {
    setBusy(f.key);
    const res = await quittiereFrist({
      quelle: f.quelle,
      quelle_id: f.quelle_id,
      art: f.art,
      datum: f.datum,
      status: "erledigt",
    });
    setBusy(null);
    if (res.error) return toast.error(res.error);
    toast.success("Frist erledigt");
    router.refresh();
  }

  const dringend = fristen.filter((f) => {
    const u = dringlichkeit(f.datum);
    return u === "ueberfaellig" || u === "sehrbald";
  }).length;

  const gruppiert = GRUPPEN.map((g) => ({
    gruppe: g,
    items: fristen.filter((f) => dringlichkeit(f.datum) === g),
  })).filter((x) => x.items.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Fristen-Wächter
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kündigungsfristen, Trial-Enden und ablaufende Karten an einem Ort.
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
        <div className="rounded-[20px] border bg-card p-5 shadow-soft">
          <div className="text-sm text-muted-foreground">Offene Fristen</div>
          <div className="mt-2 font-display text-2xl font-bold tabular-nums">{fristen.length}</div>
        </div>
        <div className="rounded-[20px] border bg-card p-5 shadow-soft">
          <div className="text-sm text-muted-foreground">Davon dringend</div>
          <div className="mt-2 font-display text-2xl font-bold tabular-nums">{dringend}</div>
        </div>
      </div>

      {fristen.length === 0 ? (
        <div className="rounded-[20px] border border-dashed bg-card p-12 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-success/10 text-success">
            <ShieldCheck className="size-6" />
          </span>
          <h2 className="mt-4 font-display text-lg font-semibold">Alles im grünen Bereich</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Keine offenen Fristen. Hinterlege bei deinen Abos Kündigungsfristen und
            Trial-Enden, dann wachen wir hier für dich.
          </p>
        </div>
      ) : (
        <div className="space-y-7">
          {gruppiert.map(({ gruppe, items }) => (
            <section key={gruppe}>
              <h2 className={`mb-3 text-xs font-semibold uppercase tracking-wide ${GRUPPE_STYLE[gruppe]}`}>
                {DRINGLICHKEIT_LABEL[gruppe]} · {items.length}
              </h2>
              <ul className="space-y-2.5">
                {items.map((f) => {
                  const href = f.quelle === "abo" ? `/app/abos/${f.quelle_id}` : "/app/zahlungskanaele";
                  return (
                    <li
                      key={f.key}
                      className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-soft sm:flex-row sm:items-center"
                    >
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-lg ${
                          gruppe === "ueberfaellig"
                            ? "bg-destructive/10 text-destructive"
                            : gruppe === "sehrbald"
                              ? "bg-warning/15 text-warning"
                              : "bg-primary/10 text-primary"
                        }`}
                      >
                        <ArtIcon art={f.art} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{f.titel}</span>
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                            {ART_LABEL[f.art]}
                          </span>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {fmtDate(f.datum)} · {tageText(f.datum)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{f.konsequenz}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          disabled={busy === f.key}
                          onClick={() => erledigen(f)}
                        >
                          <Check className="size-4" /> Erledigt
                        </Button>
                        <Button asChild variant="ghost" size="sm" className="gap-1.5">
                          <Link href={href}>
                            Öffnen <ArrowRight className="size-4" />
                          </Link>
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
