import { getPublicState } from "@/lib/data";
import { json, error } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    return json(await getPublicState());
  } catch (e) {
    console.warn(
      "[/api/state] database unavailable —",
      (e as Error).message?.split("\n")[0]
    );
    return error("Failed to load catalog. Is the database configured?", 500);
  }
}
