import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/safe-redirect";
import { sendEmail } from "@/lib/email";
import { willkommen } from "@/lib/email-templates";

/** E-01: einmalige Willkommens-Mail nach erster Anmeldung/Verifizierung. Blockiert den Login nie. */
async function maybeWelcome(supabase: Awaited<ReturnType<typeof createClient>>, base: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return;
    const { data: profil } = await supabase.from("profiles").select("first_name, welcome_sent_at").eq("id", user.id).maybeSingle();
    if (!profil || profil.welcome_sent_at) return;
    const { subject, html } = willkommen(profil.first_name ?? null, base);
    await sendEmail({ to: user.email, subject, html });
    await supabase.from("profiles").update({ welcome_sent_at: new Date().toISOString() }).eq("id", user.id);
  } catch {
    /* Willkommens-Mail ist best effort, darf den Login nie blockieren */
  }
}

/**
 * Auth-Callback (Google-OAuth + E-Mail-Bestaetigung). Tauscht den Code gegen eine
 * Session, sendet einmalig die Willkommens-Mail und leitet auf den Zielpfad weiter.
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
      await maybeWelcome(supabase, base);
      return NextResponse.redirect(`${base}${target}`);
    }
  }
  return NextResponse.redirect(`${base}/login?error=oauth`);
}
