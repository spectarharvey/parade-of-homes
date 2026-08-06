import { json, error } from "@/lib/api";
import { createOrder } from "@/lib/paypal";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const formType = String(b?.formType || "builder");
  const level = String(b?.level || "");
  if (!level) return error("Select an entry level before paying.");
  try {
    const order = await createOrder(formType, level);
    return json(order, 200);
  } catch (e) {
    return error(e instanceof Error ? e.message : "PayPal error", 502);
  }
}
