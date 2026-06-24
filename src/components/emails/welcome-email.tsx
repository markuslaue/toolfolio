export interface WelcomeEmailProps {
  /** Vorname für die Anrede. Falls leer, wird eine neutrale Begrüßung verwendet. */
  firstName?: string;
  /** Link zum Onboarding-Wizard (B-02). */
  onboardingUrl?: string;
  /** Link zum Impressum (R-01). */
  imprintUrl?: string;
  /** Link zur Datenschutzerklärung (R-02). */
  privacyUrl?: string;
  /** Link zur Hilfe. */
  helpUrl?: string;
  /** Name des Absenders für die Signatur. */
  senderName?: string;
  /** Absenderkennzeichnung (Firma, Anschrift, Kontakt). */
  legalEntity?: string;
}

export const WELCOME_SUBJECTS = [
  "Willkommen bei Toolfolio, {{firstName}}",
  "Los geht's, {{firstName}}. Dein Überblick wartet.",
  "Schön, dass du da bist {{firstName}}",
];

export const WELCOME_PREHEADER =
  "In zwei Minuten hast du deine ersten Abos im Blick.";

export function welcomeSubject(props: WelcomeEmailProps): string {
  const name = props.firstName?.trim() || "du";
  return WELCOME_SUBJECTS[0].replace("{{firstName}}", name);
}

export function welcomeEmailHTML(props: WelcomeEmailProps): string {
  const {
    firstName,
    onboardingUrl = "https://toolfolio.lovable.app/onboarding",
    imprintUrl = "https://toolfolio.lovable.app/impressum",
    privacyUrl = "https://toolfolio.lovable.app/datenschutz",
    helpUrl = "https://toolfolio.lovable.app/hilfe",
    senderName = "Toolfolio-Team",
    legalEntity = "[Firma, Anschrift, Kontakt einsetzen]",
  } = props;

  const greeting = firstName?.trim()
    ? `Hallo ${firstName.trim()},`
    : "Hallo,";

  const ctaUrl = onboardingUrl;
  const ctaLabel = "Einrichtung starten";

  return `<!DOCTYPE html>
<html lang="de" dir="ltr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Willkommen bei Toolfolio</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    /* Reset */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }
    /* Client fixes */
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    #outlook a { padding: 0; }
    .ExternalClass { width: 100%; }
    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }
    @media screen and (max-width: 600px) {
      .wrapper { width: 100% !important; }
      .content { padding: 24px 20px !important; }
      .heading { font-size: 24px !important; line-height: 30px !important; }
      .copy { font-size: 15px !important; line-height: 23px !important; }
      .button-wrap { width: 100% !important; }
      .button-link { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; box-sizing: border-box !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #FBF7F1; color: #1F1D2B; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Preheader -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${WELCOME_PREHEADER}
  </div>
  <!-- Preview spacing hack -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #FBF7F1;">
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  </div>

  <!-- Wrapper -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FBF7F1;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" class="wrapper" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #ECE6DA;">

          <!-- Header / Logo -->
          <tr>
            <td align="center" style="padding: 40px 40px 24px;" class="content">
              <a href="https://toolfolio.lovable.app" style="text-decoration: none; color: #1F1D2B; font-size: 24px; font-weight: 700; letter-spacing: -0.02em; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;" aria-label="Toolfolio Startseite">
                Toolfolio
              </a>
            </td>
          </tr>

          <!-- Hero line -->
          <tr>
            <td class="content" style="padding: 0 40px 24px;">
              <div style="width: 48px; height: 4px; background-color: #FF7A66; border-radius: 2px;" aria-hidden="true"></div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td class="content" style="padding: 0 40px 24px;">
              <p class="copy" style="margin: 0; font-size: 16px; line-height: 26px; color: #1F1D2B;">
                <strong>${greeting}</strong>
              </p>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td class="content" style="padding: 0 40px 24px;">
              <p class="copy" style="margin: 0; font-size: 16px; line-height: 26px; color: #1F1D2B;">
                schön, dass du da bist. Toolfolio bringt alle deine Software-Abos an einen Ort, warnt dich vor Kosten und Kündigungsfristen und zeigt dir, wo du bei gleicher Leistung weniger zahlen kannst.
              </p>
            </td>
          </tr>

          <!-- First step -->
          <tr>
            <td class="content" style="padding: 0 40px 24px;">
              <p class="copy" style="margin: 0; font-size: 16px; line-height: 26px; color: #1F1D2B;">
                <strong>Der erste Schritt:</strong> Am besten richtest du dir jetzt in wenigen Minuten deinen Überblick ein. Du hast drei Wege, deine Abos zu erfassen:
              </p>
            </td>
          </tr>

          <!-- Ways list -->
          <tr>
            <td class="content" style="padding: 0 40px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td valign="top" style="width: 28px; padding-bottom: 14px; font-size: 16px; line-height: 26px; color: #6C5CE7; font-weight: 700;">1.</td>
                  <td valign="top" style="padding-bottom: 14px; font-size: 16px; line-height: 26px; color: #1F1D2B;">
                    <strong>Kontoauszug importieren</strong>, das findet auch Vergessenes.
                  </td>
                </tr>
                <tr>
                  <td valign="top" style="width: 28px; padding-bottom: 14px; font-size: 16px; line-height: 26px; color: #6C5CE7; font-weight: 700;">2.</td>
                  <td valign="top" style="padding-bottom: 14px; font-size: 16px; line-height: 26px; color: #1F1D2B;">
                    <strong>Belege an dein persönliches Beleg-Postfach</strong> weiterleiten.
                  </td>
                </tr>
                <tr>
                  <td valign="top" style="width: 28px; font-size: 16px; line-height: 26px; color: #6C5CE7; font-weight: 700;">3.</td>
                  <td valign="top" style="font-size: 16px; line-height: 26px; color: #1F1D2B;">
                    <strong>Tools manuell oder aus dem Verzeichnis</strong> hinzufügen.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button (bulletproof) -->
          <tr>
            <td class="content" style="padding: 0 40px 32px;">
              <table role="presentation" class="button-wrap" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: #6C5CE7;" bgcolor="#6C5CE7">
                    <a href="${ctaUrl}" class="button-link" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 12px; background-color: #6C5CE7; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;" aria-label="Onboarding starten">
                      ${ctaLabel}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Trial note -->
          <tr>
            <td class="content" style="padding: 0 40px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #EFEAFE; border-radius: 12px; border-left: 4px solid #6C5CE7;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <p class="copy" style="margin: 0; font-size: 15px; line-height: 24px; color: #1F1D2B;">
                      <strong>14 Tage vollen Zugang</strong> zu allen Funktionen, ganz ohne Kreditkarte. Danach wählst du deinen Plan oder bleibst kostenlos.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Help / closing -->
          <tr>
            <td class="content" style="padding: 0 40px 40px;">
              <p class="copy" style="margin: 0 0 18px; font-size: 16px; line-height: 26px; color: #1F1D2B;">
                Wenn du Fragen hast, antworte einfach auf diese E-Mail oder <a href="${helpUrl}" style="color: #6C5CE7; text-decoration: underline;">schau in die Hilfe</a>. Wir freuen uns, dass du dabei bist.
              </p>
              <p class="copy" style="margin: 0; font-size: 16px; line-height: 26px; color: #1F1D2B;">
                Viele Grüße<br />
                <strong>dein ${senderName}</strong>
              </p>
            </td>
          </tr>

        </table>

        <!-- Legal footer -->
        <table role="presentation" class="wrapper" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; margin-top: 24px;">
          <tr>
            <td class="content" style="padding: 0 40px; text-align: center; font-size: 12px; line-height: 19px; color: #6B6779;">
              <p style="margin: 0 0 12px;">
                Dies ist eine Service- und Transaktionsnachricht zu deinem Toolfolio-Konto. Kein Newsletter.
              </p>
              <p style="margin: 0 0 12px;">
                <strong>Absenderkennzeichnung:</strong> ${legalEntity}
              </p>
              <p style="margin: 0 0 12px;">
                <a href="${imprintUrl}" style="color: #6B6779; text-decoration: underline;">Impressum</a> &nbsp;&middot;&nbsp;
                <a href="${privacyUrl}" style="color: #6B6779; text-decoration: underline;">Datenschutzerklärung</a>
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

export default welcomeEmailHTML;
