/** E-02/E-03: HTML-Vorlage für die Frist- und Trial-Erinnerung (Du-Form, Umlaute, keine Gedankenstriche). */

export type MailFrist = {
  tool: string;
  art: "kuendigung" | "trial" | "karte";
  datum: string; // YYYY-MM-DD
  tage: number;
  konsequenz: string;
};

const ART_LABEL: Record<MailFrist["art"], string> = {
  kuendigung: "Kündigungsfrist",
  trial: "Trial endet",
  karte: "Karte läuft ab",
};

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return d ? `${d}.${m}.${y}` : iso;
}

function tageText(t: number): string {
  if (t < 0) return `seit ${Math.abs(t)} Tagen überfällig`;
  if (t === 0) return "heute";
  if (t === 1) return "morgen";
  return `in ${t} Tagen`;
}

const PRIMARY = "#6c5ce7";
const INK = "#1f1d2b";
const PAPER = "#fbf7f1";

export function fristenDigest(
  vorname: string | null,
  fristen: MailFrist[],
  appUrl: string,
): { subject: string; html: string } {
  const dringend = fristen.filter((f) => f.tage <= 7).length;
  const subject =
    dringend > 0
      ? `${dringend} dringende Frist${dringend === 1 ? "" : "en"} bei deinen Software-Abos`
      : `${fristen.length} anstehende Frist${fristen.length === 1 ? "" : "en"} bei deinen Abos`;

  const rows = fristen
    .map(
      (f) => `
      <tr>
        <td style="padding:14px 16px;border-bottom:1px solid #ece6da;">
          <div style="font-weight:600;color:${INK};">${escape(f.tool)}</div>
          <div style="font-size:13px;color:#6b6779;margin-top:2px;">${escape(f.konsequenz)}</div>
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #ece6da;text-align:right;white-space:nowrap;">
          <div style="font-size:12px;color:#6b6779;">${ART_LABEL[f.art]}</div>
          <div style="font-weight:600;color:${f.tage <= 7 ? "#f0533d" : INK};">${fmtDate(f.datum)}</div>
          <div style="font-size:12px;color:#6b6779;">${tageText(f.tage)}</div>
        </td>
      </tr>`,
    )
    .join("");

  const html = `
  <!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;background:${PAPER};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK};">
    <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
        <tr>
          <td width="36" height="36" style="width:36px;height:36px;background:${PRIMARY};border-radius:10px;text-align:center;vertical-align:middle;color:#ffffff;font-weight:700;font-size:20px;line-height:36px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">T</td>
          <td style="padding-left:10px;vertical-align:middle;font-size:19px;font-weight:600;letter-spacing:-0.01em;color:${INK};">Toolfolio</td>
        </tr>
      </table>
      <div style="background:#fff;border:1px solid #ece6da;border-radius:20px;padding:24px;">
        <h1 style="margin:0 0 6px;font-size:20px;">${vorname ? `Hallo ${escape(vorname)},` : "Hallo,"}</h1>
        <p style="margin:0 0 18px;font-size:15px;color:#3d3a4d;line-height:1.5;">
          bei deinen Software-Abos stehen Fristen an. Prüfe rechtzeitig, damit sich nichts still verlängert.
        </p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #ece6da;border-radius:12px;overflow:hidden;">
          ${rows}
        </table>
        <div style="text-align:center;margin-top:22px;">
          <a href="${appUrl}/app/fristen" style="display:inline-block;background:${PRIMARY};color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px;">Fristen ansehen</a>
        </div>
      </div>
      <p style="text-align:center;font-size:12px;color:#6b6779;margin-top:16px;line-height:1.5;">
        Du bekommst diese Mail, weil du Abos mit Fristen bei Toolfolio verwaltest.<br>
        OMMM GmbH, Leipzig
      </p>
    </div>
  </body></html>`;

  return { subject, html };
}

function escape(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
}

const ROLLE_LABEL: Record<string, string> = { admin: "Administrator", member: "Mitglied" };

/** E-04: Einladung in ein Toolfolio-Team. */
export function teamEinladung(
  einladerName: string,
  rolle: string,
  acceptUrl: string,
): { subject: string; html: string } {
  const subject = `${einladerName} lädt dich zu Toolfolio ein`;
  const html = `
  <!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;background:${PAPER};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK};">
    <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
        <tr>
          <td width="36" height="36" style="width:36px;height:36px;background:${PRIMARY};border-radius:10px;text-align:center;vertical-align:middle;color:#ffffff;font-weight:700;font-size:20px;line-height:36px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">T</td>
          <td style="padding-left:10px;vertical-align:middle;font-size:19px;font-weight:600;letter-spacing:-0.01em;color:${INK};">Toolfolio</td>
        </tr>
      </table>
      <div style="background:#fff;border:1px solid #ece6da;border-radius:20px;padding:24px;">
        <h1 style="margin:0 0 6px;font-size:20px;">Du wurdest eingeladen</h1>
        <p style="margin:0 0 18px;font-size:15px;color:#3d3a4d;line-height:1.5;">
          ${escape(einladerName)} möchte dich als <strong>${ROLLE_LABEL[rolle] ?? "Mitglied"}</strong> zum Toolfolio-Konto hinzufügen. Damit siehst du die Software-Abos, Kosten und Fristen des Teams an einem Ort.
        </p>
        <div style="text-align:center;margin-top:22px;">
          <a href="${acceptUrl}" style="display:inline-block;background:${PRIMARY};color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px;">Einladung annehmen</a>
        </div>
        <p style="margin:18px 0 0;font-size:13px;color:#6b6779;line-height:1.5;">
          Falls der Button nicht funktioniert, öffne diesen Link: <br><span style="color:${PRIMARY};">${escape(acceptUrl)}</span>
        </p>
      </div>
      <p style="text-align:center;font-size:12px;color:#6b6779;margin-top:16px;line-height:1.5;">
        Du bekommst diese Mail, weil dich jemand zu seinem Toolfolio-Team eingeladen hat. Wenn du das nicht erwartest, ignoriere die Mail einfach.<br>
        OMMM GmbH, Leipzig
      </p>
    </div>
  </body></html>`;
  return { subject, html };
}

function kopf(): string {
  return `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
        <tr>
          <td width="36" height="36" style="width:36px;height:36px;background:${PRIMARY};border-radius:10px;text-align:center;vertical-align:middle;color:#ffffff;font-weight:700;font-size:20px;line-height:36px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">T</td>
          <td style="padding-left:10px;vertical-align:middle;font-size:19px;font-weight:600;letter-spacing:-0.01em;color:${INK};">Toolfolio</td>
        </tr>
      </table>`;
}

function eur(n: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);
}

/** E-01: Willkommens-Mail nach erfolgreicher Anmeldung/Verifizierung. */
export function willkommen(vorname: string | null, appUrl: string): { subject: string; html: string } {
  const subject = "Willkommen bei Toolfolio";
  const html = `
  <!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;background:${PAPER};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK};">
    <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
      ${kopf()}
      <div style="background:#fff;border:1px solid #ece6da;border-radius:20px;padding:24px;">
        <h1 style="margin:0 0 6px;font-size:20px;">${vorname ? `Willkommen, ${escape(vorname)}!` : "Willkommen!"}</h1>
        <p style="margin:0 0 14px;font-size:15px;color:#3d3a4d;line-height:1.5;">
          Schön, dass du da bist. Toolfolio bringt deine Software-Abos an einen Ort, warnt vor Kosten und Kündigungsfristen und zeigt, wo du bei gleicher Leistung weniger zahlst.
        </p>
        <p style="margin:0 0 8px;font-size:15px;font-weight:600;">So startest du:</p>
        <ol style="margin:0 0 18px;padding-left:20px;font-size:15px;color:#3d3a4d;line-height:1.7;">
          <li>Abos importieren oder anlegen</li>
          <li>Zahlungskanäle und Fristen hinterlegen</li>
          <li>Sparvorschläge und Berichte ansehen</li>
        </ol>
        <div style="text-align:center;margin-top:8px;">
          <a href="${appUrl}/app" style="display:inline-block;background:${PRIMARY};color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px;">Zum Dashboard</a>
        </div>
      </div>
      <p style="text-align:center;font-size:12px;color:#6b6779;margin-top:16px;line-height:1.5;">
        Du bekommst diese Mail, weil du dich bei Toolfolio registriert hast.<br>OMMM GmbH, Leipzig
      </p>
    </div>
  </body></html>`;
  return { subject, html };
}

export type MailReport = {
  monatLabel: string;
  gesamtMonat: number;
  fixMonat: number;
  varMonat: number;
  topKategorien: { name: string; betrag: number }[];
  sparAnzahl: number;
  sparPotenzial: number;
  spikes: { name: string; faktor: number }[];
  fristenAnzahl: number;
};

/** E-06: Monatsreport (buendelt Kostenueberblick, Sparvorschlaege E-07, AI-Spikes E-04, Fristen). */
export function monatsReport(vorname: string | null, r: MailReport, appUrl: string): { subject: string; html: string } {
  const subject = `Dein Toolfolio-Report für ${r.monatLabel}`;
  const katRows = r.topKategorien
    .map((k) => `<tr><td style="padding:6px 0;font-size:14px;color:#3d3a4d;">${escape(k.name)}</td><td style="padding:6px 0;text-align:right;font-size:14px;font-weight:600;color:${INK};">${eur(k.betrag)}</td></tr>`)
    .join("");
  const spikeBlock = r.spikes.length
    ? `<div style="margin-top:16px;background:#fff4f1;border:1px solid #ffd9cf;border-radius:12px;padding:12px 14px;">
         <div style="font-weight:600;font-size:14px;color:#b4341f;">AI-Spend-Spikes</div>
         ${r.spikes.map((s) => `<div style="font-size:13px;color:#6b6779;margin-top:2px;">${escape(s.name)}, ${String(s.faktor).replace(".", ",")}-facher Schnitt</div>`).join("")}
       </div>`
    : "";
  const sparBlock = r.sparAnzahl
    ? `<div style="margin-top:16px;background:#ecfdf3;border:1px solid #c7f0d8;border-radius:12px;padding:12px 14px;">
         <div style="font-weight:600;font-size:14px;color:#067647;">${r.sparAnzahl} offene Sparvorschläge</div>
         <div style="font-size:13px;color:#6b6779;margin-top:2px;">Bis zu ${eur(r.sparPotenzial)} pro Jahr Potenzial.</div>
       </div>`
    : "";
  const fristBlock = r.fristenAnzahl
    ? `<div style="margin-top:16px;background:#fff8ec;border:1px solid #ffe6bf;border-radius:12px;padding:12px 14px;">
         <div style="font-weight:600;font-size:14px;color:#92600a;">${r.fristenAnzahl} anstehende Frist${r.fristenAnzahl === 1 ? "" : "en"}</div>
         <div style="font-size:13px;color:#6b6779;margin-top:2px;">Prüfe rechtzeitig, damit sich nichts still verlängert.</div>
       </div>`
    : "";
  const html = `
  <!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;background:${PAPER};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK};">
    <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
      ${kopf()}
      <div style="background:#fff;border:1px solid #ece6da;border-radius:20px;padding:24px;">
        <h1 style="margin:0 0 4px;font-size:20px;">${vorname ? `Hallo ${escape(vorname)},` : "Hallo,"}</h1>
        <p style="margin:0 0 16px;font-size:15px;color:#3d3a4d;line-height:1.5;">dein Software-Kosten-Überblick für ${escape(r.monatLabel)}.</p>
        <div style="background:#faf7f2;border-radius:14px;padding:16px;text-align:center;">
          <div style="font-size:12px;color:#6b6779;text-transform:uppercase;letter-spacing:.04em;">Kosten diesen Monat</div>
          <div style="font-size:30px;font-weight:700;color:${INK};">${eur(r.gesamtMonat)}</div>
          <div style="font-size:12px;color:#6b6779;">fix ${eur(r.fixMonat)} · variabel ${eur(r.varMonat)}</div>
        </div>
        ${r.topKategorien.length ? `<table style="width:100%;border-collapse:collapse;margin-top:16px;"><tr><td style="font-size:12px;color:#6b6779;text-transform:uppercase;letter-spacing:.04em;padding-bottom:4px;">Top-Kategorien</td><td></td></tr>${katRows}</table>` : ""}
        ${spikeBlock}
        ${sparBlock}
        ${fristBlock}
        <div style="text-align:center;margin-top:22px;">
          <a href="${appUrl}/app/berichte" style="display:inline-block;background:${PRIMARY};color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px;">Berichte ansehen</a>
        </div>
      </div>
      <p style="text-align:center;font-size:12px;color:#6b6779;margin-top:16px;line-height:1.5;">
        Du bekommst diese Mail, weil der Monatsreport in deinen Benachrichtigungen aktiviert ist. Du kannst ihn in den Einstellungen abstellen.<br>OMMM GmbH, Leipzig
      </p>
    </div>
  </body></html>`;
  return { subject, html };
}
