/**
 * Add the new 2026 Parade builders and form entries to the database.
 *
 * Non-destructive: inserts anything from SEED that isn't already present
 * (matched by id via skipDuplicates) and touches nothing else. Safe to re-run.
 *
 * Adds:
 *   - Public builders (shown in admin → Builders and the public Builders page)
 *   - Builder + sponsor form entries (shown in admin → Entries & Forms)
 *
 * Run with the project's env loaded:
 *   set -a && . ./.env && set +a && npx tsx scripts/add-2026-parade.ts
 */
import { PrismaClient } from "@prisma/client";
import { SEED, BUILDER_ENTRIES, SPONSOR_ENTRIES } from "../src/lib/seed";

const prisma = new PrismaClient();

async function main() {
  console.log("BEFORE:", {
    builders: await prisma.builder.count(),
    builderEntries: await prisma.builderEntry.count(),
    sponsorEntries: await prisma.sponsorEntry.count(),
  });

  const builders = await prisma.builder.createMany({
    data: SEED.builders,
    skipDuplicates: true,
  });
  const bEntries = await prisma.builderEntry.createMany({
    data: BUILDER_ENTRIES,
    skipDuplicates: true,
  });
  const sEntries = await prisma.sponsorEntry.createMany({
    data: SPONSOR_ENTRIES,
    skipDuplicates: true,
  });

  console.log(
    `Inserted ${builders.count} builder(s), ${bEntries.count} builder entr(y/ies), ${sEntries.count} sponsor entr(y/ies).`,
  );
  console.log("AFTER: ", {
    builders: await prisma.builder.count(),
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
