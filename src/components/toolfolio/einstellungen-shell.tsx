import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  User,
  Building,
  Bell,
  CreditCard,
  Users as UsersIcon,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { label: string; to: string; icon: LucideIcon };

const items: Item[] = [
  { label: "Profil", to: "/einstellungen", icon: User },
  { label: "Unternehmen", to: "/einstellungen/unternehmen", icon: Building },
  { label: "Benachrichtigungen", to: "/einstellungen/benachrichtigungen", icon: Bell },
  { label: "Plan & Abrechnung", to: "/einstellungen/plan", icon: CreditCard },
  { label: "Team & Rollen", to: "/einstellungen/team", icon: UsersIcon },
  { label: "Daten & Datenschutz", to: "/einstellungen/daten", icon: ShieldAlert },
];

export function EinstellungenShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Einstellungen
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Verwalte dein Profil, dein Unternehmen und deinen Plan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Mobile: scrollable pills */}
        <nav className="lg:hidden -mx-4 px-4 overflow-x-auto">
          <div className="flex gap-2 pb-2 w-max">
            {items.map((item) => {
              const active =
                item.to === "/einstellungen"
                  ? pathname === "/einstellungen"
                  : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to as "/einstellungen"}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border whitespace-nowrap transition-colors",
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Desktop: vertical list */}
        <aside className="hidden lg:block">
          <nav className="sticky top-20 space-y-1">
            {items.map((item) => {
              const active =
                item.to === "/einstellungen"
                  ? pathname === "/einstellungen"
                  : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to as "/einstellungen"}
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

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function EinstellungenPlaceholder({ titel }: { titel: string }) {
  return (
    <div className="rounded-[20px] border bg-card p-10 text-center shadow-soft">
      <h2 className="font-display text-2xl font-semibold">{titel}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Dieser Bereich folgt in Kürze. Wir arbeiten daran.
      </p>
    </div>
  );
}
