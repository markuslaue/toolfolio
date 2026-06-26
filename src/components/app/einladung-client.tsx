"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Check, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptInvite } from "@/app/app/einstellungen/team/actions";

export function EinladungClient({ token }: { token: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function annehmen() {
    setError(null);
    start(async () => {
      const r = await acceptInvite(token);
      if (r.error) setError(r.error);
      else {
        setDone(true);
        setTimeout(() => router.push("/app"), 900);
      }
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        {done ? <Check className="size-7" /> : error ? <X className="size-7 text-destructive" /> : <Users className="size-7" />}
      </span>
      {done ? (
        <>
          <h1 className="mt-6 font-display text-2xl font-semibold">Willkommen im Team</h1>
          <p className="mt-2 text-sm text-muted-foreground">Du wirst weitergeleitet …</p>
        </>
      ) : error ? (
        <>
          <h1 className="mt-6 font-display text-2xl font-semibold">Einladung nicht möglich</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{error}</p>
          <Button asChild variant="outline" className="mt-6"><Link href="/app">Zu meinem Konto</Link></Button>
        </>
      ) : (
        <>
          <h1 className="mt-6 font-display text-2xl font-semibold">Du wurdest eingeladen</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Tritt dem Toolfolio-Konto bei, um die Abos, Kosten und Fristen des Teams zu sehen.
          </p>
          <Button className="mt-6 gap-2" onClick={annehmen} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Einladung annehmen
          </Button>
        </>
      )}
    </div>
  );
}
