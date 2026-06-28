"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Star, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { bewertungEinreichen, type BewertenResult } from "@/app/(site)/verzeichnis/bewerten/actions";

export function BewertenForm({ toolSlug, toolName }: { toolSlug: string; toolName: string }) {
  const [sterne, setSterne] = useState(5);
  const [state, action, pending] = useActionState(bewertungEinreichen, {} as BewertenResult);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
        <CheckCircle2 className="mx-auto size-10 text-success" />
        <h2 className="mt-3 font-display text-xl font-semibold">Danke fuer deine Bewertung!</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Wir pruefen sie kurz und schalten sie dann frei. So halten wir das Verzeichnis sauber und ehrlich.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <input type="hidden" name="tool" value={toolSlug} />
      <input type="hidden" name="sterne" value={sterne} />

      <div className="mb-1 text-sm font-medium">Deine Bewertung fuer {toolName}</div>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button key={i} type="button" onClick={() => setSterne(i + 1)} aria-label={`${i + 1} Sterne`}>
            <Star className={cn("size-7 transition-colors", i < sterne ? "fill-[#F5A623] text-[#F5A623]" : "fill-muted text-muted hover:text-[#F5A623]/50")} />
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4">
        <div>
          <label className="text-sm font-medium" htmlFor="titel">Titel (optional)</label>
          <input id="titel" name="titel" maxLength={120} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="text">Deine Erfahrung</label>
          <textarea id="text" name="text" required minLength={10} maxLength={2000} rows={5} className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary" placeholder="Was gefaellt dir, was nicht? Wofuer nutzt du das Tool?" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium" htmlFor="autor_name">Name (optional)</label>
            <input id="autor_name" name="autor_name" maxLength={80} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="autor_email">E-Mail (optional, nicht oeffentlich)</label>
            <input id="autor_email" name="autor_email" type="email" className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
          </div>
        </div>
      </div>

      <button type="submit" disabled={pending} className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
        {pending && <Loader2 className="size-4 animate-spin" />} Bewertung absenden
      </button>
      <p className="mt-3 text-xs text-muted-foreground">
        Bewertungen werden vor der Veroeffentlichung geprueft. Nur Bewertungen direkt auf Toolfolio, keine fremden Quellen.
      </p>
    </form>
  );
}
