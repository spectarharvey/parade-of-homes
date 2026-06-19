import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { serializeHome } from "@/lib/serialize";
import { json, error, requireRole } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const num = (v: unknown, d = 0) =>
  v === undefined || v === null || v === "" ? d : Number(v);
const arr = (v: unknown): string[] =>
  Array.isArray(v)
    ? v.filter(Boolean).map(String)
    : typeof v === "string"
      ? v.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

// A builder creates a live home listing owned by their builder profile.
export async function POST(req: Request) {
  const session = await requireRole("BUILDER");
  if (session instanceof NextResponse) return session;
  if (!session.builderId)
    return error("No builder profile is linked to this account", 400);

  const b = await req.json().catch(() => ({}));
  if (!b?.name) return error("Home name is required");
  if (!b?.nb) return error("Please choose a neighborhood");

  try {
    const home = await prisma.home.create({
      data: {
        id: "h_" + randomUUID().slice(0, 8),
        name: String(b.name),
        builderId: session.builderId, // forced — builders can only post as themselves
        nbId: String(b.nb),
        style: String(b.style || "Modern"),
        price: num(b.price),
        beds: num(b.beds),
        baths: num(b.baths),
        sqft: num(b.sqft),
        garage: num(b.garage),
        blurb: String(b.blurb || ""),
        features: arr(b.features),
        imgs: arr(b.imgs),
        x: num(b.x, 50),
        y: num(b.y, 50),
        featured: false, // only admins can feature
        checkins: 0,
        rating: 0,
        ratings: 0,
      },
    });
    return json(serializeHome(home), 201);
  } catch (e) {
    console.error("[builder home create]", (e as Error).message);
    return error("Could not create the home — check the neighborhood and fields.", 400);
  }
}
