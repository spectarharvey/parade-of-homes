import { crud } from "@/lib/adminCrud";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const b = crud("builders");
// PATCH handles both full edits and the single-field ad-text save.
export const PATCH = b.update;
export const DELETE = b.remove;
