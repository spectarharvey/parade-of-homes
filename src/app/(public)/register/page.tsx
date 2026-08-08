"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import type { User } from "@/lib/types";
import QRCode from "@/components/QRCode";
import InstallButton from "@/components/InstallButton";

type Tab = "register" | "login";

const MIN_PASSWORD = 8;

export default function RegisterPage() {
  const { registerGuest, loginGuest, guestUser, logoutGuest } = useStore();

  const [tab, setTab] = useState<Tab>("register");
  const [done, setDone] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // Open the Log In tab when linked with ?tab=login (client-only, no SSR mismatch).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("tab") === "login") setTab("login");
  }, []);

  const switchTab = (t: Tab) => {
    setTab(t);
    setErr("");
    setShowPw(false);
  };

  const submitRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget as unknown as Record<string, { value: string; checked: boolean }>;
    const password = f.password.value;
    const confirm = f.confirm.value;

    if (password.length < MIN_PASSWORD) {
      setErr(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (password !== confirm) {
      setErr("Those passwords don't match. Please re-enter them.");
      return;
    }

    const u: User = {
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
    setBusy(true);
    setErr("");
    try {
      await registerGuest(u, password);
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const submitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget as unknown as Record<string, { value: string }>;
    setBusy(true);
    setErr("");
    try {
      await loginGuest(f.email.value, f.password.value);
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "We couldn't log you in.");
    } finally {
      setBusy(false);
    }
  };

  const linkBtn: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "var(--navy)",
    fontWeight: 600,
    fontSize: ".82rem",
    cursor: "pointer",
    padding: 0,
    textDecoration: "underline",
  };

  const revealBtn: React.CSSProperties = {
    ...linkBtn,
    fontSize: ".72rem",
    float: "right",
  };

  const alreadySignedIn = guestUser && !done;

  const heading = alreadySignedIn
    ? { eyebrow: "Your Guest Pass", title: "You're all set", blurb: "You're already signed in. Head to your contest card, or log out to switch accounts." }
    : tab === "login"
    ? { eyebrow: "Welcome Back", title: "Log In to Your Pass", blurb: "Enter the email and password you registered with to pick up right where you left off." }
    : { eyebrow: "Join the Parade", title: "Register to Win", blurb: "Create your free guest pass to track home check-ins, fill your contest card, and get notified about builder specials. It only takes a moment." };

  return (
    <div className="wrap">
      <div className="crumb">
        <Link href="/">Home</Link> / {tab === "login" ? "Log In" : "Register"}
      </div>
      <div className="grid-2" style={{ alignItems: "start", marginTop: "1rem" }}>
        <div>
          <span className="eyebrow">{heading.eyebrow}</span>
          <h2 style={{ fontSize: "2rem" }}>{heading.title}</h2>
          <p className="muted">{heading.blurb}</p>

          <div className="form-card" style={{ marginTop: "1.2rem" }}>
            {/* Already signed in */}
            {alreadySignedIn ? (
              <div style={{ textAlign: "center", padding: "1rem" }}>
                <div style={{ fontSize: "2.4rem" }}>✅</div>
                <h3 style={{ margin: ".2rem 0" }}>You&apos;re signed in</h3>
                <p className="muted" style={{ fontSize: ".9rem" }}>
                  {guestUser!.first} {guestUser!.last}
                  <br />
                  {guestUser!.email}
                </p>
                <Link href="/contest" className="btn btn-gold btn-block" style={{ marginTop: ".8rem" }}>
                  Go to My Contest Card →
                </Link>
                <button
                  className="btn btn-outline btn-block"
                  style={{ marginTop: ".6rem" }}
                  onClick={logoutGuest}
                >
                  Log out
                </button>
              </div>
            ) : done ? (
              <div style={{ textAlign: "center", padding: "1rem" }}>
                <div style={{ fontSize: "3rem" }}>🎉</div>
                <h3>{tab === "login" ? "Welcome back!" : "You're registered!"}</h3>
                <p className="muted">
                  {tab === "login"
                    ? "You're signed back in — your check-ins and contest card are right where you left them."
                    : "Your guest pass is ready. Start checking in at homes to fill your contest card."}
                </p>
                <Link href="/contest" className="btn btn-gold">
                  Go to My Contest Card →
                </Link>
              </div>
            ) : (
              <>
                {/* Register / Log In toggle */}
                <div style={{ display: "flex", gap: ".4rem", marginBottom: "1.1rem" }}>
                  <button
                    type="button"
                    className={"btn btn-sm " + (tab === "register" ? "btn-navy" : "btn-outline")}
                    style={{ flex: 1 }}
                    onClick={() => switchTab("register")}
                  >
                    New here? Register
                  </button>
                  <button
                    type="button"
                    className={"btn btn-sm " + (tab === "login" ? "btn-navy" : "btn-outline")}
                    style={{ flex: 1 }}
                    onClick={() => switchTab("login")}
                  >
                    Returning? Log In
                  </button>
                </div>

                {/* REGISTER — details + password */}
                {tab === "register" && (
                  <form onSubmit={submitRegister}>
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
                        <label>
                          Password *
                          <button type="button" style={revealBtn} onClick={() => setShowPw((v) => !v)}>
                            {showPw ? "Hide" : "Show"}
                          </button>
                        </label>
                        <input
                          name="password"
                          type={showPw ? "text" : "password"}
                          required
                          minLength={MIN_PASSWORD}
                          autoComplete="new-password"
                          placeholder="At least 8 characters"
                        />
                      </div>
                      <div className="fld full">
                        <label>Confirm Password *</label>
                        <input
                          name="confirm"
                          type={showPw ? "text" : "password"}
                          required
                          minLength={MIN_PASSWORD}
                          autoComplete="new-password"
                          placeholder="Re-enter your password"
                        />
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
                    {err && <p style={{ color: "#c0392b", fontSize: ".82rem", marginTop: ".8rem" }}>{err}</p>}
                    <button className="btn btn-gold btn-block" style={{ marginTop: "1.2rem" }} type="submit" disabled={busy}>
                      {busy ? "Creating your pass…" : "Create My Guest Pass →"}
                    </button>
                    <p className="muted center" style={{ fontSize: ".74rem", marginTop: ".8rem" }}>
                      Already have a pass?{" "}
                      <button type="button" style={linkBtn} onClick={() => switchTab("login")}>
                        Log in instead
                      </button>
                      .
                    </p>
                  </form>
                )}

                {/* LOGIN — email + password */}
                {tab === "login" && (
                  <form onSubmit={submitLogin}>
                    <div className="fld full">
                      <label>Email *</label>
                      <input name="email" type="email" required placeholder="jane@email.com" />
                    </div>
                    <div className="fld full">
                      <label>
                        Password *
                        <button type="button" style={revealBtn} onClick={() => setShowPw((v) => !v)}>
                          {showPw ? "Hide" : "Show"}
                        </button>
                      </label>
                      <input
                        name="password"
                        type={showPw ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        placeholder="Your password"
                      />
                    </div>
                    {err && <p style={{ color: "#c0392b", fontSize: ".82rem", marginTop: ".8rem" }}>{err}</p>}
                    <button className="btn btn-gold btn-block" style={{ marginTop: "1rem" }} type="submit" disabled={busy}>
                      {busy ? "Logging in…" : "Log In →"}
                    </button>
                    <p className="muted center" style={{ fontSize: ".74rem", marginTop: ".8rem" }}>
                      No guest pass yet?{" "}
                      <button type="button" style={linkBtn} onClick={() => switchTab("register")}>
                        Register instead
                      </button>
                      .
                    </p>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
        <div className="form-card center" style={{ position: "sticky", top: 90 }}>
          <span className="badge badge-gold">Save to Your Phone</span>
          <h3 style={{ marginTop: ".8rem" }}>Take the app with you</h3>
          <p className="muted" style={{ fontSize: ".86rem" }}>
            Scan this code to open the Parade of Homes app on your phone — check
            in at each home with one tap.
          </p>
          <QRCode
            value={typeof window !== "undefined" ? window.location.origin : ""}
            style={{ margin: "1rem auto", width: 180, height: 180 }}
          />
          <p className="muted" style={{ fontSize: ".78rem", marginBottom: "1rem" }}>
            Scan to open, or install it as an app:
          </p>
          <InstallButton />
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
