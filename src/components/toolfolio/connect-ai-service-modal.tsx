/**
 * ConnectAiServiceModal
 *
 * Wiederverwendbare Modal-Komponente fuer das Verbinden eines AI-Service per API-Key.
 * Wird im Onboarding (B-02) und in den Integrationen (B-24) genutzt.
 *
 * Sicherheits- und Backend-Kontrakt (verbindlich):
 * - Der API-Key liegt NIEMALS im localStorage, sessionStorage oder persistenten Frontend-State.
 *   Er existiert nur lokal im React-State und wird einmalig per HTTPS ans Backend gesendet.
 * - "Verbindung testen" ruft IMMER das Toolfolio-Backend auf, nie direkt die Provider-API
 *   (CORS-Bruch und Key-Leak).
 * - Erwartete Backend-Endpoints:
 *     POST   /api/integrations/ai/:providerId/connect   Body { apiKey }
 *            -> { status: "connected" | "invalid_key" | "no_permission", usagePreview? }
 *     GET    /api/integrations/ai                       -> Statusliste fuer die Kacheln
 *     GET    /api/integrations/ai/:providerId/usage     -> aktueller Verbrauch (wo unterstuetzt)
 *     DELETE /api/integrations/ai/:providerId           -> Verbindung trennen, Key loeschen
 * - Backend speichert den Key verschluesselt at rest, Anzeige nur maskiert (letzte 4 Zeichen).
 *
 * Dieses Template ist reine Frontend-Vorlage und simuliert den Backend-Call.
 */
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { capabilityBadge, type AiProvider } from "@/lib/ai-providers";

export interface ConnectionResult {
  status: "connected" | "invalid_key" | "no_permission";
  usagePreview?: { periodSpend: number; currency: "EUR" | "USD" };
}

interface Props {
  provider: AiProvider | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected?: (providerId: string, result: ConnectionResult) => void;
}

export function ConnectAiServiceModal({ provider, open, onOpenChange, onConnected }: Props) {
  const [key, setKey] = useState("");
  const [reveal, setReveal] = useState(false);
  const [state, setState] = useState<"idle" | "testing" | "ok" | "err">("idle");
  const [result, setResult] = useState<ConnectionResult | null>(null);

  useEffect(() => {
    if (open) {
      setKey("");
      setReveal(false);
      setState("idle");
      setResult(null);
    }
  }, [open, provider?.id]);

  const badge = useMemo(
    () => (provider ? capabilityBadge(provider.usageCapability) : null),
    [provider],
  );

  if (!provider) return null;

  const prefixOk = !provider.keyPrefix || key.startsWith(provider.keyPrefix);
  const canTest = key.trim().length >= 8 && state !== "testing";

  const handleTest = async () => {
    setState("testing");
    setResult(null);
    // Mock-Backend-Call. Im echten Setup: POST /api/integrations/ai/:providerId/connect
    await new Promise((r) => setTimeout(r, 1200));
    if (!prefixOk) {
      setState("err");
      setResult({ status: "invalid_key" });
      return;
    }
    const mock: ConnectionResult = {
      status: "connected",
      usagePreview: provider.usageCapability === "spend_only"
        ? undefined
        : { periodSpend: Math.round(40 + Math.random() * 280), currency: "EUR" },
    };
    setState("ok");
    setResult(mock);
    onConnected?.(provider.id, mock);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="size-11 rounded-xl grid place-items-center font-display font-bold text-white"
              style={{ background: provider.farbe }}
            >
              {provider.initial}
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="font-display text-lg">{provider.name} verbinden</DialogTitle>
              {badge && (
                <span
                  className="mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: badge.bg, color: badge.text }}
                >
                  {provider.usageLabel}
                </span>
              )}
            </div>
          </div>
          <DialogDescription className="sr-only">
            API-Key von {provider.name} hinterlegen und Verbindung testen.
          </DialogDescription>
        </DialogHeader>

        {provider.keyTypeWarning && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 flex gap-2">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <span>{provider.keyTypeWarning}</span>
          </div>
        )}

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-between gap-2"
            asChild
          >
            <a href={provider.setupUrl} target="_blank" rel="noopener noreferrer">
              <span>Key bei {provider.name} holen</span>
              <ExternalLink className="size-4" />
            </a>
          </Button>

          <ol className="space-y-1.5 text-sm text-muted-foreground list-decimal list-inside">
            {provider.instructions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ai-key" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {provider.keyType}
          </Label>
          <div className="relative">
            <Input
              id="ai-key"
              type={reveal ? "text" : "password"}
              autoComplete="off"
              spellCheck={false}
              placeholder={provider.keyPrefix ? `${provider.keyPrefix}...` : "Key einfuegen"}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="pr-10 font-mono"
              disabled={state === "ok"}
            />
            <button
              type="button"
              onClick={() => setReveal((r) => !r)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              aria-label={reveal ? "Key verbergen" : "Key anzeigen"}
            >
              {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {key && !prefixOk && (
            <p className="text-xs text-amber-700">
              Hinweis: erwarteter Praefix {provider.keyPrefix}. Pruefe, ob du den richtigen Key kopiert hast.
            </p>
          )}
        </div>

        {state === "ok" && result?.status === "connected" && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="font-semibold">Verbindung erfolgreich.</div>
              {result.usagePreview && (
                <div className="text-xs mt-0.5">
                  Aktueller Periodenverbrauch: {result.usagePreview.periodSpend} {result.usagePreview.currency}.
                </div>
              )}
            </div>
          </div>
        )}

        {state === "err" && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-800 flex items-start gap-2">
            <XCircle className="size-4 shrink-0 mt-0.5" />
            <div>Pruefe den Key. Er konnte beim Anbieter nicht verifiziert werden.</div>
          </div>
        )}

        <div className="rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground flex items-start gap-2">
          <ShieldCheck className="size-4 shrink-0 mt-0.5 text-emerald-700" />
          <span>{provider.securityNote}</span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {state === "ok" ? "Schliessen" : "Abbrechen"}
          </Button>
          {state !== "ok" && (
            <Button onClick={handleTest} disabled={!canTest}>
              {state === "testing" ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Pruefe ...
                </>
              ) : (
                "Verbindung testen"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
