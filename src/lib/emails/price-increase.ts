export type PriceSource = "billing" | "listprice";

export interface PriceIncreaseEmailProps {
  firstName?: string;
  toolName?: string;
  oldPrice?: string;
  newPrice?: string;
  interval?: string;
  /** Absolute Differenz, z. B. "10,00 €". */
  difference?: string;
  /** Prozentuale Differenz, z. B. "+33 %". */
  differencePercent?: string;
  /** Mehrkosten im Jahr, z. B. "120,00 €". */
  yearlyExtra?: string;
  /** Gültig ab, z. B. "1. August 2026". */
  validFrom?: string;
  source?: PriceSource;
  clientName?: string;
  detailUrl?: string;
  alternativesUrl?: string;
  acknowledgeUrl?: string;
  notificationSettingsUrl?: string;
  imprintUrl?: string;
  privacyUrl?: string;
  legalEntity?: string;
}

export function priceIncreaseSubject(props: PriceIncreaseEmailProps): string {
  const tool = props.toolName?.trim() || "deinem Tool";
  const oldP = props.oldPrice?.trim();
  const newP = props.newPrice?.trim();
  const interval = props.interval?.trim() || "Monat";
  if (oldP && newP) {
    return `${tool} ist teurer geworden: ${newP} statt ${oldP} pro ${interval}`;
  }
  return `Preiserhöhung bei ${tool} erkannt`;
}

export function priceIncreasePreheader(props: PriceIncreaseEmailProps): string {
  const yearly = props.yearlyExtra?.trim() || "mehr";
  return `Das sind ${yearly} mehr pro Jahr. Wir zeigen dir auch Alternativen.`;
}

export function priceIncreaseEmailHTML(props: PriceIncreaseEmailProps): string {
  const {
    firstName,
    toolName = "[Tool-Name]",
    oldPrice = "[alter Preis]",
    newPrice = "[neuer Preis]",
    interval = "Monat",
    difference = "[Betrag]",
    differencePercent = "[X %]",
    yearlyExtra = "[Betrag]",
    validFrom = "[Datum]",
    source = "billing",
    clientName,
    detailUrl = "https://toolfolio.de/abos",
    alternativesUrl = "https://toolfolio.de/verzeichnis",
    acknowledgeUrl = "https://toolfolio.de/abos",
    notificationSettingsUrl = "https://toolfolio.de/einstellungen/benachrichtigungen",
    imprintUrl = "https://toolfolio.de/impressum",
    privacyUrl = "https://toolfolio.de/datenschutz",
    legalEntity = "OMMM GmbH, Leipzig",
  } = props;

  const greeting = firstName?.trim() ? `Hallo ${firstName.trim()},` : "Hallo,";

  const factsBg = "#FEF3DA";
  const factsBorder = "#F5A623";

  const sourceLabel =
    source === "billing"
      ? "deiner Abrechnung (verifiziert)"
      : "dem Listenpreis des Anbieters (laut Anbieter)";
  const sourceHint =
    source === "billing"
      ? "Wir haben den höheren Betrag in deiner letzten Abrechnung gesehen."
      : "Der öffentliche Listenpreis des Anbieters wurde angehoben. Bei dir greift die Erhöhung in der Regel zur nächsten Verlängerung.";

  const clientRow = clientName
    ? `<tr>
        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #6B6779; width: 45%; border-top: 1px solid rgba(31,29,43,0.08);">Kunde</td>
        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #1F1D2B; font-weight: 600; border-top: 1px solid rgba(31,29,43,0.08);">${escapeHtml(clientName)}</td>
      </tr>`
    : "";

  const preheader = priceIncreasePreheader({ yearlyExtra });

  return `<!DOCTYPE html>
<html lang="de" dir="ltr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Preiserhöhung erkannt: ${escapeHtml(toolName)}</title>
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
      .copy { font-size: 15px !important; line-height: 23px !important; }
      .button-wrap { width: 100% !important; }
      .button-link { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; box-sizing: border-box !important; text-align: center !important; }
      .bignum { font-size: 26px !important; line-height: 32px !important; }
      .pricecol { display: block !important; width: 100% !important; padding: 6px 0 !important; }
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
                damit dich die nächste Abrechnung nicht überrascht: Der Preis für <strong>${escapeHtml(toolName)}</strong> ist gestiegen.
              </p>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${factsBg}; border-radius: 14px; border-left: 4px solid ${factsBorder};">
                <tr>
                  <td style="padding: 22px 24px;">
                    <p style="margin: 0 0 14px; font-size: 12px; line-height: 18px; color: #6B6779; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">Preisänderung</p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 16px;">
                      <tr>
                        <td class="pricecol" width="50%" valign="top" style="padding-right: 12px;">
                          <p style="margin: 0 0 4px; font-size: 12px; line-height: 18px; color: #6B6779; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;">Bisher</p>
                          <p class="tnum" style="margin: 0; font-size: 18px; line-height: 24px; color: #6B6779; text-decoration: line-through;">${escapeHtml(oldPrice)}</p>
                          <p style="margin: 2px 0 0; font-size: 12px; line-height: 18px; color: #6B6779;">pro ${escapeHtml(interval)}</p>
                        </td>
                        <td class="pricecol" width="50%" valign="top" style="padding-left: 12px; border-left: 1px solid rgba(31,29,43,0.08);">
                          <p style="margin: 0 0 4px; font-size: 12px; line-height: 18px; color: #1F1D2B; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;">Neu</p>
                          <p class="tnum" style="margin: 0; font-size: 22px; line-height: 28px; color: #1F1D2B; font-weight: 700;">${escapeHtml(newPrice)}</p>
                          <p style="margin: 2px 0 0; font-size: 12px; line-height: 18px; color: #1F1D2B;">pro ${escapeHtml(interval)}</p>
                        </td>
                      </tr>
                    </table>

                    <p class="bignum tnum" style="margin: 0 0 4px; font-size: 30px; line-height: 36px; color: #1F1D2B; font-weight: 700; letter-spacing: -0.01em;">+${escapeHtml(yearlyExtra)} <span style="font-size: 14px; font-weight: 600; color: #6B6779; letter-spacing: 0;">im Jahr</span></p>
                    <p class="tnum" style="margin: 0 0 18px; font-size: 14px; line-height: 22px; color: #6B6779;">
                      Differenz: <strong style="color: #1F1D2B;">${escapeHtml(difference)}</strong> mehr (<strong style="color: #1F1D2B;">${escapeHtml(differencePercent)}</strong>)
                    </p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #6B6779; width: 45%; border-top: 1px solid rgba(31,29,43,0.08);">Tool</td>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #1F1D2B; font-weight: 600; border-top: 1px solid rgba(31,29,43,0.08);">${escapeHtml(toolName)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #6B6779; border-top: 1px solid rgba(31,29,43,0.08);">Gültig ab</td>
                        <td class="tnum" style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #1F1D2B; font-weight: 600; border-top: 1px solid rgba(31,29,43,0.08);">${escapeHtml(validFrom)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #6B6779; border-top: 1px solid rgba(31,29,43,0.08);">Erkannt aus</td>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #1F1D2B; font-weight: 600; border-top: 1px solid rgba(31,29,43,0.08);">${escapeHtml(sourceLabel)}</td>
                      </tr>
                      ${clientRow}
                    </table>

                    <p style="margin: 12px 0 0; font-size: 13px; line-height: 20px; color: #6B6779; font-style: italic;">
                      ${escapeHtml(sourceHint)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 24px;">
              <p class="copy" style="margin: 0; font-size: 16px; line-height: 26px; color: #1F1D2B;">
                Wenn dir <strong>${escapeHtml(toolName)}</strong> den Preis weiterhin wert ist, musst du nichts tun. Falls nicht, lohnt jetzt ein kurzer Vergleich, vielleicht gibt es eine günstigere Lösung mit ähnlichem Funktionsumfang.
              </p>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 16px;">
              <table role="presentation" class="button-wrap" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: #6C5CE7;" bgcolor="#6C5CE7">
                    <a href="${detailUrl}" class="button-link" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 12px; background-color: #6C5CE7; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;" aria-label="Details ansehen">
                      Details ansehen
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 32px;" align="center">
              <p class="copy" style="margin: 0; font-size: 14px; line-height: 22px; color: #6B6779;">
                <a href="${alternativesUrl}" style="color: #6C5CE7; text-decoration: underline; font-weight: 600;">Alternativen vergleichen</a>
                &nbsp;&middot;&nbsp;
                <a href="${acknowledgeUrl}" style="color: #6C5CE7; text-decoration: underline; font-weight: 600;">Zur Kenntnis genommen</a>
              </p>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 40px;">
              <p class="copy" style="margin: 0 0 18px; font-size: 16px; line-height: 26px; color: #1F1D2B;">
                Wir behalten Preise für dich im Blick, damit du es nicht musst.
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
              <p style="margin: 0 0 12px;">Hinweis: Der Link "Alternativen vergleichen" führt ins Toolfolio-Verzeichnis. Einzelne Einträge können als Anzeige oder Partnerschaft gekennzeichnet sein.</p>
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

export default priceIncreaseEmailHTML;
