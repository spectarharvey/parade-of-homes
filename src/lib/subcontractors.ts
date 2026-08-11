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

/**
 * Curated MCBIA member trade partners shown on public builder profiles, keyed by
 * public builder id. Sourced from each builder's 2026 Parade entry form.
 */
export const BUILDER_SUBS: Record<string, Subcontractor[]> = {
  b_brije: [
    { service: "Pool", name: "Agua Pools" },
    { service: "Plumbing", name: "Reputable Plumbing" },
    { service: "Windows", name: "Prime Windows and Doors" },
    { service: "Concrete", name: "Del Zotto Concrete" },
    { service: "Roof", name: "Bushnell Truss" },
    { service: "HVAC", name: "SunKool AC" },
  ],
  b_curington: [
    { service: "Tile", name: "Bowen Tile" },
    { service: "Windows", name: "Central Florida Window & Door" },
    { service: "Doors, Trim, Trusses", name: "Manning Building Supply" },
    { service: "Lumber", name: "RoMac Building Supply" },
    { service: "Garage Door", name: "Overhead Door Company" },
  ],
  b_townsley: [
    { service: "Gas & Plumbing", name: "Allen Curry" },
    { service: "Garage Doors", name: "D&D Garage Doors" },
    { service: "Marketing Video", name: "Bad to the Drone" },
    { service: "Landscape", name: "Grandview Landscaping Services" },
    { service: "Floor Materials", name: "Bowen Tile" },
    { service: "Redi-Mix Concrete", name: "Del Zotto" },
  ],
  b_stentiford: [
    { service: "Cabinets", name: "Deem's Cabinetry" },
    { service: "Windows", name: "Central Florida Window" },
    { service: "Plumbing", name: "Chad's Water Works" },
    { service: "Lumber", name: "Romac" },
    { service: "Geotech", name: "Geotechnical Engineering" },
    { service: "Glass Enclosures", name: "ARP" },
  ],
};
