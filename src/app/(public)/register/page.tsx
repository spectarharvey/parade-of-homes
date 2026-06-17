"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore, useToast } from "@/lib/store";
import QRCode from "@/components/QRCode";

export default function RegisterPage() {
  const { addUser } = useStore();
  const { toast } = useToast();
  const [done, setDone] = useState(false);

  return (
    <div className="wrap">
      <div className="crumb">
        <Link href="/">Home</Link> / Register
      </div>
      <div className="grid-2" style={{ alignItems: "start", marginTop: "1rem" }}>
        <div>
          <span className="eyebrow">Join the Parade</span>
          <h2 style={{ fontSize: "2rem" }}>Register to Win</h2>
          <p className="muted">
            Create your free guest pass to track home check-ins, fill your
            contest card, and get notified about builder specials. It only takes
            a moment.
          </p>
          <div className="form-card" style={{ marginTop: "1.2rem" }}>
            {!done ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = e.currentTarget as any;
                  const u = {
                    id: "u" + Date.now(),
                    first: f.first.value,
                    last: f.last.value,
                    email: f.email.value,
                    phone: f.phone.value,
                    zip: f.zip.value,
                    sms: f.sms.checked,
                    checkins: 0,
                    date: "2026-06-17",
                  };
                  addUser(u);
                  setDone(true);
                  toast("🎉 Welcome to the Parade, " + u.first + "!");
                }}
              >
                <div className="form-grid">
                  <div className="fld">
                    <label>First Name *</label>
                    <input name="first" required placeholder="Jane" />
                  </div>
                  <div className="fld">
                    <label>Last Name *</label>
                    <input name="last" required placeholder="Doe" />
                  </div>
                  <div className="fld full">
                    <label>Email *</label>
                    <input name="email" type="email" required placeholder="jane@email.com" />
                  </div>
                  <div className="fld">
                    <label>Phone</label>
                    <input name="phone" type="tel" placeholder="(352) 555-0123" />
                  </div>
                  <div className="fld">
                    <label>ZIP Code *</label>
                    <input name="zip" required maxLength={5} placeholder="34471" />
                  </div>
                  <div className="fld full">
                    <label className="check">
                      <input type="checkbox" name="sms" defaultChecked />
                      <span>
                        Yes! Send me SMS updates about builder specials, contest
                        reminders, and event news. (Opt out anytime.)
                      </span>
                    </label>
                  </div>
                </div>
                <button
                  className="btn btn-gold btn-block"
                  style={{ marginTop: "1.2rem" }}
                  type="submit"
                >
                  Create My Guest Pass →
                </button>
                <p
                  className="muted center"
                  style={{ fontSize: ".74rem", marginTop: ".8rem" }}
                >
                  By registering you agree to the event terms. We never sell your
                  data.
                </p>
              </form>
            ) : (
              <div style={{ textAlign: "center", padding: "1rem" }}>
                <div style={{ fontSize: "3rem" }}>🎉</div>
                <h3>You&apos;re registered!</h3>
                <p className="muted">
                  Your guest pass is ready. Start checking in at homes to fill
                  your contest card.
                </p>
                <Link href="/contest" className="btn btn-gold">
                  Go to My Contest Card →
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="form-card center" style={{ position: "sticky", top: 90 }}>
          <span className="badge badge-gold">📱 Save to Your Phone</span>
          <h3 style={{ marginTop: ".8rem" }}>Take the app with you</h3>
          <p className="muted" style={{ fontSize: ".86rem" }}>
            Scan this code to open the Parade of Homes app on your phone — check
            in at each home with one tap.
          </p>
          <QRCode
            seed="PARADE-APP-2026"
            style={{ margin: "1rem auto", width: 180, height: 180 }}
          />
          <p className="muted" style={{ fontSize: ".78rem" }}>
            parade-home-go.app
          </p>
          <hr className="soft" />
          <div style={{ textAlign: "left" }}>
            <div style={{ display: "flex", gap: ".6rem", marginBottom: ".6rem" }}>
              <span>✓</span>
              <span style={{ fontSize: ".85rem" }}>
                One-tap QR check-in at every home
              </span>
            </div>
            <div style={{ display: "flex", gap: ".6rem", marginBottom: ".6rem" }}>
              <span>✓</span>
              <span style={{ fontSize: ".85rem" }}>
                Automatic contest entry tracking
              </span>
            </div>
            <div style={{ display: "flex", gap: ".6rem" }}>
              <span>✓</span>
              <span style={{ fontSize: ".85rem" }}>
                Save favorites &amp; plan your route
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
