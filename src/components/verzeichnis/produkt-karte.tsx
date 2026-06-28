import Link from "next/link";
import { ArrowUpRight, BadgeCheck, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sterne } from "@/components/verzeichnis/sterne";
import { produktInitialen, type ProduktInZone } from "@/lib/verzeichnis";

function fmtStand(iso: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return d ? `${d}.${m}.${y}` : iso;
}

/** Produktkarte fuer Collection-/Cluster-Seiten. Zeigt Zone, Preis (mit Stand & Quelle) und Bewertung. */
export function ProduktKarte({
  p,
  bewertung,
  rang,
}: {
  p: ProduktInZone;
  bewertung?: { schnitt: number; anzahl: number };
  rang?: number;
}) {
  const gesponsert = p.zone === "gesponsert";
  return (
    <div
      className={cn(
        "relative flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-soft transition-colors sm:flex-row sm:items-start",
        gesponsert ? "border-coral/40 ring-1 ring-coral/20" : "border-border hover:border-primary/40",
      )}
    >
      {gesponsert && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-coral/15 px-2.5 py-1 text-[11px] font-semibold text-coral">
          Gesponsert
        </span>
      )}

      <div className="flex items-center gap-3 sm:w-56 sm:shrink-0">
        {typeof rang === "number" && (
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground tabular-nums">{rang}</span>
        )}
        <span className="grid size-12 shrink-0 place-items-center rounded-xl font-display text-base font-bold text-white" style={{ backgroundColor: p.farbe }}>
          {produktInitialen(p.name)}
        </span>
        <div className="min-w-0">
          <Link href={`/software/${p.slug}`} className="font-display text-lg font-semibold hover:text-primary">
            {p.name}
          </Link>
          {p.anbieter && <div className="truncate text-xs text-muted-foreground">{p.anbieter}</div>}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground/80">{p.kurzbeschreibung}</p>
        {p.features.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {p.features.slice(0, 4).map((f) => (
              <span key={f} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">{f}</span>
            ))}
          </div>
        )}
        {bewertung && bewertung.anzahl > 0 && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <Sterne wert={bewertung.schnitt} />
            <span className="font-medium tabular-nums">{bewertung.schnitt.toString().replace(".", ",")}</span>
            <span className="text-xs text-muted-foreground">({bewertung.anzahl})</span>
          </div>
        )}
      </div>

      <div className="sm:w-52 sm:shrink-0 sm:text-right">
        {p.preis_hinweis && (
          <div className="rounded-xl bg-secondary/50 p-3 text-left">
            <div className="text-sm font-medium">{p.preis_hinweis}</div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <BadgeCheck className="size-3" /> Listenpreis
              {p.preis_stand && <span>· Stand {fmtStand(p.preis_stand)}</span>}
            </div>
            {p.preis_quelle_url && (
              <a href={p.preis_quelle_url} target="_blank" rel="noopener noreferrer nofollow" className="mt-1 inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
                Quelle <ExternalLink className="size-3" />
              </a>
            )}
          </div>
        )}
        <Link href={`/software/${p.slug}`} className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-accent">
          Details <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
