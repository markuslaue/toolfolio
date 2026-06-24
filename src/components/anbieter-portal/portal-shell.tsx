import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  Inbox,
  TrendingUp,
  Receipt,
  Menu,
  ChevronDown,
  LifeBuoy,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/anbieter-portal" as const, exact: true },
  { label: "Mein Listing", icon: FileText, to: "/anbieter-portal/listing" as const },
  { label: "Leads", icon: Inbox, to: "/anbieter-portal/leads" as const, badge: 2 },
  { label: "Platzierung", icon: TrendingUp, to: "/anbieter-portal/platzierung" as const },
  { label: "Abrechnung", icon: Receipt, to: "/anbieter-portal/abrechnung" as const },
];

export type AnbieterProfile = {
  name: string;
  initial: string;
  category: string;
  email: string;
};

export function AnbieterPortalShell({
  children,
  profile,
}: {
  children: ReactNode;
  profile: AnbieterProfile;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar min-h-screen sticky top-0">
          <SidebarContent profile={profile} pathname={pathname} />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-foreground/40"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute left-0 top-0 h-full w-72 bg-sidebar border-r border-border flex flex-col">
              <SidebarContent profile={profile} pathname={pathname} />
            </aside>
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar onMenu={() => setMobileOpen(true)} profile={profile} />
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({
  profile,
  pathname,
}: {
  profile: AnbieterProfile;
  pathname: string;
}) {
  return (
    <>
      <div className="px-5 py-5 border-b border-sidebar-border">
        <Link to="/anbieter-portal" className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-primary text-primary-foreground grid place-items-center font-display font-bold">
            {profile.initial}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              Anbieter-Portal
            </div>
            <div className="font-display text-base font-semibold tracking-tight truncate">
              {profile.name}
            </div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.to
            : pathname.startsWith(item.to);
          return (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge ? (
                <span className="inline-flex items-center justify-center rounded-full bg-coral text-coral-foreground text-[10px] font-semibold h-5 min-w-5 px-1.5">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="m-3 rounded-xl border border-sidebar-border bg-background/60 p-3 text-xs">
        <div className="font-semibold text-foreground">Anbieter-Support</div>
        <p className="mt-1 text-muted-foreground leading-relaxed">
          Fragen zu Listing oder Platzierung? Wir helfen dir.
        </p>
        <Link
          to="/kontakt"
          className="mt-2 inline-flex items-center gap-1 text-primary font-medium hover:underline"
        >
          <LifeBuoy className="size-3.5" /> Kontakt aufnehmen
        </Link>
      </div>
    </>
  );
}

function TopBar({
  onMenu,
  profile,
}: {
  onMenu: () => void;
  profile: AnbieterProfile;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 h-16 max-w-[1400px] w-full mx-auto">
        <button
          onClick={onMenu}
          className="md:hidden inline-flex items-center justify-center size-9 rounded-md border border-border hover:bg-accent"
          aria-label="Menü öffnen"
        >
          <Menu className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            Anbieter-Portal
          </div>
          <div className="font-display text-base sm:text-lg font-semibold truncate">
            {profile.name}
          </div>
        </div>

        <Link
          to="/verzeichnis"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="size-3.5" /> Eintrag im Verzeichnis ansehen
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full border border-border bg-card pl-1 pr-3 py-1 hover:bg-accent cursor-pointer">
            <div className="size-7 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-semibold">
              {profile.initial}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold leading-tight">{profile.name}</div>
              <div className="text-[10px] text-muted-foreground leading-tight truncate max-w-[140px]">
                {profile.email}
              </div>
            </div>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Anbieter-Konto</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to="/anbieter-portal/listing">Listing bearbeiten</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/anbieter-portal/abrechnung">Abrechnung</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/kontakt">Hilfe & Support</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-muted-foreground">
              <LogOut className="size-3.5 mr-2" /> Abmelden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
