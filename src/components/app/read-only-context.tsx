"use client";

import { createContext, useContext } from "react";

/**
 * Stellt app-weit bereit, ob das aktive Konto fuer den aktuellen Nutzer
 * schreibgeschuetzt ist (Rolle "member" in einem fremden Konto, B-25).
 * Die eigentliche Durchsetzung liegt serverseitig (RLS + Action-Guards);
 * dieser Context dient nur der UI-Klarheit (Hinweis, Buttons deaktivieren).
 */
const ReadOnlyContext = createContext(false);

export function ReadOnlyProvider({ readOnly, children }: { readOnly: boolean; children: React.ReactNode }) {
  return <ReadOnlyContext.Provider value={readOnly}>{children}</ReadOnlyContext.Provider>;
}

/** True, wenn der Nutzer das aktive Konto nur ansehen darf. */
export function useReadOnly(): boolean {
  return useContext(ReadOnlyContext);
}
