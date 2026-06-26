"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConsent } from "./consent";

/**
 * Click-to-load fuer externe Einbettungen (z. B. YouTube). Laedt das iframe erst
 * nach Zustimmung (einmalig oder dauerhaft via Consent "Externe Medien").
 */
export function MediaEmbed({ src, title, host = "YouTube" }: { src: string; title: string; host?: string }) {
  const c = useConsent();
  const [einmal, setEinmal] = useState(false);
  const laden = c.medien || einmal;

  if (laden) {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl border" style={{ aspectRatio: "16 / 9" }}>
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-muted/40 p-8 text-center" style={{ aspectRatio: "16 / 9" }}>
      <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary"><Play className="size-6" /></span>
      <div className="text-sm font-medium">{title}</div>
      <p className="max-w-sm text-xs text-muted-foreground">
        Dieser Inhalt von {host} wird erst nach deiner Zustimmung geladen. Dabei können Daten an {host} übertragen werden.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button size="sm" onClick={() => setEinmal(true)}>Einmal laden</Button>
        <Button size="sm" variant="outline" onClick={() => c.setMedien(true)}>Immer erlauben</Button>
      </div>
    </div>
  );
}
