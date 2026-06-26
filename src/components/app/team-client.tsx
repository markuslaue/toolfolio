"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { UserPlus, Loader2, Trash2, Crown, ShieldCheck, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { inviteMember, changeRole, removeMember, revokeInvite, type TeamState } from "@/app/app/einstellungen/team/actions";

export type Member = { id: string; member_email: string; member_name: string | null; role: "admin" | "member"; created_at: string };
export type Invite = { id: string; email: string; role: "admin" | "member"; expires_at: string };
export type Owner = { name: string; email: string };

function initials(s: string) {
  const parts = s.replace(/@.*/, "").split(/[ ._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || s.slice(0, 2).toUpperCase();
}

function RoleBadge({ role }: { role: "owner" | "admin" | "member" }) {
  if (role === "owner") return <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/10"><Crown className="size-3" /> Owner</Badge>;
  if (role === "admin") return <Badge variant="secondary" className="gap-1"><ShieldCheck className="size-3" /> Administrator</Badge>;
  return <Badge variant="outline">Mitglied</Badge>;
}

export function TeamClient({ owner, members, invites }: { owner: Owner; members: Member[]; invites: Invite[] }) {
  const [state, formAction, pending] = useActionState<TeamState, FormData>(inviteMember, {});
  const [rolle, setRolle] = useState<"admin" | "member">("member");
  const [busy, startTransition] = useTransition();
  const [confirmRemove, setConfirmRemove] = useState<Member | null>(null);

  useEffect(() => {
    if (state.info) toast.success(state.info);
    if (state.error) toast.error(state.error);
  }, [state]);

  function act(p: Promise<TeamState>, okMsg?: string) {
    startTransition(async () => {
      const r = await p;
      if (r.error) toast.error(r.error);
      else if (okMsg) toast.success(okMsg);
    });
  }

  return (
    <div className="space-y-6">
      {/* Einladen */}
      <section className="rounded-[20px] border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-2">
          <UserPlus className="size-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">Mitglied einladen</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Lade Kolleginnen und Kollegen ein. Sie sehen die Abos, Kosten und Fristen des Kontos. Bearbeiten bleibt vorerst dir vorbehalten.
        </p>
        <form action={formAction} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input id="email" name="email" type="email" required placeholder="kollege@agentur.de" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role">Rolle</Label>
            <input type="hidden" name="role" value={rolle} />
            <Select value={rolle} onValueChange={(v) => setRolle(v as "admin" | "member")}>
              <SelectTrigger id="role" className="sm:w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Mitglied (nur Ansicht)</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={pending} className="gap-2">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
            Einladen
          </Button>
        </form>
      </section>

      {/* Mitglieder */}
      <section className="rounded-[20px] border bg-card p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Mitglieder</h2>
        <div className="mt-4 divide-y">
          {/* Owner (du) */}
          <div className="flex items-center gap-3 py-3">
            <Avatar><AvatarFallback className="bg-primary/10 text-primary">{initials(owner.name)}</AvatarFallback></Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{owner.name} <span className="text-muted-foreground">(du)</span></div>
              <div className="truncate text-sm text-muted-foreground">{owner.email}</div>
            </div>
            <RoleBadge role="owner" />
          </div>

          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 py-3">
              <Avatar><AvatarFallback>{initials(m.member_name || m.member_email)}</AvatarFallback></Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{m.member_name || m.member_email}</div>
                <div className="truncate text-sm text-muted-foreground">{m.member_email}</div>
              </div>
              <Select value={m.role} onValueChange={(v) => act(changeRole(m.id, v as "admin" | "member"), "Rolle aktualisiert")} disabled={busy}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Mitglied</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" disabled={busy} onClick={() => setConfirmRemove(m)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Offene Einladungen */}
      {invites.length > 0 && (
        <section className="rounded-[20px] border bg-card p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Offene Einladungen</h2>
          <div className="mt-4 divide-y">
            {invites.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 py-3">
                <span className="grid size-10 place-items-center rounded-full bg-secondary text-muted-foreground"><Clock className="size-4" /></span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{inv.email}</div>
                  <div className="text-sm text-muted-foreground">Einladung ausstehend</div>
                </div>
                <RoleBadge role={inv.role} />
                <Button variant="ghost" size="sm" disabled={busy} onClick={() => act(revokeInvite(inv.id), "Einladung zurückgezogen")}>
                  Zurückziehen
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      <AlertDialog open={!!confirmRemove} onOpenChange={(o) => !o && setConfirmRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mitglied entfernen?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmRemove?.member_name || confirmRemove?.member_email} verliert sofort den Zugriff auf dieses Konto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => { if (confirmRemove) act(removeMember(confirmRemove.id), "Mitglied entfernt"); setConfirmRemove(null); }}
            >
              Entfernen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
