import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api";
import { verifyLoginToken, codeMatches } from "@/lib/verify";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Returning-guest login, step 2: confirm the emailed code, then return the
// existing registrant so the guest session can be restored.
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const token = b?.token ? String(b.token) : "";
  const code = b?.code ? String(b.code).replace(/\D/g, "") : "";
  if (!token || !code) return error("Enter the 6-digit login code");

  const pending = await verifyLoginToken(token);
  if (!pending)
    return error("Your code expired. Please request a new one.", 410);

  if (!codeMatches(pending.codeHash, code))
    return error("That code is incorrect. Please try again.");

  const user = await prisma.registrant.findUnique({ where: { id: pending.uid } });
  if (!user)
    return error("That guest pass no longer exists. Please register.", 404);

  return json(user, 200);
}
