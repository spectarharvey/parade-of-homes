"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore, useToast } from "@/lib/store";

export default function AdminLogin() {
  const { adminLogin } = useStore();
  const { toast } = useToast();
  const [err, setErr] = useState(false);

  return (
    <>
      <header className="site">
        <div className="wrap nav">
          <Link className="brand" href="/">
            <span className="logo">P</span>
            <span>
              <b>Admin Console</b>
              <small>Parade of Homes</small>
            </span>
          </Link>
          <nav className="nav-links">
            <Link href="/">↗ Public Site</Link>
          </nav>
        </div>
      </header>
      <div className="login-wrap">
        <div className="login-card">
          <div style={{ fontSize: "2.4rem" }}>🔐</div>
          <h2 style={{ fontSize: "1.6rem" }}>Admin Login</h2>
          <p className="muted" style={{ fontSize: ".86rem" }}>
            Enter the admin password to manage the Parade of Homes.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const pw = (e.currentTarget.elements.namedItem("pw") as HTMLInputElement)
                .value;
              if (adminLogin(pw)) {
                toast("Welcome back, admin");
              } else {
                setErr(true);
              }
            }}
          >
            <div className="fld" style={{ textAlign: "left", margin: "1rem 0" }}>
              <label>Password</label>
              <input name="pw" type="password" placeholder="••••••••" autoFocus />
            </div>
            {err && (
              <p
                style={{
                  color: "var(--red)",
                  fontSize: ".82rem",
                  margin: "0 0 .6rem",
                }}
              >
                Incorrect password. Try again.
              </p>
            )}
            <button className="btn btn-navy btn-block" type="submit">
              Log In →
            </button>
          </form>
          <p className="muted" style={{ fontSize: ".72rem", marginTop: "1rem" }}>
            Demo password: <b>parade2025</b>
          </p>
        </div>
      </div>
    </>
  );
}
