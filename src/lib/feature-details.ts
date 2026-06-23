import type { ComponentType } from "react";
import {
  CalendarClock,
  Hourglass,
  Bell,
  CheckCircle2,
  Sparkles,
  Bot,
  Users,
  BarChart3,
  FileSpreadsheet,
  Receipt,
  LayoutDashboard,
  Search,
} from "lucide-react";
import {
  PreviewFristen,
  PreviewDashboard,
  PreviewAiCredits,
  PreviewBenchmark,
  PreviewSparvorschlaege,
  PreviewKunde,
} from "@/components/marketing/marketing-home";

export type Shot = {
  slot: string;
  caption: string;
  Preview?: ComponentType;
};

export type FaqItem = { q: string; a: string };

export type RelatedLink = {
  slug: string;
  title: string;
  desc: string;
  icon: ComponentType<{ className?: string }>;
};

export type FeatureDetail = {
  slug: string;
  breadcrumb: string;
  eyebrow: string;
  h1: string;
  subline: string;
  hero: Shot;
  schmerz: {
    intro: string;
    paragraphs: string[];
    beispiel?: { titel: string; text: string };
  };
  schritte: {
    titel: string;
    text: string;
    shot: Shot;
  }[];
  detail: {
    titel: string;
    text: string;
    icon: ComponentType<{ className?: string }>;
  }[];
  outcome: {
    paragraphs: string[];
    kpis?: { wert: string; label: string }[];
  };
  zielgruppe: { titel: string; text: string }[];
  related: RelatedLink[];
  faq: FaqItem[];
};

/* ------------------------------------------------------------------ */
/*  Instanz: Kündigungsfristen-Wächter                                 */
/* ------------------------------------------------------------------ */

export const fristenDetail: FeatureDetail = {
  slug: "fristen-waechter",
  breadcrumb: "Produkt / Kündigungsfristen-Wächter",
  eyebrow: "Kündigungsfristen-Wächter",
  h1: "Kündigungsfristen-Wächter. Nie wieder eine stille Verlängerung.",
  subline:
    "Verträge verlängern sich still um ein Jahr, weil Fristen vergessen werden. Toolfolio erinnert dich rechtzeitig und macht die Kündigung zum Ein-Klick-Schritt.",
  hero: {
    slot: "Fristen-Timeline mit Restlaufzeit pro Vertrag und Konsequenz.",
    caption: "fristen",
    Preview: PreviewFristen,
  },
  schmerz: {
    intro:
      "Software-Verträge im B2B verlängern sich fast nie von selbst zu deinen Gunsten. Wer die Kündigungsfrist verpasst, ist ein weiteres Jahr gebunden. Das ist Alltag, kein Ausnahmefall.",
    paragraphs: [
      "Die meisten Jahresverträge laufen still aus, drei Monate oder sechs Wochen vor Vertragsende. Wer nichts macht, hat unterschrieben. Bei einer Handvoll Tools ist das vielleicht überschaubar. Bei zwanzig oder dreißig Abos verteilt auf mehrere Karten und Konten verlierst du den Überblick zwangsläufig.",
      "Trials sind die zweite große Quelle für unnötige Kosten. Du testest ein Tool, vergisst zu kündigen, und vier Monate später fällt dir auf, dass es im Hintergrund jeden Monat Geld abbucht. Geld, für das niemand etwas bekommen hat.",
      "Ein gewöhnlicher Kalender-Eintrag reicht selten. Er steht nicht in deinem Buchhaltungs-Kontext, du hast den Vertrag nicht griffbereit, und am Tag X bist du im Kundentermin.",
    ],
    beispiel: {
      titel: "Ein typischer Fall",
      text: "239 Euro für ein weiteres Jahr Screaming Frog, nur weil das Kündigungsdatum sechs Wochen vor Vertragsende lag und niemand daran gedacht hat. Bei drei solcher Verträge im Jahr ist das echtes Geld.",
    },
  },
  schritte: [
    {
      titel: "1. Abos erfassen, Toolfolio kennt die Fristen.",
      text: "Sobald ein Abo im System ist, sei es per Kontoauszug-Import, Beleg-Postfach oder manuell, zieht Toolfolio die typischen Kündigungsfristen aus dem Verzeichnis. Du kannst sie pro Vertrag manuell überschreiben, wenn du eine Sonderkondition hast.",
      shot: {
        slot: "Abo-Detail mit Vertragslaufzeit und Kündigungsfrist.",
        caption: "abo-vertrag",
      },
    },
    {
      titel: "2. Der Wächter berechnet den letzten Kündigungstermin.",
      text: "Aus Vertragsbeginn, Laufzeit und Frist ergibt sich automatisch der letzte mögliche Kündigungstermin. Du siehst pro Vertrag die Restlaufzeit, die Konsequenz einer verpassten Frist (also den Betrag, der dich ein weiteres Jahr binden würde) und den Status.",
      shot: {
        slot: "Fristen-Timeline mit letztem Kündigungstermin und Konsequenz.",
        caption: "fristen-timeline",
        Preview: PreviewFristen,
      },
    },
    {
      titel: "3. Du wirst rechtzeitig erinnert.",
      text: "Toolfolio meldet sich in mehreren Stufen, im Dashboard und per E-Mail. Standard sind 60, 30, 14 und 3 Tage vor dem letzten Kündigungstermin. Trial-Übergänge bekommen eine separate, frühere Erinnerung.",
      shot: {
        slot: "Erinnerungs-E-Mail und Aktions-Center mit Frist.",
        caption: "erinnerung",
      },
    },
    {
      titel: "4. Mit einem Klick kündigen oder bewusst behalten.",
      text: "Aus der Erinnerung heraus erstellst du die Kündigungs-E-Mail mit korrekten Daten und Empfänger, lädst sie als PDF oder bestätigst, dass du den Vertrag bewusst weiterlaufen lässt. Beides wird im Archiv festgehalten.",
      shot: {
        slot: "Kündigungs-Assistent mit vorbereiteter E-Mail.",
        caption: "kuendigen",
      },
    },
  ],
  detail: [
    {
      titel: "Timeline- und Kalenderansicht",
      text: "Alle Fristen sortiert nach Datum, optional als Monatskalender. Auf einen Blick siehst du den Engpass-Monat.",
      icon: CalendarClock,
    },
    {
      titel: "Trial-Ende-Warnung",
      text: "Trials werden separat markiert und früher gemeldet, damit der Übergang ins zahlende Abo nie unbemerkt passiert.",
      icon: Hourglass,
    },
    {
      titel: "Mehrstufige Erinnerungen",
      text: "60, 30, 14 und 3 Tage vor Frist. Stufen individuell einstellbar pro Vertragsklasse.",
      icon: Bell,
    },
    {
      titel: "Konsequenz in Euro",
      text: "Jede Frist zeigt den Jahresbetrag, der bei verpasster Kündigung als Verlängerung anfällt. Damit priorisierst du sofort.",
      icon: Receipt,
    },
    {
      titel: "Kunden-Zuordnung",
      text: "Bei Agenturen siehst du, welche Kundenprojekte ein Vertrag betrifft, damit du vor der Kündigung intern abstimmen kannst.",
      icon: Users,
    },
    {
      titel: "Archiv mit Vertrag",
      text: "Vertrag, Bestätigung und Kündigungsbeleg liegen am selben Abo, jederzeit auffindbar.",
      icon: CheckCircle2,
    },
  ],
  outcome: {
    paragraphs: [
      "Du verlierst kein Geld mehr an ungewollte Verlängerungen. Alle Verträge laufen genau so lange, wie du es willst, nicht einen Monat länger.",
      "Du hast Ruhe. Statt mit einem Bauchgefühl von Unsicherheit weißt du, dass jede relevante Frist gemeldet wird, bevor sie zum Problem wird.",
    ],
    kpis: [
      { wert: "Ø 1.480 €", label: "vermiedene Verlängerungen pro Jahr" },
      { wert: "98 %", label: "rechtzeitig erkannte Fristen" },
      { wert: "0", label: "stille Verlängerungen seit Aktivierung" },
    ],
  },
  zielgruppe: [
    {
      titel: "Agenturen",
      text: "Viele parallele Jahresverträge, oft pro Kundenprojekt. Hier wirkt der Wächter am direktesten.",
    },
    {
      titel: "Freelancer",
      text: "Wenig Zeit für Vertragsverwaltung. Erinnerungen kommen genau dann, wenn du etwas tun kannst.",
    },
    {
      titel: "Solopreneure",
      text: "Software-Stack soll schlank bleiben. Der Wächter verhindert, dass Tests still zu Dauerabos werden.",
    },
  ],
  related: [
    {
      slug: "sparvorschlaege",
      title: "Sparvorschläge & Deals",
      desc: "Konkrete Maßnahmen, sobald der Wächter eine Frist meldet.",
      icon: Sparkles,
    },
    {
      slug: "ai-credits",
      title: "AI-Credit-Tracker",
      desc: "Auch variable KI-Kosten im Griff, mit Spike-Erkennung und Budgets.",
      icon: Bot,
    },
    {
      slug: "benchmark",
      title: "Benchmark",
      desc: "Sieh, ob du bei gleicher Leistung mehr zahlst als der Markt.",
      icon: BarChart3,
    },
    {
      slug: "verzeichnis",
      title: "Zum Verzeichnis",
      desc: "Alternativen zu deinen Tools finden, bevor du verlängerst.",
      icon: Search,
    },
  ],
  faq: [
    {
      q: "Woher kennt Toolfolio meine Kündigungsfristen?",
      a: "Aus dem DACH-Verzeichnis ziehen wir typische Vertragslaufzeiten und Fristen pro Tool und Plan. Du kannst jede Frist pro Vertrag manuell überschreiben, wenn du eine Sonderkondition oder einen Rahmenvertrag hast.",
    },
    {
      q: "Werde ich rechtzeitig erinnert?",
      a: "Standardmäßig 60, 30, 14 und 3 Tage vor dem letzten Kündigungstermin, im Dashboard und per E-Mail. Bei Trials melden wir uns früher. Die Stufen kannst du anpassen.",
    },
    {
      q: "Kündigt Toolfolio automatisch für mich?",
      a: "Nein, die Entscheidung bleibt bewusst bei dir. Toolfolio bereitet die Kündigung auf Knopfdruck vor, mit korrekten Daten, Empfängern und Bezugsnummern. Du verschickst sie selbst oder bestätigst, dass du weiterlaufen lassen willst.",
    },
    {
      q: "Funktioniert das auch bei Trials?",
      a: "Ja, Trial-Übergänge sind ein eigener Frist-Typ mit früherer Erinnerung. Du siehst rechtzeitig, wann ein Test in den bezahlten Tarif kippt.",
    },
    {
      q: "Was kostet die Funktion?",
      a: "Der Wächter ist in jedem Plan enthalten, auch im Free-Plan. Im Pro- und Agentur-Plan kommen mehrstufige Erinnerungen, Kunden-Zuordnung und der Kündigungs-Assistent dazu.",
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Weitere Instanzen (gleiche Vorlage, eigene Inhalte)                */
/* ------------------------------------------------------------------ */

const dashboardDetail: FeatureDetail = {
  slug: "dashboard",
  breadcrumb: "Produkt / Überblick & Dashboard",
  eyebrow: "Überblick & Dashboard",
  h1: "Überblick und Dashboard. Alle Tool-Kosten auf einen Blick.",
  subline:
    "Du verlierst sonst die Übersicht, welche Tools laufen, was sie kosten und wann sie abbuchen. Das Dashboard macht es sichtbar.",
  hero: {
    slot: "Dashboard mit KPI-Karten, Verlauf und Spar-Fortschritt.",
    caption: "dashboard",
    Preview: PreviewDashboard,
  },
  schmerz: {
    intro:
      "Software-Kosten verteilen sich auf mehrere Konten, Karten und PayPal-Accounts. Eine einzige Zahl gibt es nirgendwo.",
    paragraphs: [
      "Wer am Monatsende eine Auswertung in Excel zusammenbaut, hat schon verloren. Die Daten sind veraltet, sobald sie fertig sind.",
      "Ohne Überblick wirken alle Kosten gleich wichtig. Das macht jede Sparmaßnahme zur Bauchentscheidung.",
    ],
  },
  schritte: [
    {
      titel: "1. Daten kommen automatisch ins Dashboard.",
      text: "Per Kontoauszug-Import, Beleg-Postfach oder manuell. Alle Quellen landen in einer Ansicht.",
      shot: {
        slot: "Dashboard mit KPI-Karten und Spar-Fortschritt.",
        caption: "dashboard",
        Preview: PreviewDashboard,
      },
    },
    {
      titel: "2. Aufschlüsselung nach Kategorie, Kanal und Kunde.",
      text: "Du siehst, wo das Geld hingeht, gruppiert nach den Dimensionen, die du wirklich brauchst.",
      shot: { slot: "Verteilungs-Ansicht nach Kategorie und Kunde.", caption: "verteilung" },
    },
    {
      titel: "3. Anstehende Abbuchungen sofort sichtbar.",
      text: "Die nächsten dreißig Tage in einer Liste. Keine bösen Überraschungen mehr am Monatsanfang.",
      shot: { slot: "Anstehende Abbuchungen der nächsten 30 Tage.", caption: "abbuchungen" },
    },
  ],
  detail: [
    { titel: "KPI-Karten", text: "Monat, Jahr, Veränderung gegenüber Vormonat, Spar-Fortschritt.", icon: LayoutDashboard },
    { titel: "Verlaufsgrafik", text: "Zwölf Monate auf einen Blick, fix und variabel getrennt.", icon: BarChart3 },
    { titel: "Anstehende Abbuchungen", text: "Liste der nächsten Buchungen mit Kanal und Betrag.", icon: Bell },
    { titel: "Filter", text: "Nach Kategorie, Kunde, Karte oder Status filtern.", icon: Search },
  ],
  outcome: {
    paragraphs: [
      "Du weißt jederzeit, welche Tool-Kosten du gerade produzierst. Diese Klarheit ist die Voraussetzung für jede sinnvolle Sparmaßnahme.",
    ],
  },
  zielgruppe: [
    { titel: "Agenturen", text: "Komplexe Stacks mit vielen Verträgen, übersichtlich gebündelt." },
    { titel: "Freelancer", text: "Eine einzige Quelle der Wahrheit für die Kalkulation." },
    { titel: "Solopreneure", text: "Kein Excel mehr, kein Schätzen am Monatsende." },
  ],
  related: [
    { slug: "fristen-waechter", title: "Kündigungsfristen-Wächter", desc: "Nie wieder eine stille Verlängerung.", icon: CalendarClock },
    { slug: "ai-credits", title: "AI-Credit-Tracker", desc: "Variable KI-Kosten im Griff.", icon: Bot },
    { slug: "benchmark", title: "Benchmark", desc: "Sieh, ob du fair zahlst.", icon: BarChart3 },
  ],
  faq: [
    { q: "Wie schnell ist mein Dashboard befüllt?", a: "Mit dem Kontoauszug-Import in unter zehn Minuten." },
    { q: "Kann ich mehrere Gesellschaften abbilden?", a: "Ja, im Agentur-Plan mit eigener Kostenstellen-Trennung." },
    { q: "Sehe ich auch jährliche Verträge anteilig pro Monat?", a: "Ja, Toolfolio normalisiert alle Beträge auf Monat und Jahr." },
  ],
};

const aiCreditsDetail: FeatureDetail = {
  slug: "ai-credits",
  breadcrumb: "Produkt / AI-Credit-Tracker",
  eyebrow: "AI-Credit-Tracker",
  h1: "AI-Credit-Tracker. Auch die KI-Kosten unter Kontrolle.",
  subline:
    "OpenAI, Anthropic, ElevenLabs und Co. laufen variabel und unbemerkt. Du erkennst Spikes früh und setzt harte Budgets.",
  hero: {
    slot: "AI-Credit-Detail mit Spike-Erkennung und Budgets.",
    caption: "ai-credits",
    Preview: PreviewAiCredits,
  },
  schmerz: {
    intro:
      "Variable KI-Kosten passen in keine klassische Abo-Logik. Eine Schleife im Code und die Rechnung verdoppelt sich.",
    paragraphs: [
      "Auto-Recharge ist bequem und gefährlich. Ohne Überblick merkst du es erst auf der nächsten Kreditkartenabrechnung.",
      "Klassische Tracker zeigen nur den Monatsbetrag. Du brauchst den Verlauf, um Spikes zu erkennen, bevor sie eskalieren.",
    ],
  },
  schritte: [
    { titel: "1. API-Konten verbinden oder Belege weiterleiten.", text: "Read-only über offizielle APIs oder per Beleg-Postfach.", shot: { slot: "Verbindungs-Wizard für AI-Anbieter.", caption: "ai-verbinden" } },
    { titel: "2. Verbrauch im Verlauf, nicht nur als Summe.", text: "Tages-Granularität pro Anbieter. Spikes sieht man sofort.", shot: { slot: "AI-Credit-Detail mit Verlauf.", caption: "ai-verlauf", Preview: PreviewAiCredits } },
    { titel: "3. Budgets setzen, Warnungen erhalten.", text: "Harte Budget-Schwellen pro Anbieter, Warnung bei Überschreitung.", shot: { slot: "Budget-Konfiguration je AI-Anbieter.", caption: "ai-budgets" } },
  ],
  detail: [
    { titel: "Spike-Erkennung", text: "Markiert Tage, die deutlich über deinem Schnitt liegen.", icon: BarChart3 },
    { titel: "Auto-Recharge-Warnung", text: "Wenn ein Anbieter automatisch nachlädt, wirst du informiert.", icon: Bell },
    { titel: "Budget pro Anbieter", text: "Eigene Schwelle für OpenAI, Anthropic, ElevenLabs und mehr.", icon: Receipt },
    { titel: "Zuordnung pro Kunde", text: "Variable Kosten anteilig dem Kundenprojekt zuordnen.", icon: Users },
  ],
  outcome: {
    paragraphs: ["Du wirst nie wieder von einer KI-Rechnung überrascht. Spikes werden zur frühen Diagnose statt zur späten Buchhaltung."],
  },
  zielgruppe: [
    { titel: "AI-Builder", text: "Eigene Produkte, die auf LLM-APIs laufen." },
    { titel: "Agenturen", text: "Kundenarbeit mit AI-Anteilen, sauber zuzuordnen." },
    { titel: "Solopreneure", text: "Klare Sicht statt böse Überraschung." },
  ],
  related: [
    { slug: "dashboard", title: "Überblick & Dashboard", desc: "Alle Kosten zentral.", icon: LayoutDashboard },
    { slug: "fristen-waechter", title: "Kündigungsfristen-Wächter", desc: "Nie wieder eine stille Verlängerung.", icon: CalendarClock },
    { slug: "benchmark", title: "Benchmark", desc: "AI-Preise im Marktvergleich.", icon: BarChart3 },
  ],
  faq: [
    { q: "Welche Anbieter werden unterstützt?", a: "OpenAI, Anthropic, Google AI, ElevenLabs, Replicate, Mistral und weitere. Beleg-Postfach deckt alles ab, was als Rechnung kommt." },
    { q: "Brauche ich API-Zugang?", a: "Nein, das Beleg-Postfach reicht. API-Verbindung liefert nur feinere Auflösung." },
    { q: "Werden Budgets hart durchgesetzt?", a: "Toolfolio warnt, kann aber keine fremde API stoppen. Wir empfehlen zusätzlich harte Limits beim Anbieter." },
  ],
};

const kundenDetail: FeatureDetail = {
  slug: "kosten-pro-kunde",
  breadcrumb: "Produkt / Kosten pro Kunde",
  eyebrow: "Kosten pro Kunde",
  h1: "Toolkosten pro Kunde. Sauber zuordnen und weiterverrechnen.",
  subline:
    "Bei Agenturen verteilen sich Toolkosten ungeordnet auf Kunden. Toolfolio macht aus diffusen Kosten saubere Margen.",
  hero: {
    slot: "Kunden-Detail mit Tool-Kosten, Weiterverrechnung und Marge.",
    caption: "kunde",
    Preview: PreviewKunde,
  },
  schmerz: {
    intro: "Ohne klare Zuordnung schätzt jede Agentur ihre Tool-Marge.",
    paragraphs: [
      "Manche Tools werden nur für einen Kunden eingesetzt, andere geteilt. In Excel ist das nicht abbildbar, in der Buchhaltung kommt es nie an.",
      "Am Ende des Quartals stellt man fest, dass die Tool-Marge nicht stimmt, oder dass ein Kunde stillschweigend mitfinanziert wird.",
    ],
  },
  schritte: [
    { titel: "1. Tool dem Kunden zuordnen.", text: "Pro Abo wählst du den Kunden, optional anteilig.", shot: { slot: "Abo-Zuordnung zu Kunde.", caption: "zuordnung" } },
    { titel: "2. Kosten je Kunde im Überblick.", text: "Aggregiert über alle zugeordneten Tools, monatlich und jährlich.", shot: { slot: "Kunden-Detail mit Tool-Kosten und Marge.", caption: "kunde", Preview: PreviewKunde } },
    { titel: "3. Weiterverrechnungs-Report exportieren.", text: "Pro Kunde, pro Monat, fertig für die Rechnung.", shot: { slot: "Report-Vorschau pro Kunde.", caption: "report" } },
  ],
  detail: [
    { titel: "Anteilige Zuordnung", text: "Geteilte Tools prozentual auf mehrere Kunden verteilen.", icon: Users },
    { titel: "Marge sichtbar", text: "Selbstkosten, weiterverrechneter Anteil, Marge in Prozent.", icon: Receipt },
    { titel: "Zeitreihe pro Kunde", text: "Sieh, wie sich die Tool-Kosten je Kunde entwickeln.", icon: BarChart3 },
    { titel: "Export", text: "CSV oder PDF, kompatibel zu DATEV.", icon: FileSpreadsheet },
  ],
  outcome: { paragraphs: ["Deine Tool-Marge stimmt wieder. Weiterverrechnungen sind sauber dokumentiert und vollständig."] },
  zielgruppe: [
    { titel: "Full-Service-Agenturen", text: "Viele Kunden, viele Tools, klare Trennung nötig." },
    { titel: "Studios und Kollektive", text: "Geteilte Lizenzen sauber aufteilen." },
    { titel: "Freelancer mit Retainern", text: "Kundenspezifische Tool-Kosten transparent ausweisen." },
  ],
  related: [
    { slug: "dashboard", title: "Überblick & Dashboard", desc: "Alle Kosten zentral, auch nach Kunde.", icon: LayoutDashboard },
    { slug: "fristen-waechter", title: "Kündigungsfristen-Wächter", desc: "Vor Vertragsende Kunden-Auswirkung sehen.", icon: CalendarClock },
    { slug: "sparvorschlaege", title: "Sparvorschläge", desc: "Redundanzen je Kunde aufdecken.", icon: Sparkles },
  ],
  faq: [
    { q: "Kann ich ein Tool mehreren Kunden zuordnen?", a: "Ja, anteilig in Prozent oder pro Seat." },
    { q: "Wird die Weiterverrechnung automatisch berechnet?", a: "Du hinterlegst pro Tool einen Markup, Toolfolio rechnet den Rest." },
    { q: "Funktioniert das im Free-Plan?", a: "Kunden-Zuordnung ist ab dem Agentur-Plan enthalten." },
  ],
};

const benchmarkDetail: FeatureDetail = {
  slug: "benchmark",
  breadcrumb: "Produkt / Benchmark",
  eyebrow: "Benchmark",
  h1: "Benchmark. Sieh, ob du fair zahlst.",
  subline:
    "Verifizierte Marktpreise aus echten Abrechnungsdaten zeigen, wo du günstiger oder fairer verhandeln könntest.",
  hero: {
    slot: "Benchmark-Ansicht Du gegen Markt-Median.",
    caption: "benchmark",
    Preview: PreviewBenchmark,
  },
  schmerz: {
    intro: "Listenpreise sagen wenig über das, was vergleichbare Nutzer wirklich zahlen.",
    paragraphs: [
      "Wer nicht weiß, was fair ist, verhandelt nicht. Und wer nicht verhandelt, zahlt den Listenpreis.",
      "Klassische Bewertungsportale arbeiten mit beworbenen Preisen. Wir arbeiten mit echten, anonymisierten Abrechnungsdaten.",
    ],
  },
  schritte: [
    { titel: "1. Daten anonymisiert vergleichen.", text: "Toolfolio gleicht deine Preise mit dem Markt-Median ähnlicher Profile ab.", shot: { slot: "Benchmark-Vergleich Du gegen Markt.", caption: "benchmark", Preview: PreviewBenchmark } },
    { titel: "2. Differenz in Euro sehen.", text: "Pro Tool die monatliche und jährliche Differenz, klar in Euro.", shot: { slot: "Differenz-Ansicht pro Tool.", caption: "benchmark-diff" } },
    { titel: "3. Direkt Alternativen prüfen.", text: "Bei großer Differenz schlagen wir vergleichbare Tools mit fairem Preis vor.", shot: { slot: "Alternativ-Vorschlag aus dem Verzeichnis.", caption: "alternativen" } },
  ],
  detail: [
    { titel: "Vergleichbare Profile", text: "Größe, Region, Branche werden berücksichtigt.", icon: Users },
    { titel: "Median statt Schnitt", text: "Robust gegen einzelne Ausreißer.", icon: BarChart3 },
    { titel: "Anonymisiert", text: "Niemand sieht deine Zahlen einzeln.", icon: CheckCircle2 },
  ],
  outcome: { paragraphs: ["Du verhandelst mit Belegen, nicht aus dem Bauch. Bei gleicher Leistung zahlst du den fairen Preis."] },
  zielgruppe: [
    { titel: "Agenturen", text: "Verhandelt jährlich neu, braucht Vergleichswerte." },
    { titel: "Freelancer", text: "Will keinen Listenpreis zahlen, ohne den Markt zu kennen." },
    { titel: "Solopreneure", text: "Schnelle Orientierung, ob das Tool seinen Preis wert ist." },
  ],
  related: [
    { slug: "sparvorschlaege", title: "Sparvorschläge", desc: "Direkt umsetzen, was der Benchmark zeigt.", icon: Sparkles },
    { slug: "fristen-waechter", title: "Kündigungsfristen-Wächter", desc: "Zum richtigen Zeitpunkt verhandeln.", icon: CalendarClock },
    { slug: "verzeichnis", title: "Zum Verzeichnis", desc: "Alternativen mit verifiziertem Preis.", icon: Search },
  ],
  faq: [
    { q: "Woher kommen die Daten?", a: "Aus echten, anonymisierten Abrechnungsdaten der Toolfolio-Community." },
    { q: "Werden meine Beträge sichtbar?", a: "Nein. Beiträge fließen nur in Aggregaten in Benchmarks ein." },
    { q: "Wie groß ist die Vergleichsgruppe?", a: "Wir zeigen Benchmarks nur, wenn ausreichend Datenpunkte vorliegen." },
  ],
};

const sparDetail: FeatureDetail = {
  slug: "sparvorschlaege",
  breadcrumb: "Produkt / Sparvorschläge & Deals",
  eyebrow: "Sparvorschläge & Deals",
  h1: "Sparvorschläge. Konkrete Maßnahmen statt vager Berichte.",
  subline:
    "Intervallwechsel, Redundanzen, Gutscheine. Jeder Vorschlag zeigt die jährliche Ersparnis und ist mit einem Klick umsetzbar.",
  hero: {
    slot: "Sparvorschläge mit Jahres-Ersparnis und Aktionen.",
    caption: "sparvorschlaege",
    Preview: PreviewSparvorschlaege,
  },
  schmerz: {
    intro: "Berichte sagen, dass du sparen könntest. Sie sagen selten, wie.",
    paragraphs: [
      "Wer eine konkrete Maßnahme will, muss recherchieren, abwägen, vergleichen. Genau das passiert dann doch nicht.",
      "Toolfolio liefert die Maßnahme fertig. Du entscheidest nur noch ja oder nein.",
    ],
  },
  schritte: [
    { titel: "1. Toolfolio analysiert deinen Stack.", text: "Intervalle, Nutzung, Redundanzen, Marktpreise.", shot: { slot: "Analyse-Übersicht des eigenen Stacks.", caption: "analyse" } },
    { titel: "2. Konkrete Vorschläge mit Ersparnis.", text: "Jeder Vorschlag zeigt die Jahres-Ersparnis und die nötige Aktion.", shot: { slot: "Sparvorschläge mit Jahres-Ersparnis.", caption: "sparvorschlaege", Preview: PreviewSparvorschlaege } },
    { titel: "3. Ein Klick zur Umsetzung.", text: "Intervall wechseln, Tool kündigen, Alternative wählen, Gutschein einlösen.", shot: { slot: "Aktions-Schritt für einen Vorschlag.", caption: "aktion" } },
  ],
  detail: [
    { titel: "Intervallwechsel", text: "Jährlich statt monatlich, sofortige Ersparnis.", icon: CalendarClock },
    { titel: "Redundanz-Erkennung", text: "Tools, die sich überschneiden, werden markiert.", icon: CheckCircle2 },
    { titel: "Gutscheine und Deals", text: "Aktive Aktionen der Anbieter, automatisch eingespielt.", icon: Sparkles },
  ],
  outcome: { paragraphs: ["Sparmaßnahmen werden so einfach wie ein Häkchen setzen. Aus Reports werden Entscheidungen."] },
  zielgruppe: [
    { titel: "Alle", text: "Sparvorschläge greifen unabhängig von Größe oder Branche." },
  ],
  related: [
    { slug: "benchmark", title: "Benchmark", desc: "Die Grundlage für viele Vorschläge.", icon: BarChart3 },
    { slug: "fristen-waechter", title: "Kündigungsfristen-Wächter", desc: "Vorschläge mit Frist gekoppelt.", icon: CalendarClock },
    { slug: "verzeichnis", title: "Zum Verzeichnis", desc: "Alternativen finden und wechseln.", icon: Search },
  ],
  faq: [
    { q: "Wie oft kommen neue Vorschläge?", a: "Toolfolio prüft täglich, du siehst neue Vorschläge im Aktions-Center." },
    { q: "Werden Vorschläge automatisch umgesetzt?", a: "Nein, du bestätigst jede Aktion bewusst." },
  ],
};

const erfassenDetail: FeatureDetail = {
  slug: "drei-wege-erfassung",
  breadcrumb: "Produkt / Drei-Wege-Erfassung",
  eyebrow: "Drei-Wege-Erfassung",
  h1: "Drei-Wege-Erfassung. Auch das, was du vergessen hattest.",
  subline:
    "Kontoauszug-Import, Beleg-Postfach oder manuell. Der Importer findet auch Abos, die du längst vergessen hast.",
  hero: { slot: "Import-Review mit erkannten Buchungen.", caption: "import" },
  schmerz: {
    intro: "Ein Tool, das nur funktioniert, wenn du es vorher manuell befüllst, befüllt niemand.",
    paragraphs: [
      "Manuelles Erfassen kostet Zeit und ist genau dann unvollständig, wenn es wehtut.",
      "Du brauchst eine Quelle, die du nicht aktiv pflegen musst: deine Abrechnung.",
    ],
  },
  schritte: [
    { titel: "1. Kontoauszug importieren.", text: "CSV von Bank, Stripe oder PayPal. Toolfolio erkennt Software-Buchungen automatisch.", shot: { slot: "Kontoauszug-Upload im Onboarding.", caption: "upload" } },
    { titel: "2. Review der Treffer.", text: "Du bestätigst pro Buchung, was Toolfolio bereits zugeordnet hat.", shot: { slot: "Import-Review mit erkannten Buchungen.", caption: "import" } },
    { titel: "3. Belege per E-Mail nachlegen.", text: "Belege ans Toolfolio-Postfach weiterleiten, Vertrag und Beleg landen am richtigen Abo.", shot: { slot: "Beleg-Postfach mit eingehender Mail.", caption: "postfach" } },
  ],
  detail: [
    { titel: "Erkennung deutscher Anbieter", text: "Auch deutsche Software-Anbieter und SEPA-Lastschriften werden zuverlässig erkannt.", icon: CheckCircle2 },
    { titel: "Mehrere Konten", text: "Mehrere Banken und Karten parallel importieren.", icon: FileSpreadsheet },
    { titel: "Manuelle Pflege bleibt möglich", text: "Tools ohne Buchung kannst du manuell anlegen.", icon: Receipt },
  ],
  outcome: { paragraphs: ["Dein Stack ist vollständig in zehn Minuten erfasst. Auch die Abos, an die du nicht gedacht hast."] },
  zielgruppe: [
    { titel: "Neue Nutzer", text: "Wer Toolfolio startet, ist sofort produktiv." },
    { titel: "Wachsende Stacks", text: "Wer regelmäßig Tools testet, bleibt vollständig." },
  ],
  related: [
    { slug: "dashboard", title: "Überblick & Dashboard", desc: "Sofort sichtbar im Cockpit.", icon: LayoutDashboard },
    { slug: "fristen-waechter", title: "Kündigungsfristen-Wächter", desc: "Erfasst gleich, gewarnt sofort.", icon: CalendarClock },
  ],
  faq: [
    { q: "Welche Banken werden unterstützt?", a: "Jede Bank, die CSV-Export anbietet. Wir erkennen die gängigen Formate automatisch." },
    { q: "Speichert Toolfolio meine Zugangsdaten?", a: "Nein. Wir verarbeiten nur den exportierten Auszug, keine Login-Daten." },
  ],
};

const weiterverrechnungDetail: FeatureDetail = {
  slug: "weiterverrechnung",
  breadcrumb: "Produkt / Weiterverrechnungs-Report",
  eyebrow: "Weiterverrechnungs-Report",
  h1: "Weiterverrechnungs-Report. Fertig für die Rechnung.",
  subline:
    "Bündelt die zuordenbaren Tool-Kosten pro Kunde in einem klaren Report. Direkt in die Rechnung oder als PDF ans Buchhaltungstool.",
  hero: { slot: "Report-Vorschau pro Kunde.", caption: "report" },
  schmerz: {
    intro: "Weiterverrechnung scheitert meistens am Beleg, nicht am Willen.",
    paragraphs: [
      "Ohne klaren Report wird geschätzt. Geschätzt wird zu niedrig.",
      "Mit klarem Report wird vollständig weiterverrechnet, ohne Diskussion mit dem Kunden.",
    ],
  },
  schritte: [
    { titel: "1. Tools sind dem Kunden zugeordnet.", text: "Voraussetzung ist die Kosten-pro-Kunde-Funktion.", shot: { slot: "Kunden-Zuordnung der Tools.", caption: "zuordnung" } },
    { titel: "2. Report pro Kunde generieren.", text: "Monatlich oder quartalsweise, mit allen Positionen.", shot: { slot: "Report-Vorschau pro Kunde.", caption: "report" } },
    { titel: "3. Als PDF oder CSV exportieren.", text: "Direkt an die Buchhaltung oder als Anlage zur Rechnung.", shot: { slot: "Export-Auswahl mit PDF und CSV.", caption: "export" } },
  ],
  detail: [
    { titel: "Konfigurierbare Positionen", text: "Markup, Aufschlag oder 1:1 weiterverrechnen.", icon: Receipt },
    { titel: "Mehrere Zeiträume", text: "Monatlich, quartalsweise, jährlich.", icon: CalendarClock },
    { titel: "Mehrere Kunden parallel", text: "Reports für viele Kunden gleichzeitig erzeugen.", icon: Users },
  ],
  outcome: { paragraphs: ["Du verrechnest vollständig weiter und sparst die Diskussion mit der Buchhaltung."] },
  zielgruppe: [
    { titel: "Agenturen", text: "Klar dokumentierte Weiterverrechnung." },
    { titel: "Freelancer mit Retainern", text: "Saubere Belege, weniger Rückfragen." },
  ],
  related: [
    { slug: "kosten-pro-kunde", title: "Kosten pro Kunde", desc: "Grundlage für jeden Report.", icon: Users },
    { slug: "dashboard", title: "Überblick & Dashboard", desc: "Alle Kosten zentral.", icon: LayoutDashboard },
  ],
  faq: [
    { q: "In welchen Formaten kann ich exportieren?", a: "PDF und CSV, CSV-Layout kompatibel zu DATEV." },
    { q: "Sind die Reports rechtssicher?", a: "Sie sind klar dokumentiert. Die Rechnungsstellung selbst läuft weiter über dein Buchhaltungstool." },
  ],
};

const REGISTRY: Record<string, FeatureDetail> = {
  [fristenDetail.slug]: fristenDetail,
  [dashboardDetail.slug]: dashboardDetail,
  [aiCreditsDetail.slug]: aiCreditsDetail,
  [kundenDetail.slug]: kundenDetail,
  [benchmarkDetail.slug]: benchmarkDetail,
  [sparDetail.slug]: sparDetail,
  [erfassenDetail.slug]: erfassenDetail,
  [weiterverrechnungDetail.slug]: weiterverrechnungDetail,
};

export function getFeatureDetail(slug: string): FeatureDetail | undefined {
  return REGISTRY[slug];
}

export const featureSlugs = Object.keys(REGISTRY);
