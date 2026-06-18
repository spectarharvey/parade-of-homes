import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { json, error, requireRole } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireRole("ADMIN");
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  const home = await prisma.home.findUnique({
    where: { id },
    select: { featured: true },
  });
  if (!home) return error("Home not found", 404);
  const updated = await prisma.home.update({
    where: { id },
    data: { featured: !home.featured },
    select: { featured: true },
  });
  return json(updated);
}
