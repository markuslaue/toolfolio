"use client";

import { openConsentSettings } from "./consent";

/** Footer-Eintrag, der den Datenschutz-Einstellungen-Dialog oeffnet. */
export function ConsentSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={openConsentSettings} className={className}>
      Cookie-Einstellungen
    </button>
  );
}
