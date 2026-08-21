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
  "b_stentiford",
  "b_cbi",
  "b_brije",
];

/**
 * Builder pinned to the front of public builder/home listings — the home page
 * "Get Inspired" slider and the Participating Builders grid — ahead of the
 * usual Premier-then-Standard ordering.
 */
export const LEAD_BUILDER_ID = "b_brije";

/**
 * Homes kept out of the home page "Get Inspired" slider even though their
 * builder is Premier tier — e.g. a builder's $2,000 additional-home entry,
 * which MCBIA lists as Standard.
 */
export const SLIDER_EXCLUDED_HOME_IDS = ["h_bakan_fusion"];

/** How many cards the "Get Inspired" slider will hold. */
export const SLIDER_HOME_LIMIT = 8;

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
