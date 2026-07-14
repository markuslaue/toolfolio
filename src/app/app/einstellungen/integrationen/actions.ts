"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveAccount } from "@/lib/active-account";
import { verschluessele } from "@/lib/crypto";
import { holeVerbrauch } from "@/lib/integrationen-server";
import { syncIntegration } from "@/lib/integration-sync";
import { provider, type ProviderId } from "@/lib/integrationen";

export type IntegrationResult = { ok?: boolean; error?: string; hinweis?: string };

async function kontext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const account = user ? await getActiveAccount(supabase, user.id) : null;
  return { supabase, user, account };
}

/**
 * Anbieter verbinden: Zugangsdaten werden ZUERST gegen die API geprueft, dann
 * verschluesselt abgelegt (eigene Tabelle ohne Lese-Policy). Der Klartext
 * verlaesst den Server nie und wird nie zurueckgegeben.
 */
export async function verbinden(_prev: IntegrationResult, formData: FormData): Promise<IntegrationResult> {
  const providerId = String(formData.get("provider") ?? "") as ProviderId;
  const p = provider(providerId);
  if (!p) return { error: "Unbekannter Anbieter." };

  const { user, account } = await kontext();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };

  // Felder des Anbieters einsammeln und validieren.
  const cred: Record<string, string> = {};
  for (const f of p.felder) {
    const wert = String(formData.get(f.key) ?? "").trim();
    const ok = z.string().min(1).max(300).safeParse(wert);
    if (!ok.success) return { error: `Bitte ${f.label} ausfüllen.` };
    cred[f.key] = wert;
  }

  // Umrechnungskurs (nur noetig, wenn der Anbieter nicht in EUR abrechnet).
  let kurs = 1;
  if (p.waehrung !== "EUR") {
    const roh = String(formData.get("kurs") ?? "").replace(",", ".").trim();
    const k = Number(roh);
    if (!roh || !isFinite(k) || k <= 0 || k > 100) {
      return { error: `Bitte gib einen gültigen Umrechnungskurs an (1 ${p.waehrung} = ? EUR).` };
    }
    kurs = Math.round(k * 10000) / 10000;
  }

  // Verbindungstest: nur lesend.
  let verbrauch;
  try {
    verbrauch = await holeVerbrauch(providerId, cred);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Verbindung fehlgeschlagen." };
  }

  const admin = createAdminClient();

  // Passenden AI-Dienst finden oder anlegen (fuettert das bestehende B-13-Modell).
  const { data: vorhandenerDienst } = await admin
    .from("ai_services")
    .select("id")
    .eq("user_id", account)
    .eq("name", p.name)
    .maybeSingle();
  let serviceId = vorhandenerDienst?.id as string | undefined;
  if (!serviceId) {
    const { data: neu, error } = await admin
      .from("ai_services")
      .insert({ user_id: account, name: p.name, farbe: p.farbe, budget_monat: null })
      .select("id")
      .single();
    if (error || !neu) return { error: "Dienst konnte nicht angelegt werden." };
    serviceId = neu.id as string;
  }

  // Integration (Metadaten) anlegen/aktualisieren. Startwert des kumulierten
  // Verbrauchs = aktueller Stand, damit keine Alt-Ausgaben in diesen Monat fallen.
  const label = cred.login ? maskiere(cred.login) : p.name;
  const { data: integration, error: iErr } = await admin
    .from("integration")
    .upsert(
      {
        user_id: account,
        provider: providerId,
        label,
        ai_service_id: serviceId,
        guthaben: verbrauch.guthaben,
        kumuliert_ausgegeben: verbrauch.kumuliertAusgegeben ?? 0,
        kurs,
        last_sync_at: new Date().toISOString(),
        last_status: "ok",
      },
      { onConflict: "user_id,provider" },
    )
    .select("id")
    .single();
  if (iErr || !integration) return { error: "Integration konnte nicht gespeichert werden." };

  // Geheimnis verschluesselt ablegen (nur Service-Role kann es lesen).
  const v = verschluessele(JSON.stringify(cred));
  const { error: sErr } = await admin
    .from("integration_secret")
    .upsert({ integration_id: integration.id, ciphertext: v.ciphertext, iv: v.iv, tag: v.tag }, { onConflict: "integration_id" });
  if (sErr) return { error: "Zugangsdaten konnten nicht sicher gespeichert werden." };

  /* Liefert der Anbieter datierte Monatswerte (OpenAI, Anthropic), schreiben wir sie
     SOFORT. Sonst starrt der Nutzer bis zum naechsten naechtlichen Abgleich auf eine
     leere Kurve und denkt, die Verbindung sei kaputt. */
  if (verbrauch.monate && verbrauch.monate.length > 0) {
    for (const m of verbrauch.monate) {
      await admin.from("ai_spend").upsert(
        {
          user_id: account,
          service_id: serviceId,
          jahr: m.jahr,
          monat: m.monat,
          betrag: Math.round(m.betrag * kurs * 100) / 100,
        },
        { onConflict: "service_id,jahr,monat" },
      );
    }
  }

  revalidatePath("/app/einstellungen/integrationen");
  revalidatePath("/app/ai-credits");

  let hinweis = "Verbunden.";
  if (verbrauch.guthaben !== null) {
    hinweis = `Verbunden. Aktuelles Guthaben: ${verbrauch.guthaben.toFixed(2).replace(".", ",")}.`;
  } else if (verbrauch.monate && verbrauch.monate.length > 0) {
    const n = verbrauch.monate.length;
    hinweis = `Verbunden. ${n} ${n === 1 ? "Monat" : "Monate"} echte Kosten übernommen.`;
  } else if (verbrauch.monate) {
    hinweis = "Verbunden. Für die letzten zwölf Monate meldet der Anbieter keine Kosten.";
  }
  return { ok: true, hinweis };
}

function maskiere(login: string): string {
  const [name, domain] = login.split("@");
  if (!domain) return login.slice(0, 2) + "***";
  return `${name.slice(0, 2)}***@${domain}`;
}

/** Verbindung trennen: Metadaten und Geheimnis werden hart geloescht (Cascade). */
export async function trennen(providerId: string): Promise<IntegrationResult> {
  const { user, account } = await kontext();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };
  const admin = createAdminClient();
  const { error } = await admin.from("integration").delete().eq("user_id", account).eq("provider", providerId);
  if (error) return { error: "Trennen hat nicht geklappt." };
  revalidatePath("/app/einstellungen/integrationen");
  return { ok: true };
}

/** Sofort synchronisieren (sonst uebernimmt das der taegliche Cron). */
export async function jetztSynchronisieren(providerId: string): Promise<IntegrationResult> {
  const { user, account } = await kontext();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };
  const admin = createAdminClient();
  const { data: i } = await admin
    .from("integration")
    .select("id, user_id, provider, ai_service_id, kumuliert_ausgegeben, kurs")
    .eq("user_id", account)
    .eq("provider", providerId)
    .maybeSingle();
  if (!i) return { error: "Keine Verbindung gefunden." };
  const res = await syncIntegration(i);
  revalidatePath("/app/einstellungen/integrationen");
  revalidatePath("/app/ai-credits");
  return res.ok ? { ok: true } : { error: res.fehler };
}
