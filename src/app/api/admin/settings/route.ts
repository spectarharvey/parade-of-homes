import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { json, error, requireRole } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(req: Request) {
  const session = await requireRole("ADMIN");
  if (session instanceof NextResponse) return session;

  const b = await req.json().catch(() => null);
  const target = Number(b?.target);
  const prize = b?.prize;
  if (!(target >= 1) || typeof prize !== "string")
    return error("A valid target (≥1) and prize description are required");

  const contest = await prisma.contest.upsert({
    where: { id: 1 },
    update: { target, prize },
    create: { id: 1, target, prize },
  });
  return json(contest);
}
