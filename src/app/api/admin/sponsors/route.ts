import { crud } from "@/lib/adminCrud";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = crud("sponsors").create;
