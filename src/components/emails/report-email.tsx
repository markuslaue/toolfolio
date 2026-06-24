export type ReportPeriod = "woche" | "monat";

export interface ReportBreakdownItem {
  label: string;
  amount: string;
  /** 0–100, optional Balkenlänge */
  percent?: number;
}

export interface ReportUpcomingItem {
  tool: string;
  date: string;
  kind: "Kündigungsfrist" | "Testende";
}

export interface ReportOpportunityItem {
  title: string;
  saving: string;
  link?: string;
}

export interface ReportHighlightItem {
  text: string;
  kind?: "spike" | "preis" | "info";
}

export interface ReportEmailProps {
  firstName?: string;
  period?: ReportPeriod;
  /** Anzeigezeitraum, z. B. "Juni 2026" oder "17.–23. Juni 2026". */
  periodLabel?: string;
  /** Monatsname für Betreff "Dein Monatsreport: [Monat]". */
  monthLabel?: string;
  totalCost?: string;
  changePercent?: string; // z. B. "+4,2 %" oder "-3,1 %"
  changeDirection?: "up" | "down" | "flat";
  activeSubs?: string;
  aiCost?: string;
  breakdownTitle?: string; // "nach Kategorie" oder "nach Kunde"
  breakdown?: ReportBreakdownItem[];
  upcoming?: ReportUpcomingItem[];
  opportunities?: ReportOpportunityItem[];
  totalSaving?: string; // Summe Sparpotenzial
  opportunitiesCount?: number;
  highlights?: ReportHighlightItem[];
  showBars?: boolean;
  sparseData?: boolean;
  reportUrl?: string;
  savingsUrl?: string;
  deadlinesUrl?: string;
  notificationSettingsUrl?: string;
  frequencyUrl?: string;
  imprintUrl?: string;
  privacyUrl?: string;
  legalEntity?: string;
}

export function reportSubject(props: ReportEmailProps): string {
  const period = props.period ?? "monat";
  if (period === "monat") {
    const month = props.monthLabel?.trim() || props.periodLabel?.trim() || "diesen Monat";
    if (props.totalCost && props.opportunitiesCount && props.opportunitiesCount > 0) {
      return `${month} in Zahlen: ${props.totalCost}, ${props.opportunitiesCount} Chancen entdeckt`;
    }
    return `Dein Monatsreport: ${month}`;
  }
  const first = props.firstName?.trim();
  return first ? `Deine Woche im Überblick, ${first}` : "Deine Woche im Überblick";
}

export function reportPreheader(): string {
  return "Gesamtkosten, anstehende Fristen und wo du sparen kannst.";
}

const DEFAULT_BREAKDOWN: ReportBreakdownItem[] = [
  { label: "KI / API", amount: "496,60 €", percent: 100 },
  { label: "Design", amount: "298,00 €", percent: 60 },
  { label: "Produktivität", amount: "263,00 €", percent: 53 },
  { label: "SEO", amount: "199,00 €", percent: 40 },
  { label: "Kommunikation", amount: "93,50 €", percent: 19 },
];

const DEFAULT_UPCOMING: ReportUpcomingItem[] = [
  { tool: "Ahrefs", date: "12.08.2026", kind: "Kündigungsfrist" },
  { tool: "Framer", date: "25.06.2026", kind: "Testende" },
  { tool: "Adobe CC", date: "12.11.2026", kind: "Kündigungsfrist" },
];

const DEFAULT_OPPORTUNITIES: ReportOpportunityItem[] = [
  { title: "Figma jährlich statt monatlich abrechnen", saving: "144,00 € / Jahr" },
  { title: "Loom seit 5 Monaten ungenutzt, kündigen", saving: "180,00 € / Jahr" },
  { title: "Notion und Coda decken sich, eines reicht", saving: "96,00 € / Jahr" },
];

export function reportEmailHTML(props: ReportEmailProps): string {
  const {
    firstName,
    period = "monat",
    periodLabel = "Juni 2026",
    totalCost = "2.480,00 €",
    changePercent = "+4,2 %",
    changeDirection = "up",
    activeSubs = "17",
    aiCost = "496,60 €",
    breakdownTitle = "nach Kategorie",
    breakdown = DEFAULT_BREAKDOWN,
    upcoming = DEFAULT_UPCOMING,
    opportunities = DEFAULT_OPPORTUNITIES,
    totalSaving = "420,00 €",
    highlights = [],
    showBars = true,
    sparseData = false,
    reportUrl = "https://toolfolio.lovable.app/berichte",
    savingsUrl = "https://toolfolio.lovable.app/sparvorschlaege",
    deadlinesUrl = "https://toolfolio.lovable.app/fristen",
    notificationSettingsUrl = "https://toolfolio.lovable.app/einstellungen/benachrichtigungen",
    frequencyUrl = "https://toolfolio.lovable.app/einstellungen/benachrichtigungen",
    imprintUrl = "https://toolfolio.lovable.app/impressum",
    privacyUrl = "https://toolfolio.lovable.app/datenschutz",
    legalEntity = "[Firma, Anschrift, Kontakt einsetzen]",
  } = props;

  const greeting = firstName?.trim() ? `Hallo ${firstName.trim()},` : "Hallo,";
  const periodWord = period === "woche" ? "diese Woche" : "diesen Monat";
  const intro = period === "woche"
    ? `hier dein Überblick für ${escapeHtml(periodLabel)}. Kurz, ehrlich, und mit den Stellen, an denen sich ein Blick lohnt.`
    : `hier dein Überblick für ${escapeHtml(periodLabel)}. Kurz, ehrlich, und mit den Stellen, an denen sich ein Blick lohnt.`;

  const changeColor = changeDirection === "down" ? "#12B76A" : changeDirection === "up" ? "#F5A623" : "#6B6779";
  const changeArrow = changeDirection === "down" ? "▼" : changeDirection === "up" ? "▲" : "→";

  const breakdownRows = breakdown
    .map((b) => {
      const pct = Math.max(0, Math.min(100, b.percent ?? 0));
      const bar = showBars
        ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 6px;">
            <tr>
              <td style="background-color: #ECE6DA; border-radius: 999px; height: 6px; line-height: 6px; font-size: 0;">
                <table role="presentation" width="${pct}%" cellspacing="0" cellpadding="0" border="0" style="background-color: #6C5CE7; border-radius: 999px; height: 6px; line-height: 6px; font-size: 0;">
                  <tr><td style="height: 6px; line-height: 6px; font-size: 0;">&nbsp;</td></tr>
                </table>
              </td>
            </tr>
          </table>`
        : "";
      return `<tr>
        <td style="padding: 10px 0; border-top: 1px solid rgba(31,29,43,0.08);">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="font-size: 14px; line-height: 22px; color: #1F1D2B; font-weight: 600;">${escapeHtml(b.label)}</td>
              <td align="right" class="tnum" style="font-size: 14px; line-height: 22px; color: #1F1D2B; font-weight: 700;">${escapeHtml(b.amount)}</td>
            </tr>
          </table>
          ${bar}
        </td>
      </tr>`;
    })
    .join("");

  const upcomingRows = upcoming.length
    ? upcoming
        .map((u) => {
          const badgeBg = u.kind === "Testende" ? "#FEF3DA" : "#EEF0FE";
          const badgeColor = u.kind === "Testende" ? "#8A6A12" : "#3F35B8";
          return `<tr>
            <td style="padding: 10px 0; border-top: 1px solid rgba(31,29,43,0.08);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="font-size: 14px; line-height: 22px; color: #1F1D2B; font-weight: 600;">${escapeHtml(u.tool)}</td>
                  <td align="right" class="tnum" style="font-size: 14px; line-height: 22px; color: #1F1D2B; white-space: nowrap;">${escapeHtml(u.date)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 4px;">
                    <span style="display: inline-block; padding: 2px 10px; border-radius: 999px; background-color: ${badgeBg}; color: ${badgeColor}; font-size: 12px; line-height: 18px; font-weight: 600;">${escapeHtml(u.kind)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
        })
        .join("")
    : `<tr><td style="padding: 12px 0; font-size: 14px; line-height: 22px; color: #6B6779;">Aktuell stehen keine Fristen oder Testenden an. Wir melden uns, sobald etwas auftaucht.</td></tr>`;

  const opportunityRows = opportunities.length
    ? opportunities
        .map(
          (o) => `<tr>
            <td style="padding: 12px 0; border-top: 1px solid rgba(18,183,106,0.18);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="font-size: 14px; line-height: 22px; color: #1F1D2B;">${escapeHtml(o.title)}</td>
                  <td align="right" class="tnum" style="font-size: 14px; line-height: 22px; color: #0F8B53; font-weight: 700; white-space: nowrap; padding-left: 12px;">−${escapeHtml(o.saving)}</td>
                </tr>
              </table>
            </td>
          </tr>`,
        )
        .join("")
    : `<tr><td style="padding: 12px 0; font-size: 14px; line-height: 22px; color: #6B6779;">Aktuell keine konkreten Sparhebel sichtbar. Wir schauen weiter im Hintergrund mit.</td></tr>`;

  const highlightsBlock = highlights.length
    ? `<tr>
        <td class="content" style="padding: 0 40px 28px;">
          <p style="margin: 0 0 10px; font-size: 12px; line-height: 18px; color: #6B6779; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">Im ${periodWord === "diese Woche" ? "Wochenverlauf" : "Monatsverlauf"} passiert</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            ${highlights
              .map(
                (h) => `<tr><td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #1F1D2B; border-top: 1px solid rgba(31,29,43,0.08);">• ${escapeHtml(h.text)}</td></tr>`,
              )
              .join("")}
          </table>
        </td>
      </tr>`
    : "";

  const sparseHint = sparseData
    ? `<tr>
        <td class="content" style="padding: 0 40px 24px;">
          <div style="background-color: #F4F1EA; border-radius: 12px; padding: 14px 18px; font-size: 13px; line-height: 20px; color: #6B6779;">
            Noch wenig Daten in deinem Konto, dieser Report wird mit der Zeit aussagekräftiger. Sobald mehr Abrechnungen einlaufen, werden Aufschlüsselungen und Chancen schärfer.
          </div>
        </td>
      </tr>`
    : "";

  const preheader = reportPreheader();
  const subject = reportSubject({ ...props, period, periodLabel });

  return `<!DOCTYPE html>
<html lang="de" dir="ltr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    #outlook a { padding: 0; }
    .ExternalClass { width: 100%; }
    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }
    .tnum { font-variant-numeric: tabular-nums; font-feature-settings: "tnum"; }
    @media screen and (max-width: 600px) {
      .wrapper { width: 100% !important; }
      .content { padding-left: 20px !important; padding-right: 20px !important; }
      .copy { font-size: 15px !important; line-height: 23px !important; }
      .button-wrap { width: 100% !important; }
      .button-link { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; box-sizing: border-box !important; text-align: center !important; }
      .kpi-cell { display: block !important; width: 100% !important; padding: 10px 0 !important; border-left: 0 !important; border-top: 1px solid rgba(31,29,43,0.08) !important; }
      .kpi-cell-first { border-top: 0 !important; }
      .bignum { font-size: 28px !important; line-height: 34px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #FBF7F1; color: #1F1D2B; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${escapeHtml(preheader)}</div>
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #FBF7F1;">
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FBF7F1;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" class="wrapper" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #ECE6DA;">

          <tr>
            <td align="center" style="padding: 40px 40px 24px;" class="content">
              <a href="https://toolfolio.lovable.app" style="text-decoration: none; color: #1F1D2B; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;" aria-label="Toolfolio Startseite">Toolfolio</a>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 8px;">
              <p style="margin: 0; font-size: 12px; line-height: 18px; color: #6B6779; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">${period === "woche" ? "Wochenreport" : "Monatsreport"}</p>
              <p style="margin: 4px 0 0; font-size: 22px; line-height: 30px; color: #1F1D2B; font-weight: 700; letter-spacing: -0.01em;">${escapeHtml(periodLabel)}</p>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 16px 40px 8px;">
              <div style="width: 48px; height: 4px; background-color: #6C5CE7; border-radius: 2px;" aria-hidden="true"></div>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 16px 40px 8px;">
              <p class="copy" style="margin: 0; font-size: 16px; line-height: 26px; color: #1F1D2B;"><strong>${greeting}</strong></p>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 24px;">
              <p class="copy" style="margin: 0; font-size: 16px; line-height: 26px; color: #1F1D2B;">${intro}</p>
            </td>
          </tr>

          <!-- Top-Zahlen -->
          <tr>
            <td class="content" style="padding: 0 40px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F7F3EA; border-radius: 16px;">
                <tr>
                  <td style="padding: 20px 22px 8px;">
                    <p style="margin: 0 0 6px; font-size: 12px; line-height: 18px; color: #6B6779; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">Gesamtkosten ${periodWord}</p>
                    <p class="bignum tnum" style="margin: 0; font-size: 34px; line-height: 40px; color: #1F1D2B; font-weight: 700; letter-spacing: -0.01em;">${escapeHtml(totalCost)}</p>
                    <p class="tnum" style="margin: 6px 0 0; font-size: 13px; line-height: 20px; color: ${changeColor}; font-weight: 600;">
                      <span aria-hidden="true">${changeArrow}</span> ${escapeHtml(changePercent)} <span style="color: #6B6779; font-weight: 400;">zur Vorperiode</span>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 22px 22px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top: 1px solid rgba(31,29,43,0.08);">
                      <tr>
                        <td class="kpi-cell kpi-cell-first" width="50%" valign="top" style="padding: 14px 12px 0 0;">
                          <p style="margin: 0 0 2px; font-size: 12px; line-height: 18px; color: #6B6779; font-weight: 600;">Aktive Abos</p>
                          <p class="tnum" style="margin: 0; font-size: 20px; line-height: 26px; color: #1F1D2B; font-weight: 700;">${escapeHtml(activeSubs)}</p>
                        </td>
                        <td class="kpi-cell" width="50%" valign="top" style="padding: 14px 0 0 12px; border-left: 1px solid rgba(31,29,43,0.08);">
                          <p style="margin: 0 0 2px; font-size: 12px; line-height: 18px; color: #6B6779; font-weight: 600;">davon variable KI-Kosten</p>
                          <p class="tnum" style="margin: 0; font-size: 20px; line-height: 26px; color: #1F1D2B; font-weight: 700;">${escapeHtml(aiCost)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${sparseHint}

          <!-- Aufschlüsselung -->
          <tr>
            <td class="content" style="padding: 0 40px 8px;">
              <p style="margin: 0 0 4px; font-size: 18px; line-height: 26px; color: #1F1D2B; font-weight: 700;">Wohin das Geld geht</p>
              <p style="margin: 0 0 8px; font-size: 13px; line-height: 20px; color: #6B6779;">Größte Kostentreiber ${escapeHtml(breakdownTitle)}.</p>
            </td>
          </tr>
          <tr>
            <td class="content" style="padding: 0 40px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                ${breakdownRows}
              </table>
            </td>
          </tr>

          <!-- Fristen und Trials -->
          <tr>
            <td class="content" style="padding: 0 40px 8px;">
              <p style="margin: 0 0 4px; font-size: 18px; line-height: 26px; color: #1F1D2B; font-weight: 700;">Anstehende Fristen und Trials</p>
              <p style="margin: 0 0 8px; font-size: 13px; line-height: 20px; color: #6B6779;">Was im nächsten Zeitraum auf dich zukommt. Den vollen Verlauf findest du im <a href="${deadlinesUrl}" style="color: #6C5CE7; text-decoration: underline; font-weight: 600;">Fristen-Wächter</a>.</p>
            </td>
          </tr>
          <tr>
            <td class="content" style="padding: 0 40px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                ${upcomingRows}
              </table>
            </td>
          </tr>

          <!-- Chancen -->
          <tr>
            <td class="content" style="padding: 0 40px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #E7F8EE; border-radius: 16px; border-left: 4px solid #12B76A;">
                <tr>
                  <td style="padding: 22px 24px;">
                    <p style="margin: 0 0 4px; font-size: 12px; line-height: 18px; color: #0F8B53; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">Deine Chancen</p>
                    <p class="bignum tnum" style="margin: 0; font-size: 28px; line-height: 34px; color: #0F8B53; font-weight: 700; letter-spacing: -0.01em;">bis zu −${escapeHtml(totalSaving)} <span style="font-size: 13px; font-weight: 600; color: #0F8B53; letter-spacing: 0;">pro Jahr</span></p>
                    <p style="margin: 6px 0 12px; font-size: 13px; line-height: 20px; color: #1F1D2B;">Realistisch, neutral, ohne aufgeblähte Versprechen.</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      ${opportunityRows}
                    </table>
                    <p style="margin: 14px 0 0; font-size: 13px; line-height: 20px;">
                      <a href="${savingsUrl}" style="color: #0F8B53; text-decoration: underline; font-weight: 700;">Alle Sparvorschläge ansehen</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${highlightsBlock}

          <!-- Primärer CTA -->
          <tr>
            <td class="content" style="padding: 8px 40px 16px;">
              <table role="presentation" class="button-wrap" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: #6C5CE7;" bgcolor="#6C5CE7">
                    <a href="${reportUrl}" class="button-link" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 12px; background-color: #6C5CE7; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;" aria-label="Vollen Bericht ansehen">
                      Vollen Bericht ansehen
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 32px;" align="center">
              <p class="copy" style="margin: 0; font-size: 14px; line-height: 22px; color: #6B6779;">
                <a href="${savingsUrl}" style="color: #6C5CE7; text-decoration: underline; font-weight: 600;">Sparvorschläge ansehen</a>
                &nbsp;&middot;&nbsp;
                <a href="${deadlinesUrl}" style="color: #6C5CE7; text-decoration: underline; font-weight: 600;">Fristen prüfen</a>
              </p>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 40px;">
              <p class="copy" style="margin: 0 0 18px; font-size: 16px; line-height: 26px; color: #1F1D2B;">
                Bis zum nächsten Überblick.
              </p>
              <p class="copy" style="margin: 0; font-size: 16px; line-height: 26px; color: #1F1D2B;">
                Viele Grüße<br />
                <strong>dein Toolfolio-Team</strong>
              </p>
            </td>
          </tr>

        </table>

        <table role="presentation" class="wrapper" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; margin-top: 24px;">
          <tr>
            <td class="content" style="padding: 0 40px; text-align: center; font-size: 12px; line-height: 19px; color: #6B6779;">
              <p style="margin: 0 0 12px;">Dies ist eine Service- und Transaktionsnachricht zu deinem Toolfolio-Konto. Kein Newsletter.</p>
              <p style="margin: 0 0 12px;"><strong>Absenderkennzeichnung:</strong> ${escapeHtml(legalEntity)}</p>
              <p style="margin: 0 0 12px;">
                <a href="${imprintUrl}" style="color: #6B6779; text-decoration: underline;">Impressum</a> &nbsp;&middot;&nbsp;
                <a href="${privacyUrl}" style="color: #6B6779; text-decoration: underline;">Datenschutzerklärung</a>
              </p>
              <p style="margin: 0 0 12px;">
                <a href="${frequencyUrl}" style="color: #6B6779; text-decoration: underline;">Report-Frequenz ändern</a> &nbsp;&middot;&nbsp;
                <a href="${notificationSettingsUrl}" style="color: #6B6779; text-decoration: underline;">Benachrichtigungen verwalten</a>
              </p>
              <p style="margin: 0;">
                <a href="https://toolfolio.lovable.app" style="color: #6B6779; text-decoration: none; font-weight: 600;">toolfolio.lovable.app</a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default reportEmailHTML;
