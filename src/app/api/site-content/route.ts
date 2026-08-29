import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { json, error, requireRole } from "@/lib/api";
import { readSiteContentRows } from "@/lib/cms/server";
import { CMS_PAGE_SLUGS } from "@/lib/cms/registry";
import type { CmsFieldType } from "@/lib/cms/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TYPES: CmsFieldType[] = [
  "text",
  "textarea",
  "multiline",
  "html",
  "image",
  "url",
];

/**
 * GET /api/site-content?page=home              → { "<key>": "<value>" }
 * GET /api/site-content?page=global,home       → the two maps merged
 * GET /api/site-content?page=all               → every page
 * GET /api/site-content?page=home&verbose=1    → { "<key>": { value, type } }
 *
 * Public and unauthenticated — the live site reads it. Only stored OVERRIDES
 * come back; anything absent falls through to the page's built-in default.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = (url.searchParams.get("page") || "").trim();
  const verbose = url.searchParams.get("verbose") === "1";

  const requested =
    raw === "all"
      ? CMS_PAGE_SLUGS
      : raw
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);

  if (!requested.length) return error("A `page` query parameter is required");

  const rows = await readSiteContentRows(requested);

  // Keys are page-namespaced (shared ones start with `global.`), so merging a
  // comma list into one flat map cannot collide.
  const out: Record<string, unknown> = {};
  for (const r of rows) {
    out[r.key] = verbose ? { value: r.value, type: r.type } : r.value;
  }
  return json(out);
}

/**
 * PUT /api/site-content  (admin only)
 * body: { page, values: { "<key>": { value, type } | null } }
 *
 * Upserts on (page, key); a `null` DELETES the override so the page falls back
 * to its built-in default. All changes are applied in one transaction.
 */
export async function PUT(req: Request) {
  const session = await requireRole("ADMIN");
  if (session instanceof NextResponse) return session;

  const body = await req.json().catch(() => null);
  const page = typeof body?.page === "string" ? body.page.trim() : "";
  const values = body?.values;

  if (!page) return error("`page` is required");
  if (!CMS_PAGE_SLUGS.includes(page)) return error(`Unknown page "${page}"`);
  if (!values || typeof values !== "object" || Array.isArray(values))
    return error("`values` must be an object");

  const entries = Object.entries(values as Record<string, unknown>);
  if (entries.length > 500) return error("Too many fields in one save");

  const ops = [];
  for (const [key, entry] of entries) {
    if (!key) return error("Empty key");

    if (entry === null) {
      ops.push(
        prisma.siteContent.deleteMany({ where: { page, key } }),
      );
      continue;
    }
    if (typeof entry !== "object") return error(`Bad value for "${key}"`);

    const { value, type } = entry as { value?: unknown; type?: unknown };
    if (typeof value !== "string") return error(`"${key}" must be a string`);
    const fieldType = TYPES.includes(type as CmsFieldType)
      ? (type as CmsFieldType)
      : "text";

    ops.push(
      prisma.siteContent.upsert({
        where: { page_key: { page, key } },
        create: { page, key, type: fieldType, value },
        update: { type: fieldType, value },
      }),
    );
  }

  try {
    await prisma.$transaction(ops);
  } catch (e) {
    console.error("[site-content] save failed:", (e as Error).message);
    return error("Could not save website content", 500);
  }

  return json({ ok: true, count: ops.length });
}
