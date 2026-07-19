import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mitUtm, geraeteKlasse } from "@/lib/ausgang";

/**
 * AD-13: Ausgang zum Anbieter. Zaehlt den Klick und leitet weiter.
 *
 * ---------------------------------------------------------------------------
 * DIE WEITERLEITUNG HAT IMMER VORRANG.
 *
 * Faellt die Datenbank aus, ist die Statistik luecken haft. Faellt die Weiterleitung
 * aus, steht ein Interessent vor einer Fehlerseite, und der Anbieter verliert einen
 * Lead, fuer den er womoeglich bezahlt hat. Deshalb ist das Zaehlen in einen
 * try/catch gehuellt und das Ergebnis wird nicht abgewartet, wo es nicht noetig ist.
 * ---------------------------------------------------------------------------
 *
 * 307 statt 301: Ein dauerhafter Redirect wuerde vom Browser gecacht, und dann
 * kaeme der zweite Klick desselben Nutzers nie bei uns an. Die Statistik haette
 * systematisch zu wenig.
 */

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const url = new URL(req.url);
  const von = url.searchParams.get("von");
  const zone = url.searchParams.get("zone");

  const admin = createAdminClient();

  const { data: produkt } = await admin
    .from("dir_produkt")
    .select("id, name, website_url, affiliate_url")
    .eq("slug", slug)
    .maybeSingle();

  if (!produkt) {
    return NextResponse.redirect(new URL("/verzeichnis", req.url), 307);
  }

  const istAffiliate = Boolean(produkt.affiliate_url);
  const rohZiel = (produkt.affiliate_url as string | null) ?? (produkt.website_url as string | null);
  if (!rohZiel) {
    return NextResponse.redirect(new URL("/verzeichnis", req.url), 307);
  }

  const ziel = mitUtm(rohZiel, {
    kampagne: von,
    // Affiliate-Klicks getrennt kennzeichnen, damit der Anbieter sie in seinem
    // Werkzeug von organischen Empfehlungen unterscheiden kann.
    medium: istAffiliate ? "affiliate" : "verzeichnis",
  });

  if (!ziel) {
    return NextResponse.redirect(new URL("/verzeichnis", req.url), 307);
  }

  /* Zaehlen. Fehlertolerant: eine kaputte Statistik darf niemanden aufhalten. */
  try {
    let collectionId: string | null = null;
    if (von) {
      const { data: coll } = await admin.from("dir_collection").select("id").eq("slug", von).maybeSingle();
      collectionId = (coll?.id as string) ?? null;
    }

    await admin.from("dir_klick").insert({
      produkt_id: produkt.id,
      collection_id: collectionId,
      zone: zone === "gesponsert" || zone === "organisch" || zone === "community" ? zone : null,
      ist_affiliate: istAffiliate,
      // Nur was ohnehin offen in der Adresse stand. Nichts rekonstruiert.
      utm_source: url.searchParams.get("utm_source"),
      utm_medium: url.searchParams.get("utm_medium"),
      utm_campaign: url.searchParams.get("utm_campaign"),
      geraet: geraeteKlasse(req.headers.get("user-agent")),
    });
  } catch {
    // Bewusst still. Die Weiterleitung ist wichtiger als der Zaehler.
  }

  return NextResponse.redirect(ziel, 307);
}
