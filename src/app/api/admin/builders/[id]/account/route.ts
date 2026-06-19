import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { json, error, requireRole } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Admin creates / updates the login account for a builder (BUILDER role).
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireRole("ADMIN");
  if (session instanceof NextResponse) return session;
  const { id } = await params;

  const b = await req.json().catch(() => ({}));
  const email = String(b.email || "").toLowerCase().trim();
  const password = String(b.password || "");
  if (!email || password.length < 6)
    return error("A valid email and a password (min 6 chars) are required");

  const builder = await prisma.builder.findUnique({ where: { id } });
  if (!builder) return error("Builder not found", 404);

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const existing = await prisma.account.findUnique({
      where: { builderId: id },
    });
    if (existing) {
      await prisma.account.update({
        where: { id: existing.id },
        data: { email, passwordHash, role: "BUILDER" },
      });
    } else {
      await prisma.account.create({
        data: { email, passwordHash, role: "BUILDER", builderId: id },
      });
    }
    return json({ ok: true, email });
  } catch (e) {
    console.error("[builder account]", (e as Error).message);
    return error("That email is already in use by another account.", 409);
  }
}
