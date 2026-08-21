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
 * Homes MCBIA lists as Standard even though their builder is Premier tier —
 * typically a builder's second, $2,000 additional-home entry. They are treated
 * as Standard everywhere tier is shown: no Premier badge, and no slot in the
 * home page "Get Inspired" slider.
 */
export const STANDARD_HOME_IDS = ["h_brije_boone", "h_bakan_fusion"];

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

/**
 * Whether a specific home counts as Premier: its builder is Premier tier and
 * the home itself is not one of the Standard entries above.
 */
export function isPremierHome(
  home: { id: string } | null | undefined,
  builder: Pick<Builder, "id" | "ad"> | null | undefined,
): boolean {
  if (!home || STANDARD_HOME_IDS.includes(home.id)) return false;
  return isPremierBuilder(builder);
}
