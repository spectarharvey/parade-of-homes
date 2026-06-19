import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { json, error, requireRole } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// A builder submits a new home/neighborhood listing for admin review.
export async function POST(req: Request) {
  const session = await requireRole("BUILDER");
  if (session instanceof NextResponse) return session;

  const b = await req.json().catch(() => null);
  if (!b?.home) return error("Home/model name is required");

  // Use the builder's own company name from their profile when available.
  const builder = session.builderId
    ? await prisma.builder.findUnique({ where: { id: session.builderId } })
    : null;

  const submission = await prisma.submission.create({
    data: {
      builder: builder?.name || String(b.builder || "—"),
      home: String(b.home),
      nb: String(b.nb ?? ""),
      style: String(b.style ?? ""),
      price: Number(b.price) || 0,
      beds: Number(b.beds) || 0,
      baths: Number(b.baths) || 0,
      sqft: Number(b.sqft) || 0,
      blurb: String(b.blurb ?? ""),
      imgs: Array.isArray(b.imgs) ? b.imgs.filter(Boolean).map(String) : [],
      status: "pending",
      date: new Date().toISOString().slice(0, 10),
      contact: session.email,
      builderId: session.builderId ?? null,
    },
  });
  return json(submission, 201);
}
