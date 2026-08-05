"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore, useToast } from "@/lib/store";
import type { User } from "@/lib/types";
import QRCode from "@/components/QRCode";
import InstallButton from "@/components/InstallButton";

type Tab = "register" | "login";
type Mode = "input" | "verify" | "done";

export default function RegisterPage() {
  const {
    startRegistration,
    verifyRegistration,
    startLogin,
    verifyLogin,
    guestUser,
    logoutGuest,
  } = useStore();
  const { toast } = useToast();

  const [tab, setTab] = useState<Tab>("register");
  const [mode, setMode] = useState<Mode>("input");

  // Open the Log In tab when linked with ?tab=login (client-only, no SSR mismatch).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("tab") === "login") setTab("login");
  }, []);
  const [regData, setRegData] = useState<User | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [token, setToken] = useState("");
  const [devCode, setDevCode] = useState<string | undefined>();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const pendingEmail = tab === "register" ? regData?.email : loginEmail;

  const switchTab = (t: Tab) => {
    setTab(t);
    setMode("input");
    setErr("");
    setCode("");
    setDevCode(undefined);
  };

  const completeVerify = async (theToken: string, theCode: string) => {
    setBusy(true);
    setErr("");
    try {
      if (tab === "register") await verifyRegistration(theToken, theCode);
      else await verifyLogin(theToken, theCode);
      setMode("done");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "That code didn't work. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // Move to the code step. When no email provider is configured the server
  // returns the code (`devCode`) — log it to the console, auto-fill it, and
  // auto-verify so the flow can be tested end-to-end. This path disappears the
  // moment RESEND_API_KEY is set (then no devCode is returned and a real email
  // is sent instead).
  const afterCodeSent = (theToken: string, devCode: string | undefined, email: string) => {
    setToken(theToken);
    setDevCode(devCode);
    setMode("verify");
    if (devCode) {
      // eslint-disable-next-line no-console
      console.log(
        `%c🔑 Parade of Homes ${tab === "login" ? "login" : "verification"} code: ${devCode}`,
        "font-size:14px;font-weight:700;color:#116799"
      );
      setCode(devCode);
      toast("🔑 Dev mode — code from console, auto-verifying…");
      setTimeout(() => completeVerify(theToken, devCode), 900);
    } else {
      setCode("");
      toast("📧 We emailed a code to " + email);
    }
  };

  const submitRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget as unknown as Record<string, { value: string; checked: boolean }>;
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
      const { token, devCode } = await startRegistration(u);
      setRegData(u);
      afterCodeSent(token, devCode, u.email);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const submitLoginEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget as unknown as Record<string, { value: string }>;
    const email = f.email.value;
    setBusy(true);
    setErr("");
    try {
      const { token, devCode } = await startLogin(email);
      setLoginEmail(email);
      afterCodeSent(token, devCode, email);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "We couldn't send a login code.");
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;
    await completeVerify(token, code);
  };

  const resend = async () => {
    setBusy(true);
    setErr("");
    try {
      const res =
        tab === "register" && regData
          ? await startRegistration(regData)
          : tab === "login" && loginEmail
          ? await startLogin(loginEmail)
          : null;
      if (res) afterCodeSent(res.token, res.devCode, pendingEmail ?? "");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not resend the code.");
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

  const alreadySignedIn = guestUser && mode !== "done";

  const heading = alreadySignedIn
    ? { eyebrow: "Your Guest Pass", title: "You're all set", blurb: "You're already signed in. Head to your contest card, or log out to switch accounts." }
    : tab === "login"
    ? { eyebrow: "Welcome Back", title: "Log In to Your Pass", blurb: "Enter your email and we'll send a one-time code to sign you back in — no password needed." }
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
            ) : mode === "done" ? (
              <div style={{ textAlign: "center", padding: "1rem" }}>
                <div style={{ fontSize: "3rem" }}>🎉</div>
                <h3>{tab === "login" ? "Welcome back!" : "You're registered!"}</h3>
                <p className="muted">
                  {tab === "login"
                    ? "You're signed back in — your check-ins and contest card are right where you left them."
                    : "Your email is verified and your guest pass is ready. Start checking in at homes to fill your contest card."}
                </p>
                <Link href="/contest" className="btn btn-gold">
                  Go to My Contest Card →
                </Link>
              </div>
            ) : (
              <>
                {/* Register / Log In toggle (only while entering details) */}
                {mode === "input" && (
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
                )}

                {/* REGISTER — details form */}
                {mode === "input" && tab === "register" && (
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
                      {busy ? "Sending code…" : "Create My Guest Pass →"}
                    </button>
                    <p className="muted center" style={{ fontSize: ".74rem", marginTop: ".8rem" }}>
                      We&apos;ll email a 6-digit code to verify your address. Already
                      have a pass?{" "}
                      <button type="button" style={linkBtn} onClick={() => switchTab("login")}>
                        Log in instead
                      </button>
                      .
                    </p>
                  </form>
                )}

                {/* LOGIN — email only */}
                {mode === "input" && tab === "login" && (
                  <form onSubmit={submitLoginEmail}>
                    <div className="fld full">
                      <label>Email *</label>
                      <input name="email" type="email" required placeholder="jane@email.com" />
                    </div>
                    {err && <p style={{ color: "#c0392b", fontSize: ".82rem", marginTop: ".8rem" }}>{err}</p>}
                    <button className="btn btn-gold btn-block" style={{ marginTop: "1rem" }} type="submit" disabled={busy}>
                      {busy ? "Sending code…" : "Email Me a Login Code →"}
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

                {/* Shared code-entry step */}
                {mode === "verify" && (
                  <form onSubmit={submitCode}>
                    <h3 style={{ marginTop: 0 }}>Check your email</h3>
                    <p className="muted" style={{ fontSize: ".9rem" }}>
                      Enter the 6-digit code we sent to <b>{pendingEmail}</b>{" "}
                      to {tab === "login" ? "log in" : "finish creating your guest pass"}.
                    </p>
                    {devCode && (
                      <div
                        style={{
                          background: "rgba(201,162,75,.14)",
                          border: "1px dashed var(--gold)",
                          borderRadius: 8,
                          padding: ".6rem .8rem",
                          fontSize: ".8rem",
                          margin: ".2rem 0 1rem",
                        }}
                      >
                        Dev mode (email delivery not configured): your code is{" "}
                        <b style={{ letterSpacing: "2px" }}>{devCode}</b>
                      </div>
                    )}
                    <div className="fld">
                      <label>Verification Code *</label>
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="123456"
                        required
                        style={{ letterSpacing: "6px", textAlign: "center", fontSize: "1.3rem" }}
                      />
                    </div>
                    {err && <p style={{ color: "#c0392b", fontSize: ".82rem", marginTop: ".6rem" }}>{err}</p>}
                    <button className="btn btn-gold btn-block" style={{ marginTop: ".8rem" }} type="submit" disabled={busy || code.length < 6}>
                      {busy ? "Verifying…" : tab === "login" ? "Log In →" : "Verify & Finish →"}
                    </button>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: ".9rem" }}>
                      <button type="button" style={linkBtn} onClick={resend} disabled={busy}>
                        Resend code
                      </button>
                      <button
                        type="button"
                        style={linkBtn}
                        onClick={() => {
                          setMode("input");
                          setErr("");
                          setCode("");
                        }}
                        disabled={busy}
                      >
                        Use a different email
                      </button>
                    </div>
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
