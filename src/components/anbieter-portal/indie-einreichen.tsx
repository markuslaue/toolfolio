import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Upload,
  Loader2,
  AlertTriangle,
  Info,
  CreditCard,
  PartyPopper,
  Lock,
  Database,
  Globe,
  HeartHandshake,
  FileText,
  KeyRound,
  Activity,
  LifeBuoy,
  Trash2,
  Bug,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const VERIFIZIERT_PREIS = 49;
const fmt = (n: number) =>
  new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) +
  " €";

type Stufe = "community" | "verifiziert";

const SCHRITTE = [
  { id: 1, label: "Basisdaten" },
  { id: 2, label: "Standards" },
  { id: 3, label: "Selbstauskunft" },
  { id: 4, label: "Externe Prüfung" },
  { id: 5, label: "Listing-Stufe" },
  { id: 6, label: "Bestätigung" },
];

const STANDARDS = [
  "Mein Tool ist echt, erreichbar und funktioniert unter der angegebenen Live-URL.",
  "Die gewählte Kategorie passt zu dem, was das Tool tatsächlich tut.",
  "Die Beschreibung ist ehrlich und frei von irreführenden Versprechen.",
  "Mein Tool enthält keinen Scam, keine Schadsoftware und keine versteckten Funktionen.",
];

type Selbst = {
  dsgvo: boolean;
  avv: boolean;
  hosting: string;
  auth: boolean;
  verschluesselung: boolean;
  uptime: string;
  support: string;
  export: boolean;
  incident: boolean;
  backups: boolean;
  versicherung: boolean;
};

const SELBST_INIT: Selbst = {
  dsgvo: false,
  avv: false,
  hosting: "",
  auth: false,
  verschluesselung: false,
  uptime: "",
  support: "",
  export: false,
  incident: false,
  backups: false,
  versicherung: false,
};

type CheckStatus = "ok" | "hint" | "open";
const EXT_CHECKS: { label: string; status: CheckStatus; note: string; icon: typeof Lock }[] = [
  { label: "Gültiges TLS-Zertifikat", status: "ok", note: "Let's Encrypt, gültig bis 03/2027", icon: Lock },
  { label: "Erreichbarkeit und Live-Funktion", status: "ok", note: "HTTP 200, Antwortzeit 312 ms", icon: Activity },
  { label: "Datenschutzerklärung gefunden", status: "ok", note: "/datenschutz erreichbar", icon: FileText },
  { label: "Impressum gefunden", status: "hint", note: "Seite vorhanden, einige Pflichtangaben prüfen", icon: FileText },
  { label: "Sicherheits-Header (HSTS, CSP)", status: "open", note: "HSTS gesetzt, CSP fehlt noch", icon: ShieldCheck },
];

export function IndieEinreichenFlow() {
  const [schritt, setSchritt] = useState(1);
  const [basis, setBasis] = useState({
    name: "",
    url: "",
    kategorie: "Produktivität",
    kurz: "",
    lang: "",
    preise: "",
    kontakt: "",
  });
  const [standards, setStandards] = useState<boolean[]>(STANDARDS.map(() => false));
  const [selbst, setSelbst] = useState<Selbst>(SELBST_INIT);
  const [stufe, setStufe] = useState<Stufe>("community");
  const [submitted, setSubmitted] = useState(false);
  const [paying, setPaying] = useState(false);

  const standardsOk = standards.every(Boolean);
  const basisOk = basis.name && basis.url && basis.kurz && basis.lang && basis.preise && basis.kontakt;
  const selbstOk =
    selbst.dsgvo &&
    selbst.avv &&
    selbst.hosting.trim().length > 3 &&
    selbst.auth &&
    selbst.verschluesselung &&
    selbst.uptime.trim().length > 0 &&
    selbst.support.trim().length > 0 &&
    selbst.export &&
    selbst.incident &&
    selbst.backups &&
    selbst.versicherung;

  function next() {
    if (schritt === 1 && !basisOk) return toast.error("Bitte alle Basisdaten ausfüllen.");
    if (schritt === 2 && !standardsOk) return toast.error("Bitte alle Standards bestätigen.");
    if (schritt === 3 && stufe === "verifiziert" && !selbstOk)
      return toast.error("Für die verifizierte Stufe ist die Selbstauskunft Pflicht.");
    setSchritt((s) => Math.min(6, s + 1));
  }
  function back() {
    setSchritt((s) => Math.max(1, s - 1));
  }

  function abschliessen() {
    if (stufe === "verifiziert") {
      setPaying(true);
      setTimeout(() => {
        setPaying(false);
        setSubmitted(true);
        toast.success("Einreichung übermittelt (Demo)", {
          description: "Keine echte Zahlung. Externer Dienstleister wird simuliert.",
        });
      }, 1200);
    } else {
      setSubmitted(true);
      toast.success("Community-Listing eingereicht (Demo)");
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-[11px] font-semibold">
          <Sparkles className="size-3" /> Indie-Listing
        </div>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Reiche dein Tool ein
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Toolfolio ist offen für Indie-Builder. Wir prüfen, was extern prüfbar ist, du gibst eine
          verbindliche Selbstauskunft für den Rest. So bleibt das Verzeichnis ehrlich, ohne dich
          auszubremsen.
        </p>
      </div>

      {/* Fortschritt */}
      <ol className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
        {SCHRITTE.map((s, i) => {
          const active = s.id === schritt;
          const done = s.id < schritt;
          return (
            <li key={s.id} className="flex items-center gap-2 sm:gap-3">
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full pl-1 pr-3 py-1 border transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : done
                      ? "border-emerald/40 bg-emerald/5 text-emerald"
                      : "border-border bg-card text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "size-5 rounded-full grid place-items-center text-[10px] font-semibold",
                    active
                      ? "bg-primary text-primary-foreground"
                      : done
                        ? "bg-emerald text-white"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? <Check className="size-3" /> : s.id}
                </span>
                <span className="font-medium">{s.label}</span>
              </div>
              {i < SCHRITTE.length - 1 ? (
                <span className="hidden sm:block w-4 h-px bg-border" />
              ) : null}
            </li>
          );
        })}
      </ol>

      {/* Karte */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm">
        {submitted ? (
          <DankeZustand stufe={stufe} basis={basis} />
        ) : (
          <>
            {schritt === 1 && <Schritt1 basis={basis} setBasis={setBasis} />}
            {schritt === 2 && (
              <Schritt2 standards={standards} setStandards={setStandards} />
            )}
            {schritt === 3 && <Schritt3 selbst={selbst} setSelbst={setSelbst} stufe={stufe} />}
            {schritt === 4 && <Schritt4 />}
            {schritt === 5 && <Schritt5 stufe={stufe} setStufe={setStufe} />}
            {schritt === 6 && (
              <Schritt6
                basis={basis}
                stufe={stufe}
                paying={paying}
                onSubmit={abschliessen}
              />
            )}
          </>
        )}
      </div>

      {/* Nav */}
      {!submitted ? (
        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" onClick={back} disabled={schritt === 1}>
            <ChevronLeft className="size-4" /> Zurück
          </Button>
          {schritt < 6 ? (
            <Button onClick={next}>
              Weiter <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button variant="outline" onClick={() => toast("Entwurf gespeichert (Demo)")}>
              <Save className="size-4" /> Entwurf speichern
            </Button>
          )}
        </div>
      ) : null}

      {/* Badge-Scope */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-xl bg-emerald/10 text-emerald grid place-items-center shrink-0">
            <ShieldCheck className="size-4" />
          </div>
          <div className="text-sm">
            <div className="font-semibold">Was der Badge bedeutet, ehrlich gesagt</div>
            <p className="mt-1 text-muted-foreground leading-relaxed">
              Der Badge bestätigt die extern prüfbaren Punkte und deine verbindliche
              Selbstauskunft. Er ist keine Sicherheitsgarantie. Ein Teil ist manuelle Prüfung. Der
              Badge kann befristet sein und bei Verstößen entzogen werden.{" "}
              <Link to="/badge" className="text-primary font-medium hover:underline">
                Mehr zum Badge
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------- Schritte ------- */

function SectionHead({ n, title, sub }: { n: number; title: string; sub?: string }) {
  return (
    <div className="mb-5">
      <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
        Schritt {n} von 6
      </div>
      <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">{title}</h2>
      {sub ? <p className="mt-1 text-sm text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <div className="mt-2">{children}</div>
      {hint ? <p className="mt-1.5 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

type Basis = { name: string; url: string; kategorie: string; kurz: string; lang: string; preise: string; kontakt: string };

function Schritt1({
  basis,
  setBasis,
}: {
  basis: Basis;
  setBasis: (b: Basis) => void;
}) {
  return (
    <>
      <SectionHead
        n={1}
        title="Tool-Basisdaten"
        sub="Die Grundlage deines öffentlichen Profils im Verzeichnis."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Tool-Name">
          <Input
            value={basis.name}
            onChange={(e) => setBasis({ ...basis, name: e.target.value })}
            placeholder="z. B. Snippt"
          />
        </Field>
        <Field label="Live-URL">
          <Input
            value={basis.url}
            onChange={(e) => setBasis({ ...basis, url: e.target.value })}
            placeholder="https://"
          />
        </Field>
        <Field label="Kategorie">
          <select
            value={basis.kategorie}
            onChange={(e) => setBasis({ ...basis, kategorie: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {["Produktivität", "Entwicklung", "Design", "SEO", "Kommunikation", "KI / API", "eCommerce"].map(
              (k) => (
                <option key={k}>{k}</option>
              ),
            )}
          </select>
        </Field>
        <Field label="Kontakt / Betreiber">
          <Input
            value={basis.kontakt}
            onChange={(e) => setBasis({ ...basis, kontakt: e.target.value })}
            placeholder="hello@deintool.de"
          />
        </Field>
        <Field label="Kurzbeschreibung" hint="Ein Satz, max. 120 Zeichen.">
          <Input
            maxLength={120}
            value={basis.kurz}
            onChange={(e) => setBasis({ ...basis, kurz: e.target.value })}
            placeholder="Was macht dein Tool in einem Satz?"
          />
        </Field>
        <Field label="Öffentliche Preise" hint="Transparenz-Pflicht. Auch „kostenlos“ ist gültig.">
          <Input
            value={basis.preise}
            onChange={(e) => setBasis({ ...basis, preise: e.target.value })}
            placeholder="z. B. ab 9 €/Monat, oder kostenlos"
          />
        </Field>
        <div className="sm:col-span-2">
          <Field
            label="Ausführliche Beschreibung"
            hint="Wofür ist dein Tool gemacht, für wen, was sind die Grenzen?"
          >
            <Textarea
              rows={5}
              value={basis.lang}
              onChange={(e) => setBasis({ ...basis, lang: e.target.value })}
              placeholder="Bitte ehrlich beschreiben, ohne übertriebene Versprechen."
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Logo">
            <div className="rounded-xl border border-dashed border-border bg-background p-4 flex items-center gap-3">
              <div className="size-12 rounded-lg bg-muted grid place-items-center text-muted-foreground">
                <Upload className="size-4" />
              </div>
              <div className="text-xs">
                <div className="font-medium">Logo hochladen</div>
                <div className="text-muted-foreground">SVG oder PNG, mind. 256 × 256 px (Demo).</div>
              </div>
            </div>
          </Field>
        </div>
      </div>
    </>
  );
}

function Schritt2({
  standards,
  setStandards,
}: {
  standards: boolean[];
  setStandards: (s: boolean[]) => void;
}) {
  return (
    <>
      <SectionHead
        n={2}
        title="Allgemeine Standards"
        sub="Die Mindestanforderungen für jedes Listing im Verzeichnis."
      />
      <ul className="space-y-3">
        {STANDARDS.map((text, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-xl border border-border bg-background p-4"
          >
            <Checkbox
              checked={standards[i]}
              onCheckedChange={(v) => {
                const next = [...standards];
                next[i] = Boolean(v);
                setStandards(next);
              }}
              className="mt-0.5"
            />
            <div className="text-sm">{text}</div>
          </li>
        ))}
      </ul>
    </>
  );
}

function Schritt3({
  selbst,
  setSelbst,
  stufe,
}: {
  selbst: Selbst;
  setSelbst: (s: Selbst) => void;
  stufe: Stufe;
}) {
  const set = <K extends keyof Selbst>(k: K, v: Selbst[K]) =>
    setSelbst({ ...selbst, [k]: v });

  return (
    <>
      <SectionHead
        n={3}
        title="Sicherheit und Vertrauen"
        sub="Pflicht für die verifizierte Stufe. Bitte ehrlich und nachvollziehbar."
      />

      <div className="rounded-xl border border-amber-200/60 bg-amber-50/60 dark:bg-amber-500/5 p-3 text-xs text-amber-900 dark:text-amber-200 inline-flex items-start gap-2 mb-5">
        <Info className="size-3.5 mt-0.5 shrink-0" />
        <span>
          Diese Angaben sind eine verbindliche Selbstauskunft. Falschangaben führen zum Entzug des
          Badges und zum Ausschluss aus dem Verzeichnis.
        </span>
      </div>

      <div className="space-y-3">
        <SelbstCheck
          icon={FileText}
          label="DSGVO-Konformität"
          hint="Datenschutzerklärung ist vorhanden, AV-Prozesse sind dokumentiert."
          checked={selbst.dsgvo}
          onChange={(v) => set("dsgvo", v)}
        />
        <SelbstCheck
          icon={HeartHandshake}
          label="AVV möglich für Geschäftskunden"
          hint="Auftragsverarbeitungsvertrag wird auf Anfrage bereitgestellt."
          checked={selbst.avv}
          onChange={(v) => set("avv", v)}
        />
        <SelbstText
          icon={Database}
          label="Datenstandort und Hosting"
          hint="Wo liegen Kundendaten, welche Subdienstleister werden genutzt?"
          value={selbst.hosting}
          onChange={(v) => set("hosting", v)}
          placeholder="z. B. Hetzner Falkenstein (DE), Cloudflare als CDN"
        />
        <SelbstCheck
          icon={KeyRound}
          label="Authentifizierung"
          hint="Passwörter werden gehasht gespeichert (bcrypt/argon2), keine Klartext-Geheimnisse, 2FA möglich."
          checked={selbst.auth}
          onChange={(v) => set("auth", v)}
        />
        <SelbstCheck
          icon={Lock}
          label="Verschlüsselung"
          hint="TLS bei Übertragung, Verschlüsselung sensibler Daten im Ruhezustand."
          checked={selbst.verschluesselung}
          onChange={(v) => set("verschluesselung", v)}
        />
        <SelbstText
          icon={Activity}
          label="Uptime und Verfügbarkeit"
          hint="Zugesicherte Erreichbarkeit und ggf. Statusseite."
          value={selbst.uptime}
          onChange={(v) => set("uptime", v)}
          placeholder="z. B. 99,9 % monatlich, Status unter status.deintool.de"
        />
        <SelbstText
          icon={LifeBuoy}
          label="Support"
          hint="Wie erreichen Nutzer dich, in welcher Zeit antwortest du?"
          value={selbst.support}
          onChange={(v) => set("support", v)}
          placeholder="z. B. E-Mail, Antwort innerhalb von 24 h werktags"
        />
        <SelbstCheck
          icon={Trash2}
          label="Datenexport und Löschung"
          hint="Nutzer können Daten exportieren und auf Anfrage löschen lassen."
          checked={selbst.export}
          onChange={(v) => set("export", v)}
        />
        <SelbstCheck
          icon={Bug}
          label="Prozess für Sicherheitsvorfälle"
          hint="Es gibt einen dokumentierten Prozess für Meldung und Benachrichtigung."
          checked={selbst.incident}
          onChange={(v) => set("incident", v)}
        />
        <SelbstCheck
          icon={Globe}
          label="Backups"
          hint="Regelmäßige Backups, getestete Wiederherstellung."
          checked={selbst.backups}
          onChange={(v) => set("backups", v)}
        />
      </div>

      <label className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-background p-4 cursor-pointer">
        <Checkbox
          checked={selbst.versicherung}
          onCheckedChange={(v) => set("versicherung", Boolean(v))}
          className="mt-0.5"
        />
        <div className="text-sm">
          <div className="font-semibold">Ich versichere die Richtigkeit meiner Angaben.</div>
          <p className="mt-0.5 text-muted-foreground">
            Mir ist bewusst, dass Falschangaben zum Entzug des Badges und zum Ausschluss aus dem
            Verzeichnis führen können.
          </p>
        </div>
      </label>

      {stufe === "community" ? (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Für das kostenlose Community-Listing sind diese Angaben optional, aber empfohlen.
        </p>
      ) : null}
    </>
  );
}

function SelbstCheck({
  icon: Icon,
  label,
  hint,
  checked,
  onChange,
}: {
  icon: typeof Lock;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-border bg-background p-4 cursor-pointer hover:border-primary/40 transition-colors">
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onChange(Boolean(v))}
        className="mt-0.5"
      />
      <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
        <Icon className="size-4" />
      </div>
      <div className="text-sm min-w-0">
        <div className="font-semibold">{label}</div>
        <p className="mt-0.5 text-muted-foreground">{hint}</p>
      </div>
    </label>
  );
}

function SelbstText({
  icon: Icon,
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  icon: typeof Lock;
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-start gap-3">
        <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
          <Icon className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">{label}</div>
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
          <Textarea
            rows={2}
            className="mt-2"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
        </div>
      </div>
    </div>
  );
}

function Schritt4() {
  return (
    <>
      <SectionHead
        n={4}
        title="Automatisierte externe Prüfung"
        sub="Toolfolio prüft, was von außen prüfbar ist. Ergebnisse sind ein Snapshot, kein Audit."
      />
      <ul className="space-y-2.5">
        {EXT_CHECKS.map((c, i) => {
          const Icon = c.icon;
          const tone =
            c.status === "ok"
              ? { bg: "bg-emerald/10", text: "text-emerald", label: "Bestanden" }
              : c.status === "hint"
                ? { bg: "bg-amber-100 dark:bg-amber-500/15", text: "text-amber-700 dark:text-amber-300", label: "Hinweis" }
                : { bg: "bg-muted", text: "text-muted-foreground", label: "Offen" };
          return (
            <li
              key={i}
              className="flex items-center gap-3 rounded-xl border border-border bg-background p-4"
            >
              <div className={cn("size-9 rounded-lg grid place-items-center shrink-0", tone.bg, tone.text)}>
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{c.label}</div>
                <div className="text-xs text-muted-foreground">{c.note}</div>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  tone.bg,
                  tone.text,
                )}
              >
                {c.status === "ok" ? (
                  <Check className="size-3" />
                ) : c.status === "hint" ? (
                  <AlertTriangle className="size-3" />
                ) : (
                  <Loader2 className="size-3" />
                )}
                {tone.label}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-[11px] text-muted-foreground inline-flex items-start gap-1.5">
        <Info className="size-3.5 mt-0.5 shrink-0" />
        Eine manuelle Prüfung folgt nach Einreichung. Offene Punkte kannst du danach in deinem
        Listing beheben.
      </p>
    </>
  );
}

function Schritt5({ stufe, setStufe }: { stufe: Stufe; setStufe: (s: Stufe) => void }) {
  return (
    <>
      <SectionHead
        n={5}
        title="Listing-Stufe wählen"
        sub="Beide Stufen sind ehrlich gekennzeichnet. Du kannst jederzeit upgraden."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <StufeCard
          active={stufe === "community"}
          onClick={() => setStufe("community")}
          title="Community-Listing"
          preis="kostenlos"
          desc="Sofort gelistet als Community-Tool, sobald die allgemeinen Standards erfüllt sind. Ohne Badge."
          points={[
            "Eintrag im Verzeichnis",
            "Kennzeichnung als Community-Tool",
            "Kein Badge, keine Selbstauskunft nötig",
          ]}
        />
        <StufeCard
          active={stufe === "verifiziert"}
          onClick={() => setStufe("verifiziert")}
          title="Verifiziertes Listing"
          preis={`${fmt(VERIFIZIERT_PREIS)} einmalig`}
          highlight
          desc="Nach bestandener Prüfung: Badge plus erweitertes Profil. Keine laufenden Kosten, kein CPC, keine Sale-Beteiligung."
          points={[
            "Badge nach Prüfung",
            "Erweitertes Profil mit Vertrauensdaten",
            "Einmaliger Unkostenbeitrag, nichts darüber hinaus",
          ]}
        />
      </div>
    </>
  );
}

function StufeCard({
  active,
  onClick,
  title,
  preis,
  desc,
  points,
  highlight,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  preis: string;
  desc: string;
  points: string[];
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-left rounded-2xl border p-5 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        active ? "border-primary ring-2 ring-primary/30" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-display text-lg font-semibold tracking-tight">{title}</div>
          <div
            className="mt-1 font-display text-2xl font-semibold tracking-tight"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {preis}
          </div>
        </div>
        {highlight ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald/10 text-emerald px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
            <ShieldCheck className="size-3" /> Badge
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
      <ul className="mt-3 space-y-1.5 text-sm">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2">
            <Check className="size-4 text-emerald mt-0.5 shrink-0" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
      {active ? (
        <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
          <Check className="size-3" /> Ausgewählt
        </div>
      ) : null}
    </button>
  );
}

function Schritt6({
  basis,
  stufe,
  paying,
  onSubmit,
}: {
  basis: { name: string; url: string; kategorie: string };
  stufe: Stufe;
  paying: boolean;
  onSubmit: () => void;
}) {
  return (
    <>
      <SectionHead
        n={6}
        title="Zusammenfassung und Einreichung"
        sub="Prüfe deine Angaben. Du kannst danach jederzeit ergänzen."
      />
      <dl className="space-y-2.5 text-sm">
        <SumRow k="Tool" v={basis.name || "—"} />
        <SumRow k="Live-URL" v={basis.url || "—"} />
        <SumRow k="Kategorie" v={basis.kategorie} />
        <SumRow
          k="Listing-Stufe"
          v={stufe === "community" ? "Community-Listing (kostenlos)" : "Verifiziertes Listing"}
        />
        {stufe === "verifiziert" ? (
          <SumRow k="Einmaliger Beitrag" v={fmt(VERIFIZIERT_PREIS)} />
        ) : null}
      </dl>

      {stufe === "verifiziert" ? (
        <div className="mt-5 rounded-xl border border-border bg-background p-4 text-sm">
          <div className="flex items-start gap-3">
            <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
              <CreditCard className="size-4" />
            </div>
            <div>
              <div className="font-semibold">Einmalige Zahlung</div>
              <p className="mt-0.5 text-muted-foreground">
                Die Zahlung läuft über einen externen Dienstleister. Toolfolio speichert keine
                rohen Kartendaten. Nach dem Klick öffnet sich das Zahlungsfenster (Demo).
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <Button onClick={onSubmit} disabled={paying} size="lg" className="mt-5 w-full sm:w-auto">
        {paying ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Zahlung wird simuliert
          </>
        ) : stufe === "verifiziert" ? (
          <>Kostenpflichtig einreichen ({fmt(VERIFIZIERT_PREIS)})</>
        ) : (
          <>Community-Listing einreichen</>
        )}
      </Button>
    </>
  );
}

function SumRow({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 last:border-0">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium text-right">{v}</dd>
    </div>
  );
}

function DankeZustand({
  stufe,
  basis,
}: {
  stufe: Stufe;
  basis: { name: string };
}) {
  return (
    <div className="text-center py-6">
      <div className="mx-auto size-14 rounded-2xl bg-emerald/10 text-emerald grid place-items-center">
        <PartyPopper className="size-6" />
      </div>
      <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight">
        Eingereicht, in Prüfung
      </h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
        Danke, dass du {basis.name || "dein Tool"} bei Toolfolio einreichst. Wir melden uns per
        E-Mail, sobald die manuelle Prüfung abgeschlossen ist.{" "}
        {stufe === "verifiziert"
          ? "Bei bestandener Prüfung erhältst du den Badge und ein erweitertes Profil."
          : "Dein Community-Listing wird in Kürze sichtbar."}
      </p>
      <div className="mt-5 rounded-xl border border-border bg-background p-4 text-sm max-w-lg mx-auto text-left">
        <div className="flex items-start gap-3">
          <ShieldCheck className="size-4 text-emerald mt-0.5" />
          <p className="text-muted-foreground">
            Der Badge bestätigt geprüfte externe Punkte und deine Selbstverpflichtung, ist keine
            Sicherheitsgarantie und kann befristet sein oder entzogen werden.{" "}
            <Link to="/badge" className="text-primary font-medium hover:underline">
              Details
            </Link>
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        <Button asChild variant="outline">
          <Link to="/anbieter-portal">Zum Dashboard</Link>
        </Button>
        <Button asChild>
          <Link to="/anbieter-portal/listing">Listing weiter bearbeiten</Link>
        </Button>
      </div>
    </div>
  );
}
