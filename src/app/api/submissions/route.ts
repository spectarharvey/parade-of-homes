import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b?.builder || !b?.home || !b?.contact)
    return error("Builder name, home name, and contact email are required");

  const submission = await prisma.submission.create({
    data: {
      builder: String(b.builder),
      home: String(b.home),
      nb: String(b.nb ?? ""),
      style: String(b.style ?? ""),
      price: Number(b.price) || 0,
      beds: Number(b.beds) || 0,
      baths: Number(b.baths) || 0,
      sqft: Number(b.sqft) || 0,
      status: "pending",
      date: new Date().toISOString().slice(0, 10),
      contact: String(b.contact),
    },
  });
  return json(submission, 201);
}
