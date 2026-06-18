import { NextResponse } from "next/server";
import { getSession, type SessionData, type Role } from "./auth";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Returns the session if it has the required role, otherwise a 401/403 Response.
 * Usage: `const s = await requireRole("ADMIN"); if (s instanceof NextResponse) return s;`
 */
export async function requireRole(
  role: Role
): Promise<SessionData | NextResponse> {
  const session = await getSession();
  if (!session) return error("Not authenticated", 401);
  if (session.role !== role) return error("Forbidden", 403);
  return session;
}
