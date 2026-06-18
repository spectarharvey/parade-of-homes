"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logo from "../assets/parade-logo.webp"
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

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
        </nav>
      </div>
    </header>
  );
}
