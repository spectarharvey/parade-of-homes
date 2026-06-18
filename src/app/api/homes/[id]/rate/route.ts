import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const val = Number(body?.val);
  if (!(val >= 1 && val <= 5)) return error("Rating must be 1–5");

  const home = await prisma.home.findUnique({
    where: { id },
    select: { rating: true, ratings: true },
  });
  if (!home) return error("Home not found", 404);

  const rating = +(
    (home.rating * home.ratings + val) /
    (home.ratings + 1)
  ).toFixed(2);
  const updated = await prisma.home.update({
    where: { id },
    data: { rating, ratings: home.ratings + 1 },
    select: { rating: true, ratings: true },
  });
  return json(updated);
}
