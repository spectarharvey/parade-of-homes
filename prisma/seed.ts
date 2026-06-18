import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "../src/lib/seedDb";

const prisma = new PrismaClient();

seedDatabase(prisma)
  .then(() => {
    console.log("✓ Database seeded with Parade of Homes demo data.");
  })
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
