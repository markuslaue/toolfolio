"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";

export type ZugangResult = { ok?: boolean; error?: string; id?: string };

async function uc() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const account = user ? await getActiveAccount(supabase, user.id) : null;
  return { supabase, user, account };
}

/** Person anlegen. */
export async function addPerson(_prev: ZugangResult, formData: FormData): Promise<ZugangResult> {
  const parsed = z
    .object({
      name: z.string().trim().min(1, "Bitte gib einen Namen ein.").max(80),
      rolle: z.string().trim().max(60).optional(),
      email: z.string().trim().toLowerCase().email().optional().or(z.literal("")),
    })
    .safeParse({ name: formData.get("name"), rolle: formData.get("rolle") ?? "", email: formData.get("email") ?? "" });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Bitte prüfe deine Eingabe." };
  const { supabase, user, account } = await uc();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };
  const { data, error } = await supabase
    .from("personen")
    .insert({ user_id: account, name: parsed.data.name, rolle: parsed.data.rolle || null, email: parsed.data.email || null })
    .select("id")
    .single();
  if (error) return { error: "Person konnte nicht angelegt werden." };
  revalidatePath("/app/zugaenge");
  return { ok: true, id: data.id };
}

export async function removePerson(id: string): Promise<ZugangResult> {
  const { supabase, user, account } = await uc();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };
  const { error } = await supabase.from("personen").delete().eq("id", id).eq("user_id", account);
  if (error) return { error: "Person konnte nicht entfernt werden." };
  revalidatePath("/app/zugaenge");
  return { ok: true };
}

export async function setPersonStatus(id: string, status: "aktiv" | "scheidet_aus" | "ausgeschieden", austritt?: string | null): Promise<ZugangResult> {
  if (!["aktiv", "scheidet_aus", "ausgeschieden"].includes(status)) return { error: "Ungültiger Status." };
  const { supabase, user, account } = await uc();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };
  const { error } = await supabase.from("personen").update({ status, austritt: austritt ?? null }).eq("id", id).eq("user_id", account);
  if (error) return { error: "Status konnte nicht geändert werden." };
  revalidatePath("/app/zugaenge");
  return { ok: true };
}

/** Tool einer Person zuordnen (mit optionalem Platz-Kosten-Wert). */
export async function assignTool(personId: string, aboId: string, platzKosten: number | null): Promise<ZugangResult> {
  const { supabase, user, account } = await uc();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };
  const { error } = await supabase
    .from("tool_zugang")
    .upsert({ user_id: account, person_id: personId, abo_id: aboId, platz_kosten: platzKosten }, { onConflict: "person_id,abo_id" });
  if (error) return { error: "Zugang konnte nicht gespeichert werden." };
  revalidatePath("/app/zugaenge");
  return { ok: true };
}

export async function unassignTool(zugangId: string): Promise<ZugangResult> {
  const { supabase, user, account } = await uc();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };
  const { error } = await supabase.from("tool_zugang").delete().eq("id", zugangId).eq("user_id", account);
  if (error) return { error: "Zugang konnte nicht entfernt werden." };
  revalidatePath("/app/zugaenge");
  return { ok: true };
}

/**
 * Verantwortliche Person (Owner) fuer ein Tool setzen (oder loesen).
 *
 * Der Owner haengt am ABO, nicht am Zugang: verantwortlich fuer Verlaengerung,
 * Nutzer und Kosten sein heisst nicht, das Tool selbst zu benutzen.
 */
export async function setOwner(aboId: string, personId: string | null): Promise<ZugangResult> {
  const { supabase, user, account } = await uc();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };
  const { error } = await supabase
    .from("abos")
    .update({ owner_person_id: personId })
    .eq("id", aboId)
    .eq("user_id", account);
  if (error) return { error: "Owner konnte nicht gesetzt werden." };
  revalidatePath("/app/zugaenge");
  return { ok: true };
}

/** Letzte Aktivitaet eines Zugangs pflegen. Leer heisst: wir wissen es nicht. */
export async function setAktivitaet(zugangId: string, datum: string | null): Promise<ZugangResult> {
  const { supabase, user, account } = await uc();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };
  if (datum && !/^\d{4}-\d{2}-\d{2}$/.test(datum)) return { error: "Ungültiges Datum." };
  const { error } = await supabase
    .from("tool_zugang")
    .update({ letzte_aktivitaet: datum })
    .eq("id", zugangId)
    .eq("user_id", account);
  if (error) return { error: "Aktivität konnte nicht gespeichert werden." };
  revalidatePath("/app/zugaenge");
  return { ok: true };
}

/**
 * Offboarding abschliessen.
 *
 * Entzieht die abgehakten Zugaenge, setzt die Person auf ausgeschieden und legt
 * einen NACHWEIS an. Der Nachweis ist der eigentliche Punkt: ein Toast beweist
 * niemandem, dass Jonas' Adobe-Zugang am 31.01. entzogen wurde.
 *
 * Toolfolio entzieht nichts beim Anbieter, das kann es nicht (Vermittler-Prinzip).
 * Es fuehrt die Liste und haelt fest, was der Mensch erledigt hat.
 */
export async function offboardingAbschliessen(
  personId: string,
  entzogeneZugaenge: string[],
  plaetzeZurueck: string[],
): Promise<ZugangResult> {
  const { supabase, user, account } = await uc();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };
  if (entzogeneZugaenge.length === 0) return { error: "Hake mindestens einen Zugang ab." };

  const { data: person } = await supabase
    .from("personen")
    .select("id, name")
    .eq("id", personId)
    .eq("user_id", account)
    .maybeSingle();
  if (!person) return { error: "Person nicht gefunden." };

  // Die Bilanz aus der DATENBANK rechnen, nicht aus dem, was der Client behauptet.
  const { data: zugaenge } = await supabase
    .from("tool_zugang")
    .select("id, platz_kosten, abos ( tool )")
    .eq("user_id", account)
    .eq("person_id", personId)
    .in("id", entzogeneZugaenge);

  if (!zugaenge || zugaenge.length === 0) return { error: "Keine passenden Zugänge gefunden." };

  const zurueck = new Set(plaetzeZurueck);
  const ersparnis = zugaenge
    .filter((z) => zurueck.has(z.id))
    .reduce((s, z) => s + Number(z.platz_kosten ?? 0), 0);
  const tools = zugaenge
    .map((z) => (z.abos as unknown as { tool: string } | null)?.tool)
    .filter((t): t is string => Boolean(t));

  const { error: protokollFehler } = await supabase.from("offboarding").insert({
    user_id: account,
    person_id: person.id,
    person_name: person.name,
    zugaenge_entzogen: zugaenge.length,
    plaetze_zurueck: zugaenge.filter((z) => zurueck.has(z.id)).length,
    ersparnis_monatlich: ersparnis,
    tools,
  });
  if (protokollFehler) return { error: "Das Offboarding konnte nicht protokolliert werden." };

  // Erst nach dem Nachweis loeschen. Andersherum stuende im schlimmsten Fall
  // ein geloeschter Zugang ohne Beleg da.
  await supabase
    .from("tool_zugang")
    .delete()
    .eq("user_id", account)
    .eq("person_id", personId)
    .in("id", zugaenge.map((z) => z.id));

  await supabase
    .from("personen")
    .update({ status: "ausgeschieden" })
    .eq("id", personId)
    .eq("user_id", account);

  revalidatePath("/app/zugaenge");
  return { ok: true };
}
