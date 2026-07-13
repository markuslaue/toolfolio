import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { VerzeichnisClient, type DirTool, type KategorieKachel } from "@/components/app/verzeichnis-client";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";
import { bewertungenFuer, produktInitialen } from "@/lib/verzeichnis";
import { monatlich, type Abo } from "@/lib/abos";
import { kanalLabel, type Zahlungskanal } from "@/lib/zahlungskanaele";

export const metadata: Metadata = { title: "Verzeichnis" };

const KATEGORIE_PALETTE = ["#6C5CE7", "#FF7A66", "#12B76A", "#F5A623", "#3B82F6", "#0FB5BA", "#E84393", "#6B7280"];

type ProduktRow = {
  id: string;
  slug: string;
  name: string;
  anbieter: string | null;
  farbe: string;
  kurzbeschreibung: string | null;
  features: string[];
  pro: string[];
  contra: string[];
  einsatzgebiet: string | null;
  preis_hinweis: string | null;
  preis_stand: string | null;
  preis_quelle_url: string | null;
};

/** Toolnamen vergleichbar machen ("Canva Teams" und "canva" sollen matchen). */
function normalisiere(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export default async function VerzeichnisAppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const account = await getActiveAccount(supabase, user.id);

  const [produktRes, aboRes, kanalRes, kundenRes, zuordnungRes] = await Promise.all([
    supabase
      .from("dir_produkt")
      .select(
        "id, slug, name, anbieter, farbe, kurzbeschreibung, features, pro, contra, einsatzgebiet, preis_hinweis, preis_stand, preis_quelle_url",
      )
      .eq("status", "veroeffentlicht")
      .order("name"),
    supabase.from("abos").select("*").eq("user_id", account),
    supabase.from("zahlungskanaele").select("*").eq("user_id", account),
    supabase.from("kunden").select("name").eq("user_id", account).order("name"),
    supabase.from("dir_collection_produkt").select("collection_id, produkt_id"),
  ]);

  const produkte = (produktRes.data as ProduktRow[]) ?? [];
  const abos = ((aboRes.data as Abo[]) ?? []).filter(
    (a) => a.status !== "archiviert" && a.status !== "gekuendigt",
  );

  const bewertungen = await bewertungenFuer(produkte.map((p) => p.id));

  // Eigener Bestand: Abo je normalisiertem Toolnamen.
  const aboByName = new Map<string, Abo>();
  for (const a of abos) aboByName.set(normalisiere(a.tool), a);

  /* Aehnliche Tools: alles, was mit einem Produkt in derselben Sammlung steckt. */
  const zuordnungen = (zuordnungRes.data as { collection_id: string; produkt_id: string }[]) ?? [];
  const produkteJeCollection = new Map<string, string[]>();
  const collectionsJeProdukt = new Map<string, string[]>();
  for (const z of zuordnungen) {
    produkteJeCollection.set(z.collection_id, [...(produkteJeCollection.get(z.collection_id) ?? []), z.produkt_id]);
    collectionsJeProdukt.set(z.produkt_id, [...(collectionsJeProdukt.get(z.produkt_id) ?? []), z.collection_id]);
  }
  const produktById = new Map(produkte.map((p) => [p.id, p]));

  function aehnliche(produktId: string) {
    const raus = new Set<string>();
    for (const c of collectionsJeProdukt.get(produktId) ?? []) {
      for (const p of produkteJeCollection.get(c) ?? []) {
        if (p !== produktId) raus.add(p);
      }
    }
    return [...raus]
      .map((id) => produktById.get(id))
      .filter((p): p is ProduktRow => Boolean(p))
      .slice(0, 5)
      .map((p) => ({ name: p.name, slug: p.slug, farbe: p.farbe }));
  }

  const tools: DirTool[] = produkte.map((p) => {
    const abo = aboByName.get(normalisiere(p.name)) ?? null;
    const b = bewertungen.get(p.id);
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      initialen: produktInitialen(p.name),
      farbe: p.farbe,
      anbieter: p.anbieter,
      kategorie: p.einsatzgebiet ?? "Sonstiges",
      kurzbeschreibung: p.kurzbeschreibung,
      features: p.features ?? [],
      pro: p.pro ?? [],
      contra: p.contra ?? [],
      preisHinweis: p.preis_hinweis,
      preisStand: p.preis_stand,
      preisQuelle: p.preis_quelle_url,
      bewertung: b && b.anzahl > 0 ? { schnitt: b.schnitt, anzahl: b.anzahl } : null,
      imStack: Boolean(abo),
      aboId: abo?.id ?? null,
      meinPreis: abo ? Math.round(monatlich(abo.kosten, abo.intervall) * 100) / 100 : null,
      alternativen: aehnliche(p.id),
    };
  });

  // Kategorien mit echten Zaehlungen.
  const zaehler = new Map<string, number>();
  for (const t of tools) zaehler.set(t.kategorie, (zaehler.get(t.kategorie) ?? 0) + 1);
  const kategorien: KategorieKachel[] = [...zaehler.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, anzahl], i) => ({ name, anzahl, farbe: KATEGORIE_PALETTE[i % KATEGORIE_PALETTE.length] }));

  /* "Fuer dich": Tools aus Kategorien, in denen du schon etwas hast, die dir
     aber noch fehlen. Ehrliche Personalisierung aus dem eigenen Bestand,
     keine erfundene Empfehlung. */
  const meineKategorien = new Set(abos.map((a) => a.kategorie));
  const fuerDich = tools
    .filter((t) => !t.imStack && meineKategorien.has(t.kategorie))
    .sort((a, b) => (b.bewertung?.schnitt ?? 0) - (a.bewertung?.schnitt ?? 0))
    .slice(0, 4);

  const kanalOptionen = ((kanalRes.data as Zahlungskanal[]) ?? []).filter((k) => k.aktiv).map(kanalLabel);
  const kundenOptionen = ((kundenRes.data as { name: string }[]) ?? []).map((k) => k.name);

  return (
    <VerzeichnisClient
      tools={tools}
      kategorien={kategorien}
      fuerDich={fuerDich}
      kanalOptionen={kanalOptionen}
      kundenOptionen={kundenOptionen}
    />
  );
}
