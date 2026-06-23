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
  PiggyBank,
  Bell,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AboFormPanel } from "./abo-form-panel";

const navItems = [
  { label: "Übersicht", icon: LayoutDashboard, to: "/" },
  { label: "Abos", icon: Layers, to: "/abos" },
  { label: "Kunden", icon: Users, to: "/kunden" },
  { label: "Zahlungskanäle", icon: CreditCard, to: "/zahlungskanaele" },
  { label: "Sparvorschläge", icon: PiggyBank, to: "/sparvorschlaege" },
  { label: "Benachrichtigungen", icon: Bell, to: "/benachrichtigungen" },
  { label: "Verzeichnis", icon: BookOpen, to: "/verzeichnis" },
  { label: "Berichte", icon: BarChart3, to: "/berichte" },
  { label: "Einstellungen", icon: Settings, to: "/einstellungen" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

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
          <TopBar onMenu={() => setMobileOpen(true)} onAdd={() => setAddOpen(true)} />
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
      <AboFormPanel open={addOpen} onOpenChange={setAddOpen} mode="anlegen" />
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
            <Link
              key={item.label}
              to={item.to as "/"}
              activeOptions={{ exact: item.to === "/" }}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-accent-foreground"
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
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

function TopBar({ onMenu, onAdd }: { onMenu: () => void; onAdd: () => void }) {
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
          <div className="font-display text-lg sm:text-xl font-semibold truncate tracking-tight">
            Moin, Markus 👋
          </div>
          <div className="hidden sm:block text-xs text-muted-foreground">
            Dein Tool-Stack ist gut im Griff.
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
          <Link
            to="/benachrichtigungen"
            aria-label="Alle Benachrichtigungen ansehen"
            className="relative inline-flex items-center justify-center size-9 rounded-md border border-border hover:bg-accent text-foreground"
          >
            <Bell className="size-4" />
            <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              8
            </span>
          </Link>
          <Button size="sm" className="gap-1.5 hidden sm:inline-flex" onClick={onAdd}>
            <Plus className="size-4" /> Abo hinzufügen
          </Button>
          <Button size="sm" className="sm:hidden gap-1" aria-label="Abo hinzufügen" onClick={onAdd}>
            <Plus className="size-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1 px-2">
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/import">Kontoauszug importieren</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Zahlungskanal verbinden</DropdownMenuItem>
              <DropdownMenuItem>E-Mail-Postfach verbinden</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
