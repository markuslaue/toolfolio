import type { Metadata } from "next";
import { Mail, MapPin, MessageSquare } from "lucide-react";
import { KontaktForm } from "@/components/marketing/kontakt-form";

export const metadata: Metadata = {
  title: "Kontakt: So erreichst du Toolfolio",
  description:
    "Fragen, Feedback oder Interesse an einer Demo? Schreib uns. Toolfolio wird von der OMMM GmbH in Leipzig betrieben.",
};

export default function KontaktPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="max-w-2xl">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">Kontakt</div>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Schreib uns.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Ob Frage, Feedback oder Demo-Wunsch: Wir freuen uns, von dir zu hören, und antworten
          zügig.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[24px] border border-border bg-card p-6 shadow-soft sm:p-8">
          <KontaktForm />
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Mail className="size-5" />
            </span>
            <div>
              <div className="font-medium">E-Mail</div>
              <a href="mailto:hallo@toolfolio.de" className="text-sm text-primary hover:underline">
                hallo@toolfolio.de
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <MapPin className="size-5" />
            </span>
            <div>
              <div className="font-medium">OMMM GmbH</div>
              <div className="text-sm text-muted-foreground">Leipzig, Deutschland</div>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <MessageSquare className="size-5" />
            </span>
            <div>
              <div className="font-medium">Support</div>
              <div className="text-sm text-muted-foreground">
                Als angemeldeter Nutzer erreichst du uns direkt aus dem Tracker.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
