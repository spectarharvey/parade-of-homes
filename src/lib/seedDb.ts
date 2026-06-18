import bcrypt from "bcryptjs";
import type { PrismaClient } from "@prisma/client";
import { SEED } from "./seed";

/**
 * Resets the database to the original demo data. Used by both the
 * `prisma db seed` script and the admin "Reset Demo Data" endpoint.
 */
export async function seedDatabase(prisma: PrismaClient) {
  // Clear in FK-safe order.
  await prisma.account.deleteMany();
  await prisma.home.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.registrant.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.sponsor.deleteMany();
  await prisma.builder.deleteMany();
  await prisma.neighborhood.deleteMany();
  await prisma.contest.deleteMany();

  await prisma.neighborhood.createMany({ data: SEED.neighborhoods });
  await prisma.builder.createMany({ data: SEED.builders });
  await prisma.sponsor.createMany({ data: SEED.sponsors });
  await prisma.home.createMany({
    data: SEED.homes.map((h) => ({
      id: h.id,
      name: h.name,
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
  });
  await prisma.faq.createMany({
    data: SEED.faqs.map((f, i) => ({ q: f.q, a: f.a, order: i })),
  });
  await prisma.registrant.createMany({ data: SEED.users });
  await prisma.submission.createMany({ data: SEED.submissions });
  await prisma.notification.createMany({ data: SEED.notifications });
  await prisma.contest.create({ data: { id: 1, ...SEED.contest } });

  // Auth accounts.
  const adminEmail = process.env.ADMIN_EMAIL || "admin@mcbia.org";
  const adminPassword = process.env.ADMIN_PASSWORD || "parade2025";
  const builderEmail = process.env.BUILDER_EMAIL || "builder@heritagehomes.com";
  const builderPassword = process.env.BUILDER_PASSWORD || "builder2025";

  await prisma.account.create({
    data: {
      email: adminEmail.toLowerCase(),
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
    },
  });
  await prisma.account.create({
    data: {
      email: builderEmail.toLowerCase(),
      passwordHash: await bcrypt.hash(builderPassword, 10),
      role: "BUILDER",
      builderId: "b1",
    },
  });
}
