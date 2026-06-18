import { getSession } from "@/lib/auth";
import { json } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return json({ session: null });
  return json({
    session: {
      email: session.email,
      role: session.role,
      builderId: session.builderId,
    },
  });
}
