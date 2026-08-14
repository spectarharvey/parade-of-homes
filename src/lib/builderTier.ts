import type { Builder } from "./types";

/**
 * Builders on the PREMIER ($5,000) 2026 Parade entry tier, per their entry
 * forms. Kept as an explicit id list because the public `Builder.ad` text
 * (which the seed encodes as "Premier Builder Entry - …") has drifted in the
 * live data for the earlier builders and can't be relied on there.
 */
export const PREMIER_BUILDER_IDS = [
  "b_deltona",
  "b_curington",
  "b_ferrer",
  "b_stentiford",
];

/**
 * Whether a builder is Premier tier: the curated list above, OR an `ad` that
 * still follows the "Premier Builder Entry - …" convention (so newly added
 * builders are picked up automatically). "Standard"/"Additional"/"Featured"
 * wording is not matched.
 */
export function isPremierBuilder(
  builder: Pick<Builder, "id" | "ad"> | null | undefined,
): boolean {
  if (!builder) return false;
  return (
    PREMIER_BUILDER_IDS.includes(builder.id) ||
    /premier builder entry/i.test(builder.ad ?? "")
  );
}
