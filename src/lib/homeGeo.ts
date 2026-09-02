import type { Home } from "./types";

/**
 * Approximate placeholder coordinates for the 2026 Parade homes, keyed by home
 * id. These are rough community/city-level locations across Marion County — good
 * enough to show every home on a real street map, and easy to refine later with
 * each model's exact address.
 */
const HOME_COORDS: Record<string, [number, number]> = {
  h_dr_horton_holden: [29.1153, -82.2812], // Tartan Farms at Winding Oaks, SW Ocala
  h_deltona_mustang: [29.0049, -82.2007], // Marion Oaks, south of Ocala
  h_secure_built_rutherford: [29.2461, -82.2795], // Irish Acres area, NW Ocala
  h_curington_sebastian: [29.2508, -82.2903], // Irish Acres area, NW Ocala
  h_brije_aspen: [29.2836, -82.4534], // Morriston, west of Ocala
  h_luetgert_golden_hills: [29.2381, -82.2447], // Golden Hills & Country Club, NW Ocala
  h_otow_whitmore: [29.125, -82.285], // On Top of the World (Balfour), SW Ocala
  h_calesa_heritage: [29.135, -82.215], // Calesa Township (Perlino Grove), SW Ocala
  h_townsley_wyrick: [29.165, -82.105], // Townsley custom home, SE Ocala
  h_stentiford_fortking: [29.18, -82.128], // 49 SE 15th Terrace, near downtown Ocala
  h_almilton_hemlock: [29.135, -82.035], // 22 Almond Way, Silver Springs Shores, SE Ocala
  h_dream_valencia: [28.915, -82.457], // Pine Ridge Estates, Beverly Hills (Citrus Co.)
};

/** Central Ocala — the fallback for any home without mapped coordinates. */
export const MAP_FALLBACK_CENTER: [number, number] = [29.1872, -82.1401];

/** Small deterministic offset so unmapped homes don't stack on one point. */
function jitter(id: string): [number, number] {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const dLat = (((h % 100) + 100) % 100) / 100 - 0.5;
  const dLng = ((((h >> 8) % 100) + 100) % 100) / 100 - 0.5;
  return [dLat * 0.06, dLng * 0.06];
}

/**
 * The [lat, lng] to place a home at on the map. Prefers the home's real,
 * admin-set coordinates; falls back to the legacy per-id approximations, then
 * to a deterministic jitter near Ocala so unmapped homes don't stack.
 */
export function homeLatLng(
  home: Pick<Home, "id"> & Partial<Pick<Home, "lat" | "lng">>,
): [number, number] {
  if (typeof home.lat === "number" && typeof home.lng === "number")
    return [home.lat, home.lng];
  const mapped = HOME_COORDS[home.id];
  if (mapped) return mapped;
  const [dLat, dLng] = jitter(home.id);
  return [MAP_FALLBACK_CENTER[0] + dLat, MAP_FALLBACK_CENTER[1] + dLng];
}

/**
 * Stable 1-based tour numbers keyed by home id, grouped by neighborhood then
 * name — a sensible community-by-community walking order. Derived (no schema),
 * deterministic, used for map marker labels and the printable tour handout.
 */
export function tourNumber(
  homes: { id: string; nb: string; name: string }[],
): Record<string, number> {
  const sorted = [...homes].sort(
    (a, b) => a.nb.localeCompare(b.nb) || a.name.localeCompare(b.name),
  );
  return Object.fromEntries(sorted.map((h, i) => [h.id, i + 1]));
}

/**
 * Resolves street address for a model home, falling back to neighborhood city or home name.
 */
export function homeAddress(
  h: Pick<Home, "name" | "address" | "features" | "nb">,
  getNbhd?: (id: string) => { name: string; city: string } | undefined,
): string {
  if (h.address?.trim()) return h.address.trim();
  const loc = h.features?.find((f) => /^model location:/i.test(f));
  if (loc) return loc.replace(/^model location:\s*/i, "").trim();
  const n = getNbhd ? getNbhd(h.nb) : undefined;
  return n ? `${n.name}, ${n.city}, FL` : h.name;
}

