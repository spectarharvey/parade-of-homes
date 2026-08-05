import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api";
import { verifyPendingToken, codeMatches } from "@/lib/verify";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Step 2 of registration: confirm the emailed code, then create the Registrant.
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const token = b?.token ? String(b.token) : "";
  const code = b?.code ? String(b.code).replace(/\D/g, "") : "";
  if (!token || !code) return error("Enter the 6-digit verification code");

  const pending = await verifyPendingToken(token);
  if (!pending)
    return error("Your code expired. Please start registration again.", 410);

  if (!codeMatches(pending.codeHash, code))
    return error("That code is incorrect. Please try again.");

  const reg = pending.reg;

  // If this email already has a guest pass, don't create a duplicate — just
  // return it (verifying the code effectively logs them back in).
  const existing = await prisma.registrant.findFirst({
    where: { email: { equals: reg.email, mode: "insensitive" } },
    orderBy: { date: "desc" },
  });
  if (existing) return json(existing, 200);

  const user = await prisma.registrant.create({
    data: {
      first: reg.first,
      last: reg.last,
      email: reg.email,
      phone: reg.phone,
      zip: reg.zip,
      sms: reg.sms,
      checkins: 0,
      date: new Date().toISOString().slice(0, 10),
    },
  });
  return json(user, 201);
}
