"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import type { User } from "@/lib/types";
import QRCode from "@/components/QRCode";
import InstallButton from "@/components/InstallButton";
import { useCms } from "@/lib/cms/context";

type Tab = "register" | "login";

const MIN_PASSWORD = 8;

export default function RegisterPage() {
  const { registerGuest, loginGuest, guestUser, logoutGuest } = useStore();
  const cms = useCms("register");

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
    ? { eyebrow: cms.t("signedIn.eyebrow"), title: cms.t("signedIn.title"), blurb: cms.t("signedIn.blurb") }
    : tab === "login"
    ? { eyebrow: cms.t("login.eyebrow"), title: cms.t("login.title"), blurb: cms.t("login.blurb") }
    : { eyebrow: cms.t("register.eyebrow"), title: cms.t("register.title"), blurb: cms.t("register.blurb") };

  return (
    <div className="wrap">
      <div className="crumb">
        <Link href="/">{cms.t("global.crumb.home")}</Link> /{" "}
        {tab === "login" ? cms.t("global.nav.login") : cms.t("global.nav.register")}
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
                <h3 style={{ margin: ".2rem 0" }}>{cms.t("signedIn.cardTitle")}</h3>
                <p className="muted" style={{ fontSize: ".9rem" }}>
                  {guestUser!.first} {guestUser!.last}
                  <br />
                  {guestUser!.email}
                </p>
                <Link href="/contest" className="btn btn-gold btn-block" style={{ marginTop: ".8rem" }}>
                  {cms.t("signedIn.cta")}
                </Link>
                <button
                  className="btn btn-outline btn-block"
                  style={{ marginTop: ".6rem" }}
                  onClick={logoutGuest}
                >
                  {cms.t("signedIn.logout")}
                </button>
              </div>
            ) : done ? (
              <div style={{ textAlign: "center", padding: "1rem" }}>
                <div style={{ fontSize: "3rem" }}>🎉</div>
                <h3>{tab === "login" ? cms.t("done.login.title") : cms.t("done.register.title")}</h3>
                <p className="muted">
                  {tab === "login" ? cms.t("done.login.body") : cms.t("done.register.body")}
                </p>
                <Link href="/contest" className="btn btn-gold">
                  {cms.t("done.cta")}
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
                    {cms.t("tab.register")}
                  </button>
                  <button
                    type="button"
                    className={"btn btn-sm " + (tab === "login" ? "btn-navy" : "btn-outline")}
                    style={{ flex: 1 }}
                    onClick={() => switchTab("login")}
                  >
                    {cms.t("tab.login")}
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
                          <span>{cms.t("form.smsLabel")}</span>
                        </label>
                      </div>
                    </div>
                    {err && <p style={{ color: "#c0392b", fontSize: ".82rem", marginTop: ".8rem" }}>{err}</p>}
                    <button className="btn btn-gold btn-block" style={{ marginTop: "1.2rem" }} type="submit" disabled={busy}>
                      {busy ? "Creating your pass…" : cms.t("submit.register")}
                    </button>
                    <p className="muted center" style={{ fontSize: ".74rem", marginTop: ".8rem" }}>
                      {cms.t("switch.toLogin")}{" "}
                      <button type="button" style={linkBtn} onClick={() => switchTab("login")}>
                        {cms.t("switch.toLoginLabel")}
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
                      {busy ? "Logging in…" : cms.t("submit.login")}
                    </button>
                    <p className="muted center" style={{ fontSize: ".74rem", marginTop: ".8rem" }}>
                      {cms.t("switch.toRegister")}{" "}
                      <button type="button" style={linkBtn} onClick={() => switchTab("register")}>
                        {cms.t("switch.toRegisterLabel")}
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
          <span className="badge badge-gold">{cms.t("app.badge")}</span>
          <h3 style={{ marginTop: ".8rem" }}>{cms.t("app.title")}</h3>
          <p className="muted" style={{ fontSize: ".86rem" }}>{cms.t("app.body")}</p>
          <QRCode
            value={typeof window !== "undefined" ? window.location.origin : ""}
            style={{ margin: "1rem auto", width: 180, height: 180 }}
          />
          <p className="muted" style={{ fontSize: ".78rem", marginBottom: "1rem" }}>
            {cms.t("app.scanNote")}
          </p>
          <InstallButton />
          <hr className="soft" />
          <div style={{ textAlign: "left" }}>
            <div style={{ display: "flex", gap: ".6rem", marginBottom: ".6rem" }}>
              <span>✓</span>
              <span style={{ fontSize: ".85rem" }}>{cms.t("app.perk1")}</span>
            </div>
            <div style={{ display: "flex", gap: ".6rem", marginBottom: ".6rem" }}>
              <span>✓</span>
              <span style={{ fontSize: ".85rem" }}>{cms.t("app.perk2")}</span>
            </div>
            <div style={{ display: "flex", gap: ".6rem" }}>
              <span>✓</span>
              <span style={{ fontSize: ".85rem" }}>{cms.t("app.perk3")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
