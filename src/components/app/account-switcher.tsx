"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { switchAccount } from "@/app/app/account-actions";
import type { KontoOption } from "@/lib/active-account";

export function AccountSwitcher({ accounts, active }: { accounts: KontoOption[]; active: string }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const current = accounts.find((a) => a.id === active) ?? accounts[0];

  function wechseln(id: string) {
    if (id === active) return;
    start(async () => {
      const r = await switchAccount(id);
      if (r.error) toast.error(r.error);
      else { toast.success("Konto gewechselt"); router.refresh(); }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm font-medium hover:bg-accent" disabled={busy}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Building2 className="size-4 text-muted-foreground" />}
        <span className="max-w-40 truncate">{current?.label}</span>
        <ChevronsUpDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Konto wechseln</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {accounts.map((a) => (
          <DropdownMenuItem key={a.id} onClick={() => wechseln(a.id)} className="gap-2">
            <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"><Building2 className="size-3.5" /></span>
            <span className="min-w-0 flex-1 truncate">{a.label}{!a.eigenes && <span className="ml-1 text-xs text-muted-foreground">({a.rolle === "admin" ? "Admin" : "Mitglied"})</span>}</span>
            {a.id === active && <Check className="size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
