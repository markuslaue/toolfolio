import { createClient } from "@/lib/supabase/server";
import { kanalLabel, type Zahlungskanal } from "@/lib/zahlungskanaele";
import type { Kunde } from "@/lib/kunden";

/**
 * Auswahl-Vorschlaege fuer das Abo-Formular: Labels der verwalteten
 * Zahlungskanaele und Namen der Kunden des eingeloggten Nutzers.
 */
export async function ladeAboOptionen(): Promise<{
  kanalOptionen: string[];
  kundenOptionen: string[];
}> {
  const supabase = await createClient();
  const [{ data: kanaele }, { data: kunden }] = await Promise.all([
    supabase.from("zahlungskanaele").select("*").eq("aktiv", true),
    supabase.from("kunden").select("name").neq("status", "archiviert"),
  ]);

  const kanalOptionen = ((kanaele as Zahlungskanal[]) ?? []).map(kanalLabel);
  const kundenOptionen = ((kunden as Pick<Kunde, "name">[]) ?? []).map((k) => k.name);
  return { kanalOptionen, kundenOptionen };
}
