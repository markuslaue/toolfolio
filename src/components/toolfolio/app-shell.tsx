import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Layers,
  Users,
  CreditCard,
  BookOpen,
  BarChart3,
  Settings,
  Sparkles,
  Search,
  Plus,
  ChevronDown,
  Menu,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { label: "Übersicht", icon: LayoutDashboard, active: true },
  { label: "Abos", icon: Layers },
  { label: "Kunden", icon: Users },
  { label: "Zahlungskanäle", icon: CreditCard },
  { label: "Verzeichnis", icon: BookOpen },
  { label: "Berichte", icon: BarChart3 },
  { label: "Einstellungen", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        {/* Sidebar – Desktop */}
        <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-sidebar min-h-screen sticky top-0">
          <SidebarContent />
        </aside>

        {/* Sidebar – Mobile Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-foreground/30"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute left-0 top-0 h-full w-64 bg-sidebar border-r border-border flex flex-col">
              <SidebarContent />
            </aside>
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar onMenu={() => setMobileOpen(true)} />
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function SidebarContent() {
  return (
    <>
      <div className="px-5 py-5 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-display font-bold">
            T
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">Toolfolio</span>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              href="#"
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                item.active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </a>
          );
        })}
      </nav>
      <div className="m-3 rounded-lg border border-sidebar-border bg-background/50 p-3">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <Sparkles className="size-3.5 text-primary" /> Free Plan
        </div>
        <div className="mt-1 text-xs text-muted-foreground">12 von 15 Abos genutzt</div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary" style={{ width: "80%" }} />
        </div>
        <a href="#" className="mt-2 inline-block text-xs font-medium text-primary hover:underline">
          Auf Pro upgraden
        </a>
      </div>
    </>
  );
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 h-16 max-w-[1400px] w-full mx-auto">
        <button
          onClick={onMenu}
          className="md:hidden inline-flex items-center justify-center size-9 rounded-md border border-border hover:bg-accent"
          aria-label="Menü öffnen"
        >
          <Menu className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="font-display text-base sm:text-lg font-semibold truncate">
            Moin, Markus
          </div>
          <div className="hidden sm:block text-xs text-muted-foreground">
            Wir behalten deine Software für dich im Blick.
          </div>
        </div>

        <div className="hidden lg:flex relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Abo, Anbieter oder Kunde suchen"
            className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-1.5 hidden sm:inline-flex">
            <Plus className="size-4" /> Abo hinzufügen
          </Button>
          <Button size="sm" className="sm:hidden gap-1" aria-label="Abo hinzufügen">
            <Plus className="size-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1 px-2">
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>Kontoauszug importieren</DropdownMenuItem>
              <DropdownMenuItem>Zahlungskanal verbinden</DropdownMenuItem>
              <DropdownMenuItem>E-Mail-Postfach verbinden</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
