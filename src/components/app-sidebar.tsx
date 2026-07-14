"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  BellRing,
  Users,
  CreditCard,
  BookOpen,
  FileBarChart,
  FileSpreadsheet,
  FolderArchive,
  PiggyBank,
  Bell,
  Bot,
  LineChart,
  KeyRound,
  Armchair,
  ClipboardCheck,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { ToolfolioLogo } from "@/components/brand";
import { cn } from "@/lib/utils";

const items = [
  { href: "/app", label: "Übersicht", icon: LayoutDashboard },
  { href: "/app/abos", label: "Abos", icon: Receipt },
  { href: "/app/fristen", label: "Fristen", icon: BellRing },
  { href: "/app/benachrichtigungen", label: "Benachrichtigungen", icon: Bell },
  { href: "/app/sparen", label: "Sparvorschläge", icon: PiggyBank },
  { href: "/app/ai-credits", label: "AI-Credits", icon: Bot },
  { href: "/app/budget", label: "Budget & Forecast", icon: LineChart },
  { href: "/app/kunden", label: "Kunden", icon: Users },
  { href: "/app/zugaenge", label: "Team & Zugänge", icon: KeyRound },
  { href: "/app/seats", label: "Seats & Lizenzen", icon: Armchair },
  { href: "/app/freigaben", label: "Freigaben", icon: ClipboardCheck },
  { href: "/app/zahlungskanaele", label: "Zahlungskanäle", icon: CreditCard },
  { href: "/app/verzeichnis", label: "Verzeichnis", icon: BookOpen },
  { href: "/app/berichte", label: "Berichte", icon: FileBarChart },
  { href: "/app/archiv", label: "Archiv", icon: FolderArchive },
  { href: "/app/steuer", label: "Steuer-Export", icon: FileSpreadsheet },
  { href: "/app/einstellungen", label: "Einstellungen", icon: Settings },
];

export function AppSidebar({ istStaff = false }: { istStaff?: boolean }) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-card md:flex">
      <div className="flex h-16 items-center px-5">
        <Link href="/app" aria-label="Zur Uebersicht">
          <ToolfolioLogo />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const active =
            item.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[12px] px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        {/* Admin-Backend. Nur fuer Inhaber-/Redaktionskonten (is_staff), und bewusst
            abgesetzt: das ist eine andere Welt als der Tracker. */}
        {istStaff && (
          <>
            <div className="my-3 border-t" />
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-foreground text-background"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground",
              )}
            >
              <ShieldCheck className="size-4" />
              Admin-Dashboard
            </Link>
          </>
        )}
      </nav>
      <div className="border-t p-4 text-xs text-muted-foreground">
        Free Plan
      </div>
    </aside>
  );
}
