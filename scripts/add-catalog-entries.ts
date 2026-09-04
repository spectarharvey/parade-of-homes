/**
 * Add 2026 Parade catalog rows + form entries from the seed file that are not
 * yet in the database.
 *
 * Purely additive and idempotent: every insert uses `skipDuplicates`, so rows
 * that already exist are left exactly as they are (including any edits made in
 * the admin) and nothing is ever updated or deleted. Safe to re-run.
 *
 * Use this when a new builder entry has been appended to src/lib/seed.ts and
 * needs to appear on the live site — unlike `db:seed`, it will not wipe the
 * database back to the starter catalog.
 *
 * DRY RUN BY DEFAULT: it prints exactly which rows are missing and stops.
 * Pass `--apply` to actually write. Pass `--only=<substring>` to restrict the
 * insert to specific ids, which is what you want when adding one new entry —
 * without it, any seed row an admin has deliberately DELETED would come back.
 *
 * Run with the project's env loaded:
 *   set -a && . ./.env && set +a && npx tsx scripts/add-catalog-entries.ts --only=kp
 *   set -a && . ./.env && set +a && npx tsx scripts/add-catalog-entries.ts --only=kp --apply
 */
import { PrismaClient } from "@prisma/client";
import { SEED, BUILDER_ENTRIES, SPONSOR_ENTRIES } from "../src/lib/seed";

const prisma = new PrismaClient();

const APPLY = process.argv.includes("--apply");
// Comma-separated id substrings, e.g. --only=kp,livingston. A new entry usually
// needs its builder, its home AND its neighbourhood, whose ids differ.
const ONLY = (process.argv.find((a) => a.startsWith("--only="))?.slice(7) ?? "")
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);
const keep = <T extends { id: string }>(rows: T[]) =>
  ONLY.length ? rows.filter((r) => ONLY.some((o) => r.id.includes(o))) : rows;

async function counts() {
  const [builders, neighborhoods, homes, sponsors, builderEntries, sponsorEntries] =
    await Promise.all([
      prisma.builder.count(),
      prisma.neighborhood.count(),
      prisma.home.count(),
      prisma.sponsor.count(),
      prisma.builderEntry.count(),
      prisma.sponsorEntry.count(),
    ]);
  return { builders, neighborhoods, homes, sponsors, builderEntries, sponsorEntries };
}

async function main() {
  console.log(
    `${APPLY ? "APPLY" : "DRY RUN"}${ONLY.length ? ` — only ids containing: ${ONLY.join(", ")}` : " — ALL seed rows"}\n`,
  );
  console.log("BEFORE:", await counts());

  const homeRows = keep(SEED.homes).map((home) => ({
    id: home.id,
    name: home.name,
    color: home.color,
    builderId: home.builder,
    nbId: home.nb,
    style: home.style,
    price: home.price,
    beds: home.beds,
    baths: home.baths,
    sqft: home.sqft,
    garage: home.garage,
    checkins: home.checkins,
    rating: home.rating,
    ratings: home.ratings,
    featured: home.featured,
    x: home.x,
    y: home.y,
    lat: home.lat ?? null,
    lng: home.lng ?? null,
    blurb: home.blurb,
    address: home.address,
    features: home.features,
    imgs: home.imgs,
  }));

  // Neighbourhoods and builders first — homes reference both.
  const plan = [
    { label: "neighborhoods", rows: keep(SEED.neighborhoods), model: prisma.neighborhood },
    { label: "builders", rows: keep(SEED.builders), model: prisma.builder },
    { label: "sponsors", rows: keep(SEED.sponsors), model: prisma.sponsor },
    { label: "homes", rows: homeRows, model: prisma.home },
    { label: "builderEntries", rows: keep(BUILDER_ENTRIES), model: prisma.builderEntry },
    { label: "sponsorEntries", rows: keep(SPONSOR_ENTRIES), model: prisma.sponsorEntry },
  ] as const;

  // Report precisely what is missing before writing anything.
  let missingTotal = 0;
  for (const { label, rows, model } of plan) {
    if (!rows.length) continue;
    const ids = rows.map((r) => r.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const present = await (model as any).findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    const have = new Set(present.map((r: { id: string }) => r.id));
    const missing = ids.filter((id) => !have.has(id));
    missingTotal += missing.length;
    console.log(
      `  ${label}: ${missing.length} missing of ${ids.length}` +
        (missing.length ? ` → ${missing.join(", ")}` : ""),
    );
  }

  if (!APPLY) {
    console.log(
      `\n${missingTotal} row(s) would be inserted. Re-run with --apply to write them.`,
    );
    return;
  }

  const inserted: Record<string, number> = {};
  for (const { label, rows, model } of plan) {
    if (!rows.length) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await (model as any).createMany({ data: rows, skipDuplicates: true });
    inserted[label] = res.count;
  }

  console.log("\nInserted:", inserted);
  console.log("AFTER: ", await counts());
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
