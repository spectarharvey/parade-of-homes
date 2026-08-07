"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { money, stars } from "@/lib/format";
import { PartyPopper, Home, MapPin, Info } from "lucide-react";

export default function ContestPage() {
  const { db, home, nbhd, visited, myRatings, route } = useStore();
  const target = db.contest.target;
  const done = visited.length;
  const remaining = Math.max(0, target - done);
  const pct = Math.min(100, Math.round((done / target) * 100));
  const entered = done >= target;
  // Mirror the route the user built in Map & Route — planned stops not yet checked in.
  const remainingHomes = route
    .filter((id) => !visited.includes(id) && home(id))
    .map((id) => home(id)!);

  return (
    <div className="wrap">
      <div className="crumb">
        <Link href="/">Home</Link> / Contest
      </div>
      <div className="sec-head">
        <span className="eyebrow">Visit · Vote · Win</span>
        <h2>Contest Tracker</h2>
      </div>

      {/* Attention / Requirement Banner */}
      <div
        style={{
          background: "rgba(17, 103, 153, 0.08)",
          border: "1px solid rgba(17, 103, 153, 0.25)",
          borderRadius: "var(--radius)",
          padding: "0.85rem 1.2rem",
          marginBottom: "1.2rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          color: "var(--navy)",
          fontSize: "0.95rem",
          fontWeight: 600,
        }}
      >
        <Info size={20} style={{ color: "var(--navy)", flexShrink: 0 }} />
        <span>You must be registered and logged in to participate in the giveaway contest.</span>
      </div>

      {/*
        Grand-prize banner. The background is a designed sunset-over-ocean
        gradient (rights-clear, always renders). Drop a properly-licensed photo
        at public/parade-entries/2026/prize.jpg and it layers in behind the
        overlay automatically — do NOT use the resort's copyrighted image.
      */}
      <div
        style={{
          position: "relative",
          borderRadius: "var(--radius)",
          overflow: "hidden",
          minHeight: 250,
          display: "flex",
          alignItems: "flex-end",
          color: "#fff",
          margin: "0 0 2rem",
          backgroundColor: "#0a3a5c",
          backgroundImage:
            "linear-gradient(180deg, rgba(232,150,58,.72) 0%, rgba(210,95,55,.22) 32%, rgba(6,60,105,.5) 64%, rgba(2,18,34,.92) 100%), url('/parade-entries/2026/prize.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxShadow: "var(--shadow)",
        }}
      >
        <div style={{ padding: "1.6rem 1.8rem" }}>
          <span
            style={{
              textTransform: "uppercase",
              letterSpacing: ".14em",
              fontWeight: 700,
              fontSize: ".78rem",
              color: "var(--gold-light)",
            }}
          >
            Grand Prize
          </span>
          <h3
            style={{
              color: "#fff",
              fontSize: "1.8rem",
              margin: ".3rem 0 .5rem",
              textShadow: "0 2px 14px rgba(0,0,0,.45)",
            }}
          >
            A 3-Night Oceanview Escape
          </h3>
          <p
            style={{
              fontSize: "1rem",
              maxWidth: 640,
              lineHeight: 1.5,
              textShadow: "0 1px 8px rgba(0,0,0,.5)",
            }}
          >
            {db.contest.prize}
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1.2rem",
          }}
        >
          <div>
            <h3 style={{ fontSize: "1.4rem", margin: 0 }}>Your Progress</h3>
            <div className="muted" style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.3rem", flexWrap: "wrap" }}>
              <span>{done} of {target} homes visited</span>
              {entered ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "var(--green)", fontWeight: 600 }}>
                  · <PartyPopper size={14} /> You’re entered to win!
                </span>
              ) : (
                <span>· {remaining} more to enter</span>
              )}
            </div>
          </div>
          {entered ? (
            <span
              className="badge badge-green"
              style={{ fontSize: ".8rem", padding: ".5rem 1rem" }}
            >
              ✓ Entered to Win
            </span>
          ) : (
            <span
              className="badge badge-amber"
              style={{ fontSize: ".8rem", padding: ".5rem 1rem" }}
            >
              In Progress
            </span>
          )}
        </div>
        <div className="progress-ring" style={{ marginBottom: "1.6rem" }}>
          <div className="pbar">
            <i style={{ width: `${pct}%` }}></i>
          </div>
          <b style={{ fontFamily: "Lora", fontSize: "1.2rem", color: "var(--navy)" }}>
            {pct}%
          </b>
        </div>
        <div className="stamp-grid">
          {Array.from({ length: target }, (_, i) => {
            const v = visited[i];
            const h = v ? home(v) : null;
            return (
              <div key={i} className={"stamp " + (v ? "done" : "")}>
                {v ? (
                  <div>
                    <div className="ck" style={{ display: "grid", placeItems: "center", height: "30px", color: "var(--gold-dark)" }}>
                      <Home size={20} />
                    </div>
                    <div
                      style={{ fontSize: ".66rem", fontWeight: 700, padding: "0 4px" }}
                    >
                      {h ? h.name.replace("The ", "") : ""}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: "1.6rem", color: "var(--line)" }}>○</div>
                )}
                <span className="n">{i + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Home size={18} style={{ color: "var(--navy)" }} />
            <span>Homes You&apos;ve Visited</span>
          </h3>
          {visited.length ? (
            visited.map((id) => {
              const h = home(id);
              if (!h) return null;
              return (
                <Link
                  key={id}
                  href={`/home/${id}`}
                  className="route-stop"
                  style={{ textDecoration: "none" }}
                >
                  <span className="route-num" style={{ background: "var(--green)" }}>
                    ✓
                  </span>
                  <div style={{ flex: 1 }}>
                    <b style={{ fontSize: ".86rem" }}>{h.name}</b>
                    <div className="muted" style={{ fontSize: ".76rem" }}>
                      {nbhd(h.nb)?.name}
                    </div>
                    {myRatings[id] ? (
                      <div style={{ fontSize: ".82rem", marginTop: ".15rem" }}>
                        <span className="stars">{stars(myRatings[id])}</span>{" "}
                        <span className="muted" style={{ fontSize: ".72rem" }}>
                          Your vote
                        </span>
                      </div>
                    ) : (
                      <div className="muted" style={{ fontSize: ".72rem", marginTop: ".15rem" }}>
                        ☆ Tap to rate this home
                      </div>
                    )}
                  </div>
                  <span className="muted" style={{ fontSize: ".78rem" }}>
                    {money(h.price)}
                  </span>
                </Link>
              );
            })
          ) : (
            <div className="empty" style={{ padding: "1.4rem" }}>
              No check-ins yet. Visit a home and tap <b>Check In</b> to start
              stamping your card!
            </div>
          )}
        </div>
        <div className="panel">
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MapPin size={18} style={{ color: "var(--navy)" }} />
            <span>Still to Visit</span>
          </h3>
          {remainingHomes.length ? (
            remainingHomes.map((h) => (
              <Link
                key={h.id}
                href={`/home/${h.id}`}
                className="route-stop"
                style={{ textDecoration: "none" }}
              >
                <span className="route-num">{route.indexOf(h.id) + 1}</span>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: ".86rem" }}>{h.name}</b>
                  <div className="muted" style={{ fontSize: ".76rem" }}>
                    {nbhd(h.nb)?.name} · {h.style}
                  </div>
                </div>
              </Link>
            ))
          ) : route.length ? (
            <div className="empty">You’ve visited every stop on your route — amazing!</div>
          ) : (
            <div className="empty">
              No route planned yet. Tap “Plan My Route” to add your stops.
            </div>
          )}
          <Link
            href="/map"
            className="btn btn-gold btn-block btn-sm"
            style={{ marginTop: ".8rem" }}
          >
            Plan My Route →
          </Link>
        </div>
      </div>

      <p
        className="muted"
        style={{
          fontSize: ".72rem",
          lineHeight: 1.5,
          marginTop: "2rem",
          opacity: 0.75,
        }}
      >
        Giveaway terms: Based on availability. Excludes holidays and special
        events. Blackout dates may apply. Certificate cannot be extended and has
        no cash value. Valid through May 15, 2027.
      </p>
    </div>
  );
}
