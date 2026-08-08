import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api";
import { sendWelcomeEmail } from "@/lib/email";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MIN_PASSWORD = 8;

/** Strip the password hash before sending a registrant back to the client. */
function publicUser<T extends { passwordHash?: string | null }>(u: T) {
  const { passwordHash: _omit, ...rest } = u;
  return rest;
}

// Create a guest pass secured with a password. If the email already has a pass
// without a password (a legacy/OTP registrant), re-registering claims it and
// sets the password. If it already has a password, they should log in instead.
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b?.first || !b?.last || !b?.email || !b?.zip)
    return error("First name, last name, email, and ZIP are required");

  const email = String(b.email).trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return error("Please enter a valid email address");

  const password = String(b.password ?? "");
  if (password.length < MIN_PASSWORD)
    return error(`Password must be at least ${MIN_PASSWORD} characters`);

  const passwordHash = await bcrypt.hash(password, 10);

  const fields = {
    first: String(b.first).trim(),
    last: String(b.last).trim(),
    email,
    phone: String(b.phone ?? "").trim(),
    zip: String(b.zip).trim(),
    sms: Boolean(b.sms),
  };

  const existing = await prisma.registrant.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    orderBy: { date: "desc" },
  });

  if (existing?.passwordHash)
    return error(
      "An account with this email already exists. Please log in instead.",
      409
    );

  // Legacy pass with no password yet — claim it and set the password.
  if (existing) {
    const updated = await prisma.registrant.update({
      where: { id: existing.id },
      data: { ...fields, passwordHash },
    });
    await sendWelcome(updated.email, updated.first);
    return json(publicUser(updated), 200);
  }

  const user = await prisma.registrant.create({
    data: {
      ...fields,
      passwordHash,
      checkins: 0,
      date: new Date().toISOString().slice(0, 10),
    },
  });
  await sendWelcome(user.email, user.first);
  return json(publicUser(user), 201);
}

// Send the welcome email but never let a delivery failure fail registration.
async function sendWelcome(email: string, first: string) {
  try {
    await sendWelcomeEmail(email, first);
  } catch (e) {
    console.error("[register] welcome email failed:", (e as Error).message);
  }
}
