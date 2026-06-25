"use server";

/**
 * Platzhalter-Actions fuer S-01. Werden im /backend-Schritt mit Supabase Auth
 * verdrahtet: signInWithPassword, MFA-Pruefung, Session-Cookie, Redirect auf
 * den (intern validierten) Zielpfad bzw. /app. Bis dahin geben sie eine
 * neutrale Meldung zurueck.
 */

export type LoginState = {
  error?: string;
  /** true, wenn das Konto Zwei-Faktor aktiv hat (Backend setzt das). */
  twoFactor?: boolean;
};

export async function login(
  _prev: LoginState,
  _formData: FormData,
): Promise<LoginState> {
  return {
    error:
      "Die Anmeldung wird im nächsten Schritt mit Supabase verbunden (S-01 /backend).",
  };
}

export async function verifyTwoFactor(
  _prev: LoginState,
  _formData: FormData,
): Promise<LoginState> {
  return {
    error: "Die Zwei-Faktor-Prüfung wird im /backend-Schritt verbunden.",
    twoFactor: true,
  };
}

export async function signInWithGoogle(): Promise<void> {
  // TODO(/backend): Supabase OAuth (Google) starten und auf die Callback-Route leiten.
}
