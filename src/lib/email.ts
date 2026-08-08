/**
 * Minimal transactional email via Mailgun's HTTP API (no SDK/dependency).
 *
 * Auth is HTTP Basic with username `api` and the private API key as the
 * password. If MAILGUN_API_KEY / MAILGUN_DOMAIN are unset, delivery is stubbed:
 * the message is logged to the server console instead of sent, so flows stay
 * testable before the provider is wired up.
 *
 * Env:
 *   MAILGUN_API_KEY   private API key (username is always "api")
 *   MAILGUN_DOMAIN    verified sending domain, e.g. "mcbia.org"
 *   EMAIL_FROM        From header, e.g. 'Parade of Homes <admin@mcbia.org>'
 *   MAILGUN_API_BASE  optional; default US "https://api.mailgun.net",
 *                     set "https://api.eu.mailgun.net" for EU accounts
 */

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailInput): Promise<{ delivered: boolean }> {
  const key = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const from = process.env.EMAIL_FROM || "Parade of Homes <admin@mcbia.org>";
  const base = process.env.MAILGUN_API_BASE || "https://api.mailgun.net";

  if (!key || !domain) {
    // No provider configured: log instead of sending so flows stay testable.
    console.warn(
      `[email] MAILGUN_API_KEY/MAILGUN_DOMAIN not set — email to ${to} ("${subject}") not sent (dev fallback).`
    );
    return { delivered: false };
  }

  const form = new URLSearchParams({ from, to, subject, html });
  if (text) form.set("text", text);

  const res = await fetch(`${base}/v3/${domain}/messages`, {
    method: "POST",
    headers: {
      // Basic auth: "api:<key>" base64-encoded.
      Authorization: `Basic ${Buffer.from(`api:${key}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[email] Mailgun send failed:", res.status, detail);
    throw new Error("Could not send the email. Please try again.");
  }
  return { delivered: true };
}

/** Confirmation email sent to a guest right after they create their pass. */
export async function sendWelcomeEmail(to: string, firstName: string) {
  const name = firstName?.trim() || "there";
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:auto;padding:24px">
      <h2 style="color:#033256;margin:0 0 8px">Welcome to the Parade, ${name}! 🎉</h2>
      <p style="color:#333;font-size:15px;line-height:1.5">
        Your 2026 MCBIA Parade of Homes guest pass is ready. Check in at each home
        with one tap to fill your contest card and enter to win.
      </p>
      <p style="color:#333;font-size:15px;line-height:1.5">
        Log back in any time with your email and the password you just set.
      </p>
      <p style="color:#777;font-size:13px;margin-top:20px">
        See you on the Parade!<br/>The MCBIA Team
      </p>
    </div>`;
  const textVersion =
    `Welcome to the Parade, ${name}!\n\n` +
    `Your 2026 MCBIA Parade of Homes guest pass is ready. Check in at each home ` +
    `to fill your contest card and enter to win.\n\n` +
    `Log back in any time with your email and the password you just set.\n\n` +
    `See you on the Parade!\nThe MCBIA Team`;

  return sendEmail({
    to,
    subject: "Your Parade of Homes guest pass is ready 🎉",
    html,
    text: textVersion,
  });
}
