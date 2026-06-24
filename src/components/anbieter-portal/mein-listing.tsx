import { useMemo, useState, type FormEvent } from "react";
import {
  Shield,
  ShieldCheck,
  Mail,
  Globe,
  FileCode2,
  UserCheck,
  Check,
  ArrowRight,
  Plus,
  X,
  Image as ImageIcon,
  Video,
  Eye,
  Lock,
  Star,
  TrendingUp,
  Info,
  Save,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CircleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type ClaimMethod = "email" | "dns" | "manual";

type Tarif = { id: string; name: string; price: string; note: string; onRequest: boolean };
type Feature = { id: string; group: string; title: string };
type Screenshot = { id: string; label: string };
type VideoLink = { id: string; url: string };

const initialListing = {
  name: "fynk",
  tagline: "KI-gestütztes Vertragsmanagement für Mittelstand und Legal-Teams",
  cluster: "Recht & Verträge",
  category: "Vertragsmanagement",
  city: "Berlin",
  country: "Deutschland",
  founded: "2021",
  website: "https://fynk.com",
  short: "fynk hilft Teams, Verträge zu erstellen, zu verhandeln, zu unterzeichnen und nach Ablauf zu überwachen, mit KI-Analyse und Fristen-Wächter.",
  long:
    "fynk ist eine Vertragsmanagement-Plattform, die juristische und operative Teams beim gesamten Lebenszyklus eines Vertrags unterstützt. Vom Entwurf über die Verhandlung, die elektronische Signatur bis hin zu Fristen und Verlängerungen bleibt alles in einem Tool.\n\nKI-Funktionen extrahieren Klauseln, vergleichen Versionen und erkennen Risiken. Vorlagen, Freigaben und Audit-Logs sorgen für saubere Prozesse, der Datenstandort ist Deutschland.",
  features: [
    { id: "f1", group: "Erstellung", title: "Klausel-Bibliothek mit Versionsverlauf" },
    { id: "f2", group: "Verhandlung", title: "Kollaborative Redlining-Ansicht" },
    { id: "f3", group: "Signatur", title: "eIDAS-konforme elektronische Signatur" },
    { id: "f4", group: "Nach Abschluss", title: "Fristen-Wächter mit Erinnerungen" },
  ] as Feature[],
  tarife: [
    { id: "t1", name: "Starter", price: "29", note: "pro Nutzer/Monat", onRequest: false },
    { id: "t2", name: "Business", price: "59", note: "pro Nutzer/Monat", onRequest: false },
    { id: "t3", name: "Enterprise", price: "", note: "individuell", onRequest: true },
  ] as Tarif[],
  screenshots: [
    { id: "s1", label: "Dashboard mit Vertrags-Übersicht" },
    { id: "s2", label: "Klausel-Vergleich (KI)" },
  ] as Screenshot[],
  videos: [{ id: "v1", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }] as VideoLink[],
  loginUrl: "https://app.fynk.com",
  termsUrl: "https://fynk.com/agb",
  privacyUrl: "https://fynk.com/datenschutz",
  partnerParam: "tf",
  dsgvo: true,
  avv: true,
  hosting: "Deutschland (Frankfurt)",
  iso27001: true,
  contractTerm: "12 Monate",
  noticePeriod: "30 Tage zum Laufzeitende",
  trial: "14 Tage kostenlos",
};

type ListingState = typeof initialListing;

export function MeinListingPage() {
  const [claimed, setClaimed] = useState(true);

  if (!claimed) {
    return <ClaimFlow onSuccess={() => setClaimed(true)} />;
  }
  return <ListingEditor onReset={() => setClaimed(false)} />;
}

// ============ CLAIM FLOW ============

function ClaimFlow({ onSuccess }: { onSuccess: () => void }) {
  const [method, setMethod] = useState<ClaimMethod>("email");
  const [step, setStep] = useState<"choose" | "verify" | "success">("choose");
  const [email, setEmail] = useState("info@fynk.com");

  function submit(e: FormEvent) {
    e.preventDefault();
    setStep("verify");
    setTimeout(() => setStep("success"), 1400);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-6">
        <Badge variant="outline" className="text-xs">A-02 · Beanspruchen</Badge>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Beanspruche deinen Eintrag
        </h1>
        <p className="mt-2 text-muted-foreground">
          Dein Tool ist bereits im Toolfolio-Verzeichnis gelistet. Übernimm den Eintrag, um ihn
          selbst zu pflegen, auf Leads zu antworten und Vertrauens-Signale zu setzen.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="size-12 shrink-0 rounded-xl bg-primary text-primary-foreground grid place-items-center font-display text-lg font-bold">
            f
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-lg font-semibold">fynk</h2>
              <Badge variant="secondary" className="text-[10px]">Community-Eintrag</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Vertragsmanagement · Recht &amp; Verträge · Berlin, Deutschland
            </p>
            <p className="mt-2 text-sm">
              KI-gestütztes Vertragsmanagement, vom Entwurf bis zur Fristen-Überwachung. Aktuell von
              der Community vorbefüllt, noch nicht vom Anbieter bestätigt.
            </p>
          </div>
        </div>
      </section>

      {step === "choose" && (
        <section className="mt-6">
          <h2 className="font-display text-xl font-semibold">Inhaberschaft nachweisen</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Wähle eine Methode. Die Prüfung ist im Demo simuliert.
          </p>

          <div className="mt-4 grid gap-3">
            <ClaimMethodCard
              icon={Mail}
              title="E-Mail auf Firmen-Domain"
              hint="Wir senden einen Code an eine Adresse deiner Tool-Domain (z. B. info@fynk.com)."
              active={method === "email"}
              onClick={() => setMethod("email")}
            />
            <ClaimMethodCard
              icon={Globe}
              title="DNS- oder Meta-Tag"
              hint="Du hinterlegst einen TXT-Record oder ein Meta-Tag auf der Tool-Website."
              active={method === "dns"}
              onClick={() => setMethod("dns")}
            />
            <ClaimMethodCard
              icon={UserCheck}
              title="Manuelle Prüfung"
              hint="Wenn die anderen Wege nicht möglich sind, prüft unser Team mit Nachweis."
              active={method === "manual"}
              onClick={() => setMethod("manual")}
            />
          </div>

          <form onSubmit={submit} className="mt-6 rounded-2xl border border-border bg-background p-5">
            {method === "email" && (
              <div className="space-y-3">
                <Label htmlFor="claim-email">Geschäftliche E-Mail (Tool-Domain)</Label>
                <Input
                  id="claim-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Wir senden einen Bestätigungscode an diese Adresse. Demo-Modus, kein echter Versand.
                </p>
              </div>
            )}
            {method === "dns" && (
              <div className="space-y-3">
                <Label>TXT-Record für fynk.com</Label>
                <div className="rounded-lg border border-border bg-muted/50 p-3 font-mono text-xs">
                  toolfolio-verify=demo-abc123-token
                </div>
                <p className="text-xs text-muted-foreground">
                  Alternativ als Meta-Tag im Head der Startseite. Im Demo wird die Prüfung simuliert.
                </p>
              </div>
            )}
            {method === "manual" && (
              <div className="space-y-3">
                <Label htmlFor="claim-note">Nachweis (Handelsregister-Auszug, Impressum, ...)</Label>
                <Textarea id="claim-note" rows={3} placeholder="Kurzbeschreibung des Nachweises" />
                <p className="text-xs text-muted-foreground">
                  Unser Team prüft manuell, in der Regel innerhalb von zwei Werktagen.
                </p>
              </div>
            )}
            <div className="mt-4 flex items-center gap-2">
              <Button type="submit" className="gap-1.5">
                Prüfung starten <ArrowRight className="size-4" />
              </Button>
              <Button type="button" variant="ghost" onClick={onSuccess} className="text-xs">
                Demo-Shortcut: direkt zum Editor
              </Button>
            </div>
          </form>
        </section>
      )}

      {step === "verify" && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto size-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <h2 className="mt-4 font-display text-xl font-semibold">Prüfung läuft</h2>
          <p className="mt-1 text-sm text-muted-foreground">Wir verifizieren deine Angaben (Demo).</p>
        </section>
      )}

      {step === "success" && (
        <section className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-full bg-emerald-500/15 text-emerald-600 grid place-items-center">
              <Check className="size-5" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-lg font-semibold">Inhaberschaft bestätigt</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Der Eintrag &bdquo;fynk&ldquo; gehört jetzt zu deinem Anbieter-Konto. Du kannst ihn ab
                sofort pflegen.
              </p>
              <Button onClick={onSuccess} className="mt-4 gap-1.5">
                Listing bearbeiten <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function ClaimMethodCard({
  icon: Icon,
  title,
  hint,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  hint: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-2xl border bg-card p-4 text-left transition-all",
        active
          ? "border-primary ring-2 ring-primary/20"
          : "border-border hover:border-foreground/20",
      )}
    >
      <div
        className={cn(
          "size-10 shrink-0 rounded-xl grid place-items-center",
          active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="font-semibold">{title}</div>
        <div className="mt-0.5 text-sm text-muted-foreground">{hint}</div>
      </div>
    </button>
  );
}

// ============ EDITOR ============

function ListingEditor({ onReset }: { onReset: () => void }) {
  const [data, setData] = useState<ListingState>(initialListing);
  const [previewOpen, setPreviewOpen] = useState(true);

  const completeness = useMemo(() => computeCompleteness(data), [data]);

  function update<K extends keyof ListingState>(key: K, value: ListingState[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function save() {
    toast.success("Änderungen gespeichert", {
      description: "Deine Änderungen werden vor Veröffentlichung kurz geprüft (Moderation).",
    });
  }

  return (
    <div>
      {/* Header */}
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Badge variant="outline" className="text-xs">A-02 · Mein Listing</Badge>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Mein Listing bearbeiten
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pflege Beschreibung, Medien, Features und Vertrauens-Signale. Bewertungen und
            verifizierte Preise pflegen wir neutral, siehe unten.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onReset}>
            Beanspruchen-Flow anzeigen
          </Button>
          <Button size="sm" className="gap-1.5" onClick={save}>
            <Save className="size-4" /> Speichern &amp; einreichen
          </Button>
        </div>
      </header>

      {/* Vollständigkeit */}
      <CompletenessCard completeness={completeness} />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-6 items-start">
        {/* Linke Spalte: Felder */}
        <div className="space-y-5 min-w-0">
          <SectionCard id="basis" title="Basis" desc="Grunddaten des Eintrags.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Name">
                <Input value={data.name} onChange={(e) => update("name", e.target.value)} />
              </Field>
              <Field label="Tagline">
                <Input value={data.tagline} onChange={(e) => update("tagline", e.target.value)} />
              </Field>
              <Field label="Cluster">
                <Input value={data.cluster} onChange={(e) => update("cluster", e.target.value)} />
              </Field>
              <Field label="Kategorie">
                <Input value={data.category} onChange={(e) => update("category", e.target.value)} />
              </Field>
              <Field label="Sitz">
                <Input value={data.city} onChange={(e) => update("city", e.target.value)} />
              </Field>
              <Field label="Land">
                <Input value={data.country} onChange={(e) => update("country", e.target.value)} />
              </Field>
              <Field label="Gründungsjahr">
                <Input value={data.founded} onChange={(e) => update("founded", e.target.value)} />
              </Field>
              <Field label="Website-URL">
                <Input value={data.website} onChange={(e) => update("website", e.target.value)} />
              </Field>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 p-3">
              <div className="size-12 rounded-lg bg-primary text-primary-foreground grid place-items-center font-display font-bold">
                {data.name.slice(0, 1).toLowerCase() || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">Logo</div>
                <div className="text-xs text-muted-foreground">PNG oder SVG, mind. 256×256.</div>
              </div>
              <Button variant="outline" size="sm">Hochladen</Button>
            </div>
          </SectionCard>

          <SectionCard id="beschreibung" title="Beschreibung" desc="Kurz und ausführlich.">
            <Field label="Kurzbeschreibung (max. 280 Zeichen)">
              <Textarea
                rows={2}
                maxLength={280}
                value={data.short}
                onChange={(e) => update("short", e.target.value)}
              />
              <div className="mt-1 text-[11px] text-muted-foreground tabular-nums">
                {data.short.length}/280
              </div>
            </Field>
            <Field label="Ausführliche Beschreibung">
              <Textarea
                rows={8}
                value={data.long}
                onChange={(e) => update("long", e.target.value)}
                placeholder="Speist den großen Content-Bereich der Detailseite."
              />
            </Field>
          </SectionCard>

          <SectionCard id="features" title="Features" desc="Nach Anwendungsfall gruppiert.">
            <FeaturesEditor
              features={data.features}
              onChange={(features) => update("features", features)}
            />
          </SectionCard>

          <SectionCard
            id="preise"
            title="Preise (Anbieterangaben)"
            desc="Listenpreise oder auf Anfrage. Klar gekennzeichnet."
            hint="Der real gezahlte Schnitt aus verifizierten Abrechnungsdaten erscheint separat unten und ist nicht editierbar."
          >
            <TarifeEditor tarife={data.tarife} onChange={(tarife) => update("tarife", tarife)} />
          </SectionCard>

          <SectionCard id="medien" title="Medien" desc="Screenshots und Videos für die Detailseite.">
            <MediaEditor
              screenshots={data.screenshots}
              videos={data.videos}
              onScreenshots={(screenshots) => update("screenshots", screenshots)}
              onVideos={(videos) => update("videos", videos)}
            />
          </SectionCard>

          <SectionCard id="links" title="Links" desc="Anmeldung, Rechtstexte, Partner-Parameter.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Anmeldung / App">
                <Input value={data.loginUrl} onChange={(e) => update("loginUrl", e.target.value)} />
              </Field>
              <Field label="AGB-URL">
                <Input value={data.termsUrl} onChange={(e) => update("termsUrl", e.target.value)} />
              </Field>
              <Field label="Datenschutz-URL">
                <Input
                  value={data.privacyUrl}
                  onChange={(e) => update("privacyUrl", e.target.value)}
                />
              </Field>
              <Field
                label="Partner-Parameter (optional)"
                hint="Wird an die getrackte Weiterleitung angehängt (z. B. ?ref=tf)."
              >
                <Input
                  value={data.partnerParam}
                  onChange={(e) => update("partnerParam", e.target.value)}
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            id="vertrauen"
            title="Vertrauen & Sicherheit"
            desc="Speist den verifiziert-Badge und die Sicherheits-Selbstauskunft."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ToggleRow
                checked={data.dsgvo}
                onChange={(v) => update("dsgvo", v)}
                label="DSGVO-konform"
              />
              <ToggleRow
                checked={data.avv}
                onChange={(v) => update("avv", v)}
                label="AVV möglich"
              />
              <Field label="Datenstandort / Hosting">
                <Input value={data.hosting} onChange={(e) => update("hosting", e.target.value)} />
              </Field>
              <ToggleRow
                checked={data.iso27001}
                onChange={(v) => update("iso27001", v)}
                label="ISO 27001 zertifiziert"
              />
            </div>
          </SectionCard>

          <SectionCard id="vertrag" title="Vertragsdaten" desc="Laufzeit, Kündigung, Testphase.">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Typische Laufzeit">
                <Input
                  value={data.contractTerm}
                  onChange={(e) => update("contractTerm", e.target.value)}
                />
              </Field>
              <Field label="Kündigungsfrist">
                <Input
                  value={data.noticePeriod}
                  onChange={(e) => update("noticePeriod", e.target.value)}
                />
              </Field>
              <Field label="Testphase">
                <Input value={data.trial} onChange={(e) => update("trial", e.target.value)} />
              </Field>
            </div>
          </SectionCard>

          {/* Nicht editierbar */}
          <ReadOnlyBlock />

          {/* Speichern Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="size-4 mt-0.5 text-primary" />
              <span>
                Änderungen werden vor Veröffentlichung kurz geprüft. Du bekommst eine Mitteilung,
                sobald sie live sind.
              </span>
            </div>
            <Button className="gap-1.5" onClick={save}>
              <Save className="size-4" /> Speichern &amp; einreichen
            </Button>
          </div>
        </div>

        {/* Rechte Spalte: Live-Vorschau */}
        <aside className="lg:sticky lg:top-20">
          <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
            <button
              type="button"
              onClick={() => setPreviewOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-muted/40"
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Eye className="size-4 text-primary" /> Live-Vorschau Detailseite
              </span>
              {previewOpen ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </button>
            {previewOpen && <LivePreview data={data} />}
          </div>
        </aside>
      </div>
    </div>
  );
}

// ============ Helpers / Subkomponenten ============

function SectionCard({
  id,
  title,
  desc,
  hint,
  children,
}: {
  id: string;
  title: string;
  desc?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-soft">
      <div className="mb-4">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {desc && <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>}
        {hint && (
          <p className="mt-2 inline-flex items-start gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-700">
            <Info className="size-3.5 mt-0.5" /> {hint}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <div className="mt-1.5">{children}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3 cursor-pointer">
      <span className="text-sm font-medium">{label}</span>
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(Boolean(v))} />
    </label>
  );
}

function FeaturesEditor({
  features,
  onChange,
}: {
  features: Feature[];
  onChange: (f: Feature[]) => void;
}) {
  function add() {
    onChange([
      ...features,
      { id: `f-${Date.now()}`, group: "Allgemein", title: "Neue Funktion" },
    ]);
  }
  function remove(id: string) {
    onChange(features.filter((f) => f.id !== id));
  }
  function patch(id: string, p: Partial<Feature>) {
    onChange(features.map((f) => (f.id === id ? { ...f, ...p } : f)));
  }
  return (
    <div className="space-y-2">
      {features.map((f) => (
        <div
          key={f.id}
          className="grid grid-cols-[140px_1fr_auto] gap-2 rounded-xl border border-border bg-background p-2"
        >
          <Input
            value={f.group}
            onChange={(e) => patch(f.id, { group: e.target.value })}
            placeholder="Gruppe"
          />
          <Input
            value={f.title}
            onChange={(e) => patch(f.id, { title: e.target.value })}
            placeholder="Funktion"
          />
          <Button variant="ghost" size="icon" onClick={() => remove(f.id)} aria-label="Entfernen">
            <X className="size-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="gap-1.5">
        <Plus className="size-4" /> Funktion hinzufügen
      </Button>
    </div>
  );
}

function TarifeEditor({
  tarife,
  onChange,
}: {
  tarife: Tarif[];
  onChange: (t: Tarif[]) => void;
}) {
  function add() {
    onChange([
      ...tarife,
      { id: `t-${Date.now()}`, name: "Neuer Tarif", price: "", note: "pro Nutzer/Monat", onRequest: false },
    ]);
  }
  function remove(id: string) {
    onChange(tarife.filter((t) => t.id !== id));
  }
  function patch(id: string, p: Partial<Tarif>) {
    onChange(tarife.map((t) => (t.id === id ? { ...t, ...p } : t)));
  }
  return (
    <div className="space-y-2">
      {tarife.map((t) => (
        <div
          key={t.id}
          className="grid grid-cols-1 sm:grid-cols-[1fr_120px_1fr_auto_auto] gap-2 rounded-xl border border-border bg-background p-2"
        >
          <Input value={t.name} onChange={(e) => patch(t.id, { name: e.target.value })} placeholder="Tarif" />
          <Input
            value={t.price}
            onChange={(e) => patch(t.id, { price: e.target.value })}
            placeholder="Preis €"
            disabled={t.onRequest}
            className="tabular-nums"
          />
          <Input
            value={t.note}
            onChange={(e) => patch(t.id, { note: e.target.value })}
            placeholder="Hinweis"
          />
          <label className="inline-flex items-center gap-2 px-2 text-xs">
            <Checkbox
              checked={t.onRequest}
              onCheckedChange={(v) => patch(t.id, { onRequest: Boolean(v) })}
            />
            auf Anfrage
          </label>
          <Button variant="ghost" size="icon" onClick={() => remove(t.id)} aria-label="Entfernen">
            <X className="size-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="gap-1.5">
        <Plus className="size-4" /> Tarif hinzufügen
      </Button>
    </div>
  );
}

function MediaEditor({
  screenshots,
  videos,
  onScreenshots,
  onVideos,
}: {
  screenshots: Screenshot[];
  videos: VideoLink[];
  onScreenshots: (s: Screenshot[]) => void;
  onVideos: (v: VideoLink[]) => void;
}) {
  function addScreenshot() {
    onScreenshots([...screenshots, { id: `s-${Date.now()}`, label: "Neuer Screenshot" }]);
  }
  function addVideo() {
    onVideos([...videos, { id: `v-${Date.now()}`, url: "" }]);
  }
  function isYoutube(url: string) {
    if (!url) return true;
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(url);
  }
  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
          <ImageIcon className="size-4 text-primary" /> Screenshots
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {screenshots.map((s) => (
            <div
              key={s.id}
              className="group relative aspect-[4/3] rounded-xl border border-dashed border-border bg-muted/40 p-3 flex flex-col"
            >
              <ImageIcon className="size-6 text-muted-foreground/60" />
              <Input
                value={s.label}
                onChange={(e) =>
                  onScreenshots(
                    screenshots.map((x) => (x.id === s.id ? { ...x, label: e.target.value } : x)),
                  )
                }
                className="mt-auto text-xs h-8"
              />
              <button
                type="button"
                onClick={() => onScreenshots(screenshots.filter((x) => x.id !== s.id))}
                className="absolute top-1 right-1 size-6 rounded-md bg-background/80 grid place-items-center opacity-0 group-hover:opacity-100 transition"
                aria-label="Entfernen"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addScreenshot}
            className="aspect-[4/3] rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 grid place-items-center text-xs text-muted-foreground transition-colors"
          >
            <span className="flex flex-col items-center gap-1">
              <Plus className="size-5" /> hinzufügen
            </span>
          </button>
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
          <Video className="size-4 text-primary" /> YouTube-Links
        </div>
        <div className="space-y-2">
          {videos.map((v) => {
            const valid = isYoutube(v.url);
            return (
              <div key={v.id} className="flex items-start gap-2">
                <div className="flex-1">
                  <Input
                    value={v.url}
                    onChange={(e) =>
                      onVideos(videos.map((x) => (x.id === v.id ? { ...x, url: e.target.value } : x)))
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                    className={cn(!valid && "border-destructive focus-visible:ring-destructive")}
                  />
                  {!valid && (
                    <div className="mt-1 text-xs text-destructive inline-flex items-center gap-1">
                      <CircleAlert className="size-3" /> Kein gültiger YouTube-Link
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onVideos(videos.filter((x) => x.id !== v.id))}
                  aria-label="Entfernen"
                >
                  <X className="size-4" />
                </Button>
              </div>
            );
          })}
          <Button variant="outline" size="sm" onClick={addVideo} className="gap-1.5">
            <Plus className="size-4" /> Video hinzufügen
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReadOnlyBlock() {
  return (
    <section className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="size-10 shrink-0 rounded-xl bg-foreground/10 grid place-items-center">
          <Lock className="size-5 text-foreground/70" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-semibold">Nicht editierbar (Neutralität)</h2>
            <Badge variant="outline" className="text-[10px]">schreibgeschützt</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Diese Bereiche pflegen wir neutral. Sichtbarkeit lässt sich separat über{" "}
            <a href="/anbieter-portal/platzierung" className="text-primary underline">
              Platzierung
            </a>{" "}
            erhöhen.{" "}
            <a href="/badge" className="text-primary underline">
              Mehr zur Methodik (M-18)
            </a>
            .
          </p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <ReadOnlyCard
              icon={Star}
              title="Bewertungen"
              value="4,6 / 5"
              hint="Aus 142 verifizierten Bewertungen. Bewertungen sind nicht käuflich."
            />
            <ReadOnlyCard
              icon={ShieldCheck}
              title="Verifizierte Preisdaten"
              value="Ø 51 €/Nutzer"
              hint="Aus echten Abrechnungen anonymisierter Kunden. Nicht editierbar."
            />
            <ReadOnlyCard
              icon={TrendingUp}
              title="Organische Position"
              value="#3 in Kategorie"
              hint="Ergibt sich aus Relevanz, Vollständigkeit und Bewertungen, nicht aus Bezahlung."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ReadOnlyCard({
  icon: Icon,
  title,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3.5" /> {title}
      </div>
      <div className="mt-1 font-display text-xl font-semibold tabular-nums">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground leading-snug">{hint}</div>
    </div>
  );
}

// ============ Vollständigkeit ============

type Completeness = {
  percent: number;
  open: { label: string; anchor: string }[];
  done: number;
  total: number;
};

function computeCompleteness(d: ListingState): Completeness {
  const checks: { ok: boolean; label: string; anchor: string }[] = [
    { ok: !!d.name && !!d.tagline, label: "Name und Tagline", anchor: "basis" },
    { ok: !!d.website && !!d.founded, label: "Website und Gründungsjahr", anchor: "basis" },
    { ok: d.short.length >= 80, label: "Kurzbeschreibung", anchor: "beschreibung" },
    { ok: d.long.length >= 400, label: "Ausführliche Beschreibung (mind. 400 Zeichen)", anchor: "beschreibung" },
    { ok: d.features.length >= 4, label: "Mindestens 4 Funktionen", anchor: "features" },
    { ok: d.tarife.length >= 1, label: "Mindestens 1 Tarif", anchor: "preise" },
    { ok: d.screenshots.length >= 4, label: "Mindestens 4 Screenshots", anchor: "medien" },
    { ok: d.videos.length >= 1, label: "Mindestens 1 Video", anchor: "medien" },
    { ok: d.dsgvo && d.avv, label: "DSGVO und AVV bestätigt", anchor: "vertrauen" },
    { ok: !!d.hosting, label: "Datenstandort angegeben", anchor: "vertrauen" },
  ];
  const done = checks.filter((c) => c.ok).length;
  const total = checks.length;
  return {
    percent: Math.round((done / total) * 100),
    open: checks.filter((c) => !c.ok).map(({ label, anchor }) => ({ label, anchor })),
    done,
    total,
  };
}

function CompletenessCard({ completeness }: { completeness: Completeness }) {
  const { percent, open, done, total } = completeness;
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h2 className="font-display text-lg font-semibold">Vollständigkeit deines Listings</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {done} von {total} Punkten erledigt. Ein vollständiges Listing bekommt mehr Reichweite.
          </p>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl font-bold tabular-nums">{percent}%</div>
        </div>
      </div>
      <div className="mt-4 h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      {open.length > 0 && (
        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Offene Punkte
          </div>
          <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {open.map((o) => (
              <li key={o.label}>
                <a
                  href={`#${o.anchor}`}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:border-primary transition-colors"
                >
                  <CircleAlert className="size-4 text-amber-500" />
                  <span className="flex-1 min-w-0">{o.label}</span>
                  <ArrowRight className="size-3.5 text-muted-foreground" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

// ============ Live-Vorschau ============

function LivePreview({ data }: { data: ListingState }) {
  return (
    <div className="p-4 max-h-[80vh] overflow-y-auto bg-background">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        Detailseite (V-04) · Vorschau
      </div>
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-lg bg-primary text-primary-foreground grid place-items-center font-display font-bold">
            {data.name.slice(0, 1).toLowerCase() || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-display text-base font-semibold truncate">{data.name}</h3>
              {data.iso27001 && (
                <Shield className="size-3.5 text-emerald-600" aria-label="ISO 27001" />
              )}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {data.category} · {data.city}
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-foreground/80">{data.tagline}</p>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground line-clamp-3">
          {data.short}
        </p>
      </div>

      <div className="mt-4">
        <div className="text-xs font-semibold mb-1.5">Preise</div>
        <div className="grid grid-cols-1 gap-1.5">
          {data.tarife.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-xs"
            >
              <span className="font-medium">{t.name}</span>
              <span className="tabular-nums text-muted-foreground">
                {t.onRequest ? "auf Anfrage" : t.price ? `${t.price} € · ${t.note}` : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs font-semibold mb-1.5">Features ({data.features.length})</div>
        <ul className="space-y-1">
          {data.features.slice(0, 5).map((f) => (
            <li key={f.id} className="flex items-start gap-1.5 text-[11px]">
              <Check className="size-3 mt-0.5 text-emerald-600 shrink-0" />
              <span>
                <span className="text-muted-foreground">{f.group}:</span> {f.title}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <div className="text-xs font-semibold mb-1.5">Medien</div>
        <div className="grid grid-cols-3 gap-1.5">
          {data.screenshots.slice(0, 6).map((s) => (
            <div
              key={s.id}
              className="aspect-[4/3] rounded-md border border-border bg-muted/50 grid place-items-center"
              title={s.label}
            >
              <ImageIcon className="size-4 text-muted-foreground/60" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {data.dsgvo && <Badge variant="secondary" className="text-[10px]">DSGVO</Badge>}
        {data.avv && <Badge variant="secondary" className="text-[10px]">AVV</Badge>}
        {data.iso27001 && <Badge variant="secondary" className="text-[10px]">ISO 27001</Badge>}
        {data.hosting && (
          <Badge variant="secondary" className="text-[10px]">Hosting: {data.hosting}</Badge>
        )}
      </div>
    </div>
  );
}

// Unused import guard to avoid tree-shake noise during rapid edits
void FileCode2;
