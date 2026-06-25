import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";

/**
 * Huelle der eingeloggten Tracker-Welt (B-Templates). Auth wird in der
 * Middleware erzwungen (Redirect auf /login ohne Session).
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center border-b bg-background/85 px-6 backdrop-blur">
          <p className="font-display text-lg font-bold text-foreground">
            Moin, Markus
          </p>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
