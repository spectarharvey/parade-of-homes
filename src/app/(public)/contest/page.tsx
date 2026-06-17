"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";

export default function ContestPage() {
  const { db, home, nbhd, visited } = useStore();
  const target = db.contest.target;
  const done = visited.length;
  const remaining = Math.max(0, target - done);
  const pct = Math.min(100, Math.round((done / target) * 100));
  const entered = done >= target;
  const remainingHomes = db.homes.filter((h) => !visited.includes(h.id)).slice(0, 4);

  return (
    <div className="wrap">
      <div className="crumb">
        <Link href="/">Home</Link> / Contest
      </div>
      <div className="sec-head">
        <span className="eyebrow">Visit · Stamp · Win</span>
        <h2>Contest Tracker</h2>
        <p>{db.contest.prize}</p>
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
            <p className="muted" style={{ margin: 0 }}>
              {done} of {target} homes visited
              {entered ? " · 🎉 You’re entered to win!" : ` · ${remaining} more to enter`}
            </p>
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
                    <div className="ck">🏡</div>
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
          <h3>🏡 Homes You&apos;ve Visited</h3>
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
          <h3>📍 Still to Visit</h3>
          {remainingHomes.length ? (
            remainingHomes.map((h) => (
              <Link
                key={h.id}
                href={`/home/${h.id}`}
                className="route-stop"
                style={{ textDecoration: "none" }}
              >
                <span className="route-num">→</span>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: ".86rem" }}>{h.name}</b>
                  <div className="muted" style={{ fontSize: ".76rem" }}>
                    {nbhd(h.nb)?.name} · {h.style}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="empty">You’ve visited every home — amazing!</div>
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
    </div>
  );
}
