// The "Communities" competition category — a curated subset of neighborhoods
// that get their own public community page. Every other neighborhood exists
// only as a model-home location (e.g. Morriston, Marion Oaks) and has no page
// of its own.
export const COMMUNITY_IDS: string[] = [
  "n_on_top_of_the_world",
  "n_calesa_township",
  "n_golden_hills",
];

export function isCommunity(id?: string | null): boolean {
  return !!id && COMMUNITY_IDS.includes(id);
}
