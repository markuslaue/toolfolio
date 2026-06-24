export type DeadlineStage = "30" | "7" | "2";

export interface DeadlineEmailProps {
  /** Vorname für die Anrede. */
  firstName?: string;
  /** Dringlichkeitsstufe: 30, 7 oder 2 Tage vor Frist. */
  stage?: DeadlineStage;
  /** Name des betroffenen Tools. */
  toolName?: string;
  /** Letzter Kündigungstermin als formatiertes Datum, z. B. "12. Juli 2026". */
  deadlineDate?: string;
  /** Verlängerungszeitraum, z. B. "ein Jahr" oder "ein Monat". */
  renewalPeriod?: string;
  /** Jahreswert (oder Gesamtkosten der Verlängerung), z. B. "239,00 €". */
  annualValue?: string;
  /** Optional: zugeordneter Kunde. */
  clientName?: string;
  /** Kennzeichnung, falls Frist nur geschätzt ist. */
  uncertain?: boolean;
  /** Link zur Abo-Detailseite bzw. zum Fristen-Wächter. */
  detailUrl?: string;
  /** Link zum Vorbereiten der Kündigung. */
  cancelUrl?: string;
  /** Link zum "Bewusst behalten" Aktionsendpunkt. */
  keepUrl?: string;
  /** Link zu Benachrichtigungs-Einstellungen (B-28). */
  notificationSettingsUrl?: string;
  /** Link zum Impressum (R-01). */
  imprintUrl?: string;
  /** Link zur Datenschutzerklärung (R-02). */
  privacyUrl?: string;
  /** Absenderkennzeichnung. */
  legalEntity?: string;
}

export function deadlineSubject(props: DeadlineEmailProps): string {
  const tool = props.toolName?.trim() || "deinem Tool";
  switch (props.stage ?? "30") {
    case "2":
      return `Letzte Chance, ${tool} vor der Verlängerung zu kündigen`;
    case "7":
      return `Nur noch 7 Tage, um ${tool} zu kündigen`;
    case "30":
    default:
      return `In 30 Tagen verlängert sich ${tool} automatisch`;
  }
}

export function deadlinePreheader(props: DeadlineEmailProps): string {
  const tool = props.toolName?.trim() || "dein Tool";
  const date = props.deadlineDate?.trim() || "demnächst";
  return `Letzter Kündigungstermin: ${date}. Danach läuft ${tool} für ein weiteres Jahr.`;
}

export function deadlineEmailHTML(props: DeadlineEmailProps): string {
  const {
    firstName,
    stage = "30",
    toolName = "[Tool-Name]",
    deadlineDate = "[Datum]",
    renewalPeriod = "ein Jahr",
    annualValue = "[Jahreswert]",
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

  // Dringlichkeits-Akzente je nach Stufe
  const isUrgent = stage === "2";
  const factsBg = isUrgent ? "#FDECE8" : "#FEF3DA";
  const factsBorder = isUrgent ? "#F0533D" : "#F5A623";
  const dateColor = isUrgent ? "#B83422" : "#1F1D2B";

  const stageNote =
    stage === "2"
      ? "Die Frist läuft in 2 Tagen ab. Wenn du nichts tust, verlängert sich das Abo automatisch."
      : stage === "7"
      ? "Die Frist läuft in 7 Tagen ab. Du hast jetzt noch in Ruhe Zeit, zu entscheiden."
      : "Die Frist läuft in 30 Tagen ab. Genug Zeit, in Ruhe zu prüfen.";

  const uncertaintyHint = uncertain
    ? `<p style="margin: 12px 0 0; font-size: 13px; line-height: 20px; color: #6B6779; font-style: italic;">
        Hinweis: Das Datum stammt aus deinen hinterlegten Daten und ist möglicherweise nur geschätzt. Bitte prüfe es kurz beim Anbieter.
      </p>`
    : "";

  const clientRow = clientName
    ? `<tr>
        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #6B6779; width: 45%;">Kunde</td>
        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #1F1D2B; font-weight: 600;">${escapeHtml(clientName)}</td>
      </tr>`
    : "";

  const preheader = deadlinePreheader({ toolName, deadlineDate });

  return `<!DOCTYPE html>
<html lang="de" dir="ltr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Fristen-Warnung: ${escapeHtml(toolName)}</title>
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
      .deadline-date { font-size: 22px !important; line-height: 28px !important; }
      .annual-value { font-size: 20px !important; line-height: 26px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #FBF7F1; color: #1F1D2B; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${escapeHtml(preheader)}</div>
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #FBF7F1;">
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FBF7F1;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" class="wrapper" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #ECE6DA;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 24px;" class="content">
              <a href="https://toolfolio.lovable.app" style="text-decoration: none; color: #1F1D2B; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;" aria-label="Toolfolio Startseite">Toolfolio</a>
            </td>
          </tr>

          <!-- Accent line -->
          <tr>
            <td class="content" style="padding: 0 40px 24px;">
              <div style="width: 48px; height: 4px; background-color: ${factsBorder}; border-radius: 2px;" aria-hidden="true"></div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td class="content" style="padding: 0 40px 16px;">
              <p class="copy" style="margin: 0; font-size: 16px; line-height: 26px; color: #1F1D2B;"><strong>${greeting}</strong></p>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td class="content" style="padding: 0 40px 24px;">
              <p class="copy" style="margin: 0; font-size: 16px; line-height: 26px; color: #1F1D2B;">
                kurzer Hinweis, damit dich nichts überrascht: Die Kündigungsfrist für <strong>${escapeHtml(toolName)}</strong> läuft bald ab.
              </p>
            </td>
          </tr>

          <!-- Facts block -->
          <tr>
            <td class="content" style="padding: 0 40px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${factsBg}; border-radius: 14px; border-left: 4px solid ${factsBorder};">
                <tr>
                  <td style="padding: 22px 24px;">
                    <p style="margin: 0 0 4px; font-size: 12px; line-height: 18px; color: #6B6779; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">Letzter Kündigungstermin</p>
                    <p class="deadline-date tnum" style="margin: 0 0 18px; font-size: 26px; line-height: 32px; color: ${dateColor}; font-weight: 700; letter-spacing: -0.01em;">${escapeHtml(deadlineDate)}</p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #6B6779; width: 45%; border-top: 1px solid rgba(31,29,43,0.08);">Tool</td>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #1F1D2B; font-weight: 600; border-top: 1px solid rgba(31,29,43,0.08);">${escapeHtml(toolName)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #6B6779; border-top: 1px solid rgba(31,29,43,0.08);">Bei Nichtkündigung</td>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #1F1D2B; font-weight: 600; border-top: 1px solid rgba(31,29,43,0.08);">automatische Verlängerung um ${escapeHtml(renewalPeriod)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #6B6779; border-top: 1px solid rgba(31,29,43,0.08);">Das kostet dich dann</td>
                        <td class="annual-value tnum" style="padding: 8px 0; font-size: 18px; line-height: 24px; color: #1F1D2B; font-weight: 700; border-top: 1px solid rgba(31,29,43,0.08);">${escapeHtml(annualValue)}</td>
                      </tr>
                      ${clientRow}
                    </table>

                    ${uncertaintyHint}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Einordnung -->
          <tr>
            <td class="content" style="padding: 0 40px 24px;">
              <p class="copy" style="margin: 0 0 12px; font-size: 16px; line-height: 26px; color: #1F1D2B;">
                ${escapeHtml(stageNote)}
              </p>
              <p class="copy" style="margin: 0; font-size: 16px; line-height: 26px; color: #1F1D2B;">
                Wenn du <strong>${escapeHtml(toolName)}</strong> weiter nutzt, musst du nichts tun. Wenn nicht, ist jetzt der richtige Moment, um die Verlängerung zu vermeiden.
              </p>
            </td>
          </tr>

          <!-- Primary CTA -->
          <tr>
            <td class="content" style="padding: 0 40px 16px;">
              <table role="presentation" class="button-wrap" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: #6C5CE7;" bgcolor="#6C5CE7">
                    <a href="${detailUrl}" class="button-link" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 12px; background-color: #6C5CE7; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;" aria-label="Frist und Optionen ansehen">
                      Frist und Optionen ansehen
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Secondary actions -->
          <tr>
            <td class="content" style="padding: 0 40px 32px;" align="center">
              <p class="copy" style="margin: 0; font-size: 14px; line-height: 22px; color: #6B6779;">
                <a href="${cancelUrl}" style="color: #6C5CE7; text-decoration: underline; font-weight: 600;">Kündigung vorbereiten</a>
                &nbsp;&middot;&nbsp;
                <a href="${keepUrl}" style="color: #6C5CE7; text-decoration: underline; font-weight: 600;">Bewusst behalten</a>
              </p>
            </td>
          </tr>

          <!-- Closing -->
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

        <!-- Legal footer -->
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

export default deadlineEmailHTML;
