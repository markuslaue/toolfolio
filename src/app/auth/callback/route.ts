import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/safe-redirect";

/**
 * OAuth-Callback (z. B. Google). Tauscht den Code gegen eine Session und leitet
 * auf den (intern validierten) Zielpfad weiter.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const target = safeRedirect(searchParams.get("redirect"), "/app");
  // Hinter dem Reverse-Proxy ist request.origin der interne Host. Fuer absolute
  // Weiterleitungen die oeffentliche Site-URL nutzen.
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${base}${target}`);
    }
  }
  return NextResponse.redirect(`${base}/login?error=oauth`);
}
