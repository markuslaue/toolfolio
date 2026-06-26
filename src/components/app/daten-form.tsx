"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, Trash2, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { exportData, deleteAccount } from "@/app/app/einstellungen/daten/actions";

export function DatenForm() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [open, setOpen] = useState(false);
  const [bestaetigung, setBestaetigung] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function herunterladen() {
    setExporting(true);
    const res = await exportData();
    setExporting(false);
    if (res.error || !res.json) return toast.error(res.error ?? "Export fehlgeschlagen.");
    const blob = new Blob([res.json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "toolfolio-daten.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export erstellt");
  }

  async function loeschen() {
    setDeleting(true);
    const res = await deleteAccount();
    setDeleting(false);
    if (res.error) return toast.error(res.error);
    toast.success("Konto gelöscht");
    router.push("/");
  }

  return (
    <div className="space-y-6">
      {/* Export */}
      <section className="rounded-[20px] border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-2">
          <Download className="size-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">Datenexport</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Lade alle zu deinem Konto gespeicherten Daten als JSON herunter (Auskunft und
          Datenübertragbarkeit nach DSGVO).
        </p>
        <Button variant="outline" className="mt-4 gap-2" onClick={herunterladen} disabled={exporting}>
          {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          Daten exportieren
        </Button>
      </section>

      {/* Hinweis */}
      <section className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
        Wir speichern keine vollständigen Kartennummern oder Passwörter fremder Tools, nur Referenzen.
        Details in der Datenschutzerklärung.
      </section>

      {/* Loeschen */}
      <section className="rounded-[20px] border border-destructive/30 bg-destructive/5 p-6">
        <div className="flex items-center gap-2">
          <Trash2 className="size-5 text-destructive" />
          <h2 className="font-display text-lg font-semibold">Konto löschen</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Dein Konto und alle zugehörigen Daten (Abos, Kunden, Zahlungskanäle, Einstellungen) werden
          endgültig gelöscht. Das kann nicht rückgängig gemacht werden.
        </p>
        <Button variant="outline" className="mt-4 gap-2 border-destructive/40 text-destructive hover:text-destructive" onClick={() => setOpen(true)}>
          <Trash2 className="size-4" /> Konto endgültig löschen
        </Button>
      </section>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konto wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion ist endgültig. Tippe zur Bestätigung <strong>LÖSCHEN</strong> ein.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="bestaetigung" className="sr-only">Bestätigung</Label>
            <Input id="bestaetigung" value={bestaetigung} onChange={(e) => setBestaetigung(e.target.value)} placeholder="LÖSCHEN" />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBestaetigung("")}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              disabled={bestaetigung !== "LÖSCHEN" || deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(e) => { e.preventDefault(); loeschen(); }}
            >
              {deleting && <Loader2 className="size-4 animate-spin" />}
              Endgültig löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
