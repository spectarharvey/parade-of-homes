import type { Home } from "./types";

/**
 * The DB stores a home's relations as `builderId` / `nbId`, but the frontend
 * (and the original data model) expects `builder` / `nb`. This maps a Prisma
 * Home row to the frontend Home shape.
 */
export function serializeHome(h: {
  id: string;
  name: string;
  builderId: string;
  nbId: string;
  style: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  garage: number;
  checkins: number;
  rating: number;
  ratings: number;
  featured: boolean;
  x: number;
  y: number;
  blurb: string;
  features: string[];
  imgs: string[];
}): Home {
  const { builderId, nbId, ...rest } = h;
  return { ...rest, builder: builderId, nb: nbId };
}
