import { NextResponse } from "next/server";
import { getAdminState } from "@/lib/data";
import { json, requireRole } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await requireRole("ADMIN");
  if (session instanceof NextResponse) return session;
  return json(await getAdminState());
}
