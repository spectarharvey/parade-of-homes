import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeHome } from "@/lib/serialize";
import { json, error, requireRole } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const num = (v: unknown, d = 0) =>
  v === undefined || v === null || v === "" ? d : Number(v);
const arr = (v: unknown): string[] =>
  Array.isArray(v)
    ? v.filter(Boolean).map(String)
    : typeof v === "string"
      ? v.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

// Confirms the home exists AND belongs to the logged-in builder.
async function ownOr(res: { id: string }, builderId: string | null) {
  if (!builderId) return null;
  const home = await prisma.home.findUnique({ where: { id: res.id } });
  if (!home || home.builderId !== builderId) return null;
  return home;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireRole("BUILDER");
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  const owned = await ownOr({ id }, session.builderId);
  if (!owned) return error("Not found", 404);

  const b = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  if (b.name !== undefined) data.name = String(b.name);
  if (b.nb !== undefined) data.nbId = String(b.nb);
  if (b.style !== undefined) data.style = String(b.style);
  if (b.blurb !== undefined) data.blurb = String(b.blurb);
  for (const k of ["price", "beds", "baths", "sqft", "garage", "x", "y"] as const) {
    if (b[k] !== undefined) data[k] = num(b[k]);
  }
  if (b.features !== undefined) data.features = arr(b.features);
  if (b.imgs !== undefined) data.imgs = arr(b.imgs);
  // builderId and featured are intentionally not editable by builders.

  try {
    const home = await prisma.home.update({ where: { id }, data });
    return json(serializeHome(home));
  } catch {
    return error("Could not update", 400);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireRole("BUILDER");
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  const owned = await ownOr({ id }, session.builderId);
  if (!owned) return error("Not found", 404);
  await prisma.home.delete({ where: { id } });
  return json({ ok: true });
}
