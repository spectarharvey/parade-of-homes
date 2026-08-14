export type Subcontractor = { service: string; name: string };

/**
 * Normalize a raw entry's `details.subcontractors`, which historically comes in
 * two shapes: `{ service, name }` objects, or `"Service - Name"` strings.
 */
export function normalizeSubs(raw: unknown): Subcontractor[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x): Subcontractor | null => {
      if (x && typeof x === "object") {
        const o = x as { service?: string; name?: string };
        return { service: (o.service ?? "").trim(), name: (o.name ?? "").trim() };
      }
      if (typeof x === "string") {
        const i = x.indexOf(" - ");
        if (i >= 0) return { service: x.slice(0, i).trim(), name: x.slice(i + 3).trim() };
        return { service: "", name: x.trim() };
      }
      return null;
    })
    .filter((s): s is Subcontractor => !!s && (!!s.service || !!s.name));
}
