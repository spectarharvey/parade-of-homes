"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import BuilderLogin from "@/components/BuilderLogin";
import logo from "../../assets/parade-logo.webp"
import Image from "next/image"
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
           <Image
            src={logo}
            alt="Logo"
           
           />
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
