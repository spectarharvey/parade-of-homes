"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import QRCode from "@/components/QRCode";
import { Printer } from "lucide-react";

/**
 * Staff-facing printable sheet of per-home check-in QR codes. Each home's code
 * encodes …/home/<id>?checkin=1, which auto-records a visit when scanned. Print
 * this and post each code inside the matching home. New homes appear here
 * automatically as builders are built out.
 */
export default function AdminQrCodesPage() {
  const { db, builder, nbhd } = useStore();
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const homes = [...db.homes].sort((a, b) => {
    const ba = builder(a.builder)?.name ?? "";
    const bb = builder(b.builder)?.name ?? "";
    return ba.localeCompare(bb) || a.name.localeCompare(b.name);
  });

  return (
    <>
      <div className="qr-toolbar">
        <div>
          <h1 style={{ fontSize: "1.7rem" }}>Check-In QR Codes</h1>
          <p className="muted" style={{ marginTop: "-.4rem" }}>
            One code per showcase home — print and post inside each home for
            visitors to scan. {homes.length} home{homes.length === 1 ? "" : "s"}.
          </p>
        </div>
        <button className="btn btn-navy" onClick={() => window.print()}>
          <Printer size={16} /> Print
        </button>
      </div>

      {homes.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", color: "var(--muted)" }}>
          No homes yet. Codes appear here automatically as homes are added.
        </div>
      ) : (
        <div className="qr-print-grid">
          {homes.map((h) => {
            const b = builder(h.builder);
            const n = nbhd(h.nb);
            const url = origin ? `${origin}/home/${h.id}?checkin=1` : "";
            return (
              <div className="qr-card" key={h.id}>
                <QRCode value={url} className="qr qr-print" />
                <div className="qr-card-title">{h.name}</div>
                <div className="qr-card-sub">
                  {b?.name}
                  {n ? ` · ${n.name}` : ""}
                </div>
                <div className="qr-card-cta">Scan to check in</div>
                <div className="qr-card-url">
                  {url.replace(/^https?:\/\//, "")}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
