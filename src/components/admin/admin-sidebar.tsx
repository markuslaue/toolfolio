"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Users, Building2, Wrench, BarChart3 } from "lucide-react";
import { ToolfolioIcon } from "@/components/brand";
import { cn } from "@/lib/utils";

/**
 * Navigation des Admin-Backends. Bewusst kurz: was hier steht, ist Redaktions-
 * und Betriebsarbeit, nicht die Kundensicht.
 *
 * Punkte mit `bald` sind sichtbar, aber noch nicht gebaut. Ein toter Link ist
 * schlimmer als ein ehrlich gekennzeichneter Platzhalter (siehe /app/verzeichnis,
 * das monatelang eine 404 war, weil der Link vor der Seite da war).
 */
const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/verzeichnis", label: "Verzeichnis", icon: BookOpen },
  { href: "/admin/statistik", label: "Statistik", icon: BarChart3 },
  { href: "/admin/anbieter", label: "Anbieter", icon: Building2, bald: true },
  { href: "/admin/nutzer", label: "Nutzer", icon: Users, bald: true },
  { href: "/admin/betrieb", label: "Betrieb", icon: Wrench, bald: true },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r bg-background md:flex">
      <div className="flex h-14 items-center gap-2 px-5">
        <ToolfolioIcon className="size-6" />
        <span className="font-display text-sm font-semibold">Redaktion</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const aktiv = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          if (item.bald) {
            return (
              <span
                key={item.href}
                className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground/50"
                title="Noch nicht gebaut"
              >
                <item.icon className="size-4" />
                {item.label}
                <span className="ml-auto text-[10px] uppercase tracking-wide">bald</span>
              </span>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                aktiv ? "bg-foreground text-background" : "text-foreground/70 hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
