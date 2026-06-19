import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { json, requireRole } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// The logged-in builder's own profile + their submissions.
export async function GET() {
  const session = await requireRole("BUILDER");
  if (session instanceof NextResponse) return session;

  const builder = session.builderId
    ? await prisma.builder.findUnique({ where: { id: session.builderId } })
    : null;

  const submissions = await prisma.submission.findMany({
    where: session.builderId
      ? { builderId: session.builderId }
      : { contact: session.email },
    orderBy: { date: "desc" },
  });

  return json({ email: session.email, builder, submissions });
}
