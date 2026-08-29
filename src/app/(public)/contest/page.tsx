"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { money, stars } from "@/lib/format";
import { PartyPopper, Home, MapPin, Info } from "lucide-react";
import { useCms } from "@/lib/cms/context";

export default function ContestPage() {
  const { db, ready, guestUser, home, nbhd, visited, myRatings, route } = useStore();
  const cms = useCms("contest");
  const target = db.contest.target;
  // Prize description is admin-editable; fall back to evergreen copy when unset
  // so the grand-prize banner never renders a blank line.
  const prize = db.contest.prize?.trim();
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
        <Link href="/">{cms.t("global.crumb.home")}</Link> / {cms.t("crumb")}
      </div>
      <div className="sec-head">
        <span className="eyebrow">{cms.t("head.eyebrow")}</span>
        <h2>{cms.t("head.title")}</h2>
      </div>

      {/* Attention / Requirement Banner — logged-out visitors only. */}
      {ready && !guestUser && (
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
          <span>
            {cms.t("signin.text")}{" "}
            <Link href="/register?tab=login" style={{ color: "var(--navy)", textDecoration: "underline" }}>
              {cms.t("signin.loginLabel")}
            </Link>{" "}
            or{" "}
            <Link href="/register" style={{ color: "var(--navy)", textDecoration: "underline" }}>
              {cms.t("signin.registerLabel")}
            </Link>
            .
          </span>
        </div>
      )}

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
          // minHeight: 250,
          display: "flex",
          alignItems: "flex-end",
          color: "#fff",
          margin: "0 0 2rem",
          backgroundColor: "#0a3a5c",
          backgroundImage:
            "linear-gradient(180deg, rgba(232,150,58,.72) 0%, rgba(210,95,55,.22) 32%, rgba(6,60,105,.5) 64%, rgba(2,18,34,.92) 100%), url('" +
            cms.t("prize.image") +
            "')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxShadow: "var(--shadow)",
        }}
      >
      <div
        style={{
          padding: "2.5rem",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
  <span
    style={{
      textTransform: "uppercase",
      letterSpacing: ".14em",
      fontWeight: 700,
      fontSize: ".78rem",
      color: "var(--gold-light)",
    }}
  >
    {cms.t("prize.eyebrow")}
  </span>

  <h3
    style={{
      color: "#fff",
      fontSize: "1.8rem",
      margin: ".3rem 0 .5rem",
      textShadow: "0 2px 14px rgba(0,0,0,.45)",
    }}
  >
    {cms.t("prize.title")}
  </h3>

  <p
    style={{
      fontSize: "1rem",
      maxWidth: 640,
      lineHeight: 1.5,
      textShadow: "0 1px 8px rgba(0,0,0,.5)",
      marginBottom: 0,
    }}
  >
    {prize || cms.t("prize.fallback")}
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
            <h3 style={{ fontSize: "1.4rem", margin: 0 }}>{cms.t("progress.title")}</h3>
            <div className="muted" style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.3rem", flexWrap: "wrap" }}>
              <span>{done} of {target} homes visited</span>
              {entered ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "var(--green)", fontWeight: 600 }}>
                  · <PartyPopper size={14} /> {cms.t("progress.enteredNote")}
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
              {cms.t("progress.enteredBadge")}
            </span>
          ) : (
            <span
              className="badge badge-amber"
              style={{ fontSize: ".8rem", padding: ".5rem 1rem" }}
            >
              {cms.t("progress.inProgressBadge")}
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
            <span>{cms.t("visited.title")}</span>
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
                          {cms.t("visited.voteLabel")}
                        </span>
                      </div>
                    ) : (
                      <div className="muted" style={{ fontSize: ".72rem", marginTop: ".15rem" }}>
                        {cms.t("visited.rateHint")}
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
            <span>{cms.t("remaining.title")}</span>
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
            <div className="empty">{cms.t("remaining.allVisited")}</div>
          ) : (
            <div className="empty">{cms.t("remaining.empty")}</div>
          )}
          <Link
            href="/map"
            className="btn btn-gold btn-block btn-sm"
            style={{ marginTop: ".8rem" }}
          >
            {cms.t("remaining.cta")}
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
        {cms.t("terms")}
      </p>
    </div>
  );
}
