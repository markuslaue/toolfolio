export type TrialStage = "7" | "3" | "1";

export interface TrialEmailProps {
  firstName?: string;
  stage?: TrialStage;
  toolName?: string;
  /** Datum des Testendes, z. B. "12. Juli 2026". */
  trialEndDate?: string;
  /** Künftiger Betrag, z. B. "29,00 €". */
  futureAmount?: string;
  /** Abrechnungsintervall, z. B. "Monat" oder "Jahr". */
  interval?: string;
  clientName?: string;
  /** Kennzeichnung, falls Testende-Datum nur geschätzt ist. */
  uncertain?: boolean;
  detailUrl?: string;
  cancelUrl?: string;
  keepUrl?: string;
  notificationSettingsUrl?: string;
  imprintUrl?: string;
  privacyUrl?: string;
  legalEntity?: string;
}

export function trialSubject(props: TrialEmailProps): string {
  const tool = props.toolName?.trim() || "deinem Tool";
  switch (props.stage ?? "7") {
    case "1":
      return `Morgen beginnt ${tool} zu kosten`;
    case "3":
      return `Nur noch 3 Tage: ${tool} wechselt in ein bezahltes Abo`;
    case "7":
    default:
      return `In 7 Tagen wird dein Test von ${tool} kostenpflichtig`;
  }
}

export function trialPreheader(props: TrialEmailProps): string {
  const tool = props.toolName?.trim() || "dein Tool";
  const date = props.trialEndDate?.trim() || "demnächst";
  const amount = props.futureAmount?.trim() || "der hinterlegte Betrag";
  return `Ab ${date} zahlst du ${amount} für ${tool}. Jetzt entscheiden.`;
}

export function trialEmailHTML(props: TrialEmailProps): string {
  const {
    firstName,
    stage = "7",
    toolName = "[Tool-Name]",
    trialEndDate = "[Datum]",
    futureAmount = "[Betrag]",
    interval = "Monat",
    clientName,
    uncertain = false,
    detailUrl = "https://toolfolio.lovable.app/fristen",
    cancelUrl = "https://toolfolio.lovable.app/fristen",
    keepUrl = "https://toolfolio.lovable.app/fristen",
    notificationSettingsUrl = "https://toolfolio.lovable.app/einstellungen/benachrichtigungen",
    imprintUrl = "https://toolfolio.lovable.app/impressum",
    privacyUrl = "https://toolfolio.lovable.app/datenschutz",
    legalEntity = "[Firma, Anschrift, Kontakt einsetzen]",
  } = props;

  const greeting = firstName?.trim() ? `Hallo ${firstName.trim()},` : "Hallo,";

  const isUrgent = stage === "1";
  const factsBg = isUrgent ? "#FDECE8" : "#FEF3DA";
  const factsBorder = isUrgent ? "#F0533D" : "#F5A623";
  const dateColor = isUrgent ? "#B83422" : "#1F1D2B";

  const stageNote =
    stage === "1"
      ? "Der Test endet morgen. Wenn du nichts tust, wechselt das Tool direkt in ein zahlendes Abo."
      : stage === "3"
      ? "Der Test endet in 3 Tagen. Jetzt ist ein guter Moment, in Ruhe zu entscheiden."
      : "Der Test endet in 7 Tagen. Genug Zeit, in Ruhe zu prüfen.";

  const uncertaintyHint = uncertain
    ? `<p style="margin: 12px 0 0; font-size: 13px; line-height: 20px; color: #6B6779; font-style: italic;">
        Hinweis: Das Testende-Datum ist voraussichtlich, abgeleitet aus deinen hinterlegten Daten. Bitte prüfe es kurz beim Anbieter.
      </p>`
    : "";

  const clientRow = clientName
    ? `<tr>
        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #6B6779; width: 45%; border-top: 1px solid rgba(31,29,43,0.08);">Kunde</td>
        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #1F1D2B; font-weight: 600; border-top: 1px solid rgba(31,29,43,0.08);">${escapeHtml(clientName)}</td>
      </tr>`
    : "";

  const preheader = trialPreheader({ toolName, trialEndDate, futureAmount });

  return `<!DOCTYPE html>
<html lang="de" dir="ltr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Trial-Warnung: ${escapeHtml(toolName)}</title>
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
      .trial-date { font-size: 22px !important; line-height: 28px !important; }
      .future-amount { font-size: 20px !important; line-height: 26px !important; }
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
                damit dich keine Abbuchung überrascht: Dein kostenloser Test von <strong>${escapeHtml(toolName)}</strong> endet bald und wechselt danach in ein zahlendes Abo.
              </p>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${factsBg}; border-radius: 14px; border-left: 4px solid ${factsBorder};">
                <tr>
                  <td style="padding: 22px 24px;">
                    <p style="margin: 0 0 4px; font-size: 12px; line-height: 18px; color: #6B6779; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">Test endet am</p>
                    <p class="trial-date tnum" style="margin: 0 0 18px; font-size: 26px; line-height: 32px; color: ${dateColor}; font-weight: 700; letter-spacing: -0.01em;">${escapeHtml(trialEndDate)}</p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #6B6779; width: 45%; border-top: 1px solid rgba(31,29,43,0.08);">Tool</td>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #1F1D2B; font-weight: 600; border-top: 1px solid rgba(31,29,43,0.08);">${escapeHtml(toolName)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #6B6779; border-top: 1px solid rgba(31,29,43,0.08);">Ab dann kostenpflichtig</td>
                        <td class="future-amount tnum" style="padding: 8px 0; font-size: 18px; line-height: 24px; color: #1F1D2B; font-weight: 700; border-top: 1px solid rgba(31,29,43,0.08);">${escapeHtml(futureAmount)} pro ${escapeHtml(interval)}</td>
                      </tr>
                      ${clientRow}
                    </table>

                    ${uncertaintyHint}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 24px;">
              <p class="copy" style="margin: 0 0 12px; font-size: 16px; line-height: 26px; color: #1F1D2B;">
                ${escapeHtml(stageNote)}
              </p>
              <p class="copy" style="margin: 0 0 12px; font-size: 16px; line-height: 26px; color: #1F1D2B;">
                Wenn du <strong>${escapeHtml(toolName)}</strong> behalten willst, musst du nichts tun, es läuft dann kostenpflichtig weiter. Wenn nicht, kündige oder lösche es am besten vor dem <strong>${escapeHtml(trialEndDate)}</strong>, um die erste Abbuchung zu vermeiden.
              </p>
              <p class="copy" style="margin: 0; font-size: 13px; line-height: 20px; color: #6B6779;">
                Hinweis: Diese Warnung betrifft den Test eines getrackten Tools, nicht deinen Toolfolio-Trial. Toolfolio selbst kippt nie automatisch in ein zahlendes Abo.
              </p>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 16px;">
              <table role="presentation" class="button-wrap" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: #6C5CE7;" bgcolor="#6C5CE7">
                    <a href="${detailUrl}" class="button-link" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 12px; background-color: #6C5CE7; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;" aria-label="Test und Optionen ansehen">
                      Test und Optionen ansehen
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 32px;" align="center">
              <p class="copy" style="margin: 0; font-size: 14px; line-height: 22px; color: #6B6779;">
                <a href="${cancelUrl}" style="color: #6C5CE7; text-decoration: underline; font-weight: 600;">Vor Ablauf kündigen</a>
                &nbsp;&middot;&nbsp;
                <a href="${keepUrl}" style="color: #6C5CE7; text-decoration: underline; font-weight: 600;">Bewusst behalten</a>
              </p>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 40px;">
              <p class="copy" style="margin: 0 0 18px; font-size: 16px; line-height: 26px; color: #1F1D2B;">
                Wir melden uns nur, wenn es wirklich zählt.
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

export default trialEmailHTML;
