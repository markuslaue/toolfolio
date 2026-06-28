export interface SpikeEmailProps {
  firstName?: string;
  toolName?: string;
  /** Aktueller Verbrauch im laufenden Zeitraum, z. B. "184,20 €" oder "12.400 Credits". */
  currentSpend?: string;
  /** Üblicher Schnitt, z. B. "92,00 €" oder "6.100 Credits". */
  averageSpend?: string;
  /** Abweichung in Prozent über dem Schnitt, z. B. "+103 %". */
  deviationPercent?: string;
  /** Hochrechnung auf den Monat (aktuell), z. B. "412,00 €". */
  projectedMonth?: string;
  /** Üblicher Monatsschnitt, z. B. "205,00 €". */
  usualMonth?: string;
  clientName?: string;
  /** Optional: Balken-Visualisierung anzeigen. */
  showBars?: boolean;
  /** Werte 0..100 für die Balken (Aktuell und Schnitt im Verhältnis zum größeren Wert). */
  currentBarPercent?: number;
  averageBarPercent?: number;
  /** Kennzeichnung, falls Datenbasis dünn ist. */
  sparseData?: boolean;
  detailUrl?: string;
  thresholdUrl?: string;
  acknowledgeUrl?: string;
  notificationSettingsUrl?: string;
  imprintUrl?: string;
  privacyUrl?: string;
  legalEntity?: string;
}

export function spikeSubject(props: SpikeEmailProps): string {
  const tool = props.toolName?.trim() || "deinem Tool";
  const dev = props.deviationPercent?.trim();
  if (dev) {
    return `Dein KI-Verbrauch bei ${tool} liegt aktuell ${dev} über dem Schnitt`;
  }
  return `Ungewöhnlich hoher KI-Verbrauch bei ${tool}`;
}

export function spikePreheader(props: SpikeEmailProps): string {
  const projected = props.projectedMonth?.trim() || "deutlich mehr";
  const usual = props.usualMonth?.trim() || "der übliche Schnitt";
  return `Hochgerechnet sind das ${projected} in diesem Monat statt sonst ${usual}.`;
}

export function spikeEmailHTML(props: SpikeEmailProps): string {
  const {
    firstName,
    toolName = "[Tool-Name]",
    currentSpend = "[Betrag]",
    averageSpend = "[Betrag]",
    deviationPercent = "[X %]",
    projectedMonth = "[Betrag]",
    usualMonth = "[Betrag]",
    clientName,
    showBars = true,
    currentBarPercent = 100,
    averageBarPercent = 48,
    sparseData = false,
    detailUrl = "https://toolfolio.de/ai-credits",
    thresholdUrl = "https://toolfolio.de/einstellungen/benachrichtigungen",
    acknowledgeUrl = "https://toolfolio.de/ai-credits",
    notificationSettingsUrl = "https://toolfolio.de/einstellungen/benachrichtigungen",
    imprintUrl = "https://toolfolio.de/impressum",
    privacyUrl = "https://toolfolio.de/datenschutz",
    legalEntity = "OMMM GmbH, Leipzig",
  } = props;

  const greeting = firstName?.trim() ? `Hallo ${firstName.trim()},` : "Hallo,";

  const factsBg = "#FEF3DA";
  const factsBorder = "#F5A623";

  const sparseHint = sparseData
    ? `<p style="margin: 12px 0 0; font-size: 13px; line-height: 20px; color: #6B6779; font-style: italic;">
        Hinweis: erste Einschätzung, noch wenig Vergleichsdaten. Der Schnitt kann sich mit mehr Verbrauchsdaten verschieben.
      </p>`
    : "";

  const clientRow = clientName
    ? `<tr>
        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #6B6779; width: 45%; border-top: 1px solid rgba(31,29,43,0.08);">Kunde</td>
        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #1F1D2B; font-weight: 600; border-top: 1px solid rgba(31,29,43,0.08);">${escapeHtml(clientName)}</td>
      </tr>`
    : "";

  const clamp = (n: number) => Math.max(2, Math.min(100, Math.round(n)));
  const curW = clamp(currentBarPercent);
  const avgW = clamp(averageBarPercent);

  const barsBlock = showBars
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 18px;">
        <tr>
          <td style="padding: 4px 0; font-size: 12px; line-height: 18px; color: #6B6779; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;">Schnitt</td>
        </tr>
        <tr>
          <td style="padding: 0 0 6px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td width="${avgW}%" style="background-color: #C9C3B4; height: 14px; line-height: 14px; font-size: 1px; border-radius: 7px;">&nbsp;</td>
                <td width="${100 - avgW}%" style="font-size: 1px; line-height: 14px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0 4px; font-size: 12px; line-height: 18px; color: #6B6779; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;">Aktuell</td>
        </tr>
        <tr>
          <td style="padding: 0;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td width="${curW}%" style="background-color: ${factsBorder}; height: 14px; line-height: 14px; font-size: 1px; border-radius: 7px;">&nbsp;</td>
                <td width="${100 - curW}%" style="font-size: 1px; line-height: 14px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`
    : "";

  const preheader = spikePreheader({ projectedMonth, usualMonth });

  return `<!DOCTYPE html>
<html lang="de" dir="ltr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Spike-Alarm: ${escapeHtml(toolName)}</title>
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
      .content { padding: 24px 20px !important; }
      .heading { font-size: 22px !important; line-height: 28px !important; }
      .copy { font-size: 15px !important; line-height: 23px !important; }
      .button-wrap { width: 100% !important; }
      .button-link { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; box-sizing: border-box !important; text-align: center !important; }
      .deviation { font-size: 26px !important; line-height: 32px !important; }
      .projected { font-size: 18px !important; line-height: 24px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #FBF7F1; color: #1F1D2B; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${escapeHtml(preheader)}</div>
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #FBF7F1;">
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FBF7F1;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" class="wrapper" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #ECE6DA;">

          <tr>
            <td align="center" style="padding: 40px 40px 24px;" class="content">
              <a href="https://toolfolio.de" style="text-decoration: none; color: #1F1D2B; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;" aria-label="Toolfolio Startseite">Toolfolio</a>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 24px;">
              <div style="width: 48px; height: 4px; background-color: ${factsBorder}; border-radius: 2px;" aria-hidden="true"></div>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 16px;">
              <p class="copy" style="margin: 0; font-size: 16px; line-height: 26px; color: #1F1D2B;"><strong>${greeting}</strong></p>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 24px;">
              <p class="copy" style="margin: 0; font-size: 16px; line-height: 26px; color: #1F1D2B;">
                ein kurzer Hinweis, damit dich die nächste Rechnung nicht überrascht: Dein KI-Verbrauch bei <strong>${escapeHtml(toolName)}</strong> liegt gerade deutlich über dem Üblichen.
              </p>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${factsBg}; border-radius: 14px; border-left: 4px solid ${factsBorder};">
                <tr>
                  <td style="padding: 22px 24px;">
                    <p style="margin: 0 0 4px; font-size: 12px; line-height: 18px; color: #6B6779; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">Abweichung vom Schnitt</p>
                    <p class="deviation tnum" style="margin: 0 0 4px; font-size: 30px; line-height: 36px; color: #1F1D2B; font-weight: 700; letter-spacing: -0.01em;">${escapeHtml(deviationPercent)}</p>
                    <p class="projected tnum" style="margin: 0 0 18px; font-size: 15px; line-height: 22px; color: #6B6779;">
                      Hochgerechnet: <strong style="color: #1F1D2B;">${escapeHtml(projectedMonth)}</strong> in diesem Monat statt sonst <strong style="color: #1F1D2B;">${escapeHtml(usualMonth)}</strong> (Schätzung)
                    </p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #6B6779; width: 45%; border-top: 1px solid rgba(31,29,43,0.08);">Tool</td>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #1F1D2B; font-weight: 600; border-top: 1px solid rgba(31,29,43,0.08);">${escapeHtml(toolName)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #6B6779; border-top: 1px solid rgba(31,29,43,0.08);">Aktueller Verbrauch</td>
                        <td class="tnum" style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #1F1D2B; font-weight: 700; border-top: 1px solid rgba(31,29,43,0.08);">${escapeHtml(currentSpend)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #6B6779; border-top: 1px solid rgba(31,29,43,0.08);">Dein Schnitt</td>
                        <td class="tnum" style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #1F1D2B; font-weight: 600; border-top: 1px solid rgba(31,29,43,0.08);">${escapeHtml(averageSpend)}</td>
                      </tr>
                      ${clientRow}
                    </table>

                    ${barsBlock}
                    ${sparseHint}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 24px;">
              <p class="copy" style="margin: 0 0 12px; font-size: 16px; line-height: 26px; color: #1F1D2B;">
                Das kann ein normaler Arbeitsspitzenwert sein, etwa durch ein großes Projekt. Es kann aber auch ein Hinweis auf etwas Unbeabsichtigtes sein, zum Beispiel einen Automatismus, der mehr verbraucht als gedacht. Ein kurzer Blick lohnt sich.
              </p>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 16px;">
              <table role="presentation" class="button-wrap" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: #6C5CE7;" bgcolor="#6C5CE7">
                    <a href="${detailUrl}" class="button-link" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 12px; background-color: #6C5CE7; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;" aria-label="Verbrauch ansehen">
                      Verbrauch ansehen
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 32px;" align="center">
              <p class="copy" style="margin: 0; font-size: 14px; line-height: 22px; color: #6B6779;">
                <a href="${thresholdUrl}" style="color: #6C5CE7; text-decoration: underline; font-weight: 600;">Limit oder Warnschwelle anpassen</a>
                &nbsp;&middot;&nbsp;
                <a href="${acknowledgeUrl}" style="color: #6C5CE7; text-decoration: underline; font-weight: 600;">Passt schon</a>
              </p>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 40px;">
              <p class="copy" style="margin: 0 0 18px; font-size: 16px; line-height: 26px; color: #1F1D2B;">
                Wir melden uns nur bei auffälligen Ausschlägen, nicht bei jeder Schwankung.
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
                <a href="${privacyUrl}" style="color: #6B6779; text-decoration: underline;">Datenschutzerklärung</a> &nbsp;&middot;&nbsp;
                <a href="${notificationSettingsUrl}" style="color: #6B6779; text-decoration: underline;">Benachrichtigungen verwalten</a>
              </p>
              <p style="margin: 0;">
                <a href="https://toolfolio.de" style="color: #6B6779; text-decoration: none; font-weight: 600;">toolfolio.de</a>
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

export default spikeEmailHTML;
