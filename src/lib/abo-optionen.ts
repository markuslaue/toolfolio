import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";
import { kanalLabel, type Zahlungskanal } from "@/lib/zahlungskanaele";
import type { Kunde } from "@/lib/kunden";

/**
 * Auswahl-Vorschlaege fuer das Abo-Formular: Labels der verwalteten
 * Zahlungskanaele und Namen der Kunden des aktiven Kontos.
 */
export async function ladeAboOptionen(): Promise<{
  kanalOptionen: string[];
  kundenOptionen: string[];
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { kanalOptionen: [], kundenOptionen: [] };
  const account = await getActiveAccount(supabase, user.id);
  const [{ data: kanaele }, { data: kunden }] = await Promise.all([
    supabase.from("zahlungskanaele").select("*").eq("user_id", account).eq("aktiv", true),
    supabase.from("kunden").select("name").eq("user_id", account).neq("status", "archiviert"),
  ]);

  const kanalOptionen = ((kanaele as Zahlungskanal[]) ?? []).map(kanalLabel);
  const kundenOptionen = ((kunden as Pick<Kunde, "name">[]) ?? []).map((k) => k.name);
  return { kanalOptionen, kundenOptionen };
}
