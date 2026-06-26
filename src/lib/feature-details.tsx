"use client";

import type { ComponentType } from "react";
import { LayoutDashboard, FileSpreadsheet, Hourglass, CalendarClock, Bot, BarChart3, Sparkles, Users, Receipt, Archive } from "lucide-react";
import { PreviewDashboard, PreviewImport, PreviewFristen, PreviewAiCredits, PreviewBenchmark, PreviewSparvorschlaege, PreviewKunde } from "@/components/marketing/marketing-home";
import { FeatureDetailPage } from "@/components/marketing/feature-detail-page";

export type Shot = { slot: string; caption: string; Preview?: ComponentType };
type Icon = typeof LayoutDashboard;
export type FeatureDetail = {
  breadcrumb: string;
  eyebrow: string;
  h1: string;
  subline: string;
  hero: Shot;
  schmerz: { intro: string; paragraphs: string[]; beispiel?: { titel: string; text: string } };
  schritte: { titel: string; text: string; shot: Shot }[];
  detail: { icon: Icon; titel: string; text: string }[];
  outcome: { paragraphs: string[]; kpis?: { wert: string; label: string }[] };
  zielgruppe: { titel: string; text: string }[];
  related: { slug: string; icon: Icon; title: string; desc: string }[];
  faq: { q: string; a: string }[];
};

const R = {
  ueberblick: { slug: "ueberblick", icon: LayoutDashboard, title: "Dashboard & Überblick", desc: "Alle Kosten auf einen Blick." },
  erfassen: { slug: "erfassen", icon: FileSpreadsheet, title: "Drei-Wege-Erfassung", desc: "Import, Postfach, manuell." },
  fristen: { slug: "fristen", icon: CalendarClock, title: "Fristen-Wächter", desc: "Keine stille Verlängerung." },
  trials: { slug: "trials", icon: Hourglass, title: "Trial- & Zombie-Erkennung", desc: "Stoppt vergessene Abos." },
  ai: { slug: "ai", icon: Bot, title: "AI-Credit-Tracker", desc: "Variable KI-Kosten im Griff." },
  benchmark: { slug: "benchmark", icon: BarChart3, title: "Preis-Benchmark", desc: "Zahlst du zu viel?" },
  sparen: { slug: "sparen", icon: Sparkles, title: "Sparvorschläge", desc: "Konkrete Ersparnis pro Jahr." },
  kunden: { slug: "kunden", icon: Users, title: "Kosten pro Kunde", desc: "Zuordnen und weiterverrechnen." },
  weiterverrechnung: { slug: "weiterverrechnung", icon: Receipt, title: "Weiterverrechnungs-Report", desc: "Sauberer Beleg je Kunde." },
  archiv: { slug: "archiv", icon: Archive, title: "Archiv & Steuer-Export", desc: "Belege, Verträge, DATEV." },
} as const;

export const DETAILS: Record<string, FeatureDetail> = {
  ueberblick: {
    breadcrumb: "Überblick", eyebrow: "den Überblick", h1: "Alle Abos, Kosten und Abrechnungszeiträume auf einen Blick.",
    subline: "Das Dashboard zeigt Gesamtkosten pro Monat und Jahr, die Verteilung nach Kategorie, Zahlungskanal und Kunde sowie die nächsten Abbuchungen.",
    hero: { slot: "Dashboard mit KPI-Karten, Verlauf und Spar-Fortschritt.", caption: "dashboard", Preview: PreviewDashboard },
    schmerz: { intro: "Du verlierst den Überblick, welche Tools laufen und was sie kosten.", paragraphs: ["Abos verteilen sich auf Konten, Karten und PayPal. Am Monatsende summiert sich mehr, als du gedacht hast, und keiner weiß genau, wofür.", "Ohne einen zentralen Ort fehlt die Grundlage für jede Entscheidung: Was läuft, was kostet wie viel, was lohnt sich noch?"], beispiel: { titel: "Typisch", text: "Drei Design-Tools, zwei davon kaum genutzt, niemand hat es bemerkt." } },
    schritte: [
      { titel: "Daten rein, einmalig.", text: "Importiere den Kontoauszug oder lege Abos manuell an. Toolfolio sortiert nach Kategorie, Kanal und Kunde.", shot: { slot: "Import-Review mit erkannten Buchungen.", caption: "import", Preview: PreviewImport } },
      { titel: "Überblick raus, dauerhaft.", text: "Das Dashboard rechnet Monats- und Jahreskosten, zeigt die nächsten Abbuchungen und den Spar-Fortschritt.", shot: { slot: "Dashboard mit Verlauf.", caption: "dashboard", Preview: PreviewDashboard } },
    ],
    detail: [
      { icon: LayoutDashboard, titel: "Monats- und Jahressicht", text: "Gesamtkosten normalisiert, egal ob monatlich, quartalsweise oder jährlich." },
      { icon: BarChart3, titel: "Verteilung", text: "Nach Kategorie, Zahlungskanal und Kunde, sofort sichtbar." },
      { icon: CalendarClock, titel: "Nächste Abbuchungen", text: "Die kommenden 30 Tage im Blick, keine Überraschung." },
    ],
    outcome: { paragraphs: ["Du triffst Kostenentscheidungen mit Zahlen statt Bauchgefühl.", "Der erste Blick am Morgen zeigt dir, ob alles im Rahmen läuft."], kpis: [{ wert: "1", label: "zentraler Ort" }, { wert: "100 %", label: "Kostentransparenz" }, { wert: "30 Tage", label: "Vorschau" }] },
    zielgruppe: [
      { titel: "Solopreneure", text: "Endlich wissen, was wirklich abgeht." },
      { titel: "Freelancer", text: "Saubere Grundlage für die Steuer." },
      { titel: "Agenturen", text: "Kosten teamweit transparent." },
    ],
    related: [R.erfassen, R.fristen, R.sparen],
    faq: [{ q: "Brauche ich eine Bankanbindung?", a: "Nein. Du kannst den Kontoauszug als Datei importieren oder Abos manuell anlegen." }, { q: "Werden Fremdwährungen unterstützt?", a: "Beträge werden im deutschen Format geführt, EUR und USD sind vorgesehen." }, { q: "Ist das im Free-Plan dabei?", a: "Ja, das Dashboard ist Teil des kostenlosen Plans." }],
  },
  erfassen: {
    breadcrumb: "Erfassung", eyebrow: "die Drei-Wege-Erfassung", h1: "Alles drin in Minuten, auch das, was du vergessen hattest.",
    subline: "Importiere den Kontoauszug, leite Belege ans Toolfolio-Postfach weiter oder erfasse manuell. Der Import findet auch vergessene Abos und ordnet sie ein.",
    hero: { slot: "Import-Review mit erkannten Buchungen.", caption: "import", Preview: PreviewImport },
    schmerz: { intro: "Du weißt nicht mal, was alles läuft.", paragraphs: ["Abos verteilen sich auf Konten, Karten und PayPal. Genau die vergessenen sind die teuren.", "Manuelles Zusammensuchen ist mühsam und unvollständig."] },
    schritte: [
      { titel: "Kontoauszug importieren", text: "CSV, CAMT oder MT940 hochladen. Toolfolio erkennt wiederkehrende Buchungen und schlägt Abos vor.", shot: { slot: "Import-Erkennung.", caption: "import", Preview: PreviewImport } },
      { titel: "Prüfen und übernehmen", text: "Im Review bestätigst du die Treffer, ordnest Kategorie und Kunde zu, fertig.", shot: { slot: "Onboarding-Wizard.", caption: "onboarding" } },
    ],
    detail: [
      { icon: FileSpreadsheet, titel: "Mehrere Formate", text: "CSV, CAMT und MT940 mit automatischer Trennzeichen-Erkennung." },
      { icon: Receipt, titel: "Beleg-Postfach", text: "Rechnungen per Mail weiterleiten, später automatisch erfasst." },
      { icon: LayoutDashboard, titel: "Manuell in Sekunden", text: "Einzelne Abos schnell selbst anlegen." },
    ],
    outcome: { paragraphs: ["Du hast in Minuten ein vollständiges Bild, statt wochenlang zu sammeln.", "Auch die stillen Abbuchungen tauchen auf."], kpis: [{ wert: "3", label: "Erfassungswege" }, { wert: "Minuten", label: "statt Wochen" }] },
    zielgruppe: [
      { titel: "Wechsler", text: "Schneller Start ohne Zettelwirtschaft." },
      { titel: "Vielnutzer", text: "30 bis 60 Tools auf einmal." },
      { titel: "Agenturen", text: "Mehrere Karten und Konten zusammenführen." },
    ],
    related: [R.ueberblick, R.fristen, R.archiv],
    faq: [{ q: "Werden Bankdaten gespeichert?", a: "Nur Referenzen wie die letzten vier Ziffern, niemals vollständige Karten- oder IBAN-Daten." }, { q: "Welche Formate gehen?", a: "CSV, CAMT und MT940. Weitere folgen." }, { q: "Erkennt der Import alles?", a: "Die häufigen Anbieter ja. Den Rest ordnest du im Review mit einem Klick zu." }],
  },
  trials: {
    breadcrumb: "Trials", eyebrow: "die Trial-Erkennung", h1: "Trial- und Zombie-Erkennung warnt dich, bevor es teuer wird.",
    subline: "Toolfolio erkennt Trials und meldet sich rechtzeitig vor dem Übergang in den bezahlten Tarif. Ungenutzte Abos markieren wir als Zombies.",
    hero: { slot: "Fristen-Timeline mit Trial- und Zombie-Markern.", caption: "fristen", Preview: PreviewFristen },
    schmerz: { intro: "Du testest ein Tool und vergisst zu kündigen.", paragraphs: ["Seit vier Monaten zieht es ungenutzt Geld ab, gemerkt hast du es nie.", "Trials kippen still in bezahlte Abos, und niemand erinnert dich."], beispiel: { titel: "Klassiker", text: "14-Tage-Test, dann 49 Euro im Monat, ein halbes Jahr lang." } },
    schritte: [
      { titel: "Trial hinterlegen", text: "Beim Anlegen markierst du das Trial-Ende, oder der Import erkennt es.", shot: { slot: "Trial-Datum am Abo.", caption: "fristen-detail" } },
      { titel: "Rechtzeitig entscheiden", text: "Vor dem Übergang erinnert dich Toolfolio per Mail und im Aktions-Center.", shot: { slot: "Fristen-Timeline.", caption: "fristen", Preview: PreviewFristen } },
    ],
    detail: [
      { icon: Hourglass, titel: "Trial-Warnung", text: "E-Mail, bevor aus dem Test ein Abo wird." },
      { icon: Archive, titel: "Zombie-Erkennung", text: "Abos ohne Nutzung werden markiert und zur Kündigung vorgeschlagen." },
      { icon: CalendarClock, titel: "Frei wählbarer Vorlauf", text: "Du bestimmst, wie viele Tage vorher du erinnert wirst." },
    ],
    outcome: { paragraphs: ["Kein Trial kippt mehr unbemerkt in eine Rechnung.", "Ungenutzte Abos fallen auf, bevor sie ein Jahr kosten."], kpis: [{ wert: "0", label: "vergessene Trials" }, { wert: "rechtzeitig", label: "erinnert" }] },
    zielgruppe: [
      { titel: "Tool-Tester", text: "Probier viel, zahl nur für das, was bleibt." },
      { titel: "Teams", text: "Niemand muss sich Fristen merken." },
      { titel: "Sparfüchse", text: "Zombies konsequent loswerden." },
    ],
    related: [R.fristen, R.sparen, R.ueberblick],
    faq: [{ q: "Woher kennt Toolfolio das Trial-Ende?", a: "Aus deiner Eingabe beim Anlegen oder aus dem Import. Du kannst es jederzeit anpassen." }, { q: "Was ist ein Zombie-Abo?", a: "Ein Abo, das weiterläuft, aber nicht genutzt wird. Toolfolio markiert es und schlägt die Kündigung vor." }, { q: "Bekomme ich E-Mails?", a: "Ja, mit individuell einstellbarem Vorlauf. Du kannst sie jederzeit abstellen." }],
  },
  fristen: {
    breadcrumb: "Fristen", eyebrow: "den Fristen-Wächter", h1: "Der Kündigungsfristen-Wächter, gemacht für deutsche Verträge.",
    subline: "Für jeden Vertrag siehst du Laufzeit, letzten Kündigungstermin und die Konsequenz einer verpassten Frist. Wir erinnern dich rechtzeitig.",
    hero: { slot: "Fristen-Detail mit Kündigungstermin und Konsequenz.", caption: "fristen", Preview: PreviewFristen },
    schmerz: { intro: "Ein Vertrag hat sich still um ein Jahr verlängert.", paragraphs: ["Du hast die Frist verpasst, und jetzt zahlst du zwölf Monate für etwas, das du kündigen wolltest.", "Deutsche Verträge mit Kündigungsfristen sind genau die Falle, die Tools aus den USA nicht abbilden."], beispiel: { titel: "Teuer", text: "Drei Monate Kündigungsfrist übersehen, ein Jahr Verlängerung." } },
    schritte: [
      { titel: "Frist hinterlegen", text: "Laufzeit, Kündigungsfrist und Termin am Abo erfassen, oder aus dem Vertrag übernehmen.", shot: { slot: "Frist-Felder am Abo.", caption: "fristen-detail" } },
      { titel: "Rechtzeitig erinnert werden", text: "Toolfolio warnt per E-Mail und im Dashboard, bevor sich etwas still verlängert.", shot: { slot: "Fristen-Timeline.", caption: "fristen", Preview: PreviewFristen } },
    ],
    detail: [
      { icon: CalendarClock, titel: "Letzter Kündigungstermin", text: "Klar berechnet aus Laufzeit und Frist." },
      { icon: Hourglass, titel: "Konsequenz sichtbar", text: "Du siehst, was eine verpasste Frist kostet." },
      { icon: LayoutDashboard, titel: "Im Aktions-Center", text: "Anstehende Fristen direkt auf dem Dashboard." },
    ],
    outcome: { paragraphs: ["Verlängerungen passieren nur noch, wenn du sie willst.", "Du kündigst rechtzeitig, statt ein Jahr nachzuzahlen."], kpis: [{ wert: "0", label: "stille Verlängerungen" }, { wert: "DACH", label: "Vertragslogik" }] },
    zielgruppe: [
      { titel: "DACH-Unternehmen", text: "Endlich ein Tool, das deutsche Fristen kennt." },
      { titel: "Vielnutzer", text: "Dutzende Verträge ohne Kalender-Chaos." },
      { titel: "Agenturen", text: "Fristen teamweit sichtbar." },
    ],
    related: [R.trials, R.archiv, R.ueberblick],
    faq: [{ q: "Funktioniert das mit jeder Vertragsart?", a: "Ja, du hinterlegst Laufzeit und Kündigungsfrist pro Abo. Toolfolio berechnet den letzten Termin." }, { q: "Wie werde ich erinnert?", a: "Per E-Mail mit einstellbarem Vorlauf und im Dashboard." }, { q: "Ist das rechtsverbindlich?", a: "Toolfolio unterstützt dich bei der Organisation, ersetzt aber keine Rechtsberatung." }],
  },
  ai: {
    breadcrumb: "AI-Credits", eyebrow: "den AI-Credit-Tracker", h1: "AI-Credit-Tracker mit Verlauf, Spikes und Budgets.",
    subline: "OpenAI, Anthropic, ElevenLabs und Co. landen im selben Cockpit. Du siehst Verbrauchsverläufe, erkennst Spikes früh und setzt harte Budgets.",
    hero: { slot: "AI-Credit-Detail mit Spike-Erkennung und Budgets.", caption: "ai-credits", Preview: PreviewAiCredits },
    schmerz: { intro: "Deine KI-Kosten laufen unbemerkt aus dem Ruder.", paragraphs: ["Am Monatsende ist die OpenAI-Rechnung doppelt so hoch wie geplant, und niemand weiß, warum.", "Variable Kosten passen nicht in ein Abo-Raster, deshalb fehlen sie überall."], beispiel: { titel: "Spike", text: "Eine fehlerhafte Schleife verdreifacht den Verbrauch über Nacht." } },
    schritte: [
      { titel: "Dienste anlegen", text: "Trage deine KI-Dienste ein und erfasse die monatlichen Kosten, manuell oder per Verlauf.", shot: { slot: "AI-Dienste anlegen.", caption: "ai-credits", Preview: PreviewAiCredits } },
      { titel: "Spikes erkennen, Budget setzen", text: "Toolfolio rechnet den Schnitt, markiert Ausreißer und warnt, wenn ein Dienst aus dem Rahmen läuft.", shot: { slot: "Spike-Erkennung.", caption: "ai-credits", Preview: PreviewAiCredits } },
    ],
    detail: [
      { icon: Bot, titel: "Alle Dienste an einem Ort", text: "OpenAI, Anthropic, ElevenLabs und mehr." },
      { icon: BarChart3, titel: "Verlauf und Spikes", text: "Monatsverläufe mit Ausreißer-Markierung." },
      { icon: Sparkles, titel: "Budgets", text: "Pro Dienst ein Monatsbudget, das warnt." },
    ],
    outcome: { paragraphs: ["Keine doppelte Rechnung am Monatsende mehr.", "Spikes fallen auf, solange du noch gegensteuern kannst."], kpis: [{ wert: "1,5x", label: "Spike-Schwelle" }, { wert: "monatlich", label: "Budget-Kontrolle" }] },
    zielgruppe: [
      { titel: "KI-Builder", text: "Behalt die API-Kosten im Griff." },
      { titel: "Agenturen", text: "Variable Kosten pro Projekt im Blick." },
      { titel: "Solopreneure", text: "Kein böses Erwachen auf der Kreditkarte." },
    ],
    related: [R.sparen, R.ueberblick, R.benchmark],
    faq: [{ q: "Verbindet sich Toolfolio mit den APIs?", a: "Aktuell erfasst du die Monatskosten manuell. Der automatische Abruf per API-Schlüssel folgt mit den Integrationen." }, { q: "Wie wird ein Spike erkannt?", a: "Wenn der aktuelle Monat deutlich über dem Schnitt der Vormonate liegt, ab dem 1,5-fachen." }, { q: "Kann ich Budgets setzen?", a: "Ja, pro Dienst ein Monatsbudget mit Warnung bei Überschreitung." }],
  },
  benchmark: {
    breadcrumb: "Benchmark", eyebrow: "den Preis-Benchmark", h1: "Benchmark aus echten, anonymisierten Abrechnungsdaten.",
    subline: "Wir vergleichen deine Preise mit dem Markt-Median vergleichbarer Agenturen und Freelancer. Du erkennst, wo du fair zahlst und wo nicht.",
    hero: { slot: "Benchmark-Ansicht Du gegen Markt-Median.", caption: "benchmark", Preview: PreviewBenchmark },
    schmerz: { intro: "Du zahlst mehr als nötig, weißt es aber nicht.", paragraphs: ["Listenpreise sagen wenig, weil kaum jemand sie wirklich zahlt. Es fehlt der echte Vergleich.", "Ohne Referenz fehlt das Argument für ein Gespräch mit dem Anbieter."] },
    schritte: [
      { titel: "Deine Preise sind schon da", text: "Aus deinen erfassten Abos kennt Toolfolio, was du zahlst.", shot: { slot: "Abos mit Preisen.", caption: "dashboard", Preview: PreviewDashboard } },
      { titel: "Gegen den Markt halten", text: "Der Benchmark zeigt den anonymisierten Median vergleichbarer Nutzer, mit klarer Datenkennzeichnung.", shot: { slot: "Benchmark Du gegen Median.", caption: "benchmark", Preview: PreviewBenchmark } },
    ],
    detail: [
      { icon: BarChart3, titel: "Verifizierte Preise", text: "Aus echten, anonymisierten Abrechnungen statt Listenpreisen." },
      { icon: Sparkles, titel: "Ehrliche Zustände", text: "Verifiziert, zu wenig Daten oder Listenpreis, klar gekennzeichnet." },
      { icon: Users, titel: "Vergleichbare Gruppe", text: "Median ähnlicher Agenturen und Freelancer." },
    ],
    outcome: { paragraphs: ["Du weißt, ob ein Preis fair ist, bevor du verlängerst.", "Mit einer Referenz lässt sich besser verhandeln oder wechseln."], kpis: [{ wert: "Median", label: "statt Liste" }, { wert: "anonym", label: "und sicher" }] },
    zielgruppe: [
      { titel: "Preisbewusste", text: "Nie wieder über Marktniveau zahlen." },
      { titel: "Verhandler", text: "Mit Daten ins Anbietergespräch." },
      { titel: "Agenturen", text: "Faire Preise gegenüber Kunden belegen." },
    ],
    related: [R.sparen, R.ueberblick, R.ai],
    faq: [{ q: "Woher kommen die Vergleichsdaten?", a: "Aus anonymisierten Aggregaten mit hoher Mindestschwelle. Personenbezogene Daten fließen nie in den Benchmark." }, { q: "Sind das Listenpreise?", a: "Nein, verifizierte Preise aus echten Abrechnungen. Wo Daten fehlen, sagen wir das ehrlich." }, { q: "Ab wann ist der Benchmark verfügbar?", a: "Sobald genug anonymisierte Daten vorliegen, um aussagekräftig zu sein." }],
  },
  sparen: {
    breadcrumb: "Sparvorschläge", eyebrow: "die Sparvorschläge", h1: "Sparvorschläge mit konkreter Ersparnis pro Jahr.",
    subline: "Konkrete Maßnahmen statt abstrakter Berichte. Wechsle auf den Jahresplan, beseitige Redundanzen, stoppe Zombies. Jeder Vorschlag zeigt die Ersparnis.",
    hero: { slot: "Sparvorschläge mit Jahres-Ersparnis und Aktionen.", caption: "sparvorschlaege", Preview: PreviewSparvorschlaege },
    schmerz: { intro: "Du würdest sparen, wenn du wüsstest wie.", paragraphs: ["Berichte zeigen Probleme, aber keine Lösungen. Du brauchst die nächste konkrete Aktion.", "Ohne klaren Euro-Betrag bleibt Sparen ein Vorsatz."] },
    schritte: [
      { titel: "Toolfolio analysiert", text: "Aus deinen Abos erkennt Toolfolio Intervall-Wechsel, Redundanzen und Zombies, ehrlich aus deinen Daten.", shot: { slot: "Sparvorschläge-Liste.", caption: "sparvorschlaege", Preview: PreviewSparvorschlaege } },
      { titel: "Du setzt um", text: "Jeder Vorschlag zeigt die Jahres-Ersparnis und ist abhakbar. Der Spar-Fortschritt füllt sich.", shot: { slot: "Spar-Fortschritt.", caption: "dashboard", Preview: PreviewDashboard } },
    ],
    detail: [
      { icon: Sparkles, titel: "Intervall-Wechsel", text: "Von monatlich auf jährlich, mit berechneter Ersparnis." },
      { icon: BarChart3, titel: "Redundanzen", text: "Mehrere Tools gleicher Kategorie aufgedeckt." },
      { icon: Hourglass, titel: "Zombies", text: "Pausierte Abos, die weiter kosten." },
    ],
    outcome: { paragraphs: ["Du sparst echtes Geld, nicht nur auf dem Papier.", "Der Fortschritt zeigt, was du schon zurückgeholt hast."], kpis: [{ wert: "€/Jahr", label: "je Vorschlag" }, { wert: "1 Klick", label: "umgesetzt" }] },
    zielgruppe: [
      { titel: "Sparfüchse", text: "Konkrete Beträge statt vager Tipps." },
      { titel: "Agenturen", text: "Spürbar weniger Tool-Kosten." },
      { titel: "Solopreneure", text: "Jeder Euro zählt." },
    ],
    related: [R.benchmark, R.trials, R.ueberblick],
    faq: [{ q: "Woher kommen die Vorschläge?", a: "Ehrlich aus deinen eigenen Abodaten: Intervall, Kategorien und Status. Keine erfundenen Zahlen." }, { q: "Sind die Ersparnisse garantiert?", a: "Geschätzte Werte sind als solche gekennzeichnet, etwa der typische Jahresrabatt." }, { q: "Kann ich Vorschläge ignorieren?", a: "Ja, du kannst sie umsetzen, ignorieren oder später wieder aufnehmen." }],
  },
  kunden: {
    breadcrumb: "Kosten pro Kunde", eyebrow: "Kosten pro Kunde", h1: "Toolkosten pro Kunde zuordnen, weiterverrechnen, Marge sehen.",
    subline: "Jedes Tool kann einem Kunden zugeordnet werden, anteilig oder vollständig. Du siehst pro Kunde die Kosten, den weiterverrechneten Anteil und die Marge.",
    hero: { slot: "Kunden-Detail mit Tool-Kosten und Marge.", caption: "kunden", Preview: PreviewKunde },
    schmerz: { intro: "Bei Agenturen verteilen sich Toolkosten ungeordnet.", paragraphs: ["Niemand weiß, was zu welchem Kunden gehört, und beim Weiterverrechnen fehlt die saubere Grundlage.", "Marge bleibt ein Bauchgefühl, statt eine Zahl."] },
    schritte: [
      { titel: "Tools Kunden zuordnen", text: "Lege Kunden an und ordne ihnen Tools zu, mit Aufschlag für die Weiterverrechnung.", shot: { slot: "Kunde mit zugeordneten Tools.", caption: "kunden", Preview: PreviewKunde } },
      { titel: "Marge sehen", text: "Pro Kunde zeigt Toolfolio Kosten, weiterverrechneten Anteil und Marge.", shot: { slot: "Kosten nach Kunde.", caption: "dashboard", Preview: PreviewDashboard } },
    ],
    detail: [
      { icon: Users, titel: "Zuordnung", text: "Anteilig oder vollständig, pro Tool." },
      { icon: Receipt, titel: "Aufschlag", text: "Pro Kunde oder pro Abo definierbar." },
      { icon: BarChart3, titel: "Marge", text: "Sofort sichtbar, sauber gerechnet." },
    ],
    outcome: { paragraphs: ["Du weißt pro Kunde, was die Tools kosten und was du verdienst.", "Saubere Zahlen für Reporting und Kundengespräch."], kpis: [{ wert: "pro Kunde", label: "Transparenz" }, { wert: "Marge", label: "in Echtzeit" }] },
    zielgruppe: [
      { titel: "Agenturen", text: "Der Kern des Agentur-Plans." },
      { titel: "Freelancer", text: "Tools an Projekte koppeln." },
      { titel: "Berater", text: "Aufwände sauber zuordnen." },
    ],
    related: [R.weiterverrechnung, R.ueberblick, R.archiv],
    faq: [{ q: "Kann ein Tool mehreren Kunden gehören?", a: "Die Zuordnung erfolgt je Abo. Anteilige Modelle kannst du über den Aufschlag und die Kostenbasis abbilden." }, { q: "Wo lege ich den Aufschlag fest?", a: "Pro Kunde als Standard oder pro Abo individuell." }, { q: "Ist das im Free-Plan?", a: "Die Agentur-Funktionen sind Teil des Agentur-Plans." }],
  },
  weiterverrechnung: {
    breadcrumb: "Weiterverrechnung", eyebrow: "den Weiterverrechnungs-Report", h1: "Weiterverrechnungs-Report pro Kunde, pro Monat.",
    subline: "Toolfolio bündelt die zuordenbaren Tool-Kosten pro Kunde in einem klaren Report. Direkt in die Rechnung oder als CSV ans Buchhaltungstool.",
    hero: { slot: "Report-Vorschau mit Positionen pro Kunde.", caption: "report" },
    schmerz: { intro: "Du willst weiterverrechnen, aber der saubere Beleg fehlt.", paragraphs: ["Jeden Monat suchst du Positionen zusammen, statt sie fertig zu haben.", "Ohne klaren Report wird aus Weiterverrechnung schnell Verzicht."] },
    schritte: [
      { titel: "Zuordnung steht", text: "Sobald Tools Kunden zugeordnet sind, kennt Toolfolio die weiterverrechenbaren Kosten.", shot: { slot: "Kunde mit Tools.", caption: "kunden", Preview: PreviewKunde } },
      { titel: "Report erzeugen", text: "Pro Kunde und Monat ein Report mit Positionen, Aufschlag und Summe, als CSV oder zum Drucken.", shot: { slot: "Report mit Firmenkopf.", caption: "report" } },
    ],
    detail: [
      { icon: Receipt, titel: "Positionen je Kunde", text: "Tool, Kosten, Aufschlag, weiterverrechnet, Marge." },
      { icon: FileSpreadsheet, titel: "CSV-Export", text: "Direkt ins Buchhaltungstool." },
      { icon: Archive, titel: "Firmenkopf", text: "Mit deinen Unternehmensdaten." },
    ],
    outcome: { paragraphs: ["Weiterverrechnung wird zur Routine statt zur Monatsaufgabe.", "Der Beleg ist sauber und nachvollziehbar."], kpis: [{ wert: "pro Monat", label: "fertiger Report" }, { wert: "CSV", label: "exportierbar" }] },
    zielgruppe: [
      { titel: "Agenturen", text: "Tool-Kosten an Kunden weitergeben." },
      { titel: "Freelancer", text: "Auslagen sauber abrechnen." },
      { titel: "Buchhaltung", text: "Klarer Beleg ohne Rückfragen." },
    ],
    related: [R.kunden, R.archiv, R.ueberblick],
    faq: [{ q: "In welchem Format kommt der Report?", a: "Als CSV mit Positionen je Kunde, plus druckbare Ansicht mit Firmenkopf." }, { q: "Sind das fertige Rechnungen?", a: "Es ist die saubere Grundlage. Die Rechnung selbst stellst du in deinem Rechnungstool." }, { q: "Pro welchen Zeitraum?", a: "Monatlich wiederkehrend, normalisiert über alle Intervalle." }],
  },
  archiv: {
    breadcrumb: "Archiv & Steuer", eyebrow: "das Archiv", h1: "Rechnungs- und Vertragsarchiv plus Steuer- und DATEV-Export.",
    subline: "Alle Belege liegen am richtigen Abo, durchsuchbar, mit Vertrag verknüpft. Der Steuer-Export liefert Positionen inklusive Reverse-Charge und DATEV-kompatibles CSV.",
    hero: { slot: "Archiv mit Belegen und Verträgen je Abo.", caption: "archiv" },
    schmerz: { intro: "Zur Steuer suchst du Rechnungen mühsam zusammen.", paragraphs: ["Belege liegen in Mails, Ordnern und Tools verstreut, und der Steuerberater fragt nach.", "Reverse-Charge für EU-Anbieter ist fehleranfällig, wenn man es von Hand macht."] },
    schritte: [
      { titel: "Belege ablegen", text: "Rechnungen und Verträge hochladen und dem passenden Abo zuordnen, sicher und durchsuchbar.", shot: { slot: "Archiv mit Belegen.", caption: "archiv" } },
      { titel: "Steuer exportieren", text: "Der Export liefert Netto, USt und Brutto je Position, mit Reverse-Charge-Kennzeichnung und DATEV-kompatibler CSV.", shot: { slot: "Steuer-Export.", caption: "steuer-export" } },
    ],
    detail: [
      { icon: Archive, titel: "Belege je Abo", text: "Rechnungen, Verträge und AGB-Snapshots an einem Ort." },
      { icon: Receipt, titel: "Reverse-Charge", text: "EU-Anbieter korrekt gekennzeichnet." },
      { icon: FileSpreadsheet, titel: "DATEV-kompatibel", text: "CSV zum Import beim Steuerberater." },
    ],
    outcome: { paragraphs: ["Die Steuer wird zur Übergabe statt zur Suche.", "Belege sind verknüpft, nichts geht verloren."], kpis: [{ wert: "10 MB", label: "je Datei" }, { wert: "DATEV", label: "kompatibel" }] },
    zielgruppe: [
      { titel: "Steuerpflichtige", text: "Alles fertig für die Buchhaltung." },
      { titel: "Agenturen", text: "Belege je Kunde und Tool." },
      { titel: "EU-Einkäufer", text: "Reverse-Charge ohne Kopfzerbrechen." },
    ],
    related: [R.weiterverrechnung, R.kunden, R.fristen],
    faq: [{ q: "Welche Dateien kann ich hochladen?", a: "PDF, PNG, JPG und WebP bis 10 MB, sicher und nur für dich sichtbar." }, { q: "Ist der DATEV-Export zertifiziert?", a: "Es ist ein DATEV-kompatibler, sauber spaltierter CSV-Export. Den genauen Buchungsstapel stimmst du mit deinem Steuerberater ab." }, { q: "Wird Reverse-Charge automatisch gesetzt?", a: "Du markierst ausländische Anbieter, Toolfolio bereitet die Kennzeichnung vor. Es ersetzt keine Steuerberatung." }],
  },
};

export const FEATURE_SLUGS = Object.keys(DETAILS);

export function FeatureBySlug({ slug }: { slug: string }) {
  const data = DETAILS[slug];
  if (!data) return null;
  return <FeatureDetailPage data={data} />;
}
