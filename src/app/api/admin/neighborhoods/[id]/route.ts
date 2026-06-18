import { crud } from "@/lib/adminCrud";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const n = crud("neighborhoods");
export const PATCH = n.update;
export const DELETE = n.remove;
