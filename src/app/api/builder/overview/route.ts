import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeHome } from "@/lib/serialize";
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

  const [homes, neighborhoods] = await Promise.all([
    session.builderId
      ? prisma.home.findMany({
          where: { builderId: session.builderId },
          orderBy: { id: "asc" },
        })
      : Promise.resolve([]),
    prisma.neighborhood.findMany({
      orderBy: { id: "asc" },
      select: { id: true, name: true, city: true },
    }),
  ]);

  return json({
    email: session.email,
    builder,
    submissions,
    homes: homes.map(serializeHome),
    neighborhoods,
  });
}
