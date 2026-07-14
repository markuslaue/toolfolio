import { AppSidebar } from "@/components/app-sidebar";
import { AccountSwitcher } from "@/components/app/account-switcher";
import { ReadOnlyProvider } from "@/components/app/read-only-context";
import { ReadOnlyBanner } from "@/components/app/read-only-banner";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount, listAccounts } from "@/lib/active-account";

/**
 * Huelle der eingeloggten Tracker-Welt (B-Templates). Auth wird in der
 * Middleware erzwungen (Redirect auf /login ohne Session).
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let vorname = "";
  let istStaff = false;
  let accounts: Awaited<ReturnType<typeof listAccounts>> = [];
  let active = user?.id ?? "";
  if (user) {
    const [{ data: profil }, acc, act] = await Promise.all([
      supabase.from("profiles").select("first_name, is_staff").eq("id", user.id).maybeSingle(),
      listAccounts(supabase, user.id),
      getActiveAccount(supabase, user.id),
    ]);
    vorname = profil?.first_name ?? "";
    istStaff = Boolean(profil?.is_staff);
    accounts = acc;
    active = act;
  }

  // Schreibgeschuetzt, wenn der Nutzer im aktiven Konto nur Mitglied (member) ist.
  // Owner und Admin duerfen schreiben (siehe has_admin_access, B-25).
  const aktivesKonto = accounts.find((a) => a.id === active);
  const readOnly = aktivesKonto?.rolle === "member";

  return (
    <ReadOnlyProvider readOnly={readOnly}>
      <div className="flex min-h-screen flex-1">
        <AppSidebar istStaff={istStaff} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-between gap-4 border-b bg-background/85 px-6 backdrop-blur">
            <p className="font-display text-lg font-bold text-foreground">
              Moin{vorname ? `, ${vorname}` : ""}
            </p>
            {accounts.length > 1 && <AccountSwitcher accounts={accounts} active={active} />}
          </header>
          <ReadOnlyBanner />
          <main className="flex-1 p-6">{children}</main>
        </div>
        <Toaster />
      </div>
    </ReadOnlyProvider>
  );
}
