import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { json, requireRole } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Make this builder the single featured builder.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireRole("ADMIN");
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  await prisma.$transaction([
    prisma.builder.updateMany({ data: { featured: false } }),
    prisma.builder.update({ where: { id }, data: { featured: true } }),
  ]);
  return json({ ok: true });
}
