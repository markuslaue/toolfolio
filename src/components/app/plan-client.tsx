"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Sparkles, Building2, UserCheck, ArrowRight, Loader2, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatEur, PLANS, YEARLY_DISCOUNT, type PlanId } from "@/lib/constants";
import { createCheckout, openPortal } from "@/app/app/einstellungen/plan/actions";

export type Billing = {
  plan: PlanId;
  subscription_status: string | null;
  plan_intervall: "month" | "year" | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  hat_kunde: boolean;
};

type Cadence = "monat" | "jahr";

const FEATURES: Record<PlanId, string[]> = {
  free: ["Bis 15 Abos im Tracker", "Übersichts-Dashboard", "Kontoauszug-Import", "Fristen-Wächter (Basis)", "Benchmark als Teaser", "1 Nutzer"],
  pro: ["Unbegrenzte Abos", "Beleg-Postfach & alle Erfassungswege", "AI-Credit-Tracker", "Voller Benchmark", "Sparvorschläge und Deals", "Steuer-Export", "1 Nutzer"],
  agentur: ["Alles aus Pro", "Kosten pro Kunde", "Weiterverrechnungs-Reports", "Team & Rollen", "Seats-Verwaltung", "Freigabe-Workflow", "Mehrere Nutzer"],
};

const META: Record<PlanId, { zielgruppe: string; icon: typeof Sparkles; featured: boolean }> = {
  free: { zielgruppe: "Für Solo und Einsteiger", icon: UserCheck, featured: false },
  pro: { zielgruppe: "Für Solopreneure und Freelancer", icon: Sparkles, featured: true },
  agentur: { zielgruppe: "Für Agenturen und Teams", icon: Building2, featured: false },
};

const STATUS_LABEL: Record<string, string> = {
  active: "Aktiv",
  trialing: "Testphase",
  past_due: "Zahlung ausstehend",
  canceled: "Gekündigt",
  incomplete: "Unvollständig",
  unpaid: "Offen",
};

function fmtDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

/** Monatsbetrag je Tarif und Abrechnungszyklus (mit Jahresrabatt). */
function betragProMonat(plan: PlanId, cadence: Cadence) {
  const m = PLANS[plan].monthlyEur;
  return cadence === "jahr" ? Math.round(m * (1 - YEARLY_DISCOUNT) * 100) / 100 : m;
}

export function PlanClient({ billing, status }: { billing: Billing; status?: string }) {
  const router = useRouter();
  const [cadence, setCadence] = useState<Cadence>(billing.plan_intervall === "year" ? "jahr" : "monat");
  const [pending, startTransition] = useTransition();
  const [busyKey, setBusyKey] = useState<string | null>(null);

  useEffect(() => {
    if (status === "erfolg") {
      toast.success("Danke! Dein Plan wird gleich aktiv. Das kann einen Moment dauern.");
      router.replace("/app/einstellungen/plan");
    } else if (status === "abbruch") {
      toast("Checkout abgebrochen, kein Plan geändert.");
      router.replace("/app/einstellungen/plan");
    }
  }, [status, router]);

  const hatAbo = Boolean(billing.subscription_status && billing.subscription_status !== "canceled");

  function go(res: Promise<{ url?: string; error?: string }>, key: string) {
    setBusyKey(key);
    startTransition(async () => {
      const r = await res;
      if (r.error || !r.url) {
        setBusyKey(null);
        toast.error(r.error ?? "Das hat nicht geklappt.");
        return;
      }
      window.location.href = r.url;
    });
  }

  const order: PlanId[] = ["free", "pro", "agentur"];

  return (
    <div className="space-y-6">
      {/* Aktueller Plan */}
      <section className="rounded-[20px] border bg-card p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="size-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Dein Plan</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Aktuell: <span className="font-semibold text-foreground">{PLANS[billing.plan].name}</span>
              {billing.subscription_status && (
                <> · {STATUS_LABEL[billing.subscription_status] ?? billing.subscription_status}</>
              )}
              {billing.plan_intervall && <> · {billing.plan_intervall === "year" ? "jährlich" : "monatlich"}</>}
            </p>
            {billing.current_period_end && (
              <p className="mt-1 text-xs text-muted-foreground">
                {billing.cancel_at_period_end
                  ? `Läuft aus am ${fmtDate(billing.current_period_end)}`
                  : `Verlängert sich am ${fmtDate(billing.current_period_end)}`}
              </p>
            )}
          </div>
          {billing.hat_kunde && (
            <Button variant="outline" className="gap-2" disabled={pending} onClick={() => go(openPortal(), "portal")}>
              {busyKey === "portal" ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
              Abrechnung verwalten
            </Button>
          )}
        </div>
        {billing.cancel_at_period_end && (
          <p className="mt-4 rounded-xl border border-coral/30 bg-coral/5 p-3 text-xs text-muted-foreground">
            Dein Abo ist gekündigt und endet zum Laufzeitende. Du kannst es im Kundenportal reaktivieren.
          </p>
        )}
      </section>

      {/* Toggle */}
      <div className="flex items-center justify-center gap-3 text-sm">
        <button onClick={() => setCadence("monat")} className={cn("rounded-full px-4 py-1.5 font-medium transition", cadence === "monat" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>
          Monatlich
        </button>
        <button onClick={() => setCadence("jahr")} className={cn("rounded-full px-4 py-1.5 font-medium transition", cadence === "jahr" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>
          Jährlich
          <span className="ml-1.5 rounded-full bg-success/15 px-2 py-0.5 text-xs text-success">−{Math.round(YEARLY_DISCOUNT * 100)} %</span>
        </button>
      </div>

      {/* Tarifkarten */}
      <div className="grid gap-5 md:grid-cols-3">
        {order.map((id) => {
          const meta = META[id];
          const Icon = meta.icon;
          const betrag = betragProMonat(id, cadence);
          const istAktuell = billing.plan === id && (id === "free" ? !hatAbo : hatAbo);
          const jahrSumme = Math.round(betrag * 12 * 100) / 100;

          let cta: { label: string; action?: () => void; variant: "primary" | "outline" | "ghost"; disabled?: boolean };
          if (istAktuell) {
            cta = { label: "Aktueller Plan", variant: "outline", disabled: true };
          } else if (id === "free") {
            cta = hatAbo
              ? { label: "Im Portal kündigen", variant: "ghost", action: () => go(openPortal(), "portal-free") }
              : { label: "Dein Plan", variant: "ghost", disabled: true };
          } else if (hatAbo) {
            cta = { label: "Plan wechseln", variant: meta.featured ? "primary" : "outline", action: () => go(openPortal(), `portal-${id}`) };
          } else {
            cta = { label: `${PLANS[id].name} starten`, variant: meta.featured ? "primary" : "outline", action: () => go(createCheckout(id as "pro" | "agentur", cadence === "jahr" ? "year" : "month"), `co-${id}`) };
          }

          const busy = busyKey === `co-${id}` || busyKey === `portal-${id}` || busyKey === "portal-free";

          return (
            <div key={id} className={cn("relative flex flex-col rounded-[20px] border bg-card p-6 shadow-soft", meta.featured && "ring-2 ring-primary")}>
              {meta.featured && (
                <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Beliebt</span>
              )}
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span>
                <div>
                  <div className="font-display text-base font-semibold">{PLANS[id].name}</div>
                  <div className="text-xs text-muted-foreground">{meta.zielgruppe}</div>
                </div>
              </div>
              <div className="mt-5">
                <span className="font-display text-3xl font-bold tabular-nums">{betrag === 0 ? "0 €" : formatEur(betrag)}</span>
                <span className="text-sm text-muted-foreground"> /Monat</span>
                {cadence === "jahr" && betrag > 0 && (
                  <div className="mt-1 text-xs text-muted-foreground">{formatEur(jahrSumme)} jährlich abgerechnet</div>
                )}
              </div>
              <ul className="mt-5 space-y-2 text-sm">
                {FEATURES[id].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={cn("mt-7 w-full gap-2", cta.variant === "ghost" && "bg-secondary text-foreground hover:bg-secondary/70")}
                variant={cta.variant === "primary" ? "default" : cta.variant === "outline" ? "outline" : "ghost"}
                disabled={cta.disabled || pending}
                onClick={cta.action}
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                {cta.label}
                {!cta.disabled && !busy && cta.variant !== "ghost" && <ArrowRight className="size-4" />}
              </Button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Preise zzgl. USt. Zahlung, Rechnung und Kündigung laufen sicher über Stripe. Wir speichern keine Kartendaten, nur Referenzen.
      </p>
    </div>
  );
}
