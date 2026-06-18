import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { json, error, requireRole } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Save the builder's ad-space text.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireRole("ADMIN");
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (typeof body?.ad !== "string") return error("`ad` text is required");
  try {
    const builder = await prisma.builder.update({
      where: { id },
      data: { ad: body.ad },
    });
    return json(builder);
  } catch {
    return error("Builder not found", 404);
  }
}
