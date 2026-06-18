import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b?.first || !b?.last || !b?.email || !b?.zip)
    return error("First name, last name, email, and ZIP are required");

  const user = await prisma.registrant.create({
    data: {
      first: String(b.first),
      last: String(b.last),
      email: String(b.email),
      phone: String(b.phone ?? ""),
      zip: String(b.zip),
      sms: Boolean(b.sms),
      checkins: 0,
      date: new Date().toISOString().slice(0, 10),
    },
  });
  return json(user, 201);
}
