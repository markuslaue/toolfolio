"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ShieldCheck, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/**
 * Privacy-first Consent (R-04). Plausible misst cookielos -> kein Consent noetig.
 * Einwilligung gilt ausschliesslich externen Medien (z. B. YouTube), die per
 * Click-to-load erst nach Zustimmung geladen werden. Zustand in localStorage.
 */
const KEY = "tf-consent-v1";

export type ConsentState = { medien: boolean; dismissed: boolean };
const DEFAULT: ConsentState = { medien: false, dismissed: false };
const SERVER: ConsentState = { medien: false, dismissed: true }; // SSR: Banner nicht rendern

// --- Consent-Store (localStorage) ---
let cache: ConsentState | null = null;
const listeners = new Set<() => void>();
function read(): ConsentState {
  try {
    return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return DEFAULT;
  }
}
function getSnapshot(): ConsentState {
  if (!cache) cache = read();
  return cache;
}
function write(next: Partial<ConsentState>) {
  cache = { ...getSnapshot(), ...next };
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* localStorage nicht verfuegbar */
  }
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useConsent() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => SERVER);
  return {
    medien: state.medien,
    dismissed: state.dismissed,
    setMedien: (v: boolean) => write({ medien: v }),
    dismiss: () => write({ dismissed: true }),
    akzeptiereAlle: () => write({ medien: true, dismissed: true }),
    nurNotwendige: () => write({ medien: false, dismissed: true }),
  };
}

// --- Dialog-offen-Store (entkoppelt Footer-Button vom Dialog) ---
let openCache = false;
const openListeners = new Set<() => void>();
function setOpen(v: boolean) {
  openCache = v;
  openListeners.forEach((l) => l());
}
function useSettingsOpen() {
  return useSyncExternalStore(
    (l) => { openListeners.add(l); return () => openListeners.delete(l); },
    () => openCache,
    () => false,
  );
}
/** Oeffnet den Einstellungen-Dialog (z. B. aus dem Footer). */
export function openConsentSettings() {
  setOpen(true);
}

export function ConsentManager() {
  const c = useConsent();
  const open = useSettingsOpen();

  return (
    <>
      {!c.dismissed && (
        <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-4 sm:pb-4">
          <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-4 shadow-lift sm:p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><ShieldCheck className="size-5" /></span>
              <div className="min-w-0">
                <div className="font-display font-semibold">Datenschutz, kurz gemacht</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Wir setzen nur technisch notwendige Cookies und messen die Reichweite cookielos mit Plausible (keine personenbezogenen Profile, kein seitenübergreifendes Tracking). Externe Inhalte wie Videos laden wir erst nach deiner Zustimmung. Mehr in der{" "}
                  <Link href="/datenschutz" className="text-primary underline">Datenschutzerklärung</Link>.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={c.akzeptiereAlle}>Alle akzeptieren</Button>
                  <Button size="sm" variant="outline" onClick={c.nurNotwendige}>Nur notwendige</Button>
                  <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>Einstellungen</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Cookie className="size-5 text-primary" /> Datenschutz-Einstellungen</DialogTitle>
            <DialogDescription>Du entscheidest, was geladen wird. Technisch Notwendiges ist immer aktiv.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Zeile titel="Technisch notwendig" desc="Login, Sicherheit und Grundfunktionen. Immer aktiv." checked disabled />
            <Zeile titel="Statistik (cookielos)" desc="Reichweitenmessung mit Plausible, ohne Cookies und ohne personenbezogene Profile. Daher immer aktiv." checked disabled />
            <Zeile titel="Externe Medien" desc="YouTube und andere externe Inhalte erst nach Zustimmung laden." checked={c.medien} onCheckedChange={c.setMedien} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { c.nurNotwendige(); setOpen(false); }}>Nur notwendige</Button>
            <Button onClick={() => { c.dismiss(); setOpen(false); }}>Fertig</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Zeile({ titel, desc, checked, disabled, onCheckedChange }: { titel: string; desc: string; checked: boolean; disabled?: boolean; onCheckedChange?: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border p-3">
      <div>
        <div className="text-sm font-medium">{titel}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
    </div>
  );
}
