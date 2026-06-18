import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { json, error, requireRole } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireRole("ADMIN");
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  try {
    await prisma.home.delete({ where: { id } });
    return json({ ok: true });
  } catch {
    return error("Home not found", 404);
  }
}
