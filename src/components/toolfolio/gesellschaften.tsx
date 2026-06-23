import { useMemo, useState } from "react";
import {
  Building2,
  Plus,
  Check,
  Settings as SettingsIcon,
  Users as UsersIcon,
  MoreHorizontal,
  Info,
  ArrowLeftRight,
  Layers,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const euro = (n: number) =>
  n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

type Mitglied = {
  id: string;
  name: string;
  rolle: string;
  zugriff: boolean;
};

type Mandant = {
  id: string;
  name: string;
  rechtsform: string;
  sitz: string;
  ustId?: string;
  farbe: string;
  waehrung: string;
  kontenrahmen: string;
  tools: number;
  kostenMonat: number;
  kunden: number;
  mitglieder: Mitglied[];
  initialen: string;
  archiviert?: boolean;
};

const farben = [
  { name: "Violett", value: "#6C5CE7" },
  { name: "Koralle", value: "#FF7A66" },
  { name: "Emerald", value: "#12B76A" },
  { name: "Sand", value: "#C8A26A" },
  { name: "Ozean", value: "#3B82F6" },
  { name: "Pflaume", value: "#9D4EDD" },
];

const initialMandanten: Mandant[] = [
  {
    id: "m1",
    name: "Muster Agentur GmbH",
    rechtsform: "GmbH",
    sitz: "Hamburg",
    ustId: "DE123456789",
    farbe: "#6C5CE7",
    waehrung: "EUR",
    kontenrahmen: "SKR03",
    tools: 38,
    kostenMonat: 4280,
    kunden: 24,
    initialen: "MA",
    mitglieder: [
      { id: "u1", name: "Markus Vogel", rolle: "Inhaber", zugriff: true },
      { id: "u2", name: "Sarah Klein", rolle: "Buchhaltung", zugriff: true },
      { id: "u3", name: "Tom Berger", rolle: "Projektleitung", zugriff: true },
      { id: "u4", name: "Lina Hoff", rolle: "Design", zugriff: true },
    ],
  },
  {
    id: "m2",
    name: "Muster Holding GmbH",
    rechtsform: "GmbH",
    sitz: "Hamburg",
    ustId: "DE987654321",
    farbe: "#12B76A",
    waehrung: "EUR",
    kontenrahmen: "SKR04",
    tools: 6,
    kostenMonat: 410,
    kunden: 2,
    initialen: "MH",
    mitglieder: [
      { id: "u1", name: "Markus Vogel", rolle: "Inhaber", zugriff: true },
      { id: "u2", name: "Sarah Klein", rolle: "Buchhaltung", zugriff: true },
      { id: "u3", name: "Tom Berger", rolle: "Projektleitung", zugriff: false },
      { id: "u4", name: "Lina Hoff", rolle: "Design", zugriff: false },
    ],
  },
  {
    id: "m3",
    name: "Muster Ventures GmbH",
    rechtsform: "GmbH",
    sitz: "Berlin",
    ustId: "DE456789123",
    farbe: "#FF7A66",
    waehrung: "EUR",
    kontenrahmen: "SKR03",
    tools: 17,
    kostenMonat: 1860,
    kunden: 8,
    initialen: "MV",
    mitglieder: [
      { id: "u1", name: "Markus Vogel", rolle: "Inhaber", zugriff: true },
      { id: "u2", name: "Sarah Klein", rolle: "Buchhaltung", zugriff: true },
      { id: "u3", name: "Tom Berger", rolle: "Projektleitung", zugriff: true },
      { id: "u4", name: "Lina Hoff", rolle: "Design", zugriff: false },
    ],
  },
];

export function Gesellschaften() {
  const [mandanten, setMandanten] = useState<Mandant[]>(initialMandanten);
  const [aktivId, setAktivId] = useState("m1");
  const [konzernSichtbar, setKonzernSichtbar] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [mitgliederFor, setMitgliederFor] = useState<string | null>(null);

  const aktive = mandanten.filter((m) => !m.archiviert);

  const summen = useMemo(() => {
    const t = aktive.reduce((s, m) => s + m.tools, 0);
    const k = aktive.reduce((s, m) => s + m.kostenMonat, 0);
    return { tools: t, monat: k, jahr: k * 12, anzahl: aktive.length };
  }, [aktive]);

  const maxKosten = Math.max(...aktive.map((m) => m.kostenMonat), 1);

  function wechseln(id: string) {
    setAktivId(id);
    const m = mandanten.find((x) => x.id === id);
    if (m) toast.success(`Aktive Gesellschaft: ${m.name}`);
  }

  function openEdit(id: string) {
    setEditId(id);
    setFormOpen(true);
  }

  function openNeu() {
    setEditId(null);
    setFormOpen(true);
  }

  function archivieren(id: string) {
    setMandanten((arr) => arr.map((m) => (m.id === id ? { ...m, archiviert: true } : m)));
    toast("Gesellschaft archiviert");
  }

  function speichern(m: Mandant) {
    setMandanten((arr) => {
      const exists = arr.find((x) => x.id === m.id);
      if (exists) return arr.map((x) => (x.id === m.id ? m : x));
      return [...arr, m];
    });
    setFormOpen(false);
    toast.success(editId ? "Gesellschaft aktualisiert" : "Gesellschaft hinzugefügt");
  }

  function toggleMitglied(mandantId: string, mitgliedId: string) {
    setMandanten((arr) =>
      arr.map((m) =>
        m.id === mandantId
          ? {
              ...m,
              mitglieder: m.mitglieder.map((u) =>
                u.id === mitgliedId ? { ...u, zugriff: !u.zugriff } : u,
              ),
            }
          : m,
      ),
    );
  }

  const editMandant = editId ? mandanten.find((m) => m.id === editId) ?? null : null;
  const mitgliederMandant = mitgliederFor
    ? mandanten.find((m) => m.id === mitgliederFor) ?? null
    : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Gesellschaften
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Halte deine Toolkosten pro GmbH getrennt, steuere alles aus einem Account.
          </p>
        </div>
        <Button onClick={openNeu} className="gap-1.5">
          <Plus className="size-4" /> Gesellschaft hinzufügen
        </Button>
      </div>

      {/* Switcher-Hinweis */}
      <div className="rounded-2xl border border-border bg-card p-4 flex items-start gap-3">
        <ArrowLeftRight className="size-5 text-primary mt-0.5 shrink-0" />
        <div className="text-sm">
          <div className="font-medium">Aktive Gesellschaft wechseln</div>
          <p className="text-muted-foreground mt-0.5">
            Über den Mandanten-Switcher in der Top-Bar wechselst du die aktive Gesellschaft. Die
            gesamte App (Abos, Kunden, Zahlungskanäle, Berichte, Budgets) richtet sich danach
            aus.
          </p>
        </div>
      </div>

      {/* Konzern-Überblick */}
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="font-display text-xl">Konzern-Überblick</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Nur sichtbar für Inhaber. Die einzige Ansicht, die über Mandanten hinweg
              aggregiert.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Anzeigen</span>
            <Switch checked={konzernSichtbar} onCheckedChange={setKonzernSichtbar} />
          </div>
        </CardHeader>
        {konzernSichtbar && (
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiTile label="Gesellschaften" value={String(summen.anzahl)} icon={Building2} />
              <KpiTile label="Tools gesamt" value={String(summen.tools)} icon={Layers} />
              <KpiTile
                label="Kosten pro Monat"
                value={euro(summen.monat)}
                icon={Wallet}
                tabular
              />
              <KpiTile
                label="Hochrechnung Jahr"
                value={euro(summen.jahr)}
                icon={Wallet}
                tabular
              />
            </div>

            <div>
              <div className="text-sm font-medium mb-3">Kosten je Gesellschaft (Monat)</div>
              <div className="space-y-3">
                {aktive.map((m) => {
                  const pct = (m.kostenMonat / maxKosten) * 100;
                  return (
                    <div key={m.id} className="flex items-center gap-3">
                      <div className="w-44 shrink-0 text-sm truncate">{m.name}</div>
                      <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: m.farbe }}
                        />
                      </div>
                      <div className="w-28 text-right text-sm tabular-nums font-medium">
                        {euro(m.kostenMonat)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Mandanten-Liste */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-semibold">Deine Gesellschaften</h2>
          <span className="text-xs text-muted-foreground">{aktive.length} aktiv</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {aktive.map((m) => (
            <MandantCard
              key={m.id}
              m={m}
              aktiv={m.id === aktivId}
              onWechseln={() => wechseln(m.id)}
              onEdit={() => openEdit(m.id)}
              onMitglieder={() => setMitgliederFor(m.id)}
              onArchivieren={() => archivieren(m.id)}
            />
          ))}
        </div>
      </div>

      {/* Isolations-Hinweis */}
      <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-3">
        <ShieldCheck className="size-5 text-emerald-600 mt-0.5 shrink-0" />
        <div className="text-sm">
          <div className="font-medium">Strikte Trennung pro Mandant</div>
          <p className="text-muted-foreground mt-1 max-w-3xl">
            Abos, Kunden, Zahlungskanäle, Berichte und Budgets einer Gesellschaft erscheinen
            niemals in einer anderen. Nur der Konzern-Überblick aggregiert über alle
            Mandanten, und auch der nur für berechtigte Inhaber. Das ist die Grundlage für
            Holdingstrukturen und eine saubere Buchhaltung.
          </p>
        </div>
      </div>

      {/* Form Slide-over */}
      <MandantForm
        open={formOpen}
        onOpenChange={setFormOpen}
        mandant={editMandant}
        onSave={speichern}
      />

      {/* Mitglieder Slide-over */}
      <Sheet
        open={mitgliederMandant !== null}
        onOpenChange={(o) => !o && setMitgliederFor(null)}
      >
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {mitgliederMandant && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display">
                  Mitglieder · {mitgliederMandant.name}
                </SheetTitle>
                <SheetDescription>
                  Lege fest, wer Zugriff auf diese Gesellschaft hat. Detailrollen pflegst du
                  unter Team &amp; Rollen.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-2">
                {mitgliederMandant.mitglieder.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-xl border border-border p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="size-9 rounded-full grid place-items-center text-xs font-semibold text-white shrink-0"
                        style={{ backgroundColor: mitgliederMandant.farbe }}
                      >
                        {u.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.rolle}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Zugriff</span>
                      <Switch
                        checked={u.zugriff}
                        onCheckedChange={() =>
                          toggleMitglied(mitgliederMandant.id, u.id)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground flex items-start gap-2">
                <Info className="size-4 mt-0.5 shrink-0" />
                Nicht jedes Teammitglied muss alle Gesellschaften sehen. Differenzierte
                Rollenrechte verwaltest du unter Team &amp; Rollen.
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function KpiTile({
  label,
  value,
  icon: Icon,
  tabular,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tabular?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <div
        className={`mt-1 font-display text-2xl font-semibold ${tabular ? "tabular-nums" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

function MandantCard({
  m,
  aktiv,
  onWechseln,
  onEdit,
  onMitglieder,
  onArchivieren,
}: {
  m: Mandant;
  aktiv: boolean;
  onWechseln: () => void;
  onEdit: () => void;
  onMitglieder: () => void;
  onArchivieren: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-start gap-4">
        <div
          className="size-14 rounded-2xl grid place-items-center font-display text-lg font-semibold text-white shrink-0"
          style={{ backgroundColor: m.farbe }}
        >
          {m.initialen}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-display text-lg font-semibold truncate">{m.name}</div>
            {aktiv && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[11px] font-medium">
                <Check className="size-3" /> Aktiv
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {m.rechtsform} · {m.sitz}
            {m.ustId ? ` · ${m.ustId}` : ""}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>Bearbeiten</DropdownMenuItem>
            <DropdownMenuItem onClick={onMitglieder}>Mitglieder</DropdownMenuItem>
            <DropdownMenuItem
              onClick={onArchivieren}
              className="text-destructive focus:text-destructive"
            >
              Archivieren
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2">
        <Stat label="Tools" value={String(m.tools)} />
        <Stat label="Kosten / Monat" value={euro(m.kostenMonat)} tabular />
        <Stat label="Kunden" value={String(m.kunden)} />
        <Stat label="Mitglieder" value={String(m.mitglieder.filter((u) => u.zugriff).length)} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          onClick={onWechseln}
          disabled={aktiv}
          className="gap-1.5"
          variant={aktiv ? "secondary" : "default"}
        >
          <ArrowLeftRight className="size-3.5" />
          {aktiv ? "Aktiv" : "Öffnen / Wechseln"}
        </Button>
        <Button size="sm" variant="outline" onClick={onEdit} className="gap-1.5">
          <SettingsIcon className="size-3.5" /> Einstellungen
        </Button>
        <Button size="sm" variant="outline" onClick={onMitglieder} className="gap-1.5">
          <UsersIcon className="size-3.5" /> Mitglieder
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value, tabular }: { label: string; value: string; tabular?: boolean }) {
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`text-sm font-semibold ${tabular ? "tabular-nums" : ""}`}>{value}</div>
    </div>
  );
}

function MandantForm({
  open,
  onOpenChange,
  mandant,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  mandant: Mandant | null;
  onSave: (m: Mandant) => void;
}) {
  const [name, setName] = useState(mandant?.name ?? "");
  const [rechtsform, setRechtsform] = useState(mandant?.rechtsform ?? "GmbH");
  const [sitz, setSitz] = useState(mandant?.sitz ?? "");
  const [ustId, setUstId] = useState(mandant?.ustId ?? "");
  const [farbe, setFarbe] = useState(mandant?.farbe ?? farben[0].value);
  const [waehrung, setWaehrung] = useState(mandant?.waehrung ?? "EUR");
  const [kontenrahmen, setKontenrahmen] = useState(mandant?.kontenrahmen ?? "SKR03");

  // reset on open change
  useMemo(() => {
    if (open) {
      setName(mandant?.name ?? "");
      setRechtsform(mandant?.rechtsform ?? "GmbH");
      setSitz(mandant?.sitz ?? "");
      setUstId(mandant?.ustId ?? "");
      setFarbe(mandant?.farbe ?? farben[0].value);
      setWaehrung(mandant?.waehrung ?? "EUR");
      setKontenrahmen(mandant?.kontenrahmen ?? "SKR03");
    }
  }, [open, mandant]);

  function submit() {
    if (!name.trim()) {
      toast.error("Name der Gesellschaft fehlt");
      return;
    }
    const initialen =
      name
        .split(" ")
        .filter(Boolean)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "GM";
    const next: Mandant = {
      id: mandant?.id ?? `m${Date.now()}`,
      name: name.trim(),
      rechtsform,
      sitz: sitz.trim(),
      ustId: ustId.trim() || undefined,
      farbe,
      waehrung,
      kontenrahmen,
      tools: mandant?.tools ?? 0,
      kostenMonat: mandant?.kostenMonat ?? 0,
      kunden: mandant?.kunden ?? 0,
      initialen: mandant?.initialen ?? initialen,
      mitglieder:
        mandant?.mitglieder ?? [
          { id: "u1", name: "Markus Vogel", rolle: "Inhaber", zugriff: true },
        ],
    };
    onSave(next);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display">
            {mandant ? "Gesellschaft bearbeiten" : "Gesellschaft hinzufügen"}
          </SheetTitle>
          <SheetDescription>
            Eigene Zahlungskanäle, Kunden und Budgets pflegst du innerhalb des Mandanten.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label>Name der Gesellschaft</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Muster Holding GmbH" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Rechtsform</Label>
              <Select value={rechtsform} onValueChange={setRechtsform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GmbH">GmbH</SelectItem>
                  <SelectItem value="UG">UG (haftungsbeschränkt)</SelectItem>
                  <SelectItem value="AG">AG</SelectItem>
                  <SelectItem value="GbR">GbR</SelectItem>
                  <SelectItem value="Einzelunternehmen">Einzelunternehmen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sitz</Label>
              <Input value={sitz} onChange={(e) => setSitz(e.target.value)} placeholder="z. B. Hamburg" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>USt-ID (optional)</Label>
            <Input value={ustId} onChange={(e) => setUstId(e.target.value)} placeholder="DE123456789" />
          </div>

          <div className="space-y-2">
            <Label>Mandantenfarbe</Label>
            <div className="flex flex-wrap gap-2">
              {farben.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFarbe(f.value)}
                  className={`size-9 rounded-full border-2 transition-transform ${farbe === f.value ? "scale-110 border-foreground" : "border-transparent"}`}
                  style={{ backgroundColor: f.value }}
                  aria-label={f.name}
                  title={f.name}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Standardwährung</Label>
              <Select value={waehrung} onValueChange={setWaehrung}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CHF">CHF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kontenrahmen (DATEV)</Label>
              <Select value={kontenrahmen} onValueChange={setKontenrahmen}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SKR03">SKR03</SelectItem>
                  <SelectItem value="SKR04">SKR04</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground flex items-start gap-2">
            <Info className="size-4 mt-0.5 shrink-0" />
            Zahlungskanäle, Kunden und Budgets sind pro Gesellschaft getrennt. Du pflegst sie
            innerhalb des jeweiligen Mandanten.
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={submit}>{mandant ? "Speichern" : "Gesellschaft anlegen"}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
