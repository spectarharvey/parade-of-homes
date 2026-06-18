"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logo from "../assets/parade-logo.webp";
import { useStore } from "@/lib/store";
import { 
  LayoutDashboard, 
  Home, 
  Hammer, 
  Users, 
  Inbox, 
  Bell, 
  Settings,
  Shield
} from "lucide-react";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/homes", label: "Home Listings", icon: Home },
  { href: "/admin/builders", label: "Builders", icon: Hammer },
  { href: "/admin/users", label: "Registered Users", icon: Users },
  { href: "/admin/submissions", label: "Submissions", icon: Inbox },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/settings", label: "Contest Settings", icon: Settings },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { adminLogout } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="site">
        <div className="wrap nav">
          <Link className="brand" href="/admin">
            <Image
              className="nav-logo"
              src={logo}
              alt="parade-logo"
              style={{ height: "42px", width: "auto", objectFit: "contain" }}
            />
            <span>
              <b>Admin Console</b>
              <small>Parade of Homes · MCBIA</small>
            </span>
          </Link>
          <button className="nav-toggle" onClick={() => setOpen((o) => !o)}>
            ☰
          </button>
          <nav className={"nav-links" + (open ? " open" : "")}>
            <Link href="/">↗ View Public Site</Link>
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
      <div className="admin-shell">
        <aside className="admin-side">
          <div className="alogo">
            <Shield size={18} />
            <span>Admin</span>
          </div>
          {ADMIN_NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? "active" : ""}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          ))}
        </aside>
        <main className="admin-main">{children}</main>
      </div>
    </>
  );
}
