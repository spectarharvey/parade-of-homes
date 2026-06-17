"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

const ADMIN_NAV: [string, string, string][] = [
  ["/admin", "Dashboard", "📊"],
  ["/admin/homes", "Home Listings", "🏠"],
  ["/admin/builders", "Builders", "🏗"],
  ["/admin/users", "Registered Users", "👥"],
  ["/admin/submissions", "Submissions", "📥"],
  ["/admin/notifications", "Notifications", "🔔"],
  ["/admin/settings", "Contest Settings", "⚙️"],
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
            <span className="logo">P</span>
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
          <div className="alogo">🛠 Admin</div>
          {ADMIN_NAV.map(([href, label, icon]) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? "active" : ""}
            >
              {icon} {label}
            </Link>
          ))}
        </aside>
        <main className="admin-main">{children}</main>
      </div>
    </>
  );
}
