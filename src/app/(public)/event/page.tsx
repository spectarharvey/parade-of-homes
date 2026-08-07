"use client";

import Link from "next/link";
import BuilderLogo from "@/components/BuilderLogo";

const FEATURED_BUILDER = {
  id: "b_brije",
  name: "Brije Homes",
  website: "https://www.brije.com/",
};

export default function EventCalendarPage() {
  return (
    <div className="wrap" style={{ maxWidth: 1080 }}>
      <div className="crumb">
        <Link href="/">Home</Link> / Parade Schedule
      </div>

      {/* Hero */}
      <div className="sec-head">
        <span className="eyebrow">Parade Schedule</span>
        <h2>2026 Parade of Homes</h2>
        <p style={{ fontSize: "1.02rem" }}>
         The 2026 MCBIA Parade of Homes will take place this November.
        </p>
      </div>

      {/* Quick dates card */}
      <div
        className="panel"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        {[
          ["Parade Weekends", "Nov 6–8 & 13–15, 2026"],
          ["Fri & Sat Hours", "11 AM – 5 PM"],
          ["Sunday Hours", "12 PM – 5 PM"],
          ["Location", "Marion County, FL"],
        ].map(([l, v]) => (
          <div key={l}>
            <div className="muted" style={{ fontSize: ".74rem", textTransform: "uppercase", letterSpacing: ".06em" }}>
              {l}
            </div>
            <div style={{ fontWeight: 700, color: "var(--navy)", marginTop: ".2rem", whiteSpace: "pre-line" }}>{v}</div>
          </div>
        ))}
      </div>

      <div
        className="panel"
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "center",
          flexWrap: "wrap",
          marginTop: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <BuilderLogo
            builder={FEATURED_BUILDER}
            className="builder-mini-logo"
            style={{
              width: 68,
              height: 68,
              borderRadius: 12,
              background: "#fff",
              display: "grid",
              placeItems: "center",
              padding: ".45rem",
              flexShrink: 0,
            }}
          />
          <div>
            <span className="badge badge-gold">2026 Featured Builder</span>
            <h3 style={{ fontSize: "1.25rem", marginTop: ".5rem" }}>{FEATURED_BUILDER.name}</h3>
            <p className="muted" style={{ margin: ".2rem 0 0" }}>
              Brije Homes is the Featured Builder for this year&apos;s Parade.
            </p>
          </div>
        </div>
        <Link href={`/builders/${FEATURED_BUILDER.id}`} className="btn btn-outline">
          Visit Brije Homes →
        </Link>
      </div>

      {/* Public visitor CTAs */}
      <div
        className="contest-cta"
        style={{
          marginTop: "2rem",
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.4rem" }}>Plan your Parade visit</h2>
          <p>
            Take a look at this year’s Parade of Homes, map your route, and register to vote for your favorites so that you can participate in the giveaway.
          </p>
        </div>
        <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
          <Link href="/homes" className="btn btn-navy">
            Browse Homes →
          </Link>
          <Link href="/map" className="btn btn-navy">
            Plan My Route →
          </Link>
          <Link href="/register" className="btn btn-gold">
            Register to Vote →
          </Link>
        </div>
      </div>
    </div>
  );
}
