import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Package, Users, Receipt, AlertTriangle } from "lucide-react";
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

  const [cluster, collections, produkte, zuordnungen, nutzer, abos] = await Promise.all([
    admin.from("dir_cluster").select("id", { count: "exact", head: true }),
    admin.from("dir_collection").select("status, content_status"),
    admin.from("dir_produkt").select("status"),
    admin.from("dir_collection_produkt").select("collection_id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("abos").select("id", { count: "exact", head: true }),
  ]);

  type Coll = { status: string; content_status: string };
  type Prod = { status: string };
  const colls = (collections.data as Coll[]) ?? [];
  const prods = (produkte.data as Prod[]) ?? [];

  const live = colls.filter((c) => c.status === "veroeffentlicht").length;
  const mitText = colls.filter((c) => c.content_status !== "fehlt").length;
  const textOffen = colls.filter((c) => c.content_status === "ki_ungeprueft").length;
  const produkteOffen = prods.filter((p) => p.status === "ki_ungeprueft").length;
  const produkteLive = prods.filter((p) => p.status === "veroeffentlicht").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Admin</h1>
      <p className="mt-1 text-sm text-muted-foreground">Redaktion und Betrieb von Toolfolio.</p>

      <h2 className="mt-8 font-display text-lg font-semibold">Verzeichnis</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kachel label="Cluster" wert={String(cluster.count ?? 0)} icon={BookOpen} />
        <Kachel
          label="Kategorien"
          wert={String(colls.length)}
          hint={live > 0 ? `${live} live` : "noch keine live"}
          icon={FileText}
          ton={live > 0 ? "gut" : undefined}
        />
        <Kachel label="Mit Text" wert={`${mitText} / ${colls.length}`} icon={FileText} />
        <Kachel
          label="Produkte"
          wert={String(prods.length)}
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
