import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Returning-guest login: verify the email + password against the stored hash
// and return the registrant so the guest session can be restored.
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const email = b?.email ? String(b.email).trim() : "";
  const password = b?.password ? String(b.password) : "";
  if (!email || !password) return error("Email and password are required");

  const registrant = await prisma.registrant.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    orderBy: { date: "desc" },
  });
  if (!registrant)
    return error(
      "We couldn't find a guest pass for that email. Please register instead.",
      404
    );

  if (!registrant.passwordHash)
    return error(
      "This guest pass doesn't have a password yet. Please register again to set one.",
      409
    );

  const ok = await bcrypt.compare(password, registrant.passwordHash);
  if (!ok) return error("Incorrect password. Please try again.", 401);

  const { passwordHash: _omit, ...safe } = registrant;
  return json(safe, 200);
}
