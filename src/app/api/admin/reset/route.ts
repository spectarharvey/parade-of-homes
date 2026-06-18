import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedDatabase } from "@/lib/seedDb";
import { json, requireRole } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const session = await requireRole("ADMIN");
  if (session instanceof NextResponse) return session;
  await seedDatabase(prisma);
  return json({ ok: true });
}
