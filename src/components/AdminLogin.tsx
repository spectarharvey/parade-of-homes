"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore, useToast } from "@/lib/store";
import Image from "next/image";
import logo from "../assets/parade-logo.webp";

export default function AdminLogin() {
  const { adminLogin } = useStore();
  const { toast } = useToast();
  const [err, setErr] = useState<string | null>(null);

  return (
    <>
      <header className="site">
        <div className="wrap nav">
          <Link className="brand" href="/">
            <Image
              className="nav-logo"
              src={logo}
              alt="parade-logo"
              style={{ height: "42px", width: "auto", objectFit: "contain" }}
            />
          
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
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const email = (form.elements.namedItem("email") as HTMLInputElement).value;
              const pw = (form.elements.namedItem("pw") as HTMLInputElement).value;
              setErr(null);
              const msg = await adminLogin(email, pw);
              if (msg) setErr(msg);
              else toast("Welcome back, admin");
            }}
          >
            <div className="fld" style={{ textAlign: "left", margin: "1rem 0 .8rem" }}>
              <label>Email</label>
              <input name="email" type="email" placeholder="admin@mcbia.org" autoFocus />
            </div>
            <div className="fld" style={{ textAlign: "left", margin: "0 0 1rem" }}>
              <label>Password</label>
              <input name="pw" type="password" placeholder="••••••••" />
            </div>
            {err && (
              <p
                style={{
                  color: "var(--red)",
                  fontSize: ".82rem",
                  margin: "0 0 .6rem",
                }}
              >
                {err}
              </p>
            )}
            <button className="btn btn-navy btn-block" type="submit">
              Log In →
            </button>
          </form>
          <p className="muted" style={{ fontSize: ".72rem", marginTop: "1rem" }}>
            Demo: <b>admin@mcbia.org</b> / <b>parade2025</b>
          </p>
        </div>
      </div>
    </>
  );
}
