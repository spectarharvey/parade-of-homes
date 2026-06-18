"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { stars, homePhoto } from "@/lib/format";
import {
  Home,
  MapPin,
  Users,
  Inbox,
  Trophy,
  Megaphone,
  Star,
  Bell
} from "lucide-react";

export default function AdminDashboardPage() {
  const { db, builder, nbhd, liveStats } = useStore();
  const s = liveStats();
  const top = db.homes.slice().sort((a, b) => b.rating - a.rating)[0];
  const pending = db.submissions.filter((x) => x.status === "pending").length;
  const optin = db.users.filter((u) => u.sms).length;
  const entered = db.users.filter((u) => u.checkins >= db.contest.target).length;

  const kpis: [React.ComponentType<{ size?: number }>, string, string, string | number, string, string, string][] = [
    [Home, "#0f2742", "rgba(15,39,66,.1)", s.homes, "Live Listings", "+2 this week", "var(--green)"],
    [MapPin, "#2f7d5b", "rgba(47,125,91,.12)", s.checkins.toLocaleString("en-US"), "Total Check-Ins", "+184 today", "var(--green)"],
    [Users, "#2d6cb5", "rgba(45,108,181,.12)", s.visitors.toLocaleString("en-US"), "Registered Users", "+12 today", "var(--green)"],
    [Inbox, "#d99a2b", "rgba(217,154,43,.14)", pending, "Pending Submissions", pending ? "Needs review" : "All clear", pending ? "var(--amber)" : "var(--green)"],
    [Trophy, "#c9a24b", "rgba(201,162,75,.14)", entered, "Contest Entrants", "of " + s.visitors + " users", "var(--muted)"],
    [Megaphone, "#c0492f", "rgba(192,73,47,.12)", optin, "SMS Opt-Ins", Math.round((optin / s.visitors) * 100) + "% of users", "var(--muted)"],
  ];

  return (
    <>
      <h1 style={{ fontSize: "1.7rem" }}>Dashboard</h1>
      <p className="muted" style={{ marginTop: "-.4rem" }}>
        Live overview of your Parade of Homes event.
      </p>
      <div className="kpi-grid" style={{ margin: "1.4rem 0" }}>
        {kpis.map(([Icon, c, bg, v, l, d, dc], i) => (
          <div className="kpi" key={i}>
            <div className="kic" style={{ background: bg, color: c, display: "grid", placeItems: "center" }}>
              <Icon size={20} />
            </div>
            <div className="kv">{v}</div>
            <div className="kl">{l}</div>
            <div className="kd" style={{ color: dc }}>
              {d}
            </div>
          </div>
        ))}
      </div>
      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="panel">
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Star size={18} style={{ color: "var(--navy)" }} />
            <span>Top-Rated Home</span>
          </h3>
          <div style={{ display: "flex", gap: "1rem", marginTop: ".8rem" }}>
            <img
              src={homePhoto(top)}
              style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 10 }}
              alt={top.name}
            />
            <div>
              <b style={{ fontSize: "1.05rem" }}>{top.name}</b>
              <div className="muted" style={{ fontSize: ".82rem" }}>
                {builder(top.builder)?.name} · {nbhd(top.nb)?.name}
              </div>
              <div style={{ margin: ".4rem 0" }}>
                <span className="stars" style={{ fontSize: "1.1rem" }}>
                  {stars(top.rating)}
                </span>{" "}
                <b>{top.rating}</b> <span className="muted">({top.ratings} votes)</span>
              </div>
              <div className="muted" style={{ fontSize: ".82rem", display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.4rem" }}>
                <MapPin size={14} /> <span>{top.checkins} check-ins</span>
              </div>
            </div>
          </div>
          <hr className="soft" />
          <Link href="/admin/homes" className="btn btn-outline btn-sm">
            Manage Listings →
          </Link>
        </div>
        <div className="panel">
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Bell size={18} style={{ color: "var(--navy)" }} />
            <span>Recent Notifications</span>
          </h3>
          {db.notifications.slice(0, 3).map((n) => (
            <div
              key={n.id}
              style={{ padding: ".7rem 0", borderBottom: "1px solid var(--line)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="badge badge-blue">{n.type}</span>
                <span className="muted" style={{ fontSize: ".74rem" }}>
                  {n.sent}
                </span>
              </div>
              <p style={{ fontSize: ".84rem", margin: ".4rem 0 .1rem" }}>{n.msg}</p>
              <span className="muted" style={{ fontSize: ".74rem" }}>
                Sent to {n.count} users · {n.audience}
              </span>
            </div>
          ))}
          <Link
            href="/admin/notifications"
            className="btn btn-outline btn-sm"
            style={{ marginTop: ".8rem" }}
          >
            Send Notification →
          </Link>
        </div>
      </div>
    </>
  );
}
