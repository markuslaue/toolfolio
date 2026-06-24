import { useState } from "react";
import {
  Plug,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Mail,
  Landmark,
  Globe,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiProviders, capabilityBadge, type AiProvider } from "@/lib/ai-providers";
import { ConnectAiServiceModal, type ConnectionResult } from "./connect-ai-service-modal";

interface Connection {
  status: "connected";
  lastSyncedAt: string;
  periodSpend?: number;
}

export function Integrationen() {
  const [active, setActive] = useState<AiProvider | null>(null);
  const [open, setOpen] = useState(false);
  const [verbindungen, setVerbindungen] = useState<Record<string, Connection>>({
    openai: { status: "connected", lastSyncedAt: "vor 12 Min.", periodSpend: 184 },
    anthropic: { status: "connected", lastSyncedAt: "vor 8 Min.", periodSpend: 312 },
  });

  const openFor = (p: AiProvider) => {
    setActive(p);
    setOpen(true);
  };

  const onConnected = (id: string, r: ConnectionResult) => {
    if (r.status !== "connected") return;
    setVerbindungen((v) => ({
      ...v,
      [id]: {
        status: "connected",
        lastSyncedAt: "gerade eben",
        periodSpend: r.usagePreview?.periodSpend,
      },
    }));
  };

  const trennen = (id: string) => {
    setVerbindungen((v) => {
      const next = { ...v };
      delete next[id];
      return next;
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Integrationen</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Verbinde deine Datenquellen, damit Toolfolio Abos, Belege und Verbrauch automatisch erfasst.
          Du behaeltst jederzeit die volle Kontrolle.
        </p>
      </header>

      {/* Basis-Integrationen (Stubs) */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Basis</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <StubCard icon={Globe} title="Google Workspace" hint="OAuth-Discovery deiner Tools" />
          <StubCard icon={Landmark} title="Bank-Anbindung" hint="Kontoauszuege automatisch lesen" />
          <StubCard icon={Mail} title="Beleg-Postfach" hint="E-Mails sortieren Rechnungen ein" />
        </div>
      </section>

      {/* AI-Services */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-display text-lg font-semibold">AI-Services / API-Verbrauch</h2>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Hinterlege je Anbieter einen API-Key, damit Toolfolio den echten Token- und Credit-Verbrauch
              live ausliest, statt ihn aus Rechnungen zu schaetzen.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {aiProviders.map((p) => {
            const v = verbindungen[p.id];
            const badge = capabilityBadge(p.usageCapability);
            return (
              <div
                key={p.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="size-11 rounded-xl grid place-items-center font-display font-bold text-white shrink-0"
                    style={{ background: p.farbe }}
                  >
                    {p.initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-display text-base font-semibold truncate">{p.name}</div>
                      {v && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                          <CheckCircle2 className="size-3" /> Verbunden
                        </span>
                      )}
                    </div>
                    <span
                      className="mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: badge.bg, color: badge.text }}
                    >
                      {p.usageLabel}
                    </span>
                  </div>
                </div>

                {v ? (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Letzter Sync: {v.lastSyncedAt}</div>
                    {v.periodSpend !== undefined && (
                      <div>
                        Aktueller Periodenverbrauch:{" "}
                        <span className="font-semibold text-foreground tabular-nums">
                          {v.periodSpend} EUR
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Noch nicht verbunden. Kein Live-Verbrauch verfuegbar.
                  </p>
                )}

                <div className="mt-auto flex items-center gap-2">
                  {v ? (
                    <>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => openFor(p)}>
                        <RefreshCw className="size-3.5" /> Key aktualisieren
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-700 hover:bg-rose-500/10"
                        onClick={() => trennen(p.id)}
                      >
                        <Trash2 className="size-3.5" /> Trennen
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" className="w-full" onClick={() => openFor(p)}>
                      <Plug className="size-3.5" /> Verbinden
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground">
          Hinweis: Fuer Anbieter ohne Verbrauchs-API (spend_only) ist kein Key noetig. Kosten kommen
          weiterhin ueber Rechnung oder Kontoauszug.
        </p>
      </section>

      <ConnectAiServiceModal
        provider={active}
        open={open}
        onOpenChange={setOpen}
        onConnected={onConnected}
      />
    </div>
  );
}

function StubCard({
  icon: Icon,
  title,
  hint,
}: {
  icon: typeof Mail;
  title: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex items-start gap-3">
      <div className="size-10 rounded-xl bg-muted grid place-items-center text-muted-foreground shrink-0">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-display text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>
      </div>
      <Button size="sm" variant="outline">
        <Sparkles className="size-3.5" /> Verbinden
      </Button>
    </div>
  );
}
