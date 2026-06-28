import { createClient } from "@supabase/supabase-js";

/**
 * Anonymer Supabase-Client OHNE Session/Cookies, fuer oeffentliche
 * Verzeichnis-Seiten (SSG/ISR, SEO). RLS erlaubt nur veroeffentlichte Inhalte.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
