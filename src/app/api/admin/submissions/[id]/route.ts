import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { json, error, requireRole } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireRole("ADMIN");
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const status = body?.status;
  if (status !== "approved" && status !== "rejected")
    return error("status must be 'approved' or 'rejected'");
  try {
    const submission = await prisma.submission.update({
      where: { id },
      data: { status },
    });
    return json(submission);
  } catch {
    return error("Submission not found", 404);
  }
}
