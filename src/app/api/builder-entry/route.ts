import { json, error } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Public: a builder submits the 2026 Parade Model Home Entry Form.
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON", 400);
  }

  const s = (k: string) => (typeof body[k] === "string" ? (body[k] as string).trim() : "");

  // Required core fields.
  const required = [
    "contactName",
    "contactPhone",
    "contactEmail",
    "builderName",
    "builderPhone",
    "builderEmail",
    "website",
    "license",
    "modelName",
    "sqftLiving",
    "sqftTotal",
    "beds",
    "baths",
    "garage",
    "price",
    "buildType",
    "staged",
    "entryLevel",
    "paymentMethod",
    "signature",
  ];
  for (const k of required) {
    if (!s(k)) return error(`Missing required field: ${k}`, 422);
  }

  try {
    const created = await prisma.builderEntry.create({
      data: {
        contactName: s("contactName"),
        contactPhone: s("contactPhone"),
        contactEmail: s("contactEmail"),
        builderName: s("builderName"),
        builderContact: s("builderContact") || null,
        builderPhone: s("builderPhone"),
        builderEmail: s("builderEmail"),
        website: s("website"),
        officeAddress: s("officeAddress") || null,
        license: s("license"),
        modelName: s("modelName"),
        sqftLiving: s("sqftLiving"),
        sqftTotal: s("sqftTotal"),
        beds: s("beds"),
        baths: s("baths"),
        garage: s("garage"),
        subdivision: s("subdivision") || null,
        modelAddress: s("modelAddress") || null,
        price: s("price"),
        buildType: s("buildType"),
        staged: s("staged"),
        entryLevel: s("entryLevel"),
        paymentMethod: s("paymentMethod"),
        signature: s("signature"),
        billingName: s("billingName") || null,
        receiptEmail: s("receiptEmail") || null,
        billingAddress: s("billingAddress") || null,
        frontElevation: s("frontElevation") || null,
        logo: s("logo") || null,
        floorPlan: s("floorPlan") || null,
        details: (body.details as object) ?? undefined,
      },
    });
    return json({ ok: true, id: created.id }, 201);
  } catch (e) {
    console.error("[builder-entry] failed:", (e as Error).message);
    return error("Could not save entry", 500);
  }
}
