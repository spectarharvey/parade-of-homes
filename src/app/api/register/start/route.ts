import { json, error } from "@/lib/api";
import { generateCode, hmacCode, signPendingToken } from "@/lib/verify";
import { sendVerificationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Step 1 of registration: validate, email a verification code, and return a
// short-lived token that carries the pending data (no DB row yet).
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b?.first || !b?.last || !b?.email || !b?.zip)
    return error("First name, last name, email, and ZIP are required");

  const email = String(b.email).trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return error("Please enter a valid email address");

  const reg = {
    first: String(b.first).trim(),
    last: String(b.last).trim(),
    email,
    phone: String(b.phone ?? "").trim(),
    zip: String(b.zip).trim(),
    sms: Boolean(b.sms),
  };

  const code = generateCode();
  const token = await signPendingToken(reg, hmacCode(code));

  try {
    const { devCode } = await sendVerificationEmail(email, code);
    return json({ token, devCode, email }, 200);
  } catch (e) {
    return error(
      e instanceof Error ? e.message : "Could not send the verification email",
      502
    );
  }
}
