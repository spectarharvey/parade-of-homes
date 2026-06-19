"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore, useToast } from "@/lib/store";

export default function BuilderLogin() {
  const { adminLogin, role } = useStore();
  const { toast } = useToast();
  const [err, setErr] = useState<string | null>(null);

  return (
    <>
      <header className="site">
        <div className="wrap nav">
          <Link className="brand" href="/">
            <b style={{ fontSize: "1.1rem", color: "var(--navy)" }}>
              Parade of Homes
            </b>
          </Link>
          <nav className="nav-links">
            <Link href="/">↗ Public Site</Link>
          </nav>
        </div>
      </header>
      <div className="login-wrap">
        <div className="login-card">
          <div style={{ fontSize: "2.4rem" }}>🏗️</div>
          <h2 style={{ fontSize: "1.6rem" }}>Builder Portal</h2>
          <p className="muted" style={{ fontSize: ".86rem" }}>
            Log in to submit and manage your home listings.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const email = (form.elements.namedItem("email") as HTMLInputElement).value;
              const pw = (form.elements.namedItem("pw") as HTMLInputElement).value;
              setErr(null);
              const msg = await adminLogin(email, pw);
              if (msg) setErr(msg);
              else toast("Welcome!");
            }}
          >
            <div className="fld" style={{ textAlign: "left", margin: "1rem 0 .8rem" }}>
              <label>Email</label>
              <input name="email" type="email" placeholder="you@yourcompany.com" autoFocus />
            </div>
            <div className="fld" style={{ textAlign: "left", margin: "0 0 1rem" }}>
              <label>Password</label>
              <input name="pw" type="password" placeholder="••••••••" />
            </div>
            {err && (
              <p style={{ color: "var(--red)", fontSize: ".82rem", margin: "0 0 .6rem" }}>
                {err}
              </p>
            )}
            {role === "ADMIN" && (
              <p style={{ color: "var(--amber)", fontSize: ".82rem", margin: "0 0 .6rem" }}>
                You&apos;re logged in as an admin. Use the{" "}
                <Link href="/admin" style={{ textDecoration: "underline" }}>
                  admin console
                </Link>
                , or log out to use a builder account.
              </p>
            )}
            <button className="btn btn-navy btn-block" type="submit">
              Log In →
            </button>
          </form>
          <p className="muted" style={{ fontSize: ".72rem", marginTop: "1rem" }}>
            No account? Ask the Parade organizers to set up your builder login.
          </p>
        </div>
      </div>
    </>
  );
}
