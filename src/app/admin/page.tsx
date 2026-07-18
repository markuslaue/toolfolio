import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Package, Users, Receipt, AlertTriangle, DatabaseBackup } from "lucide-react";
import { redaktionOderRaus } from "@/lib/redaktion";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

function Kachel({
  label,
  wert,
  hint,
  icon: Icon,
  ton,
}: {
  label: string;
  wert: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  ton?: "warn" | "gut";
}) {
  return (
    <div className="rounded-2xl border bg-background p-5">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <div
        className={`mt-2 font-display text-2xl font-semibold tabular-nums ${
          ton === "warn" ? "text-warning" : ton === "gut" ? "text-success" : ""
        }`}
      >
        {wert}
      </div>
      {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export default async function AdminDashboard() {
  const { admin } = await redaktionOderRaus("/admin");

  /* Achtung: Supabase deckelt ein select ohne Grenze STILL bei 1000 Zeilen.
     Das Verzeichnis hat 1292 Kategorien. Deshalb wird hier gezaehlt, nicht geladen:
     ein "select status" haette 292 Kategorien verschluckt, ohne einen Fehler zu werfen. */
  const zaehle = (tabelle: string, filter?: [string, string]) => {
    let q = admin.from(tabelle).select("*", { count: "exact", head: true });
    if (filter) q = q.eq(filter[0], filter[1]);
    return q;
  };

  const [cluster, collGesamt, collLive, collOhneText, collTextOffen, prodGesamt, prodLive, prodOffen, zuordnungen, nutzer, abos] =
    await Promise.all([
      zaehle("dir_cluster"),
      zaehle("dir_collection"),
      zaehle("dir_collection", ["status", "veroeffentlicht"]),
      zaehle("dir_collection", ["content_status", "fehlt"]),
      zaehle("dir_collection", ["content_status", "ki_ungeprueft"]),
      zaehle("dir_produkt"),
      zaehle("dir_produkt", ["status", "veroeffentlicht"]),
      zaehle("dir_produkt", ["status", "ki_ungeprueft"]),
      zaehle("dir_collection_produkt"),
      zaehle("profiles"),
      zaehle("abos"),
    ]);

  const [{ data: sicherung }, { count: sicherungenGesamt }] = await Promise.all([
    admin.from("system_backup").select("*").order("erstellt_am", { ascending: false }).limit(1).maybeSingle(),
    admin.from("system_backup").select("*", { count: "exact", head: true }),
  ]);
  const letzteSicherung = sicherung as {
    ok: boolean; datei: string; groesse_bytes: number | null; tabellen: number | null;
    dauer_sekunden: number | null; fehler: string | null; erstellt_am: string;
  } | null;
  const sicherungen = sicherungenGesamt ?? 0;

  const collAnzahl = collGesamt.count ?? 0;
  const live = collLive.count ?? 0;
  const mitText = collAnzahl - (collOhneText.count ?? 0);
  const textOffen = collTextOffen.count ?? 0;
  const produkteLive = prodLive.count ?? 0;
  const produkteOffen = prodOffen.count ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Admin</h1>
      <p className="mt-1 text-sm text-muted-foreground">Redaktion und Betrieb von Toolfolio.</p>

      <h2 className="mt-8 font-display text-lg font-semibold">Verzeichnis</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kachel label="Cluster" wert={String(cluster.count ?? 0)} icon={BookOpen} />
        <Kachel
          label="Kategorien"
          wert={String(collAnzahl)}
          hint={live > 0 ? `${live} live` : "noch keine live"}
          icon={FileText}
          ton={live > 0 ? "gut" : undefined}
        />
        <Kachel label="Mit Text" wert={`${mitText} / ${collAnzahl}`} icon={FileText} />
        <Kachel
          label="Produkte"
          wert={String(prodGesamt.count ?? 0)}
          hint={`${produkteLive} veröffentlicht, ${zuordnungen.count ?? 0} Zuordnungen`}
          icon={Package}
        />
      </div>

      {(textOffen > 0 || produkteOffen > 0) && (
        <div className="mt-4 rounded-2xl border border-warning/40 bg-warning/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
              <div>
                <div className="font-semibold">Wartet auf dich</div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {textOffen > 0 && `${textOffen} ${textOffen === 1 ? "Text" : "Texte"} von der KI, ungeprüft`}
                  {textOffen > 0 && produkteOffen > 0 && " · "}
                  {produkteOffen > 0 && `${produkteOffen} Produkte ungeprüft`}
                </p>
              </div>
            </div>
            <Link
              href="/admin/verzeichnis"
              className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
            >
              Zur Redaktion <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      )}

      {/* SICHERUNGSSTATUS.
          Der Punkt der ganzen Uebung: eine Sicherung, von der niemand weiss, ob sie
          laeuft, ist keine Sicherung. Wird der letzte Eintrag aelter als 26 Stunden,
          ist die naechtliche Sicherung ausgefallen, und das steht hier in Rot.
          Schweigen ist hier ein Alarm, kein "alles gut". */}
      <h2 className="mt-10 font-display text-lg font-semibold">Datensicherung</h2>
      {(() => {
        if (!letzteSicherung) {
          return (
            <div className="mt-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                <div>
                  <div className="font-semibold">Noch keine Sicherung gelaufen.</div>
                  <p className="mt-0.5 text-muted-foreground">
                    Sobald der nächtliche Lauf das erste Mal durch ist, steht hier, wann und wie groß.
                  </p>
                </div>
              </div>
            </div>
          );
        }
        const alterStunden = (Date.now() - new Date(letzteSicherung.erstellt_am).getTime()) / 3_600_000;
        const veraltet = alterStunden > 26;
        const schlecht = !letzteSicherung.ok || veraltet;
        return (
          <div
            className={`mt-3 rounded-2xl border p-4 text-sm ${
              schlecht ? "border-destructive/40 bg-destructive/10" : "border-success/30 bg-success/5"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <DatabaseBackup className={`mt-0.5 size-4 shrink-0 ${schlecht ? "text-destructive" : "text-success"}`} />
                <div>
                  <div className="font-semibold">
                    {!letzteSicherung.ok
                      ? "Die letzte Sicherung ist fehlgeschlagen."
                      : veraltet
                        ? `Letzte Sicherung ist ${Math.floor(alterStunden)} Stunden alt.`
                        : "Sicherung läuft."}
                  </div>
                  <p className="mt-0.5 text-muted-foreground">
                    {new Date(letzteSicherung.erstellt_am).toLocaleString("de-DE")} · {letzteSicherung.datei}
                    {letzteSicherung.groesse_bytes
                      ? ` · ${(Number(letzteSicherung.groesse_bytes) / 1_048_576).toFixed(1)} MB`
                      : ""}
                    {letzteSicherung.tabellen ? ` · ${letzteSicherung.tabellen} Tabellen` : ""}
                    {letzteSicherung.dauer_sekunden ? ` · ${letzteSicherung.dauer_sekunden}s` : ""}
                  </p>
                  {letzteSicherung.fehler && (
                    <p className="mt-1 text-destructive">{letzteSicherung.fehler}</p>
                  )}
                  {veraltet && letzteSicherung.ok && (
                    <p className="mt-1 text-destructive">
                      Der nächtliche Lauf hat sich nicht gemeldet. Bitte den Cronjob auf dem Server prüfen.
                    </p>
                  )}
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {sicherungen} {sicherungen === 1 ? "Sicherung" : "Sicherungen"} protokolliert
              </span>
            </div>
          </div>
        );
      })()}

      <h2 className="mt-10 font-display text-lg font-semibold">Betrieb</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kachel label="Konten" wert={String(nutzer.count ?? 0)} icon={Users} />
        <Kachel label="Abos insgesamt" wert={String(abos.count ?? 0)} icon={Receipt} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Zahlen aus dem gesamten Bestand. Personenbezogene Inhalte sind hier bewusst nicht einsehbar: das Admin-Backend
        zeigt Betriebsgrößen, keine Kundendaten.
      </p>
    </div>
  );
}
