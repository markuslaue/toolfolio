export interface LeadEmailProps {
  /** Anbieter-Kontaktname, z. B. "Anna Schmidt" oder Firmenname. */
  vendorContact?: string;
  toolName?: string;
  /** Daten des Interessenten. */
  leadName?: string;
  leadCompany?: string;
  leadEmail?: string;
  leadTeamSize?: string;
  leadMessage?: string;
  receivedAt?: string;
  /** Rabattcode, zugleich Provisions-Zuordnung. */
  discountCode?: string;
  vendorPortalUrl?: string;
  leadSettingsUrl?: string;
  vendorAgreementUrl?: string;
  imprintUrl?: string;
  privacyUrl?: string;
  legalEntity?: string;
}

export function leadSubject(props: LeadEmailProps): string {
  const tool = props.toolName?.trim() || "dein Tool";
  return `Neue Anfrage über Toolfolio für ${tool}`;
}

export function leadPreheader(_props: LeadEmailProps): string {
  return "Eine Anfrage über dein Toolfolio-Listing. Bitte direkt antworten.";
}

export function leadEmailHTML(props: LeadEmailProps): string {
  const {
    vendorContact,
    toolName = "[Tool-Name]",
    leadName = "[Name]",
    leadCompany = "[Firma]",
    leadEmail = "interessent@example.com",
    leadTeamSize,
    leadMessage,
    receivedAt = "[Datum, Uhrzeit]",
    discountCode = "TF-XXXX",
    vendorPortalUrl = "https://toolfolio.lovable.app/anbieter-portal",
    leadSettingsUrl = "https://toolfolio.lovable.app/anbieter-portal/listing",
    vendorAgreementUrl = "https://toolfolio.lovable.app/anbieter",
    imprintUrl = "https://toolfolio.lovable.app/impressum",
    privacyUrl = "https://toolfolio.lovable.app/datenschutz",
    legalEntity = "[Firma, Anschrift, Kontakt einsetzen]",
  } = props;

  const greeting = vendorContact?.trim()
    ? `Hallo ${vendorContact.trim()},`
    : "Hallo,";

  const accent = "#6C5CE7";
  const factsBg = "#F3F0FF";
  const factsBorder = accent;

  const mailtoSubject = encodeURIComponent(
    `Re: Deine Anfrage zu ${toolName} über Toolfolio`,
  );
  const mailtoBody = encodeURIComponent(
    `Hallo ${leadName},\n\nvielen Dank für deine Anfrage zu ${toolName} über Toolfolio.\n\n`,
  );
  const mailtoHref = `mailto:${leadEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

  const teamRow = leadTeamSize?.trim()
    ? `<tr>
        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #6B6779; width: 45%; border-top: 1px solid rgba(31,29,43,0.08);" valign="top">Teamgröße / Einheiten</td>
        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #1F1D2B; font-weight: 600; border-top: 1px solid rgba(31,29,43,0.08);">${escapeHtml(leadTeamSize)}</td>
      </tr>`
    : "";

  const messageRow = leadMessage?.trim()
    ? `<tr>
        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #6B6779; width: 45%; border-top: 1px solid rgba(31,29,43,0.08);" valign="top">Nachricht</td>
        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #1F1D2B; border-top: 1px solid rgba(31,29,43,0.08); white-space: pre-wrap;">${escapeHtml(leadMessage)}</td>
      </tr>`
    : "";

  const preheader = leadPreheader(props);

  return `<!DOCTYPE html>
<html lang="de" dir="ltr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Neue Anfrage über Toolfolio für ${escapeHtml(toolName)}</title>
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
      .codebig { font-size: 22px !important; line-height: 28px !important; letter-spacing: 0.08em !important; }
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
              <div style="width: 48px; height: 4px; background-color: ${accent}; border-radius: 2px;" aria-hidden="true"></div>
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
                du hast eine neue Anfrage über dein Toolfolio-Listing für <strong>${escapeHtml(toolName)}</strong> erhalten. Der Interessent hat der Weitergabe seiner Angaben an dich zugestimmt und freut sich über eine zeitnahe Antwort.
              </p>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FFFFFF; border-radius: 14px; border: 1px solid #ECE6DA;">
                <tr>
                  <td style="padding: 22px 24px;">
                    <p style="margin: 0 0 14px; font-size: 12px; line-height: 18px; color: #6B6779; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">Die Anfrage</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 8px 0 8px; font-size: 14px; line-height: 22px; color: #6B6779; width: 45%;" valign="top">Tool</td>
                        <td style="padding: 8px 0 8px; font-size: 14px; line-height: 22px; color: #1F1D2B; font-weight: 600;">${escapeHtml(toolName)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #6B6779; border-top: 1px solid rgba(31,29,43,0.08);" valign="top">Name</td>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #1F1D2B; font-weight: 600; border-top: 1px solid rgba(31,29,43,0.08);">${escapeHtml(leadName)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #6B6779; border-top: 1px solid rgba(31,29,43,0.08);" valign="top">Firma</td>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #1F1D2B; font-weight: 600; border-top: 1px solid rgba(31,29,43,0.08);">${escapeHtml(leadCompany)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #6B6779; border-top: 1px solid rgba(31,29,43,0.08);" valign="top">E-Mail</td>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; border-top: 1px solid rgba(31,29,43,0.08);"><a href="mailto:${escapeHtml(leadEmail)}" style="color: ${accent}; text-decoration: underline; font-weight: 600;">${escapeHtml(leadEmail)}</a></td>
                      </tr>
                      ${teamRow}
                      ${messageRow}
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #6B6779; border-top: 1px solid rgba(31,29,43,0.08);" valign="top">Eingegangen am</td>
                        <td class="tnum" style="padding: 8px 0; font-size: 14px; line-height: 22px; color: #1F1D2B; font-weight: 600; border-top: 1px solid rgba(31,29,43,0.08);">${escapeHtml(receivedAt)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${factsBg}; border-radius: 14px; border-left: 4px solid ${factsBorder};">
                <tr>
                  <td style="padding: 22px 24px;">
                    <p style="margin: 0 0 10px; font-size: 12px; line-height: 18px; color: ${accent}; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">Vermittelt über Toolfolio</p>
                    <p style="margin: 0 0 12px; font-size: 14px; line-height: 22px; color: #1F1D2B;">
                      Hinterlegter Rabattcode für diesen Interessenten:
                    </p>
                    <p class="codebig tnum" style="margin: 0 0 12px; font-size: 26px; line-height: 32px; color: #1F1D2B; font-weight: 700; letter-spacing: 0.1em; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;">
                      ${escapeHtml(discountCode)}
                    </p>
                    <p style="margin: 0; font-size: 13px; line-height: 20px; color: #6B6779;">
                      Bitte beim Angebot berücksichtigen. Dies ist der dem Interessenten zugesagte Rabatt und dient zugleich der Zuordnung der Vermittlungsprovision.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 16px;">
              <table role="presentation" class="button-wrap" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: ${accent};" bgcolor="${accent}">
                    <a href="${mailtoHref}" class="button-link" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 12px; background-color: ${accent}; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;" aria-label="Direkt antworten">
                      Direkt antworten
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 32px;" align="center">
              <p class="copy" style="margin: 0; font-size: 13px; line-height: 20px; color: #6B6779;">
                Antworte am besten direkt an <a href="mailto:${escapeHtml(leadEmail)}" style="color: #6B6779; text-decoration: underline;">${escapeHtml(leadEmail)}</a>.
              </p>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 32px;">
              <p class="copy" style="margin: 0; font-size: 13px; line-height: 20px; color: #6B6779;">
                <strong style="color: #1F1D2B;">Datenschutz:</strong> Der Interessent hat der Übermittlung dieser Daten an dich zugestimmt. Mit Erhalt bist du für diese personenbezogenen Daten datenschutzrechtlich selbst verantwortlich und verarbeitest sie nur zur Beantwortung der Anfrage. Details in der <a href="${vendorAgreementUrl}" style="color: #6B6779; text-decoration: underline;">Anbieter-Vereinbarung</a>.
              </p>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 0 40px 40px;">
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
              <p style="margin: 0 0 12px;">Du erhältst diese Nachricht, weil dein Tool bei Toolfolio gelistet ist und du Anfragen aktiviert hast.</p>
              <p style="margin: 0 0 12px;"><strong>Absenderkennzeichnung:</strong> ${escapeHtml(legalEntity)}</p>
              <p style="margin: 0 0 12px;">
                <a href="${vendorPortalUrl}" style="color: #6B6779; text-decoration: underline;">Anbieter-Portal</a> &nbsp;&middot;&nbsp;
                <a href="${leadSettingsUrl}" style="color: #6B6779; text-decoration: underline;">Anfrage-Einstellungen</a>
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default leadEmailHTML;
