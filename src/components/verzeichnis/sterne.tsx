import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Sterne-Anzeige fuer einen Wert 0..5 (halbe Sterne gerundet). */
export function Sterne({ wert, className }: { wert: number; className?: string }) {
  const voll = Math.round(wert);
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${wert} von 5 Sternen`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn("size-4", i < voll ? "fill-[#F5A623] text-[#F5A623]" : "fill-muted text-muted")} />
      ))}
    </span>
  );
}
