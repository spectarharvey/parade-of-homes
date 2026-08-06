/**
 * PayPal Orders v2 integration (server side). Amounts are computed here from a
 * server-authoritative price map — the client is never trusted for the amount.
 * Configure via env: PAYPAL_ENV ("sandbox" | "live"), PAYPAL_CLIENT_ID,
 * PAYPAL_CLIENT_SECRET. The public NEXT_PUBLIC_PAYPAL_CLIENT_ID is used by the
 * browser SDK.
 */

const ENV = process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";
const BASE =
  ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// 3% card/processing fee passed to the payer (matches the form note).
const FEE_RATE = 0.03;

const BUILDER_PRICES: Record<string, number> = {
  "Standard Builder Entry (Members) - $2,500": 2500,
  "Premier Builder Entry (Members) - $5,000": 5000,
  "Premier Associate Entry (Members) - $5,000": 5000,
  "Additional Home Entry (after first entry) - $2,000": 2000,
};

const SPONSOR_PRICES: Record<string, number> = {
  "Premier Associate Entry - $5,000": 5000,
  "Full Page Ad Only - $2,000": 2000,
  "Half Page Ad Only - $1,200": 1200,
};

export function basePrice(formType: string, level: string): number | null {
  const map = formType === "sponsor" ? SPONSOR_PRICES : BUILDER_PRICES;
  return map[level] ?? null;
}

/** Total charged: base + 3%, as a "0.00" string. */
export function totalWithFee(base: number): string {
  return (base * (1 + FEE_RATE)).toFixed(2);
}

function credentials() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error(
      "Online payment isn't set up yet. Please pay by check or contact the event team.",
    );
  }
  return { id, secret };
}

async function accessToken(): Promise<string> {
  const { id, secret } = credentials();
  const auth = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error("Could not authenticate with PayPal.");
  const data = await res.json();
  return data.access_token as string;
}

export async function createOrder(formType: string, level: string) {
  const base = basePrice(formType, level);
  if (base == null) throw new Error("Unrecognized entry level.");
  const value = totalWithFee(base);
  const token = await accessToken();

  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: "USD", value },
          description: `2026 Parade of Homes — ${level}`.slice(0, 127),
        },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Could not create the PayPal order.");
  }
  return { id: data.id as string, amount: value };
}

export async function captureOrder(orderID: string) {
  const token = await accessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders/${orderID}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Could not capture the PayPal payment.");
  }
  const cap = data?.purchase_units?.[0]?.payments?.captures?.[0];
  return {
    status: data.status as string, // "COMPLETED" on success
    captureId: (cap?.id as string) ?? null,
    amount: (cap?.amount?.value as string) ?? null,
    payerEmail: (data?.payer?.email_address as string) ?? null,
  };
}
