import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Plus,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  Landmark,
  Wallet,
  CircleDollarSign,
  Banknote,
  Info,
  MoreHorizontal,
  Pencil,
  PowerOff,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";
import { fmtEUR } from "@/lib/toolfolio-data";

type KanalTyp = "kreditkarte" | "sepa" | "paypal" | "stripe" | "paysafe" | "anderes";
type KanalStatus = "aktiv" | "laeuft-ab" | "abgelaufen" | "inaktiv";

interface Kanal {
  id: string;
  typ: KanalTyp;
  bezeichnung: string;
  // Kreditkarte
  anbieter?: "Visa" | "Mastercard" | "Amex";
  last4?: string;
  ablaufMonat?: number;
  ablaufJahr?: number;
  inhaber?: string;
  // SEPA
  kontoname?: string;
  ibanLast4?: string;
  // PayPal / Stripe / Paysafe
  email?: string;
  // Status & Kennzahlen
  status: KanalStatus;
  aboAnzahl: number;
  kostenMonat: number;
  farbe: string;
  sammelbuchung?: boolean;
}

const initialKanaele: Kanal[] = [
  {
    id: "k1",
    typ: "kreditkarte",
    bezeichnung: "Firmenkarte Visa",
    anbieter: "Visa",
    last4: "4821",
    ablaufMonat: 4,
    ablaufJahr: 2027,
    inhaber: "Markus Berg",
    status: "aktiv",
    aboAnzahl: 7,
    kostenMonat: 884,
    farbe: "var(--color-primary)",
  },
  {
    id: "k2",
    typ: "kreditkarte",
    bezeichnung: "Backup-Karte Mastercard",
    anbieter: "Mastercard",
    last4: "7093",
    ablaufMonat: 8,
    ablaufJahr: 2026,
    inhaber: "Markus Berg",
    status: "laeuft-ab",
    aboAnzahl: 6,
    kostenMonat: 562,
    farbe: "#7a5af8",
  },
  {
    id: "k3",
    typ: "sepa",
    bezeichnung: "Geschäftskonto",
    kontoname: "Toolfolio GmbH",
    ibanLast4: "9921",
    status: "aktiv",
    aboAnzahl: 3,
    kostenMonat: 303,
    farbe: "var(--color-success)",
  },
  {
    id: "k4",
    typ: "paypal",
    bezeichnung: "PayPal Geschäftskonto",
    email: "billing@toolfolio.de",
    status: "aktiv",
    aboAnzahl: 3,
    kostenMonat: 53,
    farbe: "var(--color-warning)",
    sammelbuchung: true,
  },
  {
    id: "k5",
    typ: "stripe",
    bezeichnung: "Stripe-Guthaben",
    email: "billing@toolfolio.de",
    status: "aktiv",
    aboAnzahl: 1,
    kostenMonat: 24,
    farbe: "var(--color-muted-foreground)",
    sammelbuchung: true,
  },
];

const typLabel: Record<KanalTyp, string> = {
  kreditkarte: "Kreditkarte",
  sepa: "SEPA-Lastschrift",
  paypal: "PayPal",
  stripe: "Stripe-Guthaben",
  paysafe: "Paysafe",
  anderes: "Anderes",
};

function TypIcon({ typ, className }: { typ: KanalTyp; className?: string }) {
  const Icon =
    typ === "kreditkarte"
      ? CreditCard
      : typ === "sepa"
        ? Landmark
        : typ === "paypal"
          ? Wallet
          : typ === "stripe"
            ? CircleDollarSign
            : typ === "paysafe"
              ? Banknote
              : CreditCard;
  return <Icon className={className} />;
}

function kanalReferenz(k: Kanal): string {
  if (k.typ === "kreditkarte" && k.anbieter && k.last4) return `${k.anbieter} •••• ${k.last4}`;
  if (k.typ === "sepa") return k.kontoname ?? "SEPA-Konto";
  if (k.email) return k.email;
  return k.bezeichnung;
}

function StatusPill({ status }: { status: KanalStatus }) {
  const map = {
    aktiv: { label: "aktiv", cls: "bg-success/10 text-success border-success/20" },
    "laeuft-ab": {
      label: "läuft bald ab",
      cls: "bg-warning/15 text-warning-foreground border-warning/30",
    },
    abgelaufen: {
      label: "abgelaufen",
      cls: "bg-destructive/10 text-destructive border-destructive/20",
    },
    inaktiv: { label: "inaktiv", cls: "bg-muted text-muted-foreground border-border" },
  } as const;
  const m = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        m.cls,
      )}
    >
      {status === "laeuft-ab" && <AlertTriangle className="size-3" />}
      {m.label}
    </span>
  );
}

export function Zahlungskanaele() {
  const [kanaele, setKanaele] = useState<Kanal[]>(initialKanaele);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editKanal, setEditKanal] = useState<Kanal | null>(null);
  const [removeKanal, setRemoveKanal] = useState<Kanal | null>(null);

  const gesamt = useMemo(() => kanaele.reduce((s, k) => s + k.kostenMonat, 0), [kanaele]);
  const ablaufWarn = kanaele.find((k) => k.status === "laeuft-ab");

  const openAdd = () => {
    setEditKanal(null);
    setPanelOpen(true);
  };
  const openEdit = (k: Kanal) => {
    setEditKanal(k);
    setPanelOpen(true);
  };

  const saveKanal = (k: Kanal) => {
    setKanaele((prev) => {
      const exists = prev.find((p) => p.id === k.id);
      if (exists) return prev.map((p) => (p.id === k.id ? k : p));
      return [...prev, k];
    });
    setPanelOpen(false);
    toast.success(exists(kanaele, k.id) ? "Kanal aktualisiert" : "Kanal hinzugefügt");
  };

  const deaktivieren = (k: Kanal) => {
    if (k.aboAnzahl > 0) {
      setRemoveKanal(k);
      return;
    }
    setKanaele((prev) => prev.map((p) => (p.id === k.id ? { ...p, status: "inaktiv" } : p)));
    toast.success("Kanal deaktiviert");
  };

  const entfernen = (k: Kanal) => {
    if (k.aboAnzahl > 0) {
      setRemoveKanal(k);
      return;
    }
    setKanaele((prev) => prev.filter((p) => p.id !== k.id));
    toast.success("Kanal entfernt");
  };

  const handleUmzug = (zielId: string | "ohne") => {
    if (!removeKanal) return;
    setKanaele((prev) => {
      const moved = prev.filter((p) => p.id !== removeKanal.id);
      if (zielId === "ohne") return moved;
      return moved.map((p) =>
        p.id === zielId
          ? {
              ...p,
              aboAnzahl: p.aboAnzahl + removeKanal.aboAnzahl,
              kostenMonat: p.kostenMonat + removeKanal.kostenMonat,
            }
          : p,
      );
    });
    toast.success(
      zielId === "ohne"
        ? `${removeKanal.aboAnzahl} Abos vorerst ohne Kanal`
        : `${removeKanal.aboAnzahl} Abos umgezogen`,
    );
    setRemoveKanal(null);
  };

  return (
    <div className="space-y-6">
      {/* Kopf */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Zahlungskanäle</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {kanaele.length} Kanäle,{" "}
            <span className="font-medium text-foreground tabular-nums">{fmtEUR(gesamt)}</span> pro
            Monat
          </p>
        </div>
        <Button onClick={openAdd} className="gap-1.5">
          <Plus className="size-4" /> Kanal hinzufügen
        </Button>
      </div>

      {/* Sicherheits-Zeile */}
      <div className="flex items-start gap-2.5 rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
        <p className="text-foreground/80">
          Toolfolio speichert keine vollständigen Kartennummern, keine IBAN und keine Logins. Nur
          eine Bezeichnung, damit du den Überblick behältst.
        </p>
      </div>

      {/* Ablauf-Banner */}
      {ablaufWarn && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <p className="text-sm text-foreground">
              Deine {ablaufWarn.anbieter} •••• {ablaufWarn.last4} läuft im{" "}
              {String(ablaufWarn.ablaufMonat).padStart(2, "0")}/{ablaufWarn.ablaufJahr} ab.{" "}
              {ablaufWarn.aboAnzahl} Abos liegen auf dieser Karte.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => openEdit(ablaufWarn)}>
            Jetzt aktualisieren
          </Button>
        </div>
      )}

      {/* Übersicht */}
      <UebersichtCard kanaele={kanaele} gesamt={gesamt} />

      {/* Kanal-Liste */}
      {kanaele.length === 0 ? (
        <LeererZustand onAdd={openAdd} />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {kanaele.map((k) => (
            <KanalCard
              key={k.id}
              kanal={k}
              gesamt={gesamt}
              onEdit={() => openEdit(k)}
              onDeaktivieren={() => deaktivieren(k)}
              onEntfernen={() => entfernen(k)}
            />
          ))}
        </div>
      )}

      <KanalPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        initial={editKanal}
        onSave={saveKanal}
      />

      <UmzugDialog
        kanal={removeKanal}
        zielKanaele={kanaele.filter((k) => k.id !== removeKanal?.id)}
        onCancel={() => setRemoveKanal(null)}
        onConfirm={handleUmzug}
      />
    </div>
  );
}

function exists(arr: Kanal[], id: string) {
  return arr.some((a) => a.id === id);
}

/* ---------------------- Übersicht ---------------------- */

function UebersichtCard({ kanaele, gesamt }: { kanaele: Kanal[]; gesamt: number }) {
  const segments = kanaele.map((k) => ({
    name: kanalReferenz(k),
    wert: k.kostenMonat,
    farbe: k.farbe,
  }));

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="font-display text-lg font-semibold">Kosten nach Zahlungskanal</h2>
        <p className="text-xs text-muted-foreground">Aufschlüsselung der monatlichen Belastung</p>
      </div>
      <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
        <Donut segments={segments} gesamt={gesamt} />
        <ul className="space-y-2.5">
          {segments.map((s) => {
            const pct = gesamt > 0 ? (s.wert / gesamt) * 100 : 0;
            return (
              <li key={s.name} className="flex items-center gap-3 text-sm">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: s.farbe }}
                />
                <span className="min-w-0 flex-1 truncate text-foreground">{s.name}</span>
                <span className="tabular-nums text-muted-foreground">
                  {pct.toFixed(0).padStart(2, " ")}%
                </span>
                <span className="w-20 text-right font-medium tabular-nums">{fmtEUR(s.wert)}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Donut({
  segments,
  gesamt,
}: {
  segments: { name: string; wert: number; farbe: string }[];
  gesamt: number;
}) {
  const R = 70;
  const C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="relative mx-auto size-44">
      <svg viewBox="0 0 180 180" className="size-full -rotate-90">
        <circle cx="90" cy="90" r={R} fill="none" stroke="var(--color-muted)" strokeWidth="22" />
        {segments.map((s, i) => {
          const len = gesamt > 0 ? (s.wert / gesamt) * C : 0;
          const dash = `${len} ${C - len}`;
          const offset = -acc;
          acc += len;
          return (
            <circle
              key={i}
              cx="90"
              cy="90"
              r={R}
              fill="none"
              stroke={s.farbe}
              strokeWidth="22"
              strokeDasharray={dash}
              strokeDashoffset={offset}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-xl font-semibold tabular-nums">{fmtEUR(gesamt)}</div>
          <div className="text-xs text-muted-foreground">pro Monat</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Kanal-Karte ---------------------- */

function KanalCard({
  kanal,
  gesamt,
  onEdit,
  onDeaktivieren,
  onEntfernen,
}: {
  kanal: Kanal;
  gesamt: number;
  onEdit: () => void;
  onDeaktivieren: () => void;
  onEntfernen: () => void;
}) {
  const anteil = gesamt > 0 ? (kanal.kostenMonat / gesamt) * 100 : 0;
  return (
    <div className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div
          className="grid size-11 shrink-0 place-items-center rounded-xl text-white"
          style={{ background: kanal.farbe }}
        >
          <TypIcon typ={kanal.typ} className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-semibold leading-tight">
              {kanal.bezeichnung}
            </h3>
            <StatusPill status={kanal.status} />
          </div>
          <div className="mt-0.5 text-sm tabular-nums text-muted-foreground">
            {kanalReferenz(kanal)}
            {kanal.typ === "kreditkarte" && kanal.ablaufMonat && kanal.ablaufJahr && (
              <>
                {" "}
                <span className="text-foreground/40">·</span> gültig bis{" "}
                {String(kanal.ablaufMonat).padStart(2, "0")}/{kanal.ablaufJahr}
              </>
            )}
          </div>
          {kanal.typ === "kreditkarte" && kanal.inhaber && (
            <div className="text-xs text-muted-foreground">Inhaber: {kanal.inhaber}</div>
          )}
          {kanal.typ === "sepa" && kanal.ibanLast4 && (
            <div className="text-xs text-muted-foreground">IBAN endet auf {kanal.ibanLast4}</div>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="size-8 shrink-0">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 size-4" /> Bearbeiten
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDeaktivieren}>
              <PowerOff className="mr-2 size-4" /> Deaktivieren
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onEntfernen} className="text-destructive">
              <Trash2 className="mr-2 size-4" /> Entfernen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Kennzahl label="Abos" wert={String(kanal.aboAnzahl)} />
        <Kennzahl label="pro Monat" wert={fmtEUR(kanal.kostenMonat)} />
        <Kennzahl label="Anteil" wert={`${anteil.toFixed(0)} %`} />
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{ width: `${anteil}%`, background: kanal.farbe }}
        />
      </div>

      {kanal.sammelbuchung && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <span>
            Was hierüber läuft, erkennt der Kontoauszug nur als Sammelbuchung.{" "}
            <Link to="/import" className="font-medium text-primary hover:underline">
              Importiere den Export
            </Link>
            , um es aufzuschlüsseln.
          </span>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <Link
            to="/abos"
            search={{ kanal: kanalReferenz(kanal) } as never}
          >
            Abos ansehen
          </Link>
        </Button>
        <Button size="sm" variant="ghost" onClick={onEdit}>
          Bearbeiten
        </Button>
      </div>
    </div>
  );
}

function Kennzahl({ label, wert }: { label: string; wert: string }) {
  return (
    <div className="rounded-lg bg-background/60 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-display text-base font-semibold tabular-nums">{wert}</div>
    </div>
  );
}

/* ---------------------- Leerer Zustand ---------------------- */

function LeererZustand({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
        <CreditCard className="size-6" />
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold">Noch kein Zahlungskanal</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Füge deinen ersten Zahlungskanal hinzu, damit Toolfolio Abos zuordnen kann.
      </p>
      <Button onClick={onAdd} className="mt-4 gap-1.5">
        <Plus className="size-4" /> Kanal hinzufügen
      </Button>
    </div>
  );
}

/* ---------------------- Panel ---------------------- */

function KanalPanel({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: Kanal | null;
  onSave: (k: Kanal) => void;
}) {
  const [typ, setTyp] = useState<KanalTyp>(initial?.typ ?? "kreditkarte");
  const [bezeichnung, setBezeichnung] = useState(initial?.bezeichnung ?? "");
  const [anbieter, setAnbieter] = useState<"Visa" | "Mastercard" | "Amex">(
    initial?.anbieter ?? "Visa",
  );
  const [last4, setLast4] = useState(initial?.last4 ?? "");
  const [ablaufMonat, setAblaufMonat] = useState<string>(
    initial?.ablaufMonat ? String(initial.ablaufMonat) : "",
  );
  const [ablaufJahr, setAblaufJahr] = useState<string>(
    initial?.ablaufJahr ? String(initial.ablaufJahr) : "",
  );
  const [inhaber, setInhaber] = useState(initial?.inhaber ?? "");
  const [kontoname, setKontoname] = useState(initial?.kontoname ?? "");
  const [ibanLast4, setIbanLast4] = useState(initial?.ibanLast4 ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");

  // re-init on open
  useMemoReset(open, () => {
    setTyp(initial?.typ ?? "kreditkarte");
    setBezeichnung(initial?.bezeichnung ?? "");
    setAnbieter(initial?.anbieter ?? "Visa");
    setLast4(initial?.last4 ?? "");
    setAblaufMonat(initial?.ablaufMonat ? String(initial.ablaufMonat) : "");
    setAblaufJahr(initial?.ablaufJahr ? String(initial.ablaufJahr) : "");
    setInhaber(initial?.inhaber ?? "");
    setKontoname(initial?.kontoname ?? "");
    setIbanLast4(initial?.ibanLast4 ?? "");
    setEmail(initial?.email ?? "");
  });

  const submit = () => {
    if (!bezeichnung.trim()) {
      toast.error("Bitte eine Bezeichnung angeben");
      return;
    }
    if (typ === "kreditkarte" && (!last4 || last4.length !== 4)) {
      toast.error("Bitte die letzten 4 Ziffern angeben");
      return;
    }
    if (typ === "sepa" && !kontoname.trim()) {
      toast.error("Bitte einen Kontonamen angeben");
      return;
    }
    if ((typ === "paypal" || typ === "stripe" || typ === "paysafe") && !email.trim()) {
      toast.error("Bitte eine Konto-E-Mail angeben");
      return;
    }
    const id = initial?.id ?? `k${Math.random().toString(36).slice(2, 8)}`;
    const base: Kanal = {
      id,
      typ,
      bezeichnung: bezeichnung.trim(),
      status: initial?.status ?? "aktiv",
      aboAnzahl: initial?.aboAnzahl ?? 0,
      kostenMonat: initial?.kostenMonat ?? 0,
      farbe: initial?.farbe ?? "var(--color-primary)",
      sammelbuchung: typ === "paypal" || typ === "stripe",
    };
    if (typ === "kreditkarte") {
      base.anbieter = anbieter;
      base.last4 = last4;
      base.ablaufMonat = ablaufMonat ? Number(ablaufMonat) : undefined;
      base.ablaufJahr = ablaufJahr ? Number(ablaufJahr) : undefined;
      base.inhaber = inhaber.trim() || undefined;
    } else if (typ === "sepa") {
      base.kontoname = kontoname.trim();
      base.ibanLast4 = ibanLast4.trim() || undefined;
    } else {
      base.email = email.trim();
    }
    onSave(base);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
      >
        <VisuallyHidden>
          <SheetTitle>{initial ? "Kanal bearbeiten" : "Kanal hinzufügen"}</SheetTitle>
          <SheetDescription>Erfasse nur Referenzen, niemals vollständige Daten.</SheetDescription>
        </VisuallyHidden>

        {/* Sticky Kopf */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-6 py-4 backdrop-blur">
          <div>
            <h2 className="font-display text-lg font-semibold">
              {initial ? "Kanal bearbeiten" : "Kanal hinzufügen"}
            </h2>
            <p className="text-xs text-muted-foreground">Nur Referenzen, keine vollständigen Daten.</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            aria-label="Schließen"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Datenschutz */}
          <div className="flex items-start gap-2.5 rounded-xl border border-success/20 bg-success/5 px-3.5 py-3 text-sm">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
            <p className="text-foreground/80">
              Toolfolio speichert nur eine Bezeichnung und Referenzen wie die letzten vier Ziffern.
              Keine vollständigen Kartennummern, keine Prüfziffern, keine vollständige IBAN, keine
              Logins und keine Passwörter.
            </p>
          </div>

          <Feld label="Typ">
            <Select value={typ} onValueChange={(v) => setTyp(v as KanalTyp)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(typLabel) as KanalTyp[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {typLabel[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Feld>

          <Feld label="Bezeichnung" hint="Wie soll dieser Kanal heißen?">
            <Input
              value={bezeichnung}
              onChange={(e) => setBezeichnung(e.target.value)}
              placeholder="z. B. Firmenkarte Visa"
            />
          </Feld>

          {typ === "kreditkarte" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Feld label="Anbieter">
                  <Select value={anbieter} onValueChange={(v) => setAnbieter(v as typeof anbieter)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Visa">Visa</SelectItem>
                      <SelectItem value="Mastercard">Mastercard</SelectItem>
                      <SelectItem value="Amex">Amex</SelectItem>
                    </SelectContent>
                  </Select>
                </Feld>
                <Feld label="Letzte 4 Ziffern">
                  <Input
                    inputMode="numeric"
                    maxLength={4}
                    value={last4}
                    onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="4821"
                  />
                </Feld>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Feld label="Ablaufmonat (optional)">
                  <Input
                    inputMode="numeric"
                    maxLength={2}
                    value={ablaufMonat}
                    onChange={(e) => setAblaufMonat(e.target.value.replace(/\D/g, "").slice(0, 2))}
                    placeholder="MM"
                  />
                </Feld>
                <Feld label="Ablaufjahr (optional)">
                  <Input
                    inputMode="numeric"
                    maxLength={4}
                    value={ablaufJahr}
                    onChange={(e) => setAblaufJahr(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="JJJJ"
                  />
                </Feld>
              </div>
              <Feld label="Inhaber (optional)">
                <Input
                  value={inhaber}
                  onChange={(e) => setInhaber(e.target.value)}
                  placeholder="Name auf der Karte"
                />
              </Feld>
              <Hinweis>
                Wir fragen bewusst nicht nach der vollständigen Nummer oder Prüfziffer. Die letzten
                vier Ziffern reichen, damit du die Karte wiedererkennst.
              </Hinweis>
            </>
          )}

          {typ === "sepa" && (
            <>
              <Feld label="Kontoname">
                <Input
                  value={kontoname}
                  onChange={(e) => setKontoname(e.target.value)}
                  placeholder="z. B. Geschäftskonto"
                />
              </Feld>
              <Feld label="Letzte 4 Stellen der IBAN (optional)">
                <Input
                  inputMode="numeric"
                  maxLength={4}
                  value={ibanLast4}
                  onChange={(e) => setIbanLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="9921"
                />
              </Feld>
              <Hinweis>
                Bitte keine vollständige IBAN. Die letzten vier Stellen reichen für die Zuordnung.
              </Hinweis>
            </>
          )}

          {(typ === "paypal" || typ === "stripe" || typ === "paysafe" || typ === "anderes") && (
            <>
              <Feld label="Konto-E-Mail">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="billing@firma.de"
                />
              </Feld>
              <Hinweis>
                Toolfolio fragt niemals nach einem Passwort. Logins gehören in den Anbieter, nicht
                hierher.
              </Hinweis>
            </>
          )}
        </div>

        {/* Sticky Fuß */}
        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t border-border bg-card/95 px-6 py-4 backdrop-blur">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={submit}>Speichern</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Feld({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-foreground/80">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Hinweis({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
      <Info className="mt-0.5 size-3.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

// reset-on-open helper
function useMemoReset(trigger: boolean, fn: () => void) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (trigger) fn();
  }, [trigger]);
}

/* ---------------------- Umzugs-Dialog ---------------------- */

function UmzugDialog({
  kanal,
  zielKanaele,
  onCancel,
  onConfirm,
}: {
  kanal: Kanal | null;
  zielKanaele: Kanal[];
  onCancel: () => void;
  onConfirm: (zielId: string | "ohne") => void;
}) {
  const [ziel, setZiel] = useState<string>("ohne");
  return (
    <AlertDialog open={!!kanal} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Abos umziehen</AlertDialogTitle>
          <AlertDialogDescription>
            {kanal && (
              <>
                Auf diesem Kanal liegen <strong>{kanal.aboAnzahl} Abos</strong>. Wohin sollen sie
                umziehen, bevor du ihn entfernst?
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 py-2">
          <Label className="text-xs font-medium">Ziel-Kanal</Label>
          <Select value={ziel} onValueChange={setZiel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {zielKanaele.map((k) => (
                <SelectItem key={k.id} value={k.id}>
                  {k.bezeichnung} ({kanalReferenz(k)})
                </SelectItem>
              ))}
              <SelectItem value="ohne">Vorerst ohne Kanal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm(ziel)}>Umziehen und entfernen</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
