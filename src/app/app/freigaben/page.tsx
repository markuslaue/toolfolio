import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  FreigabenClient,
  type Antrag,
  type Kontext,
  type Kommentar,
  type Vorschlag,
} from "@/components/app/freigaben-client";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";
import { monatlich, KATEGORIE_FARBEN, type Abo, type Intervall } from "@/lib/abos";
import { formatEur } from "@/lib/constants";

export const metadata: Metadata = { title: "Freigaben" };

type AntragRow = {
  id: string;
  tool: string;
  kategorie: string;
  kosten: number;
  intervall: Intervall;
  antragsteller: string | null;
  begruendung: string | null;
  fuer: string | null;
  status: "ausstehend" | "genehmigt" | "abgelehnt";
  grund_ablehnung: string | null;
  erstellt_von: string | null;
  created_at: string;
};
type KommentarRow = { id: string; antrag_id: string; autor_name: string; text: string };

function relativ(iso: string, jetzt = Date.now()): string {
  const min = Math.floor((jetzt - new Date(iso).getTime()) / 60_000);
  if (min < 60) return min <= 1 ? "gerade eben" : `vor ${min} Minuten`;
  const std = Math.floor(min / 60);
  if (std < 24) return `vor ${std} ${std === 1 ? "Stunde" : "Stunden"}`;
  const tage = Math.floor(std / 24);
  if (tage === 1) return "gestern";
  if (tage < 7) return `vor ${tage} Tagen`;
  const wochen = Math.floor(tage / 7);
  if (wochen < 5) return `vor ${wochen} ${wochen === 1 ? "Woche" : "Wochen"}`;
  const monate = Math.floor(tage / 30);
  return `vor ${monate} ${monate === 1 ? "Monat" : "Monaten"}`;
}

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const account = await getActiveAccount(supabase, user.id);

  const [antragRes, aboRes, profilRes, kundenRes, produktRes, rolleRes] = await Promise.all([
    supabase
      .from("freigabe_antrag")
      .select(
        "id, tool, kategorie, kosten, intervall, antragsteller, begruendung, fuer, status, grund_ablehnung, erstellt_von, created_at",
      )
      .eq("user_id", account)
      .order("created_at", { ascending: false }),
    supabase.from("abos").select("tool, kategorie, kosten, intervall, status").eq("user_id", account),
    supabase.from("profiles").select("budget_jahr").eq("id", account).maybeSingle(),
    supabase.from("kunden").select("name").eq("user_id", account).order("name"),
    supabase
      .from("dir_produkt")
      .select("name, farbe, einsatzgebiet")
      .eq("status", "veroeffentlicht")
      .order("name")
      .limit(200),
    // Entscheiden darf nur der Kontoinhaber oder ein Admin des Kontos (B-25).
    account === user.id
      ? Promise.resolve({ data: { role: "owner" } })
      : supabase.from("team_members").select("role").eq("account_owner", account).eq("member", user.id).maybeSingle(),
  ]);

  const rows = (antragRes.data as AntragRow[]) ?? [];

  // Kommentare in einem Rutsch nachladen.
  const ids = rows.map((r) => r.id);
  const kommentarRes = ids.length
    ? await supabase
        .from("freigabe_kommentar")
        .select("id, antrag_id, autor_name, text")
        .in("antrag_id", ids)
        .order("created_at")
    : { data: [] as KommentarRow[] };

  const kommentareJeAntrag = new Map<string, Kommentar[]>();
  for (const k of (kommentarRes.data as KommentarRow[]) ?? []) {
    const liste = kommentareJeAntrag.get(k.antrag_id) ?? [];
    liste.push({ id: k.id, autor: k.autor_name, text: k.text });
    kommentareJeAntrag.set(k.antrag_id, liste);
  }

  type AboZeile = Pick<Abo, "tool" | "kategorie" | "kosten" | "intervall" | "status">;
  const aktiveAbos = ((aboRes.data as AboZeile[]) ?? []).filter((a) => a.status === "aktiv" || a.status === "Trial");
  const aktuellMonat = aktiveAbos.reduce((s, a) => s + monatlich(a.kosten, a.intervall), 0);
  const budgetJahr = profilRes.data?.budget_jahr ? Number(profilRes.data.budget_jahr) : null;

  const proKategorie = new Map<string, AboZeile[]>();
  for (const a of aktiveAbos) {
    const liste = proKategorie.get(a.kategorie) ?? [];
    liste.push(a);
    proKategorie.set(a.kategorie, liste);
  }

  const liste: Antrag[] = rows.map((a) => {
    const mtl = Math.round(monatlich(Number(a.kosten), a.intervall) * 100) / 100;
    const kontext: Kontext[] = [];

    if (a.status === "ausstehend") {
      const gleiche = proKategorie.get(a.kategorie) ?? [];

      if (gleiche.length > 0) {
        kontext.push({
          typ: "redundanz",
          text: `Ihr habt bereits ${gleiche.length} aktive${gleiche.length === 1 ? "s Tool" : " Tools"} in der Kategorie „${a.kategorie}“ (${gleiche
            .map((g) => g.tool)
            .slice(0, 3)
            .join(", ")}). Prüf auf Überschneidung.`,
        });

        // Ehrliche Alternative: ein eigenes, guenstigeres Tool derselben Kategorie.
        // Aus dem Verzeichnis liesse sich das nicht belastbar ableiten, dort gibt
        // es noch keine gepflegten Preise. Also erfinden wir auch keine.
        const guenstiger = gleiche
          .map((g) => ({ tool: g.tool, m: monatlich(g.kosten, g.intervall) }))
          .filter((g) => g.m < mtl)
          .sort((x, y) => x.m - y.m)[0];
        if (guenstiger) {
          kontext.push({
            typ: "alternative",
            text: `${guenstiger.tool} deckt dieselbe Kategorie ab und kostet nur ${formatEur(guenstiger.m)} pro Monat.`,
          });
        }
      }

      if (budgetJahr && (aktuellMonat + mtl) * 12 > budgetJahr) {
        const ueber = (aktuellMonat + mtl) * 12 - budgetJahr;
        kontext.push({
          typ: "budget",
          text: `Das würde dein Jahresbudget um ${formatEur(ueber)} überschreiten.`,
        });
      }
    }

    return {
      id: a.id,
      tool: a.tool,
      farbe: KATEGORIE_FARBEN[a.kategorie] ?? "#6C5CE7",
      kategorie: a.kategorie,
      kosten: Number(a.kosten),
      intervall: a.intervall,
      monatlich: mtl,
      antragsteller: a.antragsteller,
      begruendung: a.begruendung,
      fuer: a.fuer ?? "intern",
      status: a.status,
      grund_ablehnung: a.grund_ablehnung,
      datum: relativ(a.created_at),
      kontext,
      kommentare: kommentareJeAntrag.get(a.id) ?? [],
      eigener: a.erstellt_von === user.id,
    };
  });

  const vorschlaege: Vorschlag[] = (
    (produktRes.data as { name: string; farbe: string; einsatzgebiet: string | null }[]) ?? []
  ).map((p) => ({ name: p.name, kategorie: p.einsatzgebiet ?? "Sonstiges", farbe: p.farbe }));

  const rolle = (rolleRes.data as { role: string } | null)?.role;

  return (
    <FreigabenClient
      antraege={liste}
      kategorien={[...proKategorie.keys()].sort()}
      kunden={((kundenRes.data as { name: string }[]) ?? []).map((k) => k.name)}
      vorschlaege={vorschlaege}
      darfEntscheiden={rolle === "owner" || rolle === "admin"}
    />
  );
}
