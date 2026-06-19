import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { json, error, requireRole } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// A builder edits their own profile (limited fields). Cannot change featured
// status or which builder record they own.
export async function PATCH(req: Request) {
  const session = await requireRole("BUILDER");
  if (session instanceof NextResponse) return session;
  if (!session.builderId)
    return error("No builder profile is linked to this account", 400);

  const b = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  for (const key of ["blurb", "phone", "website", "ad"] as const) {
    if (b[key] !== undefined) data[key] = String(b[key]);
  }
  if (b.years !== undefined) data.years = Number(b.years) || 0;

  try {
    const builder = await prisma.builder.update({
      where: { id: session.builderId },
      data,
    });
    return json(builder);
  } catch {
    return error("Could not update profile", 400);
  }
}
