export type SavingsReason =
  | "ungenutzt"
  | "ueberdimensioniert"
  | "jahreszahlung"
  | "redundant"
  | "alternative";

export interface SavingsEmailProps {
  firstName?: string;
  toolName?: string;
  /** Jährliche Ersparnis, z. B. "144,00 €". */
  yearlySaving?: string;
  /** Kurzer Grund, frei formulierbar. */
  reasonText?: string;
  reason?: SavingsReason;
  clientName?: string;
  /** Optional: kurzer Hinweis auf Kompromisse. */
  tradeoffNote?: string;
  /** Zeigt sekundären Link "Alternativen vergleichen". */
  showAlternatives?: boolean;
  detailUrl?: string;
  alternativesUrl?: string;
  dismissUrl?: string;
  notificationSettingsUrl?: string;
  imprintUrl?: string;
  privacyUrl?: string;
  legalEntity?: string;
}

export function savingsSubject(props: SavingsEmailProps): string {
  const tool = props.toolName?.trim() || "einem Tool";
  const amount = props.yearlySaving?.trim();
  if (amount) return `Du könntest ${amount} im Jahr bei ${tool} sparen`;
  return `Spar-Chance entdeckt: ${tool}`;
}

export function savingsPreheader(_props: SavingsEmailProps): string {
  return "Wir haben eine konkrete Möglichkeit gefunden, deine Kosten zu senken.";
}

function reasonLabel(reason: SavingsReason): string {
  switch (reason) {
    case "ungenutzt":
      return "Kaum oder nicht genutzt";
    case "ueberdimensioniert":
      return "Tarif zu groß";
    case "jahreszahlung":
      return "Jahreszahlung statt monatlich";
    case "redundant":
      return "Doppelte Funktion";
    case "alternative":
      return "Günstigere Alternative";
  }
}

export function savingsEmailHTML(props: SavingsEmailProps): string {
  const {
    firstName,
    toolName = "[Tool-Name]",
    yearlySaving = "[Betrag]",
    reasonText = "[Grund, z. B. seit 6 Wochen ungenutzt]",
    reason = "ungenutzt",
    clientName,
    tradeoffNote,
    showAlternatives = reason === "alternative" || reason === "redundant",
    detailUrl = "https://toolfolio.lovable.app/sparvorschlaege",
    alternativesUrl = "https://toolfolio.lovable.app/verzeichnis",
    dismissUrl = "https://toolfolio.lovable.app/sparvorschlaege",
    notificationSettingsUrl = "https://toolfolio.lovable.app/einstellungen/benachrichtigungen",
    imprintUrl = "https://toolfolio.lovable.app/impressum",
    privacyUrl = "https://toolfolio.lovable.app/datenschutz",
    legalEntity = "[Firma, Anschrift, Kontakt einsetzen]",
  } = props;

  const greeting = firstName?.trim() ? `Hallo ${firstName.trim()},` : "Hallo,";

  // Emerald als positives Signal
  const factsBg = "#E8F8F0";
  const factsBorder = "#12B76A";
  const emerald = "#12B76A";

  const clientRow = clientName
    ? `<tr>
        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #6B6779; width: 45%; border-top: 1px solid rgba(31,29,43,0.08);">Kunde</td>
        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #1F1D2B; font-weight: 600; border-top: 1px solid rgba(31,29,43,0.08);">${escapeHtml(clientName)}</td>
      </tr>`
    : "";

  const tradeoff = tradeoffNote
    ? `<p style="margin: 12px 0 0; font-size: 13px; line-height: 20px; color: #6B6779; font-style: italic;">Ehrlich gesagt: ${escapeHtml(tradeoffNote)}</p>`
    : "";

  const alternativesLink = showAlternatives
    ? `<a href="${alternativesUrl}" style="color: ${emerald}; text-decoration: underline; font-weight: 600;">Alternativen vergleichen</a>
       &nbsp;&middot;&nbsp;`
    : "";

  const adNotice = showAlternatives
    ? `<p style="margin: 0 0 12px;">Hinweis: Der Link "Alternativen vergleichen" führt ins Toolfolio-Verzeichnis. Einzelne Einträge können als Anzeige oder Partnerschaft gekennzeichnet sein.</p>`
    : "";

  const preheader = savingsPreheader(props);

  return `<!DOCTYPE html>
<html lang="de" dir="ltr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Spar-Chance entdeckt: ${escapeHtml(toolName)}</title>
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
      .bignum { font-size: 30px !important; line-height: 36px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #FBF7F1; color: #1F1D2B; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${escapeHtml(preheader)}</div>
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #FBF7F1;">
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
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
                gute Nachricht: Wir haben eine konkrete Möglichkeit gefunden, wie du bei <strong>${escapeHtml(toolName)}</strong> sparen kannst.
              </p>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${factsBg}; border-radius: 14px; border-left: 4px solid ${factsBorder};">
                <tr>
                  <td style="padding: 22px 24px;">
                    <p style="margin: 0 0 14px; font-size: 12px; line-height: 18px; color: #0B7A47; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">Spar-Chance</p>

                    <p style="margin: 0 0 4px; font-size: 13px; line-height: 20px; color: #0B7A47; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;">Mögliche Ersparnis</p>
                    <p class="bignum tnum" style="margin: 0 0 18px; font-size: 34px; line-height: 40px; color: #1F1D2B; font-weight: 700; letter-spacing: -0.01em;">
                      ${escapeHtml(yearlySaving)} <span style="font-size: 14px; font-weight: 600; color: #6B6779; letter-spacing: 0;">pro Jahr</span>
                    </p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #6B6779; width: 45%; border-top: 1px solid rgba(31,29,43,0.08);">Tool</td>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #1F1D2B; font-weight: 600; border-top: 1px solid rgba(31,29,43,0.08);">${escapeHtml(toolName)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #6B6779; border-top: 1px solid rgba(31,29,43,0.08);">Art</td>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #1F1D2B; font-weight: 600; border-top: 1px solid rgba(31,29,43,0.08);">${escapeHtml(reasonLabel(reason))}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #6B6779; border-top: 1px solid rgba(31,29,43,0.08);" valign="top">Warum</td>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #1F1D2B; font-weight: 600; border-top: 1px solid rgba(31,29,43,0.08);">${escapeHtml(reasonText)}</td>
                      </tr>
                      ${clientRow}
                    </table>

                    ${tradeoff}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 24px;">
              <p class="copy" style="margin: 0; font-size: 16px; line-height: 26px; color: #1F1D2B;">
                Schau dir den Vorschlag in Ruhe an. Wenn er für dich passt, kannst du ihn direkt umsetzen, ohne dass du Funktionen verlierst, die du wirklich brauchst.
              </p>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 16px;">
              <table role="presentation" class="button-wrap" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: #6C5CE7;" bgcolor="#6C5CE7">
                    <a href="${detailUrl}" class="button-link" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 12px; background-color: #6C5CE7; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;" aria-label="Vorschlag ansehen">
                      Vorschlag ansehen
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 32px;" align="center">
              <p class="copy" style="margin: 0; font-size: 14px; line-height: 22px; color: #6B6779;">
                ${alternativesLink}<a href="${dismissUrl}" style="color: #6B6779; text-decoration: underline; font-weight: 600;">Passt für mich nicht</a>
              </p>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 40px;">
              <p class="copy" style="margin: 0 0 18px; font-size: 16px; line-height: 26px; color: #1F1D2B;">
                Wir suchen weiter im Hintergrund nach solchen Chancen für dich.
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
              ${adNotice}
              <p style="margin: 0 0 12px;"><strong>Absenderkennzeichnung:</strong> ${escapeHtml(legalEntity)}</p>
              <p style="margin: 0 0 12px;">
                <a href="${imprintUrl}" style="color: #6B6779; text-decoration: underline;">Impressum</a> &nbsp;&middot;&nbsp;
                <a href="${privacyUrl}" style="color: #6B6779; text-decoration: underline;">Datenschutzerklärung</a> &nbsp;&middot;&nbsp;
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

export default savingsEmailHTML;
