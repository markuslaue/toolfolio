import { useState, type FormEvent } from "react";
import {
  Info,
  TrendingUp,
  CreditCard,
  Shield,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Pencil,
  ArrowRight,
  ExternalLink,
  X,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type InvoiceStatus = "bezahlt" | "offen" | "ueberfaellig";
type Invoice = {
  id: string;
  date: string;
  desc: string;
  amount: number;
  status: InvoiceStatus;
};

const invoices: Invoice[] = [
  {
    id: "TF-2026-0612",
    date: "01.06.2026",
    desc: "Premium-Platzierung Juni 2026 · Vertragsmanagement",
    amount: 79.0,
    status: "offen",
  },
  {
    id: "TF-2026-0511",
    date: "01.05.2026",
    desc: "Premium-Platzierung Mai 2026 · Vertragsmanagement",
    amount: 79.0,
    status: "bezahlt",
  },
  {
    id: "TF-2026-0410",
    date: "01.04.2026",
    desc: "Premium-Platzierung April 2026 · Vertragsmanagement",
    amount: 79.0,
    status: "bezahlt",
  },
  {
    id: "TF-2026-0309",
    date: "15.03.2026",
    desc: "Einmalige Badge-Gebühr (verifiziert)",
    amount: 49.0,
    status: "bezahlt",
  },
  {
    id: "TF-2026-0308",
    date: "01.03.2026",
    desc: "Premium-Platzierung März 2026 · Vertragsmanagement",
    amount: 79.0,
    status: "bezahlt",
  },
];

const eur = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

export function AbrechnungPage() {
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [company, setCompany] = useState({
    name: "fynk GmbH",
    street: "Friedrichstraße 68",
    zip: "10117",
    city: "Berlin",
    country: "Deutschland",
    vat: "DE123456789",
  });

  function saveCompany(e: FormEvent) {
    e.preventDefault();
    setShowInvoiceModal(false);
    toast.success("Rechnungsdaten aktualisiert");
  }

  return (
    <div>
      {/* Header */}
      <header className="mb-6">
        <Badge variant="outline" className="text-xs">
          A-04 · Abrechnung
        </Badge>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Abrechnung
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Deine Platzierung, Zahlungsmethode und Rechnungen.
        </p>
      </header>

      {/* Abgrenzungs-Hinweis */}
      <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-border bg-primary/5 px-4 py-3 text-sm">
        <Info className="size-4 mt-0.5 text-primary shrink-0" />
        <p className="text-foreground/80">
          Hier geht es um Zahlungen <strong>an Toolfolio</strong> für deine Sichtbarkeit im
          Verzeichnis. Die Zahlungsabwicklung zwischen dir und deinen eigenen Kunden bleibt
          vollständig bei dir. Toolfolio bleibt reiner Vermittler.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Aktuelle Platzierung */}
        <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-soft hover:-translate-y-0.5 transition">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
                <TrendingUp className="size-3.5" /> Aktuelle Platzierung
              </div>
              <h2 className="mt-1 font-display text-xl font-semibold">
                Premium-Platzierung, Kategorie Vertragsmanagement
              </h2>
            </div>
            <Badge
              className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
              variant="outline"
            >
              <CheckCircle2 className="size-3 mr-1" /> aktiv
            </Badge>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Stat label="Monatliche Gebühr" value={eur.format(79)} highlight />
            <Stat label="Nächste Abbuchung" value="01.07.2026" hint="in 7 Tagen" />
            <Stat label="Vertrag" value="monatlich, jederzeit kündbar" />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <a href="/anbieter-portal/platzierung">
                Platzierung verwalten <ArrowRight className="size-3.5" />
              </a>
            </Button>
            <span className="text-xs text-muted-foreground">
              Positionen sind nicht käuflich, Premium-Slots sind klar gekennzeichnet.
            </span>
          </div>
        </section>

        {/* Zahlungsmethode */}
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-soft hover:-translate-y-0.5 transition">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
            <CreditCard className="size-3.5" /> Zahlungsmethode
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-background p-3">
            <div className="size-10 rounded-lg bg-gradient-to-br from-primary to-coral grid place-items-center text-primary-foreground text-[10px] font-bold">
              VISA
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold tabular-nums">Visa •••• 4821</div>
              <div className="text-xs text-muted-foreground">gültig bis 09/2028</div>
            </div>
          </div>
          <Button
            onClick={() => setShowMethodModal(true)}
            variant="outline"
            size="sm"
            className="mt-3 w-full"
          >
            Zahlungsmethode ändern
          </Button>
          <p className="mt-3 inline-flex items-start gap-1.5 text-[11px] text-muted-foreground leading-snug">
            <Shield className="size-3 mt-0.5 shrink-0 text-emerald-600" />
            Wir speichern keine vollständigen Kartennummern. Der Wechsel läuft über einen externen
            Zahlungsdienstleister.
          </p>
        </section>
      </div>

      {/* Rechnungen */}
      <section className="mt-6 rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-display text-lg font-semibold">Rechnungen</h2>
            <p className="text-xs text-muted-foreground">
              Alle Rechnungen von Toolfolio an dich, mit ausweisbarer Umsatzsteuer.
            </p>
          </div>
          <Badge variant="outline" className="text-[10px]">
            {invoices.length} Einträge
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-semibold px-5 sm:px-6 py-3">Datum</th>
                <th className="text-left font-semibold px-3 py-3">Beschreibung</th>
                <th className="text-right font-semibold px-3 py-3">Betrag</th>
                <th className="text-left font-semibold px-3 py-3">Status</th>
                <th className="text-right font-semibold px-5 sm:px-6 py-3">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-5 sm:px-6 py-3 whitespace-nowrap tabular-nums">{inv.date}</td>
                  <td className="px-3 py-3">
                    <div className="font-medium">{inv.desc}</div>
                    <div className="text-[11px] text-muted-foreground tabular-nums">
                      Rg.-Nr. {inv.id}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums font-medium">
                    {eur.format(inv.amount)}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="px-5 sm:px-6 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5"
                      onClick={() =>
                        toast("PDF wird vorbereitet", {
                          description: `Rechnung ${inv.id} (Demo, kein echter Download).`,
                        })
                      }
                    >
                      <Download className="size-3.5" /> PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 sm:px-6 py-3 border-t border-border bg-muted/30 text-[11px] text-muted-foreground inline-flex items-start gap-1.5">
          <Info className="size-3 mt-0.5 shrink-0" />
          <span>
            Für Anbieter mit Sitz außerhalb Deutschlands gilt das Reverse-Charge-Verfahren. Die
            Umsatzsteuer wird in diesem Fall nicht ausgewiesen, der Empfänger schuldet die Steuer.
          </span>
        </div>
      </section>

      {/* Rechnungsdaten */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
              <Building2 className="size-3.5" /> Rechnungsdaten
            </div>
            <h2 className="mt-1 font-display text-lg font-semibold">Firmen- und Steuerangaben</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Diese Angaben erscheinen auf jeder Rechnung von Toolfolio.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setShowInvoiceModal(true)}
          >
            <Pencil className="size-3.5" /> Bearbeiten
          </Button>
        </div>
        <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <DataRow label="Firma" value={company.name} />
          <DataRow label="USt-ID" value={company.vat} />
          <DataRow label="Straße" value={company.street} />
          <DataRow label="PLZ / Ort" value={`${company.zip} ${company.city}`} />
          <DataRow label="Land" value={company.country} />
        </dl>
      </section>

      {/* Modal: Zahlungsmethode ändern */}
      {showMethodModal && (
        <Modal title="Zahlungsmethode ändern" onClose={() => setShowMethodModal(false)}>
          <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4 text-center">
            <ExternalLink className="size-6 text-primary mx-auto" />
            <div className="mt-2 font-medium">Externer Zahlungsdienstleister</div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Die Eingabe deiner Kartendaten erfolgt sicher beim Zahlungsdienstleister. Toolfolio
              verarbeitet keine rohen Kartendaten und speichert nur eine Referenz (letzte vier
              Ziffern). Dieser Schritt ist im Demo nur angedeutet.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowMethodModal(false)}>
              Abbrechen
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setShowMethodModal(false);
                toast.success("Weiterleitung simuliert", {
                  description: "In echt würdest du jetzt zum Dienstleister weitergeleitet.",
                });
              }}
              className="gap-1.5"
            >
              Zum Dienstleister <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </Modal>
      )}

      {/* Modal: Rechnungsdaten bearbeiten */}
      {showInvoiceModal && (
        <Modal title="Rechnungsdaten bearbeiten" onClose={() => setShowInvoiceModal(false)}>
          <form onSubmit={saveCompany} className="space-y-3">
            <div>
              <Label className="text-xs">Firma</Label>
              <Input
                value={company.name}
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label className="text-xs">USt-ID</Label>
              <Input
                value={company.vat}
                onChange={(e) => setCompany({ ...company, vat: e.target.value })}
                placeholder="DE..."
              />
            </div>
            <div>
              <Label className="text-xs">Straße</Label>
              <Input
                value={company.street}
                onChange={(e) => setCompany({ ...company, street: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-3">
              <div>
                <Label className="text-xs">PLZ</Label>
                <Input
                  value={company.zip}
                  onChange={(e) => setCompany({ ...company, zip: e.target.value })}
                  className="tabular-nums"
                />
              </div>
              <div>
                <Label className="text-xs">Ort</Label>
                <Input
                  value={company.city}
                  onChange={(e) => setCompany({ ...company, city: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Land</Label>
              <Input
                value={company.country}
                onChange={(e) => setCompany({ ...company, country: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowInvoiceModal(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit" size="sm">
                Speichern
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  highlight,
}: {
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3",
        highlight ? "border-primary/30 bg-primary/5" : "border-border bg-background",
      )}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  if (status === "bezahlt") {
    return (
      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 gap-1">
        <CheckCircle2 className="size-3" /> bezahlt
      </Badge>
    );
  }
  if (status === "offen") {
    return (
      <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/40 gap-1">
        <Clock className="size-3" /> offen
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 gap-1">
      <AlertTriangle className="size-3" /> überfällig
    </Badge>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-border pb-2">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="size-8 rounded-md hover:bg-muted grid place-items-center"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
