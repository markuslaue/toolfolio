import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase-Client fuer Server-Komponenten, Route Handler und Server Actions.
 * Nutzt den Anon-Key plus die Nutzer-Session. NIEMALS den Service-Role-Key
 * hier verwenden (nur in dedizierten serverseitigen Admin-Pfaden).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Aufruf aus einer Server-Komponente: Cookies werden von der
            // Middleware aktualisiert, hier kann ignoriert werden.
          }
        },
      },
    },
  );
}
