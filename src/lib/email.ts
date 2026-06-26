/** E-01: Transaktionsmail-Versand über Resend. Nur serverseitig nutzen. */

import "server-only";

export type SendResult = { ok?: boolean; id?: string; error?: string };

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) return { error: "Resend ist nicht konfiguriert (RESEND_API_KEY/EMAIL_FROM)." };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) return { error: json.message ?? `Resend ${res.status}` };
    return { ok: true, id: json.id };
  } catch {
    return { error: "Mailversand fehlgeschlagen." };
  }
}
