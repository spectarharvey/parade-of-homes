import { prisma } from "./prisma";
import { serializeHome } from "./serialize";

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

  return {
    contest: contest ?? { target: 8, prize: "" },
    builders,
    neighborhoods,
    homes: homes.map(serializeHome),
    sponsors,
    faqs: faqs.map((f) => ({ q: f.q, a: f.a })),
    visitorsCount,
  };
}

/** Admin-only datasets (registrations, submissions, notifications). */
export async function getAdminState() {
  const [users, submissions, notifications] = await Promise.all([
    prisma.registrant.findMany({ orderBy: { date: "asc" } }),
    prisma.submission.findMany({ orderBy: { date: "desc" } }),
    prisma.notification.findMany({ orderBy: { sent: "desc" } }),
  ]);
  return { users, submissions, notifications };
}
