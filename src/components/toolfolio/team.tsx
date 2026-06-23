import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  UsersRound,
  ShieldAlert,
  KeyRound,
  UserMinus,
  Plus,
  ChevronRight,
  X,
  Check,
  AlertTriangle,
  CircleAlert,
  Info,
  Armchair,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { toast } from "sonner";

// ---------- Typen ----------
type PersonStatus = "aktiv" | "scheidet_aus" | "ausgeschieden";

type Person = {
  id: string;
  name: string;
  rolle: string;
  status: PersonStatus;
  austritt?: string;
  farbe: string;
};

type Zugang = {
  personId: string;
  toolId: string;
  letzteAktivitaet: string | null; // null => "Nutzungsdaten nötig"
  platzKosten: number; // € / Monat
};

type Tool = {
  id: string;
  name: string;
  kategorie: string;
  ownerId: string | null;
  farbe: string;
};

const euro = (n: number) =>
  n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

// ---------- Mock ----------
const personen: Person[] = [
  { id: "p1", name: "Markus L.", rolle: "Inhaber", status: "aktiv", farbe: "#6C5CE7" },
  { id: "p2", name: "Lena M.", rolle: "Design Lead", status: "aktiv", farbe: "#FF7A66" },
  { id: "p3", name: "Tom K.", rolle: "Entwickler", status: "aktiv", farbe: "#12B76A" },
  { id: "p4", name: "Sara B.", rolle: "Operations", status: "aktiv", farbe: "#F5A623" },
  {
    id: "p5",
    name: "Jonas R.",
    rolle: "Marketing",
    status: "scheidet_aus",
    austritt: "31.01.2026",
    farbe: "#F0533D",
  },
];

const tools: Tool[] = [
  { id: "t1", name: "Slack", kategorie: "Kommunikation", ownerId: "p1", farbe: "#6C5CE7" },
  { id: "t2", name: "Figma", kategorie: "Design", ownerId: "p2", farbe: "#FF7A66" },
  { id: "t3", name: "Notion", kategorie: "Wissen", ownerId: "p1", farbe: "#12B76A" },
  { id: "t4", name: "Adobe CC", kategorie: "Design", ownerId: null, farbe: "#F0533D" },
  { id: "t5", name: "GitHub", kategorie: "Entwicklung", ownerId: "p3", farbe: "#1F1D2B" },
  { id: "t6", name: "Google Workspace", kategorie: "Produktivität", ownerId: "p1", farbe: "#F5A623" },
  { id: "t7", name: "HubSpot", kategorie: "Marketing", ownerId: null, farbe: "#FF7A66" },
  { id: "t8", name: "Linear", kategorie: "Projekt", ownerId: "p3", farbe: "#6C5CE7" },
];

const initialZugaenge: Zugang[] = [
  // Markus
  { personId: "p1", toolId: "t1", letzteAktivitaet: "heute", platzKosten: 8 },
  { personId: "p1", toolId: "t3", letzteAktivitaet: "gestern", platzKosten: 10 },
  { personId: "p1", toolId: "t6", letzteAktivitaet: "heute", platzKosten: 12 },
  { personId: "p1", toolId: "t7", letzteAktivitaet: "vor 3 Tagen", platzKosten: 45 },
  // Lena
  { personId: "p2", toolId: "t1", letzteAktivitaet: "heute", platzKosten: 8 },
  { personId: "p2", toolId: "t2", letzteAktivitaet: "heute", platzKosten: 15 },
  { personId: "p2", toolId: "t4", letzteAktivitaet: "vor 2 Wochen", platzKosten: 60 },
  { personId: "p2", toolId: "t6", letzteAktivitaet: "heute", platzKosten: 12 },
  // Tom
  { personId: "p3", toolId: "t1", letzteAktivitaet: "heute", platzKosten: 8 },
  { personId: "p3", toolId: "t5", letzteAktivitaet: "heute", platzKosten: 19 },
  { personId: "p3", toolId: "t8", letzteAktivitaet: "gestern", platzKosten: 8 },
  { personId: "p3", toolId: "t6", letzteAktivitaet: "heute", platzKosten: 12 },
  // Sara
  { personId: "p4", toolId: "t1", letzteAktivitaet: "heute", platzKosten: 8 },
  { personId: "p4", toolId: "t3", letzteAktivitaet: "heute", platzKosten: 10 },
  { personId: "p4", toolId: "t6", letzteAktivitaet: "heute", platzKosten: 12 },
  { personId: "p4", toolId: "t7", letzteAktivitaet: null, platzKosten: 45 },
  // Jonas (scheidet aus, 6 Zugänge)
  { personId: "p5", toolId: "t1", letzteAktivitaet: "vor 5 Tagen", platzKosten: 8 },
  { personId: "p5", toolId: "t2", letzteAktivitaet: "vor 2 Wochen", platzKosten: 15 },
  { personId: "p5", toolId: "t3", letzteAktivitaet: "vor 1 Woche", platzKosten: 10 },
  { personId: "p5", toolId: "t4", letzteAktivitaet: "vor 3 Wochen", platzKosten: 60 },
  { personId: "p5", toolId: "t6", letzteAktivitaet: "vor 4 Tagen", platzKosten: 12 },
  { personId: "p5", toolId: "t7", letzteAktivitaet: "vor 1 Tag", platzKosten: 45 },
];

// ---------- Helpers ----------
function Avatar({ person, size = 36 }: { person: Person; size?: number }) {
  const initials = person.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  return (
    <div
      className="rounded-full grid place-items-center text-white font-semibold shrink-0"
      style={{ background: person.farbe, width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}

function StatusPill({ status }: { status: PersonStatus }) {
  if (status === "aktiv")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs font-medium">
        <span className="size-1.5 rounded-full bg-emerald-500" /> aktiv
      </span>
    );
  if (status === "scheidet_aus")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 text-xs font-medium">
        <AlertTriangle className="size-3" /> scheidet aus
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 px-2 py-0.5 text-xs font-medium">
      <X className="size-3" /> ausgeschieden
    </span>
  );
}

// ---------- Komponente ----------
export function Team() {
  const [zugaenge, setZugaenge] = useState<Zugang[]>(initialZugaenge);
  const [personenState, setPersonenState] = useState<Person[]>(personen);
  const [toolsState, setToolsState] = useState<Tool[]>(tools);
  const [pivot, setPivot] = useState<"person" | "tool">("person");
  const [detailPerson, setDetailPerson] = useState<Person | null>(null);
  const [offboarding, setOffboarding] = useState<Person | null>(null);
  const [ownerDialog, setOwnerDialog] = useState<Tool | null>(null);

  const kpi = useMemo(() => {
    const teamCount = personenState.filter((p) => p.status !== "ausgeschieden").length;
    const ownerless = toolsState.filter((t) => !t.ownerId).length;
    const mitOwner = toolsState.length - ownerless;
    const zugaengeGesamt = zugaenge.length;
    const inOff = personenState.filter(
      (p) =>
        p.status === "scheidet_aus" ||
        (p.status === "ausgeschieden" && zugaenge.some((z) => z.personId === p.id))
    ).length;
    return { teamCount, mitOwner, ownerless, zugaengeGesamt, inOff };
  }, [personenState, toolsState, zugaenge]);

  const toolById = (id: string) => toolsState.find((t) => t.id === id)!;
  const personById = (id: string) => personenState.find((p) => p.id === id)!;

  const personenMitMetrik = personenState.map((p) => {
    const meine = zugaenge.filter((z) => z.personId === p.id);
    const fuß = meine.reduce((s, z) => s + z.platzKosten, 0);
    return { p, anzahl: meine.length, fuß };
  });

  return (
    <div className="space-y-6">
      {/* Kopf */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Team & Zugänge
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Wer nutzt was, wer ist verantwortlich, und was beim Austritt zu tun ist.
          </p>
        </div>
        <Button className="gap-2" onClick={() => toast("Einladung versendet (Demo)")}>
          <Plus className="size-4" /> Mitglied einladen
        </Button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon={<UsersRound className="size-4" />}
          label="Teammitglieder"
          value={kpi.teamCount}
        />
        <KpiCard
          icon={<ShieldAlert className="size-4" />}
          label="Tools mit / ohne Owner"
          value={
            <span>
              {kpi.mitOwner}{" "}
              <span className="text-muted-foreground text-base">/</span>{" "}
              <span style={{ color: kpi.ownerless > 0 ? "#F5A623" : undefined }}>
                {kpi.ownerless}
              </span>
            </span>
          }
          hint={kpi.ownerless > 0 ? `${kpi.ownerless} ohne Owner` : "alle zugewiesen"}
          accent={kpi.ownerless > 0 ? "amber" : undefined}
        />
        <KpiCard
          icon={<KeyRound className="size-4" />}
          label="Zugänge gesamt"
          value={kpi.zugaengeGesamt}
        />
        <KpiCard
          icon={<UserMinus className="size-4" />}
          label="In Offboarding"
          value={kpi.inOff}
          accent={kpi.inOff > 0 ? "amber" : undefined}
        />
      </div>

      {/* Pivot */}
      <div className="inline-flex rounded-full border border-border bg-card p-1 text-sm">
        <button
          onClick={() => setPivot("person")}
          className={`px-4 py-1.5 rounded-full font-medium transition ${
            pivot === "person"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          nach Person
        </button>
        <button
          onClick={() => setPivot("tool")}
          className={`px-4 py-1.5 rounded-full font-medium transition ${
            pivot === "tool"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          nach Tool
        </button>
      </div>

      {/* Inhalt */}
      {pivot === "person" ? (
        <div className="grid md:grid-cols-2 gap-3">
          {personenMitMetrik.map(({ p, anzahl, fuß }) => {
            const risiko =
              p.status === "ausgeschieden" &&
              zugaenge.some((z) => z.personId === p.id);
            return (
              <div
                key={p.id}
                className="rounded-[20px] bg-card border border-border p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start gap-3">
                  <Avatar person={p} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-semibold truncate">{p.name}</div>
                      <StatusPill status={p.status} />
                      {risiko && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 px-2 py-0.5 text-xs font-medium">
                          <CircleAlert className="size-3" /> Risiko: aktive Zugänge
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {p.rolle}
                      {p.austritt && ` · Austritt ${p.austritt}`}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Zugänge</div>
                    <div className="font-display text-2xl font-semibold tabular-nums">
                      {anzahl}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      Kostenfußabdruck
                    </div>
                    <div className="font-display text-2xl font-semibold tabular-nums">
                      {euro(fuß)}
                      <span className="text-sm text-muted-foreground font-normal">
                        {" "}
                        / Mon.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => setDetailPerson(p)}
                  >
                    Zugänge ansehen <ChevronRight className="size-4" />
                  </Button>
                  {(p.status === "scheidet_aus" || risiko) && (
                    <Button
                      size="sm"
                      className="gap-1 bg-[#F5A623] hover:bg-[#dd9417] text-white"
                      onClick={() => setOffboarding(p)}
                    >
                      <UserMinus className="size-4" /> Offboarding starten
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {toolsState.map((t) => {
            const nutzer = zugaenge
              .filter((z) => z.toolId === t.id)
              .map((z) => personById(z.personId));
            const owner = t.ownerId ? personById(t.ownerId) : null;
            return (
              <div
                key={t.id}
                className="rounded-[20px] bg-card border border-border p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="size-10 rounded-xl grid place-items-center text-white font-display font-bold"
                    style={{ background: t.farbe }}
                  >
                    {t.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.kategorie}</div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Owner</span>
                    {owner ? (
                      <div className="flex items-center gap-2">
                        <Avatar person={owner} size={22} />
                        <span className="text-sm font-medium">{owner.name}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setOwnerDialog(t)}
                        className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2 py-1 text-xs font-medium hover:bg-amber-100"
                      >
                        <AlertTriangle className="size-3" /> kein Owner · zuweisen
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Nutzer</span>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {nutzer.slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            title={n.name}
                            className="ring-2 ring-card rounded-full"
                          >
                            <Avatar person={n} size={24} />
                          </div>
                        ))}
                      </div>
                      <span className="text-sm font-medium tabular-nums">
                        {nutzer.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast(`${nutzer.length} Nutzer von ${t.name}`)}
                  >
                    Nutzer ansehen
                  </Button>
                  {owner ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOwnerDialog(t)}
                    >
                      Owner ändern
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => setOwnerDialog(t)}>
                      Owner zuweisen
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Hinweis */}
      <div className="rounded-xl border border-border bg-card/60 p-4 text-xs text-muted-foreground flex gap-2">
        <Info className="size-4 shrink-0 text-primary mt-0.5" />
        Zuordnungen kommen aus verbundenen Integrationen oder manueller Pflege. Wo keine
        Aktivitätsdaten vorliegen, kennzeichnen wir das als &bdquo;Nutzungsdaten
        nötig&ldquo; statt zu raten. Das Entziehen passiert beim jeweiligen Anbieter
        — Toolfolio liefert dir die vollständige Checkliste.
      </div>

      {/* Personen-Detail */}
      <Sheet
        open={!!detailPerson}
        onOpenChange={(o) => !o && setDetailPerson(null)}
      >
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {detailPerson && (
            <PersonDetail
              person={detailPerson}
              zugaenge={zugaenge.filter((z) => z.personId === detailPerson.id)}
              toolById={toolById}
              personById={personById}
              onOffboard={() => {
                setDetailPerson(null);
                setOffboarding(detailPerson);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Offboarding */}
      <Sheet
        open={!!offboarding}
        onOpenChange={(o) => !o && setOffboarding(null)}
      >
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {offboarding && (
            <OffboardingFlow
              person={offboarding}
              zugaenge={zugaenge.filter((z) => z.personId === offboarding.id)}
              toolById={toolById}
              personById={personById}
              onComplete={(entzogen, plaetzeZurueck, ersparnis) => {
                // Zugänge entfernen
                setZugaenge((prev) =>
                  prev.filter(
                    (z) => !(z.personId === offboarding.id && entzogen.has(z.toolId))
                  )
                );
                setPersonenState((prev) =>
                  prev.map((p) =>
                    p.id === offboarding.id ? { ...p, status: "ausgeschieden" } : p
                  )
                );
                toast.success(
                  `Offboarding ${offboarding.name} abgeschlossen · ${plaetzeZurueck} Plätze frei · ${euro(
                    ersparnis
                  )} / Monat gespart`
                );
                setOffboarding(null);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Owner zuweisen */}
      {ownerDialog && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4"
          onClick={() => setOwnerDialog(null)}
        >
          <div
            className="bg-card rounded-2xl border border-border w-full max-w-md p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-display text-lg font-semibold">
              Owner für {ownerDialog.name} zuweisen
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Der Owner ist verantwortlich für Verlängerungen, Nutzer und Kosten.
            </p>
            <div className="mt-4 space-y-1 max-h-72 overflow-y-auto">
              {personenState
                .filter((p) => p.status === "aktiv")
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setToolsState((prev) =>
                        prev.map((t) =>
                          t.id === ownerDialog.id ? { ...t, ownerId: p.id } : t
                        )
                      );
                      toast.success(`${p.name} ist Owner von ${ownerDialog.name}`);
                      setOwnerDialog(null);
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent text-left"
                  >
                    <Avatar person={p} size={32} />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.rolle}</div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Subkomponenten ----------
function KpiCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: "amber";
}) {
  return (
    <div
      className="rounded-[20px] bg-card border border-border p-4 shadow-sm"
      style={accent === "amber" ? { borderColor: "#F5A62355" } : undefined}
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-2 font-display text-3xl font-semibold tabular-nums leading-none">
        {value}
      </div>
      {hint && (
        <div
          className="mt-2 text-xs"
          style={{ color: accent === "amber" ? "#B07A1A" : undefined }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

function PersonDetail({
  person,
  zugaenge,
  toolById,
  personById,
  onOffboard,
}: {
  person: Person;
  zugaenge: Zugang[];
  toolById: (id: string) => Tool;
  personById: (id: string) => Person;
  onOffboard: () => void;
}) {
  const summe = zugaenge.reduce((s, z) => s + z.platzKosten, 0);
  return (
    <>
      <SheetHeader>
        <div className="flex items-center gap-3">
          <Avatar person={person} size={48} />
          <div>
            <SheetTitle className="font-display">{person.name}</SheetTitle>
            <SheetDescription>
              {person.rolle} · <StatusPill status={person.status} />
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div className="mt-5 rounded-xl bg-muted/40 p-3 text-sm">
        <span className="font-semibold tabular-nums">{zugaenge.length}</span> Zugänge ·{" "}
        Kosten:{" "}
        <span className="font-semibold tabular-nums">{euro(summe)}</span> / Monat
      </div>

      <div className="mt-4 space-y-2">
        {zugaenge.map((z) => {
          const t = toolById(z.toolId);
          const owner = t.ownerId ? personById(t.ownerId) : null;
          const risiko = person.status === "ausgeschieden";
          return (
            <div
              key={z.toolId}
              className="flex items-center gap-3 rounded-xl border border-border p-3"
            >
              <div
                className="size-9 rounded-lg grid place-items-center text-white font-semibold"
                style={{ background: t.farbe }}
              >
                {t.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{t.name}</div>
                <div className="text-xs text-muted-foreground">
                  {z.letzteAktivitaet ? (
                    <>letzte Aktivität: {z.letzteAktivitaet}</>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700">
                      <Info className="size-3" /> Nutzungsdaten nötig
                    </span>
                  )}
                  {owner && <> · Owner: {owner.name}</>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold tabular-nums">
                  {euro(z.platzKosten)}
                </div>
                {risiko && (
                  <div className="text-[10px] text-red-600 font-medium">Risiko</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(person.status === "scheidet_aus" || person.status === "ausgeschieden") && (
        <div className="mt-6">
          <Button
            className="w-full gap-2 bg-[#F5A623] hover:bg-[#dd9417] text-white"
            onClick={onOffboard}
          >
            <UserMinus className="size-4" /> Offboarding starten
          </Button>
        </div>
      )}
      {person.status === "aktiv" && (
        <div className="mt-6 flex gap-2">
          <Button variant="outline" className="flex-1 gap-2">
            <Mail className="size-4" /> Nachricht
          </Button>
          <Link to="/seats" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <Armchair className="size-4" /> Seats
            </Button>
          </Link>
        </div>
      )}
    </>
  );
}

function OffboardingFlow({
  person,
  zugaenge,
  toolById,
  personById,
  onComplete,
}: {
  person: Person;
  zugaenge: Zugang[];
  toolById: (id: string) => Tool;
  personById: (id: string) => Person;
  onComplete: (
    entzogen: Set<string>,
    plaetzeZurueck: number,
    ersparnis: number
  ) => void;
}) {
  const [entzogen, setEntzogen] = useState<Set<string>>(new Set());
  const [zurueck, setZurueck] = useState<Set<string>>(new Set());

  const toggle = (set: Set<string>, id: string, fn: (s: Set<string>) => void) => {
    const n = new Set(set);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    fn(n);
  };

  const plaetze = zugaenge.filter((z) => zurueck.has(z.toolId));
  const ersparnis = plaetze.reduce((s, z) => s + z.platzKosten, 0);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="font-display flex items-center gap-2">
          <UserMinus className="size-5 text-[#F5A623]" />
          Offboarding · {person.name}
        </SheetTitle>
        <SheetDescription>
          {person.austritt ? `Austritt am ${person.austritt}. ` : ""}
          Hake jeden Zugang ab und gib ungenutzte Plätze zurück.
        </SheetDescription>
      </SheetHeader>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        Das tatsächliche Entziehen passiert beim jeweiligen Anbieter. Toolfolio liefert
        dir die vollständige Liste, damit nichts vergessen wird.
      </div>

      <div className="mt-4 space-y-2">
        {zugaenge.map((z) => {
          const t = toolById(z.toolId);
          const owner = t.ownerId ? personById(t.ownerId) : null;
          const isEntzogen = entzogen.has(z.toolId);
          const isZurueck = zurueck.has(z.toolId);
          return (
            <div
              key={z.toolId}
              className={`rounded-xl border p-3 transition ${
                isEntzogen ? "bg-emerald-50/40 border-emerald-200" : "border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggle(entzogen, z.toolId, setEntzogen)}
                  aria-label="Zugang entzogen"
                  className={`size-6 rounded-md border grid place-items-center transition ${
                    isEntzogen
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-border bg-card"
                  }`}
                >
                  {isEntzogen && <Check className="size-4" />}
                </button>
                <div
                  className="size-9 rounded-lg grid place-items-center text-white font-semibold"
                  style={{ background: t.farbe }}
                >
                  {t.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Platz: {euro(z.platzKosten)} / Mon.
                    {owner && <> · Owner: {owner.name}</>}
                  </div>
                </div>
              </div>
              <label className="mt-2 ml-9 flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={isZurueck}
                  onChange={() => toggle(zurueck, z.toolId, setZurueck)}
                />
                Platz zurückgeben (Anbindung Seats)
              </label>
            </div>
          );
        })}
      </div>

      {/* Bilanz */}
      <div className="mt-5 rounded-2xl bg-foreground text-background p-4">
        <div className="text-xs opacity-70">Bilanz</div>
        <div className="mt-1 font-display text-xl font-semibold leading-snug">
          {entzogen.size} von {zugaenge.length} Zugängen markiert ·{" "}
          {plaetze.length} Plätze werden frei ·{" "}
          <span className="text-emerald-300">{euro(ersparnis)} / Monat</span>{" "}
          gespart
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <Button
          className="flex-1 gap-2"
          disabled={entzogen.size === 0}
          onClick={() => onComplete(entzogen, plaetze.length, ersparnis)}
        >
          <Check className="size-4" /> Offboarding abschließen
        </Button>
        <Link to="/seats">
          <Button variant="outline" className="gap-2">
            <Armchair className="size-4" /> Seats
          </Button>
        </Link>
      </div>
    </>
  );
}
