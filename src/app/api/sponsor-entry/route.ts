import { json, error } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Public: a sponsor submits the 2026 Parade Sponsor Form.
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON", 400);
  }

  const s = (k: string) => (typeof body[k] === "string" ? (body[k] as string).trim() : "");

  const required = [
    "contactName",
    "contactPhone",
    "contactEmail",
    "companyName",
    "companyPhone",
    "companyEmail",
    "website",
    "level",
    "paymentMethod",
    "signature",
  ];
  for (const k of required) {
    if (!s(k)) return error(`Missing required field: ${k}`, 422);
  }

  try {
    const created = await prisma.sponsorEntry.create({
      data: {
        contactName: s("contactName"),
        contactPhone: s("contactPhone"),
        contactEmail: s("contactEmail"),
        companyName: s("companyName"),
        companyPhone: s("companyPhone"),
        companyEmail: s("companyEmail"),
        website: s("website"),
        companyAddress: s("companyAddress") || null,
        level: s("level"),
        paymentMethod: s("paymentMethod"),
        signature: s("signature"),
        billingName: s("billingName") || null,
        billingEmail: s("billingEmail") || null,
        billingAddress: s("billingAddress") || null,
        logo: s("logo") || null,
        ad: s("ad") || null,
        details: (body.details as object) ?? undefined,
      },
    });
    return json({ ok: true, id: created.id }, 201);
  } catch (e) {
    console.error("[sponsor-entry] failed:", (e as Error).message);
    return error("Could not save entry", 500);
  }
}
