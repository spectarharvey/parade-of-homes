import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "../src/lib/seedDb";

const prisma = new PrismaClient();

seedDatabase(prisma)
  .then(() => {
    console.log("✓ Database seeded with 2026 Parade of Homes starter data.");
  })
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
