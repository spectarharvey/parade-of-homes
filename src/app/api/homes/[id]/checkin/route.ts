import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const home = await prisma.home.update({
      where: { id },
      data: { checkins: { increment: 1 } },
      select: { checkins: true },
    });
    return json({ checkins: home.checkins });
  } catch {
    return error("Home not found", 404);
  }
}
