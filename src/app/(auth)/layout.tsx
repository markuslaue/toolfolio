import Link from "next/link";
import type { ReactNode } from "react";
import { Sparkles, ShieldCheck, TrendingDown, Wallet } from "lucide-react";

/** Auth-Huelle (S-Templates): Split-Layout, Markenpanel plus Formularspalte. 1:1 nach Lovable. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        {/* Markenpanel */}
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary to-[#5b4dd1] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="grid size-9 place-content-center rounded-xl bg-white/15 backdrop-blur-sm">
                <Sparkles className="size-5" />
              </span>
              <span className="font-display text-2xl font-semibold tracking-tight">
                Toolfolio
              </span>
            </Link>

            <div className="mt-16 max-w-md">
              <h1 className="font-display text-4xl font-semibold leading-tight">
                Alle deine Software-Abos im Griff. Und du zahlst weniger.
              </h1>
              <p className="mt-4 text-base text-white/80">
                Behalte Kosten, Vertraege und Fristen aller Tools deiner Agentur an
                einem ruhigen Ort im Blick.
              </p>
            </div>
          </div>

          {/* Mock-Dashboard-Andeutung */}
          <div className="relative z-10 mt-10">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-lift backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>Dein Cockpit</span>
                <span>Juni 2026</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <MiniStat icon={<Wallet className="size-4" />} label="Abos" value="42" />
                <MiniStat
                  icon={<TrendingDown className="size-4" />}
                  label="Gespart"
                  value="1.284 EUR"
                />
                <MiniStat icon={<ShieldCheck className="size-4" />} label="Fristen" value="3" />
              </div>
              <div className="mt-4 h-24 rounded-xl bg-gradient-to-tr from-white/15 to-white/5">
                <svg viewBox="0 0 200 80" className="h-full w-full">
                  <polyline
                    fill="none"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="2"
                    points="0,60 25,52 50,55 75,40 100,44 125,30 150,35 175,22 200,18"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* dezente Verzierung */}
          <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-coral/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-white/10 blur-3xl" />
        </aside>

        {/* Formularspalte */}
        <main className="flex flex-col">
          <header className="flex items-center justify-between border-b border-border/60 px-6 py-4 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="grid size-8 place-content-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </span>
              <span className="font-display text-lg font-semibold">Toolfolio</span>
            </Link>
          </header>

          <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
            <div className="w-full max-w-md">{children}</div>
          </div>

          <footer className="border-t border-border/60 px-6 py-4 text-center text-xs text-muted-foreground">
            <Link href="/datenschutz" className="hover:text-foreground">
              Datenschutz
            </Link>
            <span className="mx-2">·</span>
            <Link href="/agb" className="hover:text-foreground">
              AGB
            </Link>
            <span className="mx-2">·</span>
            <Link href="/impressum" className="hover:text-foreground">
              Impressum
            </Link>
          </footer>
        </main>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/10 p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-white/70">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 font-display text-lg font-semibold">{value}</div>
    </div>
  );
}
