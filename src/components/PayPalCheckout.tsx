"use client";

import { useEffect, useRef, useState } from "react";

// Load the PayPal JS SDK once, on demand.
let sdkPromise: Promise<void> | null = null;
function loadSdk(clientId: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as unknown as { paypal?: unknown }).paypal) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture`;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load PayPal."));
    document.body.appendChild(s);
  });
  return sdkPromise;
}

export type PaidDetails = {
  captureId: string | null;
  amount: string | null;
  payerEmail: string | null;
};

/**
 * Renders PayPal / debit-or-credit-card buttons for the selected entry level.
 * The amount is set server-side (create-order); on capture, `onPaid` fires.
 */
export default function PayPalCheckout({
  formType,
  level,
  onPaid,
}: {
  formType: "builder" | "sponsor";
  level: string;
  onPaid: (details: PaidDetails) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState("");
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  // Keep the latest level / callback without re-rendering the buttons.
  const levelRef = useRef(level);
  levelRef.current = level;
  const onPaidRef = useRef(onPaid);
  onPaidRef.current = onPaid;

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    loadSdk(clientId)
      .then(() => {
        if (cancelled || !ref.current) return;
        const paypal = (window as unknown as { paypal?: any }).paypal;
        if (!paypal) return;
        ref.current.innerHTML = "";
        paypal
          .Buttons({
            style: { layout: "vertical", color: "gold", shape: "pill", label: "pay" },
            createOrder: async () => {
              setErr("");
              const res = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ formType, level: levelRef.current }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data?.error || "Could not start checkout.");
              return data.id;
            },
            onApprove: async (data: { orderID: string }) => {
              const res = await fetch("/api/paypal/capture-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderID: data.orderID }),
              });
              const cap = await res.json();
              if (!res.ok || cap.status !== "COMPLETED") {
                throw new Error(cap?.error || "Payment was not completed.");
              }
              onPaidRef.current(cap);
            },
            onError: (e: unknown) => {
              setErr(e instanceof Error ? e.message : "PayPal error. Please try again.");
            },
          })
          .render(ref.current);
      })
      .catch((e) => setErr(e.message));

    return () => {
      cancelled = true;
    };
  }, [clientId, formType]);

  if (!clientId) {
    return (
      <p style={{ color: "#c0392b", fontSize: ".85rem" }}>
        Online payment isn&apos;t configured yet — please choose &ldquo;Check&rdquo; or
        contact the event team.
      </p>
    );
  }

  return (
    <div>
      <div ref={ref} />
      {err && (
        <p style={{ color: "#c0392b", fontSize: ".85rem", marginTop: ".4rem" }}>{err}</p>
      )}
    </div>
  );
}
