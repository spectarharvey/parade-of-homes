import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { json, error, requireRole } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await requireRole("ADMIN");
  if (session instanceof NextResponse) return session;

  const b = await req.json().catch(() => null);
  if (!b?.msg) return error("Message is required");

  const optin = await prisma.registrant.count({ where: { sms: true } });
  const audience = String(b.audience ?? "All opted-in users");
  const count = audience.toLowerCase().includes("opted")
    ? optin
    : Math.round(optin * 0.7);

  const now = new Date();
  const sent =
    now.toISOString().slice(0, 10) +
    " " +
    now.toTimeString().slice(0, 5);

  const notification = await prisma.notification.create({
    data: {
      type: String(b.type ?? "Announcement"),
      msg: String(b.msg),
      audience,
      sent,
      count,
    },
  });
  // NOTE: real SMS/push delivery is a later phase — this records the send only.
  return json({ notification, recipients: optin }, 201);
}
