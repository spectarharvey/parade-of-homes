/**
 * Home features are entered as one free-text field and stored as a string[].
 *
 * The separator is a pipe, not a comma: real features carry commas of their own
 * ("Model location: 1680 SE 20th Ave, Ocala, FL 34471", "Listed at $1,645,000"),
 * and comma-splitting shredded them into fragments. Newlines are accepted too so
 * a pasted list works, and a bare string with neither is kept as a single entry.
 */
export const FEATURE_SEP = " | ";

/** Parse the free-text features field (or an already-split array) into a list. */
export function parseFeatures(value: unknown): string[] {
  const raw = Array.isArray(value)
    ? value.map((v) => String(v))
    : typeof value === "string"
      ? value.split(/[|\n]/)
      : [];
  return raw
    .map((s) => s.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
}

/** Render a stored features list back into the editable free-text field. */
export function formatFeatures(features: string[] | null | undefined): string {
  return (features || []).join(FEATURE_SEP);
}
