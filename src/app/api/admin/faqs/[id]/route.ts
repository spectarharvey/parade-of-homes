import { crud } from "@/lib/adminCrud";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const f = crud("faqs");
export const PATCH = f.update;
export const DELETE = f.remove;
