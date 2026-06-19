"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import BuilderLogin from "@/components/BuilderLogin";

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready, role, adminLogout } = useStore();

  if (!ready) return null;
  if (role !== "BUILDER") return <BuilderLogin />;

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
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                adminLogout();
              }}
            >
              Log Out
            </a>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
