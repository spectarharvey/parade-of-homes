/**
 * Add the 2026 Parade builder + sponsor FORM ENTRIES to the database.
 *
 * Minimal and reliable: two skipDuplicates inserts, no catalog changes and no
 * big transaction, so it can't time out. Safe to re-run — it only adds entries
 * that aren't already present and never touches anything else.
 *
 * Run with the project's env loaded:
 *   set -a && . ./.env && set +a && npx tsx scripts/add-entries.ts
 */
import { PrismaClient } from "@prisma/client";
import { BUILDER_ENTRIES, SPONSOR_ENTRIES } from "../src/lib/seed";

const prisma = new PrismaClient();

async function main() {
  console.log("BEFORE:", {
    builderEntries: await prisma.builderEntry.count(),
    sponsorEntries: await prisma.sponsorEntry.count(),
  });

  const b = await prisma.builderEntry.createMany({
    data: BUILDER_ENTRIES,
    skipDuplicates: true,
  });
  const s = await prisma.sponsorEntry.createMany({
    data: SPONSOR_ENTRIES,
    skipDuplicates: true,
  });
  console.log(`Inserted ${b.count} builder + ${s.count} sponsor entries.`);

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
