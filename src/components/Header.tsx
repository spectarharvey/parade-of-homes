"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logo from "../assets/parade-logo.webp";
import { useStore } from "@/lib/store";

const PUBLIC_NAV: [string, string][] = [
  ["/", "Home"],
  ["/homes", "Homes"],
  ["/neighborhoods", "Neighborhoods"],
  ["/builders", "Builders"],
  ["/map", "Map & Route"],
  ["/contest", "Contest"],
  ["/sponsors", "Sponsors"],
  ["/faq", "FAQ"],
];

const AccountIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "20px", height: "20px", display: "block" }}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const { guestUser, logoutGuest } = useStore();

  // Prevent background scrolling when mobile menu/sidepanel is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="site">
      <div className="wrap nav">
        <Link className="brand" href="/" onClick={() => setOpen(false)}>
          <Image
            className="nav-logo"
            src={logo}
            alt="parade-logo"
          />
        </Link>
        <button className={"nav-toggle" + (open ? " open" : "")} onClick={() => setOpen((o) => !o)}>
          {open ? "✕" : "☰"}
        </button>
        <nav className={"nav-links" + (open ? " open" : "")} id="navlinks">
          {PUBLIC_NAV.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          {guestUser ? (
            <div className="guest-menu-container">
              <button
                className="btn btn-gold btn-sm"
                onClick={() => setInfoOpen(!infoOpen)}
                style={{ 
                  width: "40px", 
                  height: "40px", 
                  borderRadius: "50%", 
                  padding: 0, 
                  display: "grid", 
                  placeItems: "center" 
                }}
                aria-label="Account Info"
              >
                <AccountIcon />
              </button>
              {infoOpen && (
                <div className="guest-dropdown">
                  <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>
                    {guestUser.first} {guestUser.last}
                  </div>
                  <div className="muted" style={{ fontSize: "0.8rem", wordBreak: "break-all" }}>
                    {guestUser.email}
                  </div>
                  <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "0.4rem 0" }} />
                  <button
                    className="btn btn-sm btn-navy btn-block"
                    onClick={() => {
                      logoutGuest();
                      setInfoOpen(false);
                      setOpen(false);
                    }}
                    style={{ padding: "0.4rem 1rem", fontSize: "0.85rem", justifyContent: "center" }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/register"
              className="btn btn-gold btn-sm"
              style={{ marginLeft: ".4rem" }}
              onClick={() => setOpen(false)}
            >
              <button className="header-btn">
                Register
              </button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
