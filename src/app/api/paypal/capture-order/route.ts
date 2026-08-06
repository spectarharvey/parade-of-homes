import { json, error } from "@/lib/api";
import { captureOrder } from "@/lib/paypal";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const orderID = String(b?.orderID || "");
  if (!orderID) return error("Missing PayPal order id.");
  try {
    const result = await captureOrder(orderID);
    if (result.status !== "COMPLETED") {
      return error("Payment was not completed. Please try again.", 402);
    }
    return json(result, 200);
  } catch (e) {
    return error(e instanceof Error ? e.message : "PayPal capture error", 502);
  }
}
