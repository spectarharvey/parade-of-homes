import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api";
import { generateCode, hmacCode, signLoginToken } from "@/lib/verify";
import { sendVerificationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Returning-guest login, step 1: look up the registration by email and, if it
// exists, email a login code. No password — proof of email ownership is enough.
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const email = b?.email ? String(b.email).trim() : "";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return error("Please enter a valid email address");

  const registrant = await prisma.registrant.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    orderBy: { date: "desc" },
  });
  if (!registrant)
    return error(
      "We couldn't find a guest pass for that email. Please register instead.",
      404
    );

  const code = generateCode();
  const token = await signLoginToken(registrant.id, registrant.email, hmacCode(code));

  try {
    const { devCode } = await sendVerificationEmail(registrant.email, code);
    return json({ token, devCode, email: registrant.email }, 200);
  } catch (e) {
    return error(
      e instanceof Error ? e.message : "Could not send the login code",
      502
    );
  }
}
