import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { entschluessele } from "@/lib/crypto";
import { holeVerbrauch } from "@/lib/integrationen-server";
import type { ProviderId } from "@/lib/integrationen";

export type IntegrationRow = {
  id: string;
  user_id: string;
  provider: string;
  ai_service_id: string | null;
  kumuliert_ausgegeben: number | null;
  /** 1 Anbieterwaehrung = kurs EUR (1 bei EUR-Anbietern). */
  kurs: number | null;
};

/**
 * Holt den aktuellen Verbrauch beim Anbieter und schreibt den ZUWACHS seit dem
 * letzten Sync in den laufenden Monat (ai_spend). So entsteht aus einem
 * kumulierten Gesamtverbrauch eine saubere Monatsreihe, ohne Historie zu erfinden.
 */
export async function syncIntegration(i: IntegrationRow): Promise<{ ok: boolean; fehler?: string }> {
  const admin = createAdminClient();

  const { data: secret } = await admin
    .from("integration_secret")
    .select("ciphertext, iv, tag")
    .eq("integration_id", i.id)
    .maybeSingle();
  if (!secret) return { ok: false, fehler: "Zugangsdaten fehlen." };

  let verbrauch;
  try {
    const cred = JSON.parse(entschluessele(secret)) as Record<string, string>;
    verbrauch = await holeVerbrauch(i.provider as ProviderId, cred);
  } catch (e) {
    const fehler = e instanceof Error ? e.message : "Abruf fehlgeschlagen.";
    await admin.from("integration").update({ last_sync_at: new Date().toISOString(), last_status: fehler }).eq("id", i.id);
    return { ok: false, fehler };
  }

  const kurs = Number(i.kurs ?? 1);

  /* Fall A: Der Anbieter liefert DATIERTE Monatswerte (OpenAI, Anthropic).
     Dann schreiben wir sie exakt, statt einen Zuwachs zu buchen. Das ist nicht nur
     genauer, es behebt auch einen echten Fehler des Zuwachs-Modells: der Zuwachs
     landet immer im LAUFENDEN Monat, also faellt der Verbrauch der letzten Junitage
     in den Juli, wenn der Abgleich am 1. um 3 Uhr laeuft.

     Wir ueberschreiben hier bewusst: der Anbieter ist die Wahrheit ueber seine
     eigenen Kosten, nicht unser letzter Stand. */
  if (verbrauch.monate && verbrauch.monate.length > 0 && i.ai_service_id) {
    for (const m of verbrauch.monate) {
      const betragEur = Math.round(m.betrag * kurs * 100) / 100;
      await admin.from("ai_spend").upsert(
        { user_id: i.user_id, service_id: i.ai_service_id, jahr: m.jahr, monat: m.monat, betrag: betragEur },
        { onConflict: "service_id,jahr,monat" },
      );
    }
  }

  // Fall B: Der Anbieter kennt nur einen Gesamtstand (DataForSEO).
  // Dann buchen wir den Zuwachs seit dem letzten Sync in den laufenden Monat.
  if (verbrauch.kumuliertAusgegeben !== null && i.ai_service_id) {
    const vorher = Number(i.kumuliert_ausgegeben ?? 0);
    const zuwachs = Math.max(0, verbrauch.kumuliertAusgegeben - vorher);
    // In EUR umrechnen, weil ai_spend/Budget in EUR gefuehrt werden.
    const delta = Math.round(zuwachs * Number(i.kurs ?? 1) * 100) / 100;
    if (delta > 0) {
      const jetzt = new Date();
      const jahr = jetzt.getFullYear();
      const monat = jetzt.getMonth() + 1;
      const { data: vorhanden } = await admin
        .from("ai_spend")
        .select("betrag")
        .eq("service_id", i.ai_service_id)
        .eq("jahr", jahr)
        .eq("monat", monat)
        .maybeSingle();
      const neu = Math.round(((Number(vorhanden?.betrag) || 0) + delta) * 100) / 100;
      await admin
        .from("ai_spend")
        .upsert(
          { user_id: i.user_id, service_id: i.ai_service_id, jahr, monat, betrag: neu },
          { onConflict: "service_id,jahr,monat" },
        );
    }
  }

  await admin
    .from("integration")
    .update({
      guthaben: verbrauch.guthaben,
      kumuliert_ausgegeben: verbrauch.kumuliertAusgegeben ?? i.kumuliert_ausgegeben ?? 0,
      last_sync_at: new Date().toISOString(),
      last_status: "ok",
    })
    .eq("id", i.id);

  return { ok: true };
}
