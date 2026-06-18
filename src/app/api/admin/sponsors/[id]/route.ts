import { crud } from "@/lib/adminCrud";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const s = crud("sponsors");
export const PATCH = s.update;
export const DELETE = s.remove;
