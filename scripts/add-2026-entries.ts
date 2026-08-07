/**
 * Add the 2026 Parade builder + sponsor form entries to the database.
 *
 * Non-destructive: inserts any entries from SEED that aren't already present
 * (matched by id via skipDuplicates) and touches nothing else. Safe to re-run.
 *
 * Run with the project's env loaded:
 *   set -a && . ./.env && set +a && npx tsx scripts/add-2026-entries.ts
 */
import { PrismaClient } from "@prisma/client";
import { BUILDER_ENTRIES, SPONSOR_ENTRIES } from "../src/lib/seed";

const prisma = new PrismaClient();

async function main() {
  const before = {
    builderEntries: await prisma.builderEntry.count(),
    sponsorEntries: await prisma.sponsorEntry.count(),
  };
  console.log("BEFORE:", before);

  const b = await prisma.builderEntry.createMany({
    data: BUILDER_ENTRIES,
    skipDuplicates: true,
  });
  const s = await prisma.sponsorEntry.createMany({
    data: SPONSOR_ENTRIES,
    skipDuplicates: true,
  });

  console.log(`Inserted ${b.count} builder entr${b.count === 1 ? "y" : "ies"}, ${s.count} sponsor entr${s.count === 1 ? "y" : "ies"}.`);
  console.log("AFTER: ", {
    builderEntries: await prisma.builderEntry.count(),
    sponsorEntries: await prisma.sponsorEntry.count(),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
