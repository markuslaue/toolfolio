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
