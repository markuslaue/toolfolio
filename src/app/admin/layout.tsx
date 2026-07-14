import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { redaktionOderRaus } from "@/lib/redaktion";

/**
 * Huelle des Admin-Backends. Eigene Welt, bewusst getrennt vom Tracker:
 * Wer Toolfolio als Kunde benutzt, soll die Redaktion nie sehen, und wer
 * redigiert, soll nicht zwischen Abo-Listen und Kategorien springen.
 *
 * Das Rollen-Gate liegt hier im Layout und damit vor JEDER Unterseite.
 * Wer kein Inhaberkonto hat, bekommt eine 404: dass es ein Admin-Backend gibt,
 * geht ihn nichts an.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await redaktionOderRaus("/admin");

  return (
    <div className="flex min-h-screen bg-muted/20">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Zurück zu Toolfolio
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full bg-foreground px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-background">
              Admin
            </span>
            <span className="hidden text-muted-foreground sm:inline">{user.email}</span>
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <Toaster />
    </div>
  );
}
