import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { CmsStore } from "./types";

/**
 * Every stored override, as page → key → value.
 *
 * Deliberately fail-soft: if the table is missing (migration not deployed yet)
 * or the database is unreachable, we return an empty store and the site renders
 * its built-in copy rather than 500-ing.
 *
 * `cache()` de-dupes the query within a single request/render pass.
 */
export const getSiteContentStore = cache(async (): Promise<CmsStore> => {
  try {
    const rows = await prisma.siteContent.findMany({
      select: { page: true, key: true, value: true, type: true },
      orderBy: [{ page: "asc" }, { key: "asc" }],
    });
    const store: CmsStore = {};
    for (const r of rows) {
      (store[r.page] ??= {})[r.key] = r.value;
    }
    return store;
  } catch (e) {
    console.warn(
      "[site-content] using built-in copy —",
      (e as Error).message?.split("\n")[0],
    );
    return {};
  }
});

/** Raw rows for the requested pages (admin editor / verbose reads). */
export async function readSiteContentRows(pages: string[]) {
  try {
    return await prisma.siteContent.findMany({
      where: { page: { in: pages } },
      select: { page: true, key: true, value: true, type: true },
      orderBy: [{ page: "asc" }, { key: "asc" }],
    });
  } catch (e) {
    console.warn(
      "[site-content] read failed —",
      (e as Error).message?.split("\n")[0],
    );
    return [];
  }
}
