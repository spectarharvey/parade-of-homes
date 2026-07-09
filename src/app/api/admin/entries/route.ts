import { json, error, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Admin: list all 2026 Parade Builder + Sponsor entries.
export async function GET() {
  const session = await requireRole("ADMIN");
  if (session instanceof Response) return session;

  const [builderEntries, sponsorEntries] = await Promise.all([
    prisma.builderEntry.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.sponsorEntry.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  return json({ builderEntries, sponsorEntries });
}

// Admin: update an entry's status.
export async function PATCH(req: Request) {
  const session = await requireRole("ADMIN");
  if (session instanceof Response) return session;

  let body: { kind?: string; id?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON", 400);
  }
  const { kind, id, status } = body;
  if (!id || !kind || !status) return error("kind, id, status required", 422);
  if (!["NEW", "REVIEWED", "APPROVED", "ARCHIVED"].includes(status))
    return error("Invalid status", 422);

  try {
    if (kind === "sponsor") {
      await prisma.sponsorEntry.update({ where: { id }, data: { status } });
    } else {
      await prisma.builderEntry.update({ where: { id }, data: { status } });
    }
    return json({ ok: true });
  } catch (e) {
    console.error("[entries] update failed:", (e as Error).message);
    return error("Could not update entry", 500);
  }
}
