/**
 * Minimal transactional email via Resend's HTTP API (no SDK/dependency).
 *
 * If RESEND_API_KEY is unset, delivery is stubbed: the code is logged to the
 * server console, and (in non-production only) returned as `devCode` so the
 * verification flow is testable before a provider is wired up. Add
 * RESEND_API_KEY (and optionally EMAIL_FROM) to .env to send real email.
 */
export async function sendVerificationEmail(
  to: string,
  code: string
): Promise<{ delivered: boolean; devCode?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Parade of Homes <onboarding@resend.dev>";

  if (!key) {
    console.log(`[dev] Parade of Homes verification code for ${to}: ${code}`);
    // In production a missing provider must fail loudly — otherwise the guest is
    // stranded on the code screen with no code and no email.
    if (process.env.NODE_ENV === "production") {
      console.error(
        "RESEND_API_KEY is not set — cannot email verification codes in production."
      );
      throw new Error(
        "Email delivery isn't set up yet. Please try again shortly or contact the event team."
      );
    }
    return { delivered: false, devCode: code };
  }

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:auto;padding:24px">
      <h2 style="color:#033256;margin:0 0 8px">Verify your email</h2>
      <p style="color:#333;font-size:15px;line-height:1.5">
        Enter this code to finish creating your 2026 Parade of Homes guest pass:
      </p>
      <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:#116799;margin:16px 0">
        ${code}
      </div>
      <p style="color:#777;font-size:13px">This code expires in 10 minutes. If you didn't request it, you can ignore this email.</p>
    </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Your Parade of Homes verification code",
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Resend email failed:", res.status, detail);
    throw new Error("Could not send the verification email. Please try again.");
  }
  return { delivered: true };
}
