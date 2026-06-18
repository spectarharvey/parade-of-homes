import { authenticate, setSessionCookie } from "@/lib/auth";
import { json, error } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = body?.email;
  const password = body?.password;
  if (!email || !password) return error("Email and password are required");

  const session = await authenticate(email, password);
  if (!session) return error("Invalid email or password", 401);

  await setSessionCookie(session);
  return json({ role: session.role, email: session.email, builderId: session.builderId });
}
