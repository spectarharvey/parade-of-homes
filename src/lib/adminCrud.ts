import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "./prisma";
import { json, error, requireRole } from "./api";

type Params = { params: Promise<{ id: string }> };
type Build = (body: any, create: boolean) => Record<string, unknown>;

const num = (v: unknown, d = 0) => (v === undefined || v === null || v === "" ? d : Number(v));
const arr = (v: unknown): string[] =>
  Array.isArray(v)
    ? v.filter(Boolean).map(String)
    : typeof v === "string"
      ? v.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

/** Only copy a field when it's present in the body (used for partial updates). */
function set(out: Record<string, unknown>, body: any, key: string, cast: (v: unknown) => unknown, create: boolean, dflt?: unknown) {
  if (body[key] !== undefined) out[key] = cast(body[key]);
  else if (create && dflt !== undefined) out[key] = dflt;
}

const builds: Record<string, { model: string; prefix: string; build: Build }> = {
  homes: {
    model: "home",
    prefix: "h_",
    build: (b, create) => {
      const o: Record<string, unknown> = {};
      set(o, b, "name", String, create, "");
      set(o, b, "style", String, create, "");
      set(o, b, "blurb", String, create, "");
      if (b.builder !== undefined) o.builderId = String(b.builder);
      if (b.nb !== undefined) o.nbId = String(b.nb);
      set(o, b, "price", (v) => num(v), create, 0);
      set(o, b, "beds", (v) => num(v), create, 0);
      set(o, b, "baths", (v) => num(v), create, 0);
      set(o, b, "sqft", (v) => num(v), create, 0);
      set(o, b, "garage", (v) => num(v), create, 0);
      set(o, b, "x", (v) => num(v, 50), create, 50);
      set(o, b, "y", (v) => num(v, 50), create, 50);
      if (b.features !== undefined) o.features = arr(b.features);
      else if (create) o.features = [];
      if (b.imgs !== undefined) o.imgs = arr(b.imgs);
      else if (create) o.imgs = [];
      if (b.featured !== undefined) o.featured = Boolean(b.featured);
      if (create) {
        o.checkins = num(b.checkins, 0);
        o.rating = num(b.rating, 0);
        o.ratings = num(b.ratings, 0);
        if (o.featured === undefined) o.featured = false;
      }
      return o;
    },
  },
  builders: {
    model: "builder",
    prefix: "b_",
    build: (b, create) => {
      const o: Record<string, unknown> = {};
      set(o, b, "name", String, create, "");
      set(o, b, "initials", String, create, "");
      set(o, b, "color", String, create, "#0f2742");
      set(o, b, "phone", String, create, "");
      set(o, b, "website", String, create, "");
      set(o, b, "years", (v) => num(v), create, 0);
      set(o, b, "blurb", String, create, "");
      set(o, b, "ad", String, create, "");
      if (b.featured !== undefined) o.featured = Boolean(b.featured);
      else if (create) o.featured = false;
      return o;
    },
  },
  neighborhoods: {
    model: "neighborhood",
    prefix: "n_",
    build: (b, create) => {
      const o: Record<string, unknown> = {};
      set(o, b, "name", String, create, "");
      set(o, b, "city", String, create, "");
      set(o, b, "color", String, create, "#c9a24b");
      set(o, b, "img", String, create, "");
      set(o, b, "blurb", String, create, "");
      set(o, b, "low", (v) => num(v), create, 0);
      set(o, b, "high", (v) => num(v), create, 0);
      return o;
    },
  },
  sponsors: {
    model: "sponsor",
    prefix: "s_",
    build: (b, create) => {
      const o: Record<string, unknown> = {};
      set(o, b, "name", String, create, "");
      set(o, b, "tier", (v) => String(v), create, "silver");
      set(o, b, "color", String, create, "#6b7686");
      set(o, b, "cat", String, create, "");
      set(o, b, "img", String, create, "");
      return o;
    },
  },
  faqs: {
    model: "faq",
    prefix: "f_",
    build: (b, create) => {
      const o: Record<string, unknown> = {};
      set(o, b, "q", String, create, "");
      set(o, b, "a", String, create, "");
      set(o, b, "order", (v) => num(v), create, 0);
      return o;
    },
  },
};

export function crud(kind: keyof typeof builds) {
  const cfg = builds[kind];
  const model = () => (prisma as any)[cfg.model];

  async function create(req: Request) {
    const s = await requireRole("ADMIN");
    if (s instanceof NextResponse) return s;
    const body = await req.json().catch(() => ({}));
    const data = cfg.build(body, true);
    data.id = cfg.prefix + randomUUID().slice(0, 8);
    try {
      const row = await model().create({ data });
      return json(row, 201);
    } catch (e) {
      console.error(`[create ${kind}]`, (e as Error).message);
      return error("Could not create — check the fields and try again.", 400);
    }
  }

  async function update(req: Request, { params }: Params) {
    const s = await requireRole("ADMIN");
    if (s instanceof NextResponse) return s;
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const data = cfg.build(body, false);
    delete (data as any).id;
    try {
      const row = await model().update({ where: { id }, data });
      return json(row);
    } catch (e) {
      console.error(`[update ${kind}]`, (e as Error).message);
      return error("Not found or invalid update", 404);
    }
  }

  async function remove(_req: Request, { params }: Params) {
    const s = await requireRole("ADMIN");
    if (s instanceof NextResponse) return s;
    const { id } = await params;
    try {
      await model().delete({ where: { id } });
      return json({ ok: true });
    } catch (e) {
      console.error(`[delete ${kind}]`, (e as Error).message);
      return error("Not found", 404);
    }
  }

  return { create, update, remove };
}
