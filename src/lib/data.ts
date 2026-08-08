import { prisma } from "./prisma";
import { serializeHome } from "./serialize";
import { SEED } from "./seed";

const IMPORTED_2026_HOME_IDS = new Set(SEED.homes.map((h) => h.id));

/** The public catalog the frontend needs to render every public page. */
export async function getPublicState() {
  const [contest, builders, neighborhoods, homes, sponsors, faqs, visitorsCount] =
    await Promise.all([
      prisma.contest.findFirst(),
      prisma.builder.findMany({ orderBy: { id: "asc" } }),
      prisma.neighborhood.findMany({ orderBy: { id: "asc" } }),
      prisma.home.findMany({ orderBy: { id: "asc" } }),
      prisma.sponsor.findMany({ orderBy: { id: "asc" } }),
      prisma.faq.findMany({ orderBy: { order: "asc" } }),
      prisma.registrant.count(),
    ]);

  const serializedHomes = homes.map(serializeHome);
  const databaseHasImportedEntries = serializedHomes.some((h) =>
    IMPORTED_2026_HOME_IDS.has(h.id),
  );

  if (!databaseHasImportedEntries) {
    return {
      contest: SEED.contest,
      builders: SEED.builders,
      neighborhoods: SEED.neighborhoods,
      homes: SEED.homes,
      sponsors: SEED.sponsors,
      faqs: SEED.faqs.map((f, order) => ({ ...f, order })),
      visitorsCount,
    };
  }

  return {
    contest: contest ?? SEED.contest,
    builders,
    neighborhoods,
    homes: serializedHomes,
    sponsors,
    faqs: faqs.map((f) => ({ id: f.id, q: f.q, a: f.a, order: f.order })),
    visitorsCount,
  };
}

/** Admin-only datasets (registrations, submissions, notifications). */
export async function getAdminState() {
  const [users, submissions, notifications] = await Promise.all([
    prisma.registrant.findMany({
      orderBy: { date: "asc" },
      omit: { passwordHash: true },
    }),
    prisma.submission.findMany({ orderBy: { date: "desc" } }),
    prisma.notification.findMany({ orderBy: { sent: "desc" } }),
  ]);
  return { users, submissions, notifications };
}
