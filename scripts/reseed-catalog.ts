/**
 * Catalog-only re-seed.
 *
 * Replaces the DB's catalog (neighborhoods, builders, sponsors, homes, FAQs)
 * with the current `SEED` so the database matches the real 2026 data the site
 * shows — which lets the admin panel read/write the same source and persist.
 *
 * PRESERVES real data: registrants (visitor sign-ups), submissions,
 * notifications, contest config, and login accounts are never touched.
 *
 * Run with the project's env loaded:
 *   set -a && . ./.env && set +a && npx tsx scripts/reseed-catalog.ts
 */
import { PrismaClient } from "@prisma/client";
import { SEED, BUILDER_ENTRIES, SPONSOR_ENTRIES } from "../src/lib/seed";

const prisma = new PrismaClient();

async function counts() {
  const [homes, builders, neighborhoods, sponsors, faqs, registrants, accounts, submissions] =
    await Promise.all([
      prisma.home.count(),
      prisma.builder.count(),
      prisma.neighborhood.count(),
      prisma.sponsor.count(),
      prisma.faq.count(),
      prisma.registrant.count(),
      prisma.account.count(),
      prisma.submission.count(),
    ]);
  return { homes, builders, neighborhoods, sponsors, faqs, registrants, accounts, submissions };
}

async function main() {
  console.log("BEFORE:", await counts());

  // Replace the catalog atomically. Homes cascade-delete with their builder /
  // neighborhood; the builder account's builderId is set null (not deleted).
  await prisma.$transaction([
    prisma.home.deleteMany(),
    prisma.sponsor.deleteMany(),
    prisma.faq.deleteMany(),
    prisma.builder.deleteMany(),
    prisma.neighborhood.deleteMany(),
    prisma.neighborhood.createMany({ data: SEED.neighborhoods }),
    prisma.builder.createMany({ data: SEED.builders }),
    prisma.sponsor.createMany({ data: SEED.sponsors }),
    prisma.home.createMany({
      data: SEED.homes.map((h) => ({
        id: h.id,
        name: h.name,
        color: h.color,
        builderId: h.builder,
        nbId: h.nb,
        style: h.style,
        price: h.price,
        beds: h.beds,
        baths: h.baths,
        sqft: h.sqft,
        garage: h.garage,
        checkins: h.checkins,
        rating: h.rating,
        ratings: h.ratings,
        featured: h.featured,
        x: h.x,
        y: h.y,
        blurb: h.blurb,
        features: h.features,
        imgs: h.imgs,
      })),
    }),
    prisma.faq.createMany({
      data: SEED.faqs.map((f, i) => ({ q: f.q, a: f.a, order: i })),
    }),
    // Re-link the builder portal login to the real featured builder.
    prisma.account.updateMany({
      where: { role: "BUILDER" },
      data: { builderId: "b_brije" },
    }),
  ]);

  // Seed the 2026 public form entries only when empty, so real submissions and
  // any already-entered rows are never clobbered.
  if ((await prisma.builderEntry.count()) === 0) {
    await prisma.builderEntry.createMany({ data: BUILDER_ENTRIES });
  }
  if ((await prisma.sponsorEntry.count()) === 0) {
    await prisma.sponsorEntry.createMany({ data: SPONSOR_ENTRIES });
  }

  console.log("AFTER: ", await counts());
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
