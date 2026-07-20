import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MousePointerClick, Smartphone, Monitor, Search } from "lucide-react";
import { redaktionOderRaus } from "@/lib/redaktion";

export const metadata: Metadata = { title: "Statistik", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * AD-13: Klickstatistik, die Grundlage jedes Anbietergespraechs.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER STEHT, IST BELEGBAR, und was nicht belegbar ist, steht nicht hier.
 *
 * Gezaehlt werden ausgehende Klicks: jemand hat auf unserer Seite auf den Anbieter
 * geklickt. Das ist eine harte Zahl aus unserer eigenen Datenbank.
 *
 * NICHT hier steht, woher der Besucher urspruenglich kam oder welchen Weg er ueber
 * die Seite genommen hat. Dafuer braeuchte es eine Sitzungskennung im Browser des
 * Besuchers, also ein Einwilligungsbanner (§ 25 TTDSG). Die seitenbezogene Herkunft
 * liefert Plausible aggregiert. Eine Zahl zu zeigen, die man nicht sauber erheben
 * kann, waere in einem Verkaufsgespraech die schlechteste aller Ideen.
 * ---------------------------------------------------------------------------
 */

const ZEITRAEUME = [
  { tage: 7, label: "7 Tage" },
  { tage: 30, label: "30 Tage" },
  { tage: 90, label: "90 Tage" },
  { tage: 365, label: "12 Monate" },
] as const;

type Klick = {
  produkt_id: string;
  collection_id: string | null;
  zone: string | null;
  ist_affiliate: boolean;
  geraet: string | null;
  utm_source: string | null;
  erstellt_am: string;
};

export default async function StatistikPage({
  searchParams,
}: {
  searchParams: Promise<{ tage?: string }>;
}) {
  const { admin } = await redaktionOderRaus("/admin/statistik");
  const sp = await searchParams;
  const tage = ZEITRAEUME.some((z) => String(z.tage) === sp.tage) ? Number(sp.tage) : 30;

  const seit = new Date(Date.now() - tage * 86_400_000).toISOString();

  const seitDatum = seit.slice(0, 10);
  const [{ data: klicks }, { data: produkte }, { data: collections }, { data: suchdaten }, { data: letzterAbruf }] = await Promise.all([
    admin
      .from("dir_klick")
      .select("produkt_id, collection_id, zone, ist_affiliate, geraet, utm_source, erstellt_am")
      .gte("erstellt_am", seit)
      .limit(50000),
    admin.from("dir_produkt").select("id, name, slug"),
    admin.from("dir_collection").select("id, name, slug"),
    admin
      .from("dir_suchdaten")
      .select("collection_id, suchanfrage, impressionen, klicks, position")
      .gte("datum", seitDatum)
      .limit(50000),
    admin
      .from("system_suchdaten_lauf")
      .select("bis, zeilen, ok, erstellt_am")
      .order("erstellt_am", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const alle = (klicks ?? []) as Klick[];
  const produktName = new Map((produkte ?? []).map((p) => [p.id as string, p as { id: string; name: string; slug: string }]));
  const collName = new Map((collections ?? []).map((c) => [c.id as string, c.name as string]));

  /* Auswertung in JS statt in der Datenbank: bei diesen Mengen ist das schneller
     als vier Aggregat-Abfragen, und der Code bleibt an einer Stelle lesbar. */
  const jeProdukt = new Map<string, { klicks: number; affiliate: number; gesponsert: number }>();
  const jeCollection = new Map<string, number>();
  let mobil = 0;
  const jeTag = new Map<string, number>();

  for (const k of alle) {
    const p = jeProdukt.get(k.produkt_id) ?? { klicks: 0, affiliate: 0, gesponsert: 0 };
    p.klicks++;
    if (k.ist_affiliate) p.affiliate++;
    if (k.zone === "gesponsert") p.gesponsert++;
    jeProdukt.set(k.produkt_id, p);

    if (k.collection_id) jeCollection.set(k.collection_id, (jeCollection.get(k.collection_id) ?? 0) + 1);
    if (k.geraet === "mobil") mobil++;
    const tag = k.erstellt_am.slice(0, 10);
    jeTag.set(tag, (jeTag.get(tag) ?? 0) + 1);
  }

  const topProdukte = [...jeProdukt.entries()]
    .map(([id, v]) => ({ id, ...v, name: produktName.get(id)?.name ?? "Unbekannt", slug: produktName.get(id)?.slug }))
    .sort((a, b) => b.klicks - a.klicks)
    .slice(0, 25);

  const topSeiten = [...jeCollection.entries()]
    .map(([id, n]) => ({ name: collName.get(id) ?? "Unbekannt", klicks: n }))
    .sort((a, b) => b.klicks - a.klicks)
    .slice(0, 15);

  const gesamt = alle.length;
  const affiliateKlicks = alle.filter((k) => k.ist_affiliate).length;

  /* Suchanfragen zusammenfassen. Dieselbe Anfrage taucht je Tag einmal auf, also
     ueber die Tage summieren. Die Position wird gewichtet gemittelt: ein Tag mit
     1000 Impressionen sagt mehr ueber die tatsaechliche Position aus als einer mit
     zweien, und ein ungewichteter Mittelwert wuerde das verschleiern. */
  type SuchZeile = { collection_id: string | null; suchanfrage: string; impressionen: number; klicks: number; position: number | null };
  const suchAlle = (suchdaten ?? []) as SuchZeile[];
  const jeAnfrage = new Map<string, { impressionen: number; klicks: number; posSumme: number }>();
  let impressionenGesamt = 0;
  for (const z of suchAlle) {
    const a = jeAnfrage.get(z.suchanfrage) ?? { impressionen: 0, klicks: 0, posSumme: 0 };
    a.impressionen += z.impressionen;
    a.klicks += z.klicks;
    a.posSumme += (z.position ?? 0) * z.impressionen;
    jeAnfrage.set(z.suchanfrage, a);
    impressionenGesamt += z.impressionen;
  }
  const topAnfragen = [...jeAnfrage.entries()]
    .map(([anfrage, v]) => ({
      anfrage,
      impressionen: v.impressionen,
      klicks: v.klicks,
      position: v.impressionen > 0 ? v.posSumme / v.impressionen : null,
    }))
    .sort((a, b) => b.impressionen - a.impressionen)
    .slice(0, 25);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Statistik</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ausgehende Klicks auf Anbieter. Die Grundlage für jedes Gespräch über Sichtbarkeit.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {ZEITRAEUME.map((z) => (
          <Link
            key={z.tage}
            href={`/admin/statistik?tage=${z.tage}`}
            className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
              tage === z.tage ? "border-foreground bg-foreground text-background" : "bg-card hover:bg-accent"
            }`}
          >
            {z.label}
          </Link>
        ))}
      </div>

      {gesamt === 0 ? (
        <div className="mt-6 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Noch keine Klicks in diesem Zeitraum.</p>
          <p className="mt-1">
            Gezählt wird ab dem Moment, in dem die Anbieter-Links über den Ausgang laufen. Vorher
            entstandene Klicks lassen sich nicht nachträglich rekonstruieren, und wir erfinden sie nicht.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <Kachel label="Klicks gesamt" wert={gesamt.toLocaleString("de-DE")} icon={MousePointerClick} />
            <Kachel label="davon Affiliate" wert={affiliateKlicks.toLocaleString("de-DE")} />
            <Kachel
              label="mobil"
              wert={`${Math.round((mobil / gesamt) * 100)} %`}
              icon={mobil / gesamt > 0.5 ? Smartphone : Monitor}
            />
            <Kachel label="Anbieter mit Klicks" wert={String(jeProdukt.size)} />
          </div>

          <h2 className="mt-10 font-display text-lg font-semibold">Nach Anbieter</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Genau diese Zahl kannst du einem Anbieter nennen: so viele Interessenten haben ihn über
            Toolfolio aufgerufen.
          </p>
          <div className="mt-3 overflow-hidden rounded-2xl border bg-card">
            <ul className="divide-y">
              {topProdukte.map((p) => (
                <li key={p.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{p.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {p.gesponsert > 0 && `${p.gesponsert} aus der Anzeigenzone · `}
                      {p.affiliate > 0 && `${p.affiliate} über Affiliate-Link · `}
                      {p.klicks - p.gesponsert} organisch
                    </div>
                  </div>
                  <span className="font-display text-xl font-semibold tabular-nums">{p.klicks}</span>
                </li>
              ))}
            </ul>
          </div>

          <h2 className="mt-10 font-display text-lg font-semibold">Nach Kategorieseite</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Von welcher Seite aus geklickt wurde. Woher der Besucher ursprünglich kam, steht in
            Plausible: diese beiden Zahlen ergeben zusammen das Bild.
          </p>
          <div className="mt-3 overflow-hidden rounded-2xl border bg-card">
            <ul className="divide-y">
              {topSeiten.map((s) => (
                <li key={s.name} className="flex items-center gap-4 px-4 py-3">
                  <span className="min-w-0 flex-1 font-medium">{s.name}</span>
                  <span className="font-display text-lg font-semibold tabular-nums">{s.klicks}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* SUCHANFRAGEN, die zweite Haelfte des Anbieterberichts.
          dir_klick sagt, wie viele geklickt haben. Das hier sagt, womit sie ueberhaupt
          gekommen sind. Erst zusammen ergibt es eine Aussage. */}
      <h2 className="mt-10 font-display text-lg font-semibold">Woher der Traffic kam</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Suchanfragen aus der Google Search Console.{" "}
        {letzterAbruf
          ? `Zuletzt abgerufen bis ${new Date((letzterAbruf as { bis: string }).bis).toLocaleDateString("de-DE")}.`
          : "Noch kein Abruf gelaufen."}
      </p>

      {topAnfragen.length === 0 ? (
        <div className="mt-3 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Noch keine Suchdaten in diesem Zeitraum.</p>
          <p className="mt-1">
            Google muss die Seiten erst indexieren und ausliefern, bevor hier etwas steht. Bei frisch
            veröffentlichten Kategorien dauert das erfahrungsgemäß vier bis acht Wochen.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Kachel label="Impressionen" wert={impressionenGesamt.toLocaleString("de-DE")} icon={Search} />
            <Kachel
              label="Klicks aus der Suche"
              wert={suchAlle.reduce((s, z) => s + z.klicks, 0).toLocaleString("de-DE")}
            />
            <Kachel label="verschiedene Suchanfragen" wert={jeAnfrage.size.toLocaleString("de-DE")} />
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border bg-card">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b bg-muted/40 px-4 py-2 text-xs font-semibold text-muted-foreground">
              <span>Suchanfrage</span>
              <span className="text-right">Impr.</span>
              <span className="text-right">Klicks</span>
              <span className="text-right">Pos.</span>
            </div>
            <ul className="divide-y">
              {topAnfragen.map((a) => (
                <li key={a.anfrage} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2.5 text-sm">
                  <span className="truncate">{a.anfrage}</span>
                  <span className="text-right tabular-nums">{a.impressionen.toLocaleString("de-DE")}</span>
                  <span className="text-right tabular-nums">{a.klicks}</span>
                  <span className="text-right tabular-nums text-muted-foreground">
                    {a.position ? a.position.toFixed(1).replace(".", ",") : "-"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            Google lässt sehr seltene Suchanfragen aus Datenschutzgründen weg. Die Summe der
            einzelnen Zeilen ist deshalb immer kleiner als die Gesamtzahl oben. Das ist kein
            Rechenfehler.
          </p>
        </>
      )}

      <div className="mt-10 rounded-2xl border bg-muted/30 p-4 text-xs leading-relaxed text-muted-foreground">
        <p className="font-semibold text-foreground">Was hier bewusst fehlt</p>
        <p className="mt-1">
          Der Weg eines Besuchers über mehrere Seiten und seine ursprüngliche Herkunft (Google, LinkedIn)
          werden nicht erfasst. Dafür wäre eine Sitzungskennung im Browser nötig, und die verlangt eine
          Einwilligung, also ein Cookie-Banner. Gespeichert werden keine IP-Adressen, keine Kennungen und
          nichts auf dem Gerät des Besuchers. Diese Statistik ist damit nicht personenbezogen.
        </p>
      </div>

      <Link
        href="/admin"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        Zurück zum Admin <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

function Kachel({
  label,
  wert,
  icon: Icon,
}: {
  label: string;
  wert: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        {Icon && <Icon className="size-4 text-muted-foreground" />}
      </div>
      <div className="mt-1 font-display text-2xl font-semibold tabular-nums">{wert}</div>
    </div>
  );
}
