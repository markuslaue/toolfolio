"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Building,
  Bell,
  CreditCard,
  Users as UsersIcon,
  ShieldAlert,
  Plug,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { label: string; href: string; icon: LucideIcon };

const items: Item[] = [
  { label: "Profil", href: "/app/einstellungen", icon: User },
  { label: "Unternehmen", href: "/app/einstellungen/unternehmen", icon: Building },
  { label: "Benachrichtigungen", href: "/app/einstellungen/benachrichtigungen", icon: Bell },
  { label: "Integrationen", href: "/app/einstellungen/integrationen", icon: Plug },
  { label: "Plan & Abrechnung", href: "/app/einstellungen/plan", icon: CreditCard },
  { label: "Team & Rollen", href: "/app/einstellungen/team", icon: UsersIcon },
  { label: "Daten & Datenschutz", href: "/app/einstellungen/daten", icon: ShieldAlert },
];

function isActive(pathname: string, href: string) {
  return href === "/app/einstellungen"
    ? pathname === "/app/einstellungen"
    : pathname.startsWith(href);
}

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobil: horizontale Pills */}
      <nav className="-mx-4 overflow-x-auto px-4 lg:hidden">
        <div className="flex w-max gap-2 pb-2">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop: vertikale Liste */}
      <aside className="hidden lg:block">
        <nav className="sticky top-20 space-y-1">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
