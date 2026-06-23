import { useMemo, useState } from "react";
import {
  ShieldCheck,
  Star,
  Info,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Lock,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Nav, Footer, Reveal } from "./marketing-home";

const VIOLET = "#6C5CE7";
const CORAL = "#FF7A66";
const EMERALD = "#12B76A";
const AMBER = "#F5A623";

type Verified = "verifiziert" | "unverifiziert";

type Props = {
  toolSlug?: string;
  toolName?: string;
};

function StarsInput({
  value,
  onChange,
  size = 28,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  size?: number;
  label?: string;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1" role="radiogroup" aria-label={label || "Sterne"}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(n)}
            className="rounded-md p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2"
            style={{ outlineColor: VIOLET }}
            aria-label={`${n} von 5 Sternen`}
            aria-checked={value === n}
            role="radio"
          >
            <Star
              size={size}
              strokeWidth={1.8}
              className="transition-colors"
              style={{
                color: n <= active ? AMBER : "#D7D2C7",
                fill: n <= active ? AMBER : "transparent",
              }}
            />
          </button>
        ))}
      </div>
      {value > 0 && (
        <span className="text-sm font-medium" style={{ color: "#1F1D2B" }}>
          {value}/5
        </span>
      )}
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold" style={{ color: "#1F1D2B" }}>
          {label}
          {required && <span style={{ color: CORAL }}> *</span>}
        </span>
        {hint && <span className="text-xs text-stone-500">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

const inputBase =
  "w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 transition-shadow";
const inputStyle = { boxShadow: "0 1px 0 rgba(0,0,0,0.02)" } as const;

export function BewertenPage({ toolSlug = "notion", toolName = "Notion" }: Props) {
  const [verified, setVerified] = useState<Verified>("verifiziert");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [overall, setOverall] = useState(0);
  const [usability, setUsability] = useState(0);
  const [features, setFeatures] = useState(0);
  const [value, setValue] = useState(0);
  const [support, setSupport] = useState(0);

  const [title, setTitle] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [body, setBody] = useState("");

  const [role, setRole] = useState(verified === "verifiziert" ? "Gründer / Solo" : "");
  const [size, setSize] = useState(verified === "verifiziert" ? "1 bis 5 Mitarbeitende" : "");
  const [duration, setDuration] = useState(verified === "verifiziert" ? "6 bis 12 Monate" : "");
  const [recommend, setRecommend] = useState<"ja" | "vielleicht" | "nein" | "">("");
  const [consent, setConsent] = useState(false);

  const isVerified = verified === "verifiziert";

  const toolInitial = useMemo(() => toolName.charAt(0).toUpperCase(), [toolName]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: string[] = [];
    if (overall === 0) errs.push("Bitte vergib eine Gesamtbewertung.");
    if (!consent) errs.push("Bitte bestätige die Echtheits- und Datenschutz-Hinweise.");
    setErrors(errs);
    if (errs.length === 0) setSubmitted(true);
  }

  return (
    <div style={{ backgroundColor: "#FBF7F1", color: "#1F1D2B", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .h-display { font-family: 'Bricolage Grotesque', serif; letter-spacing: -0.01em; }
        .focus-violet:focus { box-shadow: 0 0 0 3px rgba(108,92,231,0.25); border-color: ${VIOLET}; }
      `}</style>

      <Nav />

      <main className="mx-auto max-w-3xl px-5 pt-10 pb-24 sm:px-6 lg:pt-14">
        {/* Breadcrumb / Back */}
        <Reveal>
          <div className="mb-6 flex items-center gap-2 text-sm text-stone-600">
            <Link
              to="/verzeichnis"
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 hover:bg-white/70 transition-colors"
            >
              <ArrowLeft size={14} /> Zurück zum Verzeichnis
            </Link>
          </div>
        </Reveal>

        {/* Header */}
        <Reveal>
          <div className="mb-8 flex items-start gap-4">
            <div
              className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-2xl font-bold text-white shadow-sm"
              style={{ background: `linear-gradient(135deg, ${VIOLET}, ${CORAL})` }}
              aria-hidden
            >
              {toolInitial}
            </div>
            <div>
              <h1 className="h-display text-3xl font-bold leading-tight sm:text-4xl">
                Bewertung für {toolName} abgeben
              </h1>
              <p className="mt-2 text-stone-600">
                Teile deine eigene, ehrliche Erfahrung. Bewertungen sind nie käuflich und werden
                vor der Veröffentlichung moderiert.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Demo toggle */}
        <Reveal>
          <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-stone-300 bg-white/60 p-3 text-xs text-stone-600">
            <Sparkles size={14} style={{ color: VIOLET }} />
            <span>Demo-Umschalter (nur zur Veranschaulichung):</span>
            <button
              type="button"
              onClick={() => setVerified("verifiziert")}
              className={`rounded-full px-3 py-1 transition-colors ${
                isVerified ? "text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
              style={isVerified ? { backgroundColor: EMERALD } : {}}
            >
              Verifiziert durch Abrechnung
            </button>
            <button
              type="button"
              onClick={() => setVerified("unverifiziert")}
              className={`rounded-full px-3 py-1 transition-colors ${
                !isVerified ? "text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
              style={!isVerified ? { backgroundColor: AMBER } : {}}
            >
              Unverifiziert
            </button>
          </div>
        </Reveal>

        {/* Verification banner */}
        <Reveal>
          {isVerified ? (
            <div
              className="mb-8 rounded-3xl border p-5 sm:p-6"
              style={{ backgroundColor: "#ECFDF3", borderColor: "#A6F4C5" }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white shadow-sm"
                  style={{ backgroundColor: EMERALD }}
                >
                  <ShieldCheck size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="h-display text-lg font-semibold" style={{ color: "#054F31" }}>
                      Verifiziert durch Abrechnung
                    </h2>
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
                      style={{ backgroundColor: EMERALD }}
                    >
                      <ShieldCheck size={11} /> Siegel aktiv
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-emerald-900/90">
                    Wir haben über deine Tracker-Daten bestätigt, dass du {toolName} nutzt und
                    zahlst. Deine Bewertung erhält das verifiziert-Siegel.
                  </p>
                  <ul className="mt-3 grid gap-2 text-xs text-emerald-900/80 sm:grid-cols-2">
                    <li className="flex items-start gap-2">
                      <Info size={14} className="mt-0.5 shrink-0" />
                      <span>Das Siegel bestätigt nur deine Nutzung, nicht die Richtigkeit deiner Meinung.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Lock size={14} className="mt-0.5 shrink-0" />
                      <span>Private Zahlungsdetails (Betrag, Karte, Konto) bleiben unsichtbar.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="mb-8 rounded-3xl border p-5 sm:p-6"
              style={{ backgroundColor: "#FFF8EB", borderColor: "#FCE4A8" }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white shadow-sm"
                  style={{ backgroundColor: AMBER }}
                >
                  <AlertCircle size={22} />
                </div>
                <div className="flex-1">
                  <h2 className="h-display text-lg font-semibold" style={{ color: "#7A4A05" }}>
                    Deine Bewertung wird als unverifiziert veröffentlicht
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-amber-900/90">
                    Verbinde {toolName} in deinem Toolfolio-Tracker, um über deine Abrechnungs-Daten
                    bestätigt zu werden. Danach erhält deine Bewertung automatisch das verifiziert-Siegel.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#1F1D2B" }}
                    >
                      {toolName} verbinden <ShieldCheck size={12} />
                    </Link>
                    <span className="text-xs text-amber-900/70">
                      So funktioniert die Verifizierung in unter 2 Minuten.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Reveal>

        {submitted ? (
          <Reveal>
            <div
              className="rounded-3xl border bg-white p-8 text-center shadow-sm"
              style={{ borderColor: "#E7E2D8" }}
            >
              <div
                className="mx-auto grid h-14 w-14 place-items-center rounded-full text-white"
                style={{ backgroundColor: EMERALD }}
              >
                <CheckCircle2 size={28} />
              </div>
              <h2 className="h-display mt-4 text-2xl font-bold">Danke für deine Bewertung!</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm text-stone-600">
                Deine Bewertung wurde übermittelt und geht jetzt in unsere Moderation. Wir prüfen
                jede Einreichung manuell, um gefälschte Bewertungen zu verhindern. Übliche Prüfdauer:
                1 bis 3 Werktage.
              </p>
              <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs text-stone-700">
                <span className="font-semibold">Status:</span>
                {isVerified ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold text-white"
                    style={{ backgroundColor: EMERALD }}
                  >
                    <ShieldCheck size={11} /> Verifiziert durch Abrechnung
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold text-white"
                    style={{ backgroundColor: AMBER }}
                  >
                    Unverifiziert
                  </span>
                )}
                <span>· In Moderation</span>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/verzeichnis"
                  className="inline-flex items-center gap-1 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
                  style={{ backgroundColor: VIOLET }}
                >
                  Zurück zum Verzeichnis
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setOverall(0);
                    setUsability(0);
                    setFeatures(0);
                    setValue(0);
                    setSupport(0);
                    setTitle("");
                    setPros("");
                    setCons("");
                    setBody("");
                    setRecommend("");
                    setConsent(false);
                  }}
                  className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-white"
                >
                  Weitere Bewertung abgeben
                </button>
              </div>
            </div>
          </Reveal>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Overall rating */}
            <Reveal>
              <section className="rounded-3xl border bg-white p-6 shadow-sm" style={{ borderColor: "#E7E2D8" }}>
                <h2 className="h-display text-lg font-semibold">Gesamtbewertung</h2>
                <p className="mt-1 text-sm text-stone-600">
                  Wie würdest du {toolName} insgesamt bewerten?
                </p>
                <div className="mt-4">
                  <StarsInput value={overall} onChange={setOverall} size={36} label="Gesamtbewertung" />
                </div>
              </section>
            </Reveal>

            {/* Sub ratings */}
            <Reveal>
              <section className="rounded-3xl border bg-white p-6 shadow-sm" style={{ borderColor: "#E7E2D8" }}>
                <h2 className="h-display text-lg font-semibold">Teilbewertungen <span className="text-sm font-normal text-stone-500">(optional)</span></h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {[
                    { label: "Benutzerfreundlichkeit", v: usability, set: setUsability },
                    { label: "Funktionsumfang", v: features, set: setFeatures },
                    { label: "Preis-Leistung", v: value, set: setValue },
                    { label: "Support", v: support, set: setSupport },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 px-4 py-3">
                      <span className="text-sm font-medium">{row.label}</span>
                      <StarsInput value={row.v} onChange={row.set} size={20} label={row.label} />
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>

            {/* Written review */}
            <Reveal>
              <section className="rounded-3xl border bg-white p-6 shadow-sm" style={{ borderColor: "#E7E2D8" }}>
                <h2 className="h-display text-lg font-semibold">Deine Erfahrung</h2>
                <div className="mt-4 space-y-5">
                  <Field label="Titel der Bewertung">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={`${inputBase} focus-violet`}
                      style={inputStyle}
                      placeholder="z. B. Solide Allrounder-Lösung für kleine Teams"
                      maxLength={120}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Pro: was gefällt dir?">
                      <div className="relative">
                        <ThumbsUp
                          size={16}
                          className="pointer-events-none absolute left-4 top-3.5"
                          style={{ color: EMERALD }}
                        />
                        <textarea
                          value={pros}
                          onChange={(e) => setPros(e.target.value)}
                          rows={4}
                          className={`${inputBase} pl-10 focus-violet`}
                          style={inputStyle}
                          placeholder="Was funktioniert gut im Alltag?"
                          maxLength={500}
                        />
                      </div>
                    </Field>
                    <Field label="Contra: was fehlt dir?">
                      <div className="relative">
                        <ThumbsDown
                          size={16}
                          className="pointer-events-none absolute left-4 top-3.5"
                          style={{ color: CORAL }}
                        />
                        <textarea
                          value={cons}
                          onChange={(e) => setCons(e.target.value)}
                          rows={4}
                          className={`${inputBase} pl-10 focus-violet`}
                          style={inputStyle}
                          placeholder="Was nervt oder fehlt?"
                          maxLength={500}
                        />
                      </div>
                    </Field>
                  </div>

                  <Field label="Ausführliche Bewertung" hint={`${body.length}/2000`}>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={6}
                      className={`${inputBase} focus-violet`}
                      style={inputStyle}
                      placeholder="Beschreibe deine Erfahrung im Detail: für welche Aufgaben nutzt du das Tool, wie war die Einrichtung, wo überzeugt es, wo nicht?"
                      maxLength={2000}
                    />
                  </Field>
                </div>
              </section>
            </Reveal>

            {/* Context */}
            <Reveal>
              <section className="rounded-3xl border bg-white p-6 shadow-sm" style={{ borderColor: "#E7E2D8" }}>
                <h2 className="h-display text-lg font-semibold">Dein Nutzungskontext</h2>
                <p className="mt-1 text-sm text-stone-600">
                  {isVerified
                    ? "Für dich teils vorausgefüllt aus deinem Profil. Du kannst alles anpassen."
                    : "Hilft anderen Lesern, deine Bewertung einzuordnen."}
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <Field label="Rolle">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className={`${inputBase} focus-violet`}
                      style={inputStyle}
                    >
                      <option value="">Bitte wählen</option>
                      <option>Gründer / Solo</option>
                      <option>Geschäftsführung</option>
                      <option>Operations / Finance</option>
                      <option>IT / Admin</option>
                      <option>Team-Lead</option>
                      <option>Mitarbeiter</option>
                    </select>
                  </Field>
                  <Field label="Unternehmensgröße">
                    <select
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className={`${inputBase} focus-violet`}
                      style={inputStyle}
                    >
                      <option value="">Bitte wählen</option>
                      <option>1 bis 5 Mitarbeitende</option>
                      <option>6 bis 25 Mitarbeitende</option>
                      <option>26 bis 100 Mitarbeitende</option>
                      <option>101 bis 500 Mitarbeitende</option>
                      <option>Mehr als 500</option>
                    </select>
                  </Field>
                  <Field label="Nutzungsdauer">
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className={`${inputBase} focus-violet`}
                      style={inputStyle}
                    >
                      <option value="">Bitte wählen</option>
                      <option>Weniger als 3 Monate</option>
                      <option>3 bis 6 Monate</option>
                      <option>6 bis 12 Monate</option>
                      <option>1 bis 2 Jahre</option>
                      <option>Mehr als 2 Jahre</option>
                    </select>
                  </Field>
                </div>

                <div className="mt-5">
                  <span className="text-sm font-semibold">Würdest du {toolName} weiterempfehlen?</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["ja", "vielleicht", "nein"] as const).map((opt) => {
                      const active = recommend === opt;
                      const labels: Record<typeof opt, string> = {
                        ja: "Ja, klar",
                        vielleicht: "Mit Einschränkungen",
                        nein: "Eher nicht",
                      } as const;
                      return (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => setRecommend(opt)}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                            active
                              ? "text-white"
                              : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
                          }`}
                          style={
                            active
                              ? { backgroundColor: VIOLET, borderColor: VIOLET }
                              : {}
                          }
                        >
                          {labels[opt]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            </Reveal>

            {/* Policies */}
            <Reveal>
              <section
                className="rounded-3xl border p-6"
                style={{ borderColor: "#E7E2D8", backgroundColor: "#FFFDF8" }}
              >
                <h2 className="h-display text-lg font-semibold">Echtheit & Neutralität</h2>
                <ul className="mt-3 grid gap-2 text-sm text-stone-700 sm:grid-cols-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: EMERALD }} />
                    Nur eigene, echte Erfahrungen aus deinem Arbeitsalltag.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: EMERALD }} />
                    Keine gefälschten Bewertungen, keine Konkurrenz-Sabotage.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: EMERALD }} />
                    Bewertungen werden nicht bezahlt oder belohnt (goldene Regel).
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: EMERALD }} />
                    Jede Einreichung wird vor Veröffentlichung manuell moderiert.
                  </li>
                </ul>

                <label className="mt-5 flex items-start gap-3 rounded-2xl bg-white p-4 border border-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#6C5CE7]"
                  />
                  <span className="text-sm text-stone-700">
                    Ich bestätige, dass diese Bewertung auf meiner eigenen Erfahrung beruht und
                    weder bezahlt noch durch Dritte beeinflusst wurde. Ich willige in die
                    Verarbeitung gemäß <Link to="/sicherheit" className="underline" style={{ color: VIOLET }}>Datenschutz-Hinweis (R-02)</Link> ein.
                    <span style={{ color: CORAL }}> *</span>
                  </span>
                </label>
              </section>
            </Reveal>

            {/* Errors */}
            {errors.length > 0 && (
              <div
                className="rounded-2xl border p-4 text-sm"
                style={{ backgroundColor: "#FEF3F2", borderColor: "#FDA29B", color: "#7A271A" }}
                role="alert"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <ul className="list-disc pl-4">
                    {errors.map((er) => (
                      <li key={er}>{er}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Submit */}
            <Reveal>
              <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-stone-500">
                  Mit dem Absenden geht deine Bewertung in die Moderation. Du kannst sie danach
                  jederzeit zurückziehen.
                </p>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: VIOLET }}
                >
                  Bewertung absenden
                  <Star size={14} fill="white" />
                </button>
              </div>
            </Reveal>

            <p className="pt-2 text-center text-[11px] text-stone-500">
              Demo-Hinweis: Diese Einreichung ist ein Mock. Es findet keine echte Übermittlung
              oder Verifizierung statt. Slug: <code className="font-mono">{toolSlug}</code>
            </p>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
